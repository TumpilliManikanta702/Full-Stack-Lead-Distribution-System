import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Provider from '@/models/Provider';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();

    // Fetch all providers, sorted by name
    const providers = await Provider.find({}).sort({ name: 1 }).lean();

    return NextResponse.json({ providers });
  } catch (error: any) {
    console.error('Providers fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
