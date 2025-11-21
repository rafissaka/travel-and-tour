'use client';

import { History } from 'lucide-react';

export default function HistoryPage() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
          <History className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Activity History</h1>
          <p className="text-sm text-muted-foreground">View your account activity</p>
        </div>
      </div>

      <div className="bg-card rounded-xl p-8 border border-border text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <History className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Your Activity</h2>
        <p className="text-muted-foreground mb-4">Track all your account activities and interactions.</p>
        <p className="text-sm text-muted-foreground">Coming soon...</p>
      </div>
    </div>
  );
}
