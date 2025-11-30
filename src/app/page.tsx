'use client';

import { analyzeBudget } from '@/app/actions/analyze-budget';
import { AgentStatus } from '@/components/agent-status';
import { BudgetForm } from '@/components/budget-form';
import { Deal, DealFeed } from '@/components/deal-feed';
import { Toaster } from '@/components/ui/sonner';
import type { SearchResult } from '@/lib/ai/tools/search';
import type { ValidatorResult } from '@/lib/ai/tools/validator';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Home() {
  const [status, setStatus] = useState<'idle' | 'searching' | 'validating' | 'analyzing' | 'complete' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState('');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleBudgetAnalysis = async (data: { query: string; maxBudget: number; priority: 'price' | 'quality' }) => {
    setIsLoading(true);
    setStatus('searching');
    setLogs(['Initializing BudgetBrain agent...', `Intent: Find ${data.query} under $${data.maxBudget}`]);
    setAnalysis('');
    setDeals([]);

    try {
      // Call Server Action
      const response = await analyzeBudget(data.query, data.maxBudget);
      
      // Process Steps for Logs and Deals
      const newLogs: string[] = [...logs];
      const foundDeals: Deal[] = [];

      if (response.steps) {
        for (const step of response.steps) {
          if (typeof step !== 'object' || step === null) continue;

          // Log Tool Calls
          if ('toolCalls' in step) {
             const toolCalls = (step as { toolCalls: unknown[] }).toolCalls;
             if (Array.isArray(toolCalls) && toolCalls.length > 0) {
                for (const call of toolCalls) {
                  if (typeof call === 'object' && call !== null && 'toolName' in call) {
                    const toolName = (call as { toolName: string }).toolName;
                    newLogs.push(`🛠️ Calling tool: ${toolName}`);
                    if (toolName === 'deepSearch') {
                      setStatus('searching');
                    } else if (toolName === 'dealValidator') {
                      setStatus('validating');
                    }
                  }
                }
             }
          }

          // Log Tool Results and Extract Deals
          if ('toolResults' in step) {
            const toolResults = (step as { toolResults: unknown[] }).toolResults;
            if (Array.isArray(toolResults) && toolResults.length > 0) {
              for (const result of toolResults) {
                if (typeof result !== 'object' || result === null || !('toolName' in result) || !('output' in result)) continue;
                
                const toolName = (result as { toolName: string }).toolName;
                const output = (result as { output: unknown }).output;

                newLogs.push(`✅ Tool ${toolName} completed.`);
                
                if (toolName === 'deepSearch') {
                  const searchResults = output as SearchResult;
                  if (Array.isArray(searchResults)) {
                    newLogs.push(`Found ${searchResults.length} potential candidates.`);
                    // Map search results to deals
                    searchResults.forEach((item) => {
                      if (item.url && item.title) {
                        foundDeals.push({
                          title: item.title,
                          price: 'Checking...', // Placeholder
                          url: item.url,
                          source: new URL(item.url).hostname.replace('www.', ''),
                        });
                      }
                    });
                  }
                }

                if (toolName === 'dealValidator') {
                  const validatorResult = output as ValidatorResult;
                  
                  if ('error' in validatorResult) {
                       newLogs.push(`Validation failed: ${validatorResult.error}`);
                  } else {
                      newLogs.push(`Verified: ${validatorResult.title.substring(0, 40)}...`);
                      
                      // Update existing deal or add new
                      const existingIndex = foundDeals.findIndex(d => d.url === validatorResult.url);
                      const existingDeal = foundDeals[existingIndex];
                      
                      if (existingIndex >= 0 && existingDeal) {
                        foundDeals[existingIndex] = {
                          ...existingDeal,
                          price: validatorResult.price || 'N/A',
                          verified: validatorResult.verified,
                          title: validatorResult.title || existingDeal.title,
                        };
                      } else {
                         foundDeals.push({
                          title: validatorResult.title || 'Unknown Product',
                          price: validatorResult.price || 'N/A',
                          url: validatorResult.url,
                          verified: validatorResult.verified,
                         });
                      }
                  }
                }
              }
            }
          }
        }
      }

      setStatus('analyzing');
      setLogs(prev => [...prev, ...newLogs.slice(prev.length), '🧠 Generating final analysis...']);
      
      // Artificial delay for "Analyzing" visualization if needed, but we have the result.
      
      setAnalysis(response.result);
      setDeals(foundDeals);
      setStatus('complete');
      setLogs(prev => [...prev, '✨ Analysis complete.']);
      toast.success('Analysis complete!');

    } catch (error) {
      console.error(error);
      setStatus('error');
      setLogs(prev => [...prev, '❌ Error occurred during analysis.']);
      toast.error('Failed to analyze budget. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2 mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight lg:text-7xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            BudgetBrain
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your AI agent for finding the best tech deals without breaking the bank.
          </p>
        </div>

        <BudgetForm onSubmit={handleBudgetAnalysis} isLoading={isLoading} />

        <AgentStatus status={status} logs={logs} />

        <DealFeed analysis={analysis} deals={deals} />
      </div>
      <Toaster />
    </main>
  );
}
