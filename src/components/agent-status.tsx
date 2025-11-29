'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
// I'll use simple div.

interface AgentStatusProps {
  status: 'idle' | 'searching' | 'validating' | 'analyzing' | 'complete' | 'error';
  logs: string[];
}

export function AgentStatus({ status, logs }: AgentStatusProps) {
  if (status === 'idle') return null;

  const steps = [
    { id: 'searching', label: 'Market Sweep' },
    { id: 'validating', label: 'Verifying Deals' },
    { id: 'analyzing', label: 'Value Analysis' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === status);
  // If complete, all done. If error, stop.

  return (
    <Card className="w-full max-w-xl mx-auto mt-6 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {status === 'complete' ? '✅ Analysis Complete' : '🧠 Agent Thinking...'}
          {status === 'error' && '❌ Error'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Steps */}
        <div className="flex justify-between gap-2">
          {steps.map((step, index) => {
            let variant: 'default' | 'secondary' | 'outline' = 'outline';
            if (status === 'complete') variant = 'default';
            else if (status === 'error') variant = 'outline';
            else if (status === step.id) variant = 'default'; // Active
            else if (currentStepIndex > index) variant = 'secondary'; // Done

            return (
              <Badge key={step.id} variant={variant} className="w-full justify-center py-1.5">
                {step.label}
              </Badge>
            );
          })}
        </div>

        {/* Logs / Thinking Stream */}
        <div className="bg-muted/50 rounded-md p-4 h-48 overflow-y-auto font-mono text-xs space-y-1">
          {logs.length === 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Skeleton className="h-3 w-3 rounded-full animate-pulse" />
              Initializing...
            </div>
          )}
          {logs.map((log, i) => (
            <div key={i} className="border-l-2 border-primary/50 pl-2">
              {log}
            </div>
          ))}
          {(status === 'searching' || status === 'validating' || status === 'analyzing') && (
             <div className="flex items-center gap-2 text-muted-foreground mt-2">
               <span className="animate-pulse">_</span>
             </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
