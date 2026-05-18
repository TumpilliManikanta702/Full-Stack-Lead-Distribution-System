import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Provider from '@/models/Provider';
import ProcessedWebhook from '@/models/ProcessedWebhook';
import LeadAssignment from '@/models/LeadAssignment';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { webhookId } = body;

    if (!webhookId) {
      return NextResponse.json({ error: 'Missing webhookId' }, { status: 400 });
    }

    await dbConnect();

    // Idempotency check
    const existingWebhook = await ProcessedWebhook.findOne({ webhookId });
    if (existingWebhook) {
      return NextResponse.json(
        { message: 'Webhook already processed (Idempotent success)' },
        { status: 200 } // Or 202
      );
    }

    // Process the reset
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // Reset all providers' usedQuota to 0
        await Provider.updateMany({}, { $set: { usedQuota: 0 } }).session(session);

        // Delete all LeadAssignments so the dashboard visually resets
        await LeadAssignment.deleteMany({}).session(session);

        // Record the webhook as processed
        const processed = new ProcessedWebhook({ webhookId });
        await processed.save({ session });
      });
    } finally {
      session.endSession();
    }

    return NextResponse.json({ message: 'Quotas reset successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook processing error:', error);

    // Handle concurrent duplicate webhook insertions
    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'Webhook already processed (Idempotent success - concurrent)' },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
