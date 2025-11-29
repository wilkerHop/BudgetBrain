'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';

interface BudgetFormProps {
  onSubmit: (data: { query: string; maxBudget: number; priority: 'price' | 'quality' }) => void;
  isLoading: boolean;
}

export function BudgetForm({ onSubmit, isLoading }: BudgetFormProps) {
  const [query, setQuery] = useState('');
  const [maxBudget, setMaxBudget] = useState([500]); // Default $500
  const [priority, setPriority] = useState<'price' | 'quality'>('quality');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSubmit({ query, maxBudget: maxBudget[0] ?? 500, priority });
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>BudgetBrain Agent</CardTitle>
        <CardDescription>Tell me what you need and your budget.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="query">What are you looking for?</Label>
            <Input
              id="query"
              placeholder="e.g. Gaming Monitor 144Hz"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="budget">Max Budget</Label>
              <span className="text-lg font-bold text-primary">${maxBudget[0]}</span>
            </div>
            <Slider
              id="budget"
              min={50}
              max={5000}
              step={10}
              value={maxBudget}
              onValueChange={setMaxBudget}
              disabled={isLoading}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$50</span>
              <span>$5000+</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="flex gap-2">
              <Badge
                variant={priority === 'price' ? 'default' : 'outline'}
                className="cursor-pointer px-4 py-2 text-sm"
                onClick={() => setPriority('price')}
              >
                💰 Lowest Price
              </Badge>
              <Badge
                variant={priority === 'quality' ? 'default' : 'outline'}
                className="cursor-pointer px-4 py-2 text-sm"
                onClick={() => setPriority('quality')}
              >
                ⭐ Best Value
              </Badge>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Analyzing Market...' : 'Find Deals'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
