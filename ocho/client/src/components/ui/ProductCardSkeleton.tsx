import React from 'react';
import { Card, CardContent } from './Card';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <Card className="flex flex-col h-full bg-white border border-brand-border rounded-2xl overflow-hidden animate-pulse">
      {/* Photo skeleton */}
      <div className="relative aspect-4/3 w-full bg-gray-200">
        <div className="absolute top-2.5 left-2.5 w-16 h-5 bg-gray-300 rounded-md" />
        <div className="absolute top-2.5 right-2.5 w-20 h-5 bg-gray-300 rounded-md" />
      </div>

      {/* Content skeleton */}
      <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="w-14 h-4 bg-gray-200 rounded" />
            <div className="w-12 h-3 bg-gray-200 rounded" />
          </div>
          <div className="w-full h-4 bg-gray-200 rounded" />
          <div className="w-3/4 h-4 bg-gray-200 rounded" />
        </div>

        <div className="pt-2 border-t border-brand-border/60 space-y-2">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <div className="w-10 h-3 bg-gray-200 rounded" />
              <div className="w-24 h-5 bg-gray-300 rounded" />
            </div>
            <div className="w-16 h-3 bg-gray-200 rounded" />
          </div>

          <div className="flex justify-between items-center pt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gray-200" />
              <div className="w-20 h-3 bg-gray-200 rounded" />
            </div>
            <div className="w-16 h-4 bg-gray-200 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
