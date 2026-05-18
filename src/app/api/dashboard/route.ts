import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Provider from '@/models/Provider';
import LeadAssignment from '@/models/LeadAssignment';
import Lead from '@/models/Lead';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();

    // Fetch all providers, sorted by name
    const providers = await Provider.find({}).sort({ name: 1 }).lean();

    // For each provider, fetch their assigned leads
    const dashboardData = await Promise.all(
      providers.map(async (provider) => {
        // Find assignments
        const assignments = await LeadAssignment.find({ providerId: provider._id })
          .sort({ assignedAt: -1 })
          .populate({
            path: 'leadId',
            model: Lead,
            select: 'name phone city serviceType'
          })
          .lean();

        // Format assignments
        const leads = assignments
          .map((a: any) => a.leadId)
          .filter(Boolean);

        return {
          id: provider._id,
          name: provider.name,
          services: provider.services,
          monthlyQuota: provider.monthlyQuota,
          usedQuota: provider.usedQuota,
          assignedCount: leads.length,
          leads: leads
        };
      })
    );

    return NextResponse.json({ providers: dashboardData });
  } catch (error: any) {
    console.error('Dashboard fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
