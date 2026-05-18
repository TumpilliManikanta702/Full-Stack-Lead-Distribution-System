import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Lead from '@/models/Lead';
import { allocateLead } from '@/lib/allocation';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, city, serviceType, description } = body;

    if (!name || !phone || !city || !serviceType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    // Start a transaction session
    const session = await mongoose.startSession();
    
    let resultProviders: any[] = [];
    let savedLeadId: string | null = null;
    let isDuplicate = false;

    try {
      await session.withTransaction(async () => {
        // 1. Create Lead
        let lead;
        try {
          const newLead = new Lead({ name, phone, city, serviceType, description });
          lead = await newLead.save({ session });
        } catch (err: any) {
          if (err.code === 11000) {
            isDuplicate = true;
            throw new Error('Duplicate lead for this phone and service type');
          }
          throw err;
        }

        savedLeadId = lead._id as string;

        // 2. Allocate
        const allocatedProviders = await allocateLead(lead, session);
        resultProviders = allocatedProviders.map(p => ({ id: p._id, name: p.name }));
        
        if (allocatedProviders.length === 0) {
           // We might want to rollback if we can't find providers, 
           // but technically a lead can be created and waiting. We'll proceed.
        }
      });
    } finally {
      session.endSession();
    }

    return NextResponse.json({ 
      message: 'Lead processed successfully', 
      leadId: savedLeadId,
      assignedTo: resultProviders 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Lead creation error:', error);
    
    if (error.message.includes('Duplicate lead')) {
      return NextResponse.json({ error: 'Duplicate lead detected' }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
