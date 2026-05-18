import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Provider from '@/models/Provider';
import Lead from '@/models/Lead';
import LeadAssignment from '@/models/LeadAssignment';
import AllocationState from '@/models/AllocationState';
import ProcessedWebhook from '@/models/ProcessedWebhook';

export async function GET() {
  try {
    await dbConnect();

    // Clear existing data
    await Provider.deleteMany({});
    await Lead.deleteMany({});
    await LeadAssignment.deleteMany({});
    await AllocationState.deleteMany({});
    await ProcessedWebhook.deleteMany({});

    // Providers to insert
    const providersData = [
      { name: 'Provider 1', services: ['Service 1', 'Service 3'], monthlyQuota: 10 },
      { name: 'Provider 2', services: ['Service 1', 'Service 3'], monthlyQuota: 10 },
      { name: 'Provider 3', services: ['Service 1', 'Service 3'], monthlyQuota: 10 },
      { name: 'Provider 4', services: ['Service 1', 'Service 3'], monthlyQuota: 10 },
      { name: 'Provider 5', services: ['Service 2', 'Service 3'], monthlyQuota: 10 },
      { name: 'Provider 6', services: ['Service 2', 'Service 3'], monthlyQuota: 10 },
      { name: 'Provider 7', services: ['Service 2', 'Service 3'], monthlyQuota: 10 },
      { name: 'Provider 8', services: ['Service 2', 'Service 3'], monthlyQuota: 10 },
    ];

    await Provider.insertMany(providersData);

    // Initialize Allocation States
    const allocationStates = [
      { serviceType: 'Service 1', currentIndex: 0 },
      { serviceType: 'Service 2', currentIndex: 0 },
      { serviceType: 'Service 3', currentIndex: 0 },
    ];

    await AllocationState.insertMany(allocationStates);

    return NextResponse.json({ message: 'Database seeded successfully' });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json({ error: 'Failed to seed database', details: error.message }, { status: 500 });
  }
}
