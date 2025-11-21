'use client';

import { CalendarCheck } from 'lucide-react';

export default function AppointmentsPage() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
          <CalendarCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Appointments</h1>
          <p className="text-sm text-muted-foreground">Manage customer appointments and bookings</p>
        </div>
      </div>

      <div className="bg-card rounded-xl p-8 border border-border text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <CalendarCheck className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Appointment Management</h2>
        <p className="text-muted-foreground mb-4">View, schedule, and manage all customer appointments.</p>
        <p className="text-sm text-muted-foreground">Coming soon...</p>
      </div>
    </div>
  );
}
