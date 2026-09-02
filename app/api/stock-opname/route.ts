/**
 * Stock Opname API Route
 * Proxy ke backend ESB / Internal API
 */

import { NextRequest, NextResponse } from 'next/server';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://187.52.114.14:8005';

// GET /api/stock-opname - List stock opnames
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());

    const res = await fetch(`${API}/api/v1/stock-opname?${new URLSearchParams(params)}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      const error = await res.text();
      return NextResponse.json({ error }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching stock opnames:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock opnames' },
      { status: 500 }
    );
  }
}

// POST /api/stock-opname - Create new stock opname
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${API}/api/v1/stock-opname`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const error = await res.text();
      return NextResponse.json({ error }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating stock opname:', error);
    return NextResponse.json(
      { error: 'Failed to create stock opname' },
      { status: 500 }
    );
  }
}
