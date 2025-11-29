'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

export interface Deal {
  title: string;
  price: string;
  url: string;
  verified?: boolean;
  source?: string;
}

interface DealFeedProps {
  analysis: string;
  deals: Deal[];
}

export function DealFeed({ analysis, deals }: DealFeedProps) {
  if (!analysis && deals.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 space-y-8">
      {/* Analysis Section */}
      {analysis && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl">💡 BudgetBrain Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              {analysis}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deals Grid */}
      {deals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold px-1">Top Vetted Deals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deals.map((deal, i) => (
              <Card key={i} className="flex flex-col h-full hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base line-clamp-2 leading-tight">
                      {deal.title}
                    </CardTitle>
                    {deal.verified && (
                      <Badge variant="secondary" className="shrink-0 bg-green-500/10 text-green-600 hover:bg-green-500/20">
                        Verified
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow pb-2">
                  <div className="text-2xl font-bold text-primary">
                    {deal.price}
                  </div>
                  {deal.source && (
                    <div className="text-xs text-muted-foreground mt-1 capitalize">
                      Source: {deal.source}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full" variant="outline">
                    <a href={deal.url} target="_blank" rel="noopener noreferrer">
                      View Deal <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
