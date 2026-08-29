'use client';

/**
 * Custom Hooks untuk Data Fetching
 * Mendukung switching antara Mock Data dan Real API
 * Struktur ini memudahkan migrasi ke API nyata
 */

import { useState, useEffect, useCallback } from 'react';
import {
  MOCK_COGS_RATIO_DATA,
  MOCK_ESTIMASI_BELANJA,
  MOCK_DASHBOARD_STATS,
  COGSRatioData,
  EstimasiBelanjaItem,
  DashboardSummaryStats,
} from '@/lib/mockData';

// ============================================================================
// CONFIGURATION
// ============================================================================
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false'; // Default: true

// ============================================================================
// HOOK: Dashboard Stats
// ============================================================================
export function useDashboardStats() {
  const [data, setData] = useState<DashboardSummaryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        if (USE_MOCK_DATA) {
          setData(MOCK_DASHBOARD_STATS);
        } else {
          // TODO: Implement real API call
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { data, loading, error };
}

// ============================================================================
// HOOK: COGS Ratio Data
// ============================================================================
export function useCOGSRatio(period?: string) {
  const [data, setData] = useState<COGSRatioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (USE_MOCK_DATA) {
        const filtered = period
          ? MOCK_COGS_RATIO_DATA.filter((d) => d.period === period)
          : MOCK_COGS_RATIO_DATA;
        setData(filtered);
      } else {
        // TODO: Implement real API call
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [period]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  // Computed values
  const avgCogsRatio = data.length > 0
    ? data.reduce((s, d) => s + d.cogsRatio, 0) / data.length
    : 0;

  const flaggedOutlets = data.filter((d) => d.flagged).length;
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalCogs = data.reduce((s, d) => s + d.cogs, 0);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    stats: {
      avgCogsRatio,
      flaggedOutlets,
      totalRevenue,
      totalCogs,
      count: data.length,
    },
  };
}

// ============================================================================
// HOOK: Estimasi Belanja
// ============================================================================
export function useEstimasiBelanja(branchId?: number) {
  const [data, setData] = useState<EstimasiBelanjaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        if (USE_MOCK_DATA) {
          setData(MOCK_ESTIMASI_BELANJA);
        } else {
          // TODO: Implement real API call
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [branchId]);

  const totalEstimasiValue = data.reduce((s, d) => s + d.estimasiValue, 0);
  const criticalItems = data.filter((d) => d.daysInStock < d.daysTarget * 0.5);
  const totalQty = data.reduce((s, d) => s + d.estimasiQty, 0);

  return {
    data,
    loading,
    error,
    stats: {
      totalEstimasiValue,
      totalQty,
      criticalItemsCount: criticalItems.length,
      itemCount: data.length,
    },
  };
}
