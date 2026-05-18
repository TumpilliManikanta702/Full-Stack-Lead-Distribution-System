import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Lead from '@/models/Lead';
import { allocateLead } from '@/lib/allocation';

export async function POST(req: Request) {
  try {
    await dbConnect();

    const generateRandomPhone = () => {
      return Math.floor(1000000000 + Math.random() * 9000000000).toString();
    };

    const serviceTypes = ['Service 1', 'Service 2', 'Service 3'];
    
    // We create 10 leads concurrently
    const promises = Array.from({ length: 10 }).map(async (_, index) => {
      const serviceType = serviceTypes[index % 3];
      const phone = generateRandomPhone();
      const name = `Test Lead ${Date.now().toString().slice(-4)}${index}`;
      
      const session = await mongoose.startSession();
      try {
        let assignedTo = null;
        await session.withTransaction(async () => {
          const newLead = new Lead({ 
            name, 
            phone, 
            city: 'Test City', 
            serviceType, 
            description: 'Generated for concurrency testing' 
          });
          const lead = await newLead.save({ session });
          assignedTo = await allocateLead(lead, session);
        });
        return { success: true, name, assignedTo };
      } catch (err: any) {
        return { success: false, name, error: err.message };
      } finally {
        session.endSession();
      }
    });

    const results = await Promise.all(promises);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({ 
      message: `Generated ${successful} leads successfully. ${failed} failed.`,
      results 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Generate leads error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
