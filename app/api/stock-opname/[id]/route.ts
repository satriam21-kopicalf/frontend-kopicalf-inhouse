/**
 * Individual Stock Opname API Route
 * Proxy ke backend ESB / Internal API
 */

import { NextRequest, NextResponse } from 'next/server';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://187.52.114.14:8005';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/stock-opname/[id] - Get single stock opname
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const res = await fetch(`${API}/api/v1/stock-opname/${id}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      const error = await res.text();
      return NextResponse.json({ error }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching stock opname:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock opname' },
      { status: 500 }
    );
  }
}

// PUT /api/stock-opname/[id] - Update stock opname
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const res = await fetch(`${API}/api/v1/stock-opname/${id}`, {
      method: 'PUT',
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
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating stock opname:', error);
    return NextResponse.json(
      { error: 'Failed to update stock opname' },
      { status: 500 }
    );
  }
}
