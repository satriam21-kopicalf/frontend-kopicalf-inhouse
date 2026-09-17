import { BaseService } from '../base';

const API_PATH = '/api/v1/waste';

export interface WasteDetail {
  id?: number;
  product_id: number;
  product_code?: string;
  product_name?: string;
  uom_name?: string;
  qty: number;
  unit_cost: number;
  total_cost?: number;
  waste_reason: string;
  photo_urls?: string[];
}

export interface WasteHeader {
  id: number;
  branch_id: number;
  branch_code?: string;
  branch_name?: string;
  branch_type?: string;
  waste_date: string;
  waste_type: 'damaged' | 'expired' | 'lost' | 'contaminated' | 'other';
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  total_value: number;
  total_items: number;
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

export interface WasteDetailResponse extends WasteHeader {
  details: WasteDetail[];
}

export interface WasteCreate {
  branch_id: number;
  waste_date: string;
  waste_type: 'damaged' | 'expired' | 'lost' | 'contaminated' | 'other';
  notes?: string;
  details: Array<{
    product_id: number;
    product_code?: string;
    qty: number;
    unit_cost: number;
    waste_reason: string;
    photo_urls?: string[];
  }>;
}

export interface WasteUpdate {
  waste_date?: string;
  waste_type?: 'damaged' | 'expired' | 'lost' | 'contaminated' | 'other';
  notes?: string;
  details?: Array<{
    id?: number;
    product_id: number;
    product_code?: string;
    qty: number;
    unit_cost: number;
    waste_reason: string;
    photo_urls?: string[];
  }>;
}

export interface WasteFilter {
  branch_id?: number;
  waste_type?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface WasteSummary {
  total: number;
  draft: number;
  submitted: number;
  approved: number;
  rejected: number;
  total_pending: number;
  total_waste_value: number;
  by_type: {
    damaged: number;
    expired: number;
    lost: number;
    contaminated: number;
    other: number;
  };
}

export interface WasteReason {
  id: number;
  code: string;
  name: string;
  category: string;
  requires_photo: boolean;
  is_active: boolean;
}

export interface ProductWithCost {
  product_id: number;
  product_code: string;
  product_name: string;
  uom_name?: string;
  unit_cost: number;
  category_name?: string;
}

class WasteService extends BaseService {
  /**
   * Get list of waste forms with filtering
   */
  async getList(filter?: WasteFilter): Promise<WasteHeader[]> {
    const params = this.buildQueryParams(filter);
    const response = await this.get<{ data: WasteHeader[] }>(`${API_PATH}${params}`);
    return response.data;
  }

  /**
   * Get summary statistics
   */
  async getSummary(): Promise<WasteSummary> {
    const response = await this.get<{ data: WasteSummary }>(`${API_PATH}/summary`);
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
   * Get single waste form header
   */
  async getById(id: number): Promise<WasteHeader> {
    const response = await this.get<{ data: WasteHeader }>(`${API_PATH}/${id}`);
    return response.data;
  }

  /**
   * Get waste form with details
   */
  async getDetail(id: number): Promise<WasteDetailResponse> {
    const response = await this.get<{ data: WasteDetailResponse }>(`${API_PATH}/${id}/details`);
    return response.data;
  }

  /**
   * Create new waste form (draft)
   */
  async create(data: WasteCreate): Promise<WasteHeader> {
    const response = await this.post<{ data: WasteHeader }>(API_PATH, data);
    return response.data;
  }

  /**
   * Update waste form
   */
  async update(id: number, data: WasteUpdate): Promise<WasteHeader> {
    const response = await this.put<{ data: WasteHeader }>(`${API_PATH}/${id}`, data);
    return response.data;
  }

  /**
   * Delete/Cancel waste form
   */
  async remove(id: number): Promise<void> {
    await this.delete(`${API_PATH}/${id}`);
  }

  /**
   * Submit waste form for approval
   */
  async submit(id: number): Promise<WasteHeader> {
    const response = await this.post<{ data: WasteHeader }>(`${API_PATH}/${id}/submit`);
    return response.data;
  }

  /**
   * Approve or reject waste form
   */
  async approve(id: number, approved: boolean, notes?: string): Promise<WasteHeader> {
    const response = await this.post<{ data: WasteHeader }>(`${API_PATH}/${id}/approve`, {
      approved,
      notes
    });
    return response.data;
  }

  /**
   * Get waste reasons by type
   */
  async getReasons(wasteType?: string): Promise<WasteReason[]> {
    const params = wasteType ? `?waste_type=${wasteType}` : '';
    const response = await this.get<{ data: WasteReason[] }>(`${API_PATH}/reasons${params}`);
    return response.data;
  }

  /**
   * Get products with cost for a branch
   */
  async getProducts(branchId: number, search?: string): Promise<ProductWithCost[]> {
    const params = new URLSearchParams();
    params.append('branch_id', branchId.toString());
    if (search) params.append('search', search);

    const response = await this.get<{ data: ProductWithCost[] }>(`/stock/products?${params.toString()}`);
    return response.data;
  }
}

export const wasteService = new WasteService();
export default wasteService;
