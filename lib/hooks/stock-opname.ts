/**
 * React Query Hooks untuk Stock Opname & Waste
 * Menggunakan pattern: useQuery / useMutation
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { StockOpname, StockOpnameDetail, WasteRecord, WasteDetail } from '@/lib/api/client';
import type { Branch } from '@/lib/api/client';
import type { Product } from '@/lib/api/client';
import { toast } from 'sonner';

// =====================================================================
// TYPES
// =====================================================================

export interface StockOpnameFormData {
  branchId: number;
  soDate: string;
  periodType: 'daily_packaging' | 'weekly' | 'monthly';
  details: StockOpnameDetailFormData[];
  notes?: string;
}

export interface StockOpnameDetailFormData {
  productCode: string;
  balanceStock: number;
  actualStock: number;
  notes?: string;
}

export interface WasteFormData {
  branchId: number;
  wasteDate: string;
  details: WasteDetailFormData[];
  notes?: string;
}

export interface WasteDetailFormData {
  productCode: string;
  qty: number;
  reason: 'expired' | 'damaged' | 'spill' | 'other';
  notes?: string;
}

export interface StockOpnameFilter {
  branchId?: number;
  status?: 'draft' | 'submitted' | 'approved' | 'rejected';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface WasteFilter {
  branchId?: number;
  status?: 'draft' | 'submitted' | 'approved' | 'rejected';
  dateFrom?: string;
  dateTo?: string;
  reason?: string;
}

// =====================================================================
// STOCK OPNAME HOOKS
// =====================================================================

export function useStockOpnames(filter: StockOpnameFilter = {}) {
  return useQuery({
    queryKey: ['stock-opnames', filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter.branchId) params.set('branchId', String(filter.branchId));
      if (filter.status) params.set('status', filter.status);
      if (filter.dateFrom) params.set('dateFrom', filter.dateFrom);
      if (filter.dateTo) params.set('dateTo', filter.dateTo);
      if (filter.search) params.set('search', filter.search);

      const res = await fetch(`/api/stock-opname?${params}`);
      if (!res.ok) throw new Error('Failed to fetch stock opnames');
      return res.json() as Promise<{ data: StockOpname[]; total: number }>;
    },
  });
}

export function useStockOpname(id: number) {
  return useQuery({
    queryKey: ['stock-opname', id],
    queryFn: async () => {
      const res = await fetch(`/api/stock-opname/${id}`);
      if (!res.ok) throw new Error('Failed to fetch stock opname');
      return res.json() as Promise<StockOpname>;
    },
    enabled: !!id,
  });
}

export function useStockOpnameSummary(branchId?: number) {
  return useQuery({
    queryKey: ['stock-opname-summary', branchId],
    queryFn: async () => {
      const params = branchId ? `?branchId=${branchId}` : '';
      const res = await fetch(`/api/stock-opname/summary${params}`);
      if (!res.ok) throw new Error('Failed to fetch summary');
      return res.json() as Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        totalVariance: number;
        totalValue: number;
      }>;
    },
  });
}

export function useCreateStockOpname() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: StockOpnameFormData) => {
      const res = await fetch('/api/stock-opname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create stock opname');
      return res.json() as Promise<{ id: number }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-opnames'] });
      queryClient.invalidateQueries({ queryKey: ['stock-opname-summary'] });
      toast.success('Stock Opname created successfully');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create stock opname');
    },
  });
}

export function useUpdateStockOpname() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<StockOpnameFormData> }) => {
      const res = await fetch(`/api/stock-opname/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update stock opname');
      return res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['stock-opnames'] });
      queryClient.invalidateQueries({ queryKey: ['stock-opname', id] });
      toast.success('Stock Opname updated successfully');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update stock opname');
    },
  });
}

export function useSubmitStockOpname() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/stock-opname/${id}/submit`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to submit stock opname');
      return res.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['stock-opnames'] });
      queryClient.invalidateQueries({ queryKey: ['stock-opname', id] });
      toast.success('Stock Opname submitted for approval');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to submit');
    },
  });
}

export function useApproveStockOpname() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/stock-opname/${id}/approve`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to approve stock opname');
      return res.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['stock-opnames'] });
      queryClient.invalidateQueries({ queryKey: ['stock-opname', id] });
      toast.success('Stock Opname approved');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to approve');
    },
  });
}

export function useRejectStockOpname() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      const res = await fetch(`/api/stock-opname/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error('Failed to reject stock opname');
      return res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['stock-opnames'] });
      queryClient.invalidateQueries({ queryKey: ['stock-opname', id] });
      toast.success('Stock Opname rejected');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to reject');
    },
  });
}

// =====================================================================
// WASTE HOOKS
// =====================================================================

export function useWasteRecords(filter: WasteFilter = {}) {
  return useQuery({
    queryKey: ['waste-records', filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter.branchId) params.set('branchId', String(filter.branchId));
      if (filter.status) params.set('status', filter.status);
      if (filter.reason) params.set('reason', filter.reason);
      if (filter.dateFrom) params.set('dateFrom', filter.dateFrom);
      if (filter.dateTo) params.set('dateTo', filter.dateTo);

      const res = await fetch(`/api/waste?${params}`);
      if (!res.ok) throw new Error('Failed to fetch waste records');
      return res.json() as Promise<{ data: WasteRecord[]; total: number }>;
    },
  });
}

export function useWasteRecord(id: number) {
  return useQuery({
    queryKey: ['waste-record', id],
    queryFn: async () => {
      const res = await fetch(`/api/waste/${id}`);
      if (!res.ok) throw new Error('Failed to fetch waste record');
      return res.json() as Promise<WasteRecord>;
    },
    enabled: !!id,
  });
}

export function useWasteSummary(branchId?: number) {
  return useQuery({
    queryKey: ['waste-summary', branchId],
    queryFn: async () => {
      const params = branchId ? `?branchId=${branchId}` : '';
      const res = await fetch(`/api/waste/summary${params}`);
      if (!res.ok) throw new Error('Failed to fetch waste summary');
      return res.json() as Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        totalQty: number;
        totalValue: number;
        byReason: Record<string, number>;
      }>;
    },
  });
}

export function useCreateWaste() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: WasteFormData) => {
      const res = await fetch('/api/waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create waste record');
      return res.json() as Promise<{ id: number }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waste-records'] });
      queryClient.invalidateQueries({ queryKey: ['waste-summary'] });
      toast.success('Waste recorded successfully');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to record waste');
    },
  });
}

export function useUpdateWaste() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<WasteFormData> }) => {
      const res = await fetch(`/api/waste/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update waste record');
      return res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['waste-records'] });
      queryClient.invalidateQueries({ queryKey: ['waste-record', id] });
      toast.success('Waste updated successfully');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update waste');
    },
  });
}

export function useSubmitWaste() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/waste/${id}/submit`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to submit waste');
      return res.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['waste-records'] });
      queryClient.invalidateQueries({ queryKey: ['waste-record', id] });
      toast.success('Waste submitted');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to submit');
    },
  });
}

export function useApproveWaste() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/waste/${id}/approve`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to approve waste');
      return res.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['waste-records'] });
      queryClient.invalidateQueries({ queryKey: ['waste-record', id] });
      toast.success('Waste approved');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to approve');
    },
  });
}

export function useRejectWaste() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      const res = await fetch(`/api/waste/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error('Failed to reject waste');
      return res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['waste-records'] });
      queryClient.invalidateQueries({ queryKey: ['waste-record', id] });
      toast.success('Waste rejected');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to reject');
    },
  });
}
