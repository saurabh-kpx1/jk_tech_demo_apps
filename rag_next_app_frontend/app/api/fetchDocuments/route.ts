import { NextRequest, NextResponse } from 'next/server';
import dotenv from 'dotenv';

dotenv.config();

const NEST_APP_URL = process.env.NEST_APP_URL;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const response = await fetch(`${NEST_APP_URL}/user/fetch-documents/${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data.documents);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}