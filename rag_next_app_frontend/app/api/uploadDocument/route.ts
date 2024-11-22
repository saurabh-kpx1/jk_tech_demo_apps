import { NextRequest, NextResponse } from 'next/server';
import dotenv from 'dotenv';

dotenv.config();

const NEST_APP_URL = process.env.NEST_APP_URL;

export async function POST(req: NextRequest) {
  try {
    const { username, documentName, content } = await req.json();
    const response = await fetch(`${NEST_APP_URL}/user/upload-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        documentName,
        content,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to upload document' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}