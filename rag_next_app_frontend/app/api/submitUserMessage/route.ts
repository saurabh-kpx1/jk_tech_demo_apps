import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import dotenv from 'dotenv';

dotenv.config();

const FLASK_APP_URL = process.env.FLASK_APP_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = await fetch(`${FLASK_APP_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch response from the chat API' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({
      id: nanoid(),
      response: data.response,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal Server Error', message: errorMessage }, { status: 500 });
  }
}