import { BaseService } from '../base';

const API_PATH = '/api/v1/stock-opname';

export interface StockOpnameDetail {
  id?: number;
  product_id: number;
  product_code?: string;
  product_name?: string;
  uom_name?: string;
  system_qty: number;
  counted_qty: number;
  variance_qty?: number;
  unit_cost: number;
  variance_value?: number;
  notes?: string;
}

export interface StockOpnameHeader {
  id: number;
  branch_id: number;
  branch_code?: string;
  branch_name?: string;
  branch_type?: string;
  opname_date: string;
  period_month: string;
  period_type?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  total_value: number;
  item_count: number;
  approved_by?: string;
  approved_at?: string;
  submitted_by?: string;
  submitted_at?: string;
  approval_notes?: string;
  notes?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StockOpnameDetailResponse extends StockOpnameHeader {
  details: StockOpnameDetail[];
}

export interface StockOpnameCreate {
  branch_id: number;
  opname_date: string;
  period_month: string;
  period_type?: string;
  notes?: string;
  details: Array<{
    product_id: number;
    system_qty: number;
    counted_qty: number;
    unit_cost: number;
    notes?: string;
  }>;
}

export interface StockOpnameUpdate {
  opname_date?: string;
  period_month?: string;
  period_type?: string;
  notes?: string;
  details?: Array<{
    id?: number;
    product_id: number;
    system_qty: number;
    counted_qty: number;
    unit_cost: number;
    notes?: string;
  }>;
}

export interface StockOpnameFilter {
  branch_id?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  period_month?: string;
  page?: number;
  page_size?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface StockOpnameSummary {
  total: number;
  draft: number;
  submitted: number;
  approved: number;
  rejected: number;
  total_pending: number;
  total_variance_value: number;
}

export interface ProductStock {
  product_id: number;
  product_code: string;
  product_name: string;
  uom_name?: string;
  current_qty: number;
  unit_cost: number;
  category_name?: string;
}

class StockOpnameService extends BaseService {
  /**
   * Get list of stock opnames with filtering
   */
  async getList(filter?: StockOpnameFilter): Promise<StockOpnameHeader[]> {
    const params = this.buildQueryParams(filter);
    const response = await this.get<{ data: StockOpnameHeader[] }>(`${API_PATH}${params}`);
    return response.data;
  }

  /**
   * Get summary statistics
   */
  async getSummary(): Promise<StockOpnameSummary> {
    const response = await this.get<{ data: StockOpnameSummary }>(`${API_PATH}/summary`);
    return response.data;
  }

  /**
   * Get pending count for dashboard badge
   */
  async getPendingCount(): Promise<number> {
    const response = await this.get<{ data: { count: number } }>(`${API_PATH}/pending-count`);
    return response.data.count;
  }

  /**
   * Get single stock opname header
   */
  async getById(id: number): Promise<StockOpnameHeader> {
    const response = await this.get<{ data: StockOpnameHeader }>(`${API_PATH}/${id}`);
    return response.data;
  }

  /**
   * Get stock opname with details
   */
  async getDetail(id: number): Promise<StockOpnameDetailResponse> {
    const response = await this.get<{ data: StockOpnameDetailResponse }>(`${API_PATH}/${id}/details`);
    return response.data;
  }

  /**
   * Create new stock opname (draft)
   */
  async create(data: StockOpnameCreate): Promise<StockOpnameHeader> {
    const response = await this.post<{ data: StockOpnameHeader }>(API_PATH, data);
    return response.data;
  }

  /**
   * Update stock opname
   */
  async update(id: number, data: StockOpnameUpdate): Promise<StockOpnameHeader> {
    const response = await this.put<{ data: StockOpnameHeader }>(`${API_PATH}/${id}`, data);
    return response.data;
  }

  /**
   * Delete/Cancel stock opname
   */
  async remove(id: number): Promise<void> {
    await this.delete(`${API_PATH}/${id}`);
  }

  /**
   * Submit stock opname for approval
   */
  async submit(id: number): Promise<StockOpnameHeader> {
    const response = await this.post<{ data: StockOpnameHeader }>(`${API_PATH}/${id}/submit`);
    return response.data;
  }

  /**
   * Approve or reject stock opname
   */
  async approve(id: number, approved: boolean, notes?: string): Promise<StockOpnameHeader> {
    const response = await this.post<{ data: StockOpnameHeader }>(`${API_PATH}/${id}/approve`, {
      approved,
      notes
    });
    return response.data;
  }

  /**
   * Get products with system stock for a branch
   */
  async getProductsWithStock(branchId: number, search?: string): Promise<ProductStock[]> {
    const params = new URLSearchParams();
    params.append('branch_id', branchId.toString());
    if (search) params.append('search', search);

    const response = await this.get<{ data: ProductStock[] }>(`/stock/system?${params.toString()}`);
    return response.data;
  }
}

export const stockOpnameService = new StockOpnameService();
export default stockOpnameService;
