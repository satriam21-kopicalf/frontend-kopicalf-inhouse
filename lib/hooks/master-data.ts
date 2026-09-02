/**
 * Master data hooks — Branches & Products
 * Consumes from backend API at /api/v1/branches & /api/v1/products
 */

'use client';

import { useQuery } from '@tanstack/react-query';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://187.52.114.14:8005';

export function useBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const res = await fetch(`${API}/api/v1/master/BRANCH/rows`);
      if (!res.ok) throw new Error('Failed to fetch branches');
      const data = await res.json() as { rows: any[]; total: number };
      return data.rows as any[];
    },
    staleTime: 10 * 60 * 1000, // 10 menit
    gcTime: 30 * 60 * 1000,
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch(`${API}/api/v1/master/PRODUCT/rows`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json() as { rows: any[]; total: number };
      return data.rows as any[];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useBranch(id: number) {
  return useQuery({
    queryKey: ['branch', id],
    queryFn: async () => {
      const res = await fetch(`${API}/api/v1/master/BRANCH/rows?id=${id}`);
      if (!res.ok) throw new Error('Failed to fetch branch');
      const data = await res.json() as { rows: any[]; total: number };
      return data.rows as any[];
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}
