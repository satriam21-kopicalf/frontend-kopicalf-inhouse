/**
 * API Client for Backend Integration
 * Handles communication with the backend API at 187.52.114.14:8005
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://187.52.114.14:8005';
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// Master Data Interfaces
export interface Branch {
  branchID: number;
  branchName: string;
  branchCode: string;
  branchType?: string;
  address: string;
  isActive: boolean;
  esbId: number;
  syncedAt: string;
  updatedAt: string;
  raw_data?: any;
}

export interface MasterEntityRow {
  [key: string]: unknown;
}

export interface MasterEntityResponse {
  entity: string;
  table: string;
  columns: string[];
  rows: MasterEntityRow[];
  total: number;
}

export interface MasterSummary {
  entity: string;
  table: string;
  row_count: number;
  per_company: Record<string, number>;
  last_sync: string | null;
  last_status: string | null;
  schedule_enabled: boolean;
}

export interface MasterSummaryResponse {
  entities: MasterSummary[];
}

export interface Product {
  productId: number;
  productCode: string;
  name: string;
  categoryId: number;
  categoryName: string;
  subCategoryId: number;
  subCategoryName: string;
  bomId: number | null;
  bomName: string;
  categoryTypeName: 'Beverage' | 'Food' | 'Ingredient' | 'Other';
  normalizedName: string;
  flagActive: boolean;
  esbId: number;
  syncedAt: string;
  updatedAt: string;
  unitPrice?: number;
  unit?: string;
}

export interface Category {
  categoryId: number;
  esbId: number;
  name: string;
  typeName: 'Beverage' | 'Food' | 'Ingredient' | 'Other';
  parentId: number | null;
  isActive: boolean;
  // extra fields from esb_data.master_category
  code?: string;
  typeId?: number;
  notes?: string;
  syncedAt?: string;
  updatedAt?: string;
  flagActive?: boolean;
}

export interface SubCategory {
  subCategoryId: number;
  esbId?: number;
  code?: string;
  name: string;
  categoryId: number;
  categoryName?: string;
  deadStock?: number;
  flagActive?: boolean;
  syncedAt?: string;
  updatedAt?: string;
}

export interface Unit {
  id: number;
  companyId?: number;
  esbId?: number;
  code: string;
  name: string;
  flagActive?: boolean;
  syncedAt?: string;
  updatedAt?: string;
}

export interface Uom {
  uomID: number;
  uomCode: string;
  uomName: string;
  category: 'Weight' | 'Volume' | 'Unit' | 'Serving';
  baseUnit: string;
  conversionFactor: number;
  description: string;
  isActive: boolean;
  syncedAt?: string;
  updatedAt?: string;
}

export interface BOM {
  bomId: number;
  esbId?: number;
  companyId?: number;
  productEsbId?: number;
  code?: string;
  name: string;
  uomId?: number;
  uomName?: string;
  outputQty?: number;
  flagActive?: boolean;
  bomTypeId?: number;
  bomTypeName?: string;
  productName?: string;
  syncedAt?: string;
  updatedAt?: string;
}

export interface BOMIngredient {
  bomID?: number;
  materialCode?: string;
  materialName?: string;
  uomName?: string;
  qty?: number;
  hpp?: number;
  totalCost?: number;
}

export interface PriceList {
  id: number;
  companyId?: number;
  esbId?: number;
  productEsbId?: number;
  branchEsbId?: number | 'ALL';
  price: number;
  flagActive?: boolean;
  priceDate?: string;
  supplierName?: string;
  productName?: string;
  productCode?: string;
  unitName?: string;
  currency?: string;
  expiredDate?: string;
  pricelistNum?: string;
  syncedAt?: string;
  updatedAt?: string;
}

export interface Staff {
  staffId: number;
  esbId?: number;
  name?: string;
  role?: string;
  isActive?: boolean;
  flagActive?: boolean;
  syncedAt?: string;
  updatedAt?: string;
}

// Sales Data Interfaces
export interface SalesRecapDetail {
  id: number;
  sales_num: string;
  sales_date: string;
  branch_code: string;
  menu_code: string;
  menu_name: string;
  category_name: string;
  qty: number;
  price: number;
  discount: number;
  total: number;
  cost: number;
  cogs: number;
  synced_at: string;
}

export interface SalesRecapHead {
  sales_num: string;
  sales_date: string;
  branch_code: string;
  grand_total: number;
  total_items: number;
  payment_method: string;
  synced_at: string;
}

// Stock System Interfaces
export interface StockSystemItem {
  productId: number;
  productCode: string;
  productName: string;
  categoryName: string;
  categoryTypeName: string;
  unit: string;
  outletStock: Record<string, number>;
  hubWhStock: Record<string, number>;
  hubCkStock: Record<string, number>;
}

// Stock Opname Interfaces
export interface StockOpname {
  soId: number;
  branchId: number;
  branchName: string;
  branchCode: string;
  branchType: 'OUTLET' | 'HUB WH' | 'HUB CK';
  periodType: 'daily_packaging' | 'weekly' | 'monthly';
  soDate: string;
  periodLabel: string;
  totalValue: number;
  varianceValue: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedBy: string;
  approvedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StockOpnameDetail {
  detailId: number;
  soId: number;
  productCode: string;
  productName: string;
  categoryName: string;
  subCategoryName: string;
  uomName: string;
  beginningBalance: number;
  mobilitas: number;
  selfPickup: number;
  transferIn: number;
  salesMenu: number;
  nonSales: number;
  wasteQty: number;
  transferOut: number;
  balanceStock: number;
  actualStock: number;
  varianceQty: number;
  varianceValue: number;
  unitPrice: number;
  notes: string;
}

// Waste Tracking Interfaces
export interface WasteRecord {
  wasteId: number;
  branchId: number;
  branchName: string;
  branchCode: string;
  branchType: 'OUTLET' | 'HUB WH' | 'HUB CK';
  wasteDate: string;
  periodLabel: string;
  totalValue: number;
  totalQty: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedBy: string;
  approvedBy: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface WasteDetail {
  detailId: number;
  wasteId: number;
  productCode: string;
  productName: string;
  categoryName: string;
  uomName: string;
  qty: number;
  unitPrice: number;
  totalValue: number;
  reason: 'expired' | 'damaged' | 'spill' | 'other';
  notes: string;
}

interface COGSRatioData {
  branchId: number;
  branchCode: string;
  branchName: string;
  branchType: 'OUTLET' | 'HUB WH' | 'HUB CK';
  period: string;
  revenue: number;
  cogs: number;
  cogsRatio: number;
  targetCogsRatio: number;
  gap: number;
  teoretisUsage: number;
  actualUsage: number;
  usageRatio: number;
  flagged: boolean;
  trend: 'up' | 'down' | 'flat';
  lastUpdated: string;
  materialCost?: number;
  wasteCost?: number;
  stockOpnameData?: any;
  wasteData?: any;
}

interface COGSRatioResponse {
  summary: {
    totalBranches: number;
    flaggedBranches: number;
    avgCogsRatio: number;
    avgUsageRatio: number;
    totalRevenue: number;
    totalCogs: number;
    totalMaterialCost?: number;
    totalWasteCost?: number;
    dataCompleteness?: number;
    period?: string;
  };
  data: COGSRatioData[];
  metadata?: {
    lastUpdated: string;
    dataSource: string;
    hasStockOpnameData: boolean;
    hasWasteData: boolean;
  };
}

interface PeriodOption {
  value: string;
  label: string;
}

interface BranchCogsDetail {
  branchId: number;
  branchCode: string;
  branchName: string;
  branchType: string;
  period: string;
  revenue: number;
  materialCost: number;
  wasteCost: number;
  totalCogs: number;
  cogsRatio: number;
  targetCogsRatio: number;
  gap: number;
  teoretisUsage: number;
  actualUsage: number;
  usageRatio: number;
  productLevelAnalysis?: ProductCogsDetail[];
  stockOpnameHistory?: any[];
  wasteHistory?: any[];
}

interface ProductCogsDetail {
  productCode: string;
  productName: string;
  categoryName: string;
  teoretisUsage: number;
  actualUsage: number;
  usageRatio: number;
  variance: number;
  unitPrice: number;
  costImpact: number;
  flagged: boolean;
}

interface ApiResponse<T> {
  summary?: any;
  data: T;
}

function normalizeCategoryType(raw: string): Product['categoryTypeName'] {
  const upper = (raw || '').toUpperCase();
  if (upper.includes('BEVERAGE') || upper.includes('MINUMAN')) return 'Beverage';
  if (upper.includes('FOOD') || upper.includes('MAKANAN')) return 'Food';
  if (upper.includes('INGREDIENT') || upper.includes('BAHAN')) return 'Ingredient';
  return 'Other';
}

function normalizeBranchType(raw: string): Branch['branchType'] {
  const upper = (raw || '').toUpperCase();
  if (upper.includes('HUB') && upper.includes('WH')) return 'HUB WH';
  if (upper.includes('HUB') && (upper.includes('CK') || upper.includes('KITCHEN'))) return 'HUB CK';
  if (upper.includes('HEAD')) return 'HEAD OFFICE';
  if (upper.includes('BULK')) return 'BULK ORDER';
  if (upper.includes('COTR')) return 'COTR';
  return 'OUTLET';
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  throw new Error('Invalid response format');
}

/**
 * Generic helper: fetch paginated rows from any esb_data.master_* table.
 * Column names come from the DB schema directly.
 */
export async function getMasterEntityRows(
  entity: string,
  options?: { limit?: number; offset?: number; search?: string }
): Promise<MasterEntityResponse> {
  // Use mock data when USE_MOCK_DATA is enabled
  if (USE_MOCK_DATA) {
    return getMockMasterEntityRows(entity, options);
  }

  const params = new URLSearchParams();
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.offset) params.set('offset', String(options.offset ?? 0));
  if (options?.search) params.set('search', options.search);

  const url = `${BACKEND_URL}/api/v1/master/${entity}/rows${params.size ? '?' + params : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  return handleResponse<MasterEntityResponse>(response);
}

/**
 * Mock data helper for master entity rows
 */
async function getMockMasterEntityRows(
  entity: string,
  options?: { limit?: number; offset?: number; search?: string }
): Promise<MasterEntityResponse> {
  const limit = options?.limit ?? 500;
  const offset = options?.offset ?? 0;

  // Dynamic import mock data
  const { MOCK_BRANCHES, MOCK_PRODUCTS } = await import('@/lib/mockData');

  let rows: MasterEntityRow[] = [];

  switch (entity.toUpperCase()) {
    case 'BRANCH':
      // Map MOCK_BRANCHES to DB column format
      rows = MOCK_BRANCHES.map((b) => ({
        id: b.branchID,
        company_id: 1,
        esb_id: b.esbId,
        name: b.branchName,
        branch_code: b.branchCode,
        branch_type: b.branchType,
        is_active: b.isActive,
        location_name: b.address,
        stock: 0,
        available_stock: 0,
        raw_data: b,
        synced_at: b.syncedAt,
        updated_at: b.updatedAt,
      }));
      break;

    case 'PRODUCT':
      // Map MOCK_PRODUCTS to DB column format
      rows = MOCK_PRODUCTS.map((p) => ({
        id: p.productId,
        esb_id: p.esbId,
        code: p.productCode,
        name: p.name,
        category_id: p.categoryId,
        category_name: p.categoryName,
        sub_category_id: p.subCategoryId,
        sub_category_name: p.subCategoryName,
        bom_id: p.bomId,
        bom_name: p.bomName,
        type: p.categoryTypeName,
        normalized_name: p.normalizedName,
        is_active: p.flagActive,
        synced_at: p.syncedAt,
        updated_at: p.updatedAt,
      }));
      break;

    default:
      // Return empty rows for unhandled entities
      rows = [];
  }

  // Apply search filter if provided
  if (options?.search) {
    const searchLower = options.search.toLowerCase();
    rows = rows.filter((r) =>
      Object.values(r).some((v) =>
        String(v).toLowerCase().includes(searchLower)
      )
    );
  }

  const total = rows.length;
  // Apply pagination
  rows = rows.slice(offset, offset + limit);

  return {
    entity: entity.toUpperCase(),
    table: `master_${entity.toLowerCase()}`,
    columns: rows.length > 0 ? Object.keys(rows[0]) : [],
    rows,
    total,
  };
}

/**
 * Fetch master data summary (entity counts, sync status).
 */
export async function getMasterSummary(): Promise<MasterSummaryResponse> {
  const response = await fetch(`${BACKEND_URL}/api/v1/master/summary`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  return handleResponse<MasterSummaryResponse>(response);
}

export const apiClient = {

/**
 * Get all branches — maps esb_data.master_branch rows to Branch interface.
 * DB columns: id, company_id, esb_id, name, branch_code, is_active,
 *             location_name, stock, available_stock, raw_data, synced_at, updated_at
 */
getBranches: async (): Promise<Branch[]> => {
  const data = await getMasterEntityRows('BRANCH', { limit: 500 });
  return data.rows.map((r) => ({
    branchID:     Number(r.id ?? 0),
    branchName:  String(r.name ?? ''),
    branchCode:  String(r.branch_code ?? ''),
    address:     String(r.location_name ?? ''),
    isActive:    Boolean(r.is_active ?? true),
    esbId:       Number(r.esb_id ?? 0),
    syncedAt:    String(r.synced_at ?? ''),
    updatedAt:   String(r.updated_at ?? ''),
    raw_data:    r.raw_data,
  }));
},

/**
 * Get branch by ID
 */
getBranchById: async (branchId: number): Promise<Branch> => {
  const branches = await getMasterEntityRows('BRANCH', { limit: 500 });
  const r = branches.rows.find(row => Number(row.id) === branchId);
  if (!r) throw new Error('Branch not found');
  return {
    branchID:  Number(r.id),
    branchName: String(r.name ?? ''),
    branchCode: String(r.branch_code ?? ''),
    address:    String(r.location_name ?? ''),
    isActive:   Boolean(r.is_active ?? true),
    esbId:      Number(r.esb_id ?? 0),
    syncedAt:   String(r.synced_at ?? ''),
    updatedAt:  String(r.updated_at ?? ''),
    raw_data:   r.raw_data,
  };
},

/**
 * Create new branch — note: backend has no POST endpoint for master_branch yet,
 * so we return a client-side constructed object for now (write ops may need backend impl).
 */
createBranch: async (branchData: Partial<Branch>): Promise<Branch> => {
  const now = new Date().toISOString();
  return {
    branchID: Date.now(),
    esbId: 0,
    branchName: branchData.branchName || '',
    branchCode: branchData.branchCode || '',
    address: branchData.address || '',
    isActive: branchData.isActive !== undefined ? branchData.isActive : true,
    syncedAt: now,
    updatedAt: now,
  };
},

/**
 * Update branch — returns updated record (client-side merge, write op may need backend impl).
 */
updateBranch: async (branchId: number, branchData: Partial<Branch>): Promise<Branch> => {
  const existing = await apiClient.getBranchById(branchId);
  return { ...existing, ...branchData, updatedAt: new Date().toISOString() };
},

/**
 * Delete branch (client-side, write op may need backend impl).
 */
deleteBranch: async (branchId: number): Promise<void> => {
  // Backend has no DELETE for master_branch yet; this is a no-op client-side.
  // Backend write ops for master data need to be implemented separately.
  return;
},

  /**
   * Get all products — maps esb_data.master_product rows to Product interface.
   */
  getProducts: async (): Promise<Product[]> => {
    const data = await getMasterEntityRows('PRODUCT', { limit: 500 });
    return data.rows.map((r) => ({
      productId:     Number(r.id ?? r.product_id ?? r.productId ?? 0),
      productCode:   String(r.code ?? r.product_code ?? r.productCode ?? ''),
      name:          String(r.name ?? r.product_name ?? r.productName ?? ''),
      categoryId:    Number(r.category_id ?? r.categoryId ?? r.parent_id ?? r.parentId ?? 0),
      categoryName:  String(r.category_name ?? r.categoryName ?? ''),
      subCategoryId:Number(r.sub_category_id ?? r.subCategoryId ?? r.subcategory_id ?? 0),
      subCategoryName: String(r.sub_category_name ?? r.subCategoryName ?? ''),
      bomId:        r.bom_id !== undefined ? Number(r.bom_id) : r.bomId !== undefined ? Number(r.bomId) : null,
      bomName:       String(r.bom_name ?? r.bomName ?? ''),
      categoryTypeName: normalizeCategoryType(r.type as string ?? r.category_type as string ?? ''),
      normalizedName: String(r.normalized_name ?? r.normalizedName ?? ''),
      flagActive:    r.is_active !== undefined ? Boolean(r.is_active) : Boolean(r.flagActive ?? r.isActive ?? true),
      esbId:        Number(r.esb_id ?? r.esbId ?? 0),
      syncedAt:     String(r.synced_at ?? r.syncedAt ?? ''),
      updatedAt:    String(r.updated_at ?? r.updatedAt ?? ''),
      unitPrice:    r.unit_price !== undefined ? Number(r.unit_price) : r.unitPrice !== undefined ? Number(r.unitPrice) : undefined,
      unit:         String(r.unit ?? r.uom ?? ''),
    }));
  },

  /**
   * Get product by ID
   */
  getProductById: async (productId: number): Promise<Product> => {
    const rows = await getMasterEntityRows('PRODUCT', { limit: 500 });
    const r = rows.rows.find(row => Number(row.id) === productId);
    if (!r) throw new Error('Product not found');
    return {
      productId: Number(r.id), productCode: String(r.code ?? ''), name: String(r.name ?? ''),
      categoryId: Number(r.category_id ?? 0), categoryName: String(r.category_name ?? ''),
      subCategoryId: Number(r.sub_category_id ?? 0), subCategoryName: String(r.sub_category_name ?? ''),
      bomId: r.bom_id != null ? Number(r.bom_id) : null,
      bomName: String(r.bom_name ?? ''),
      categoryTypeName: normalizeCategoryType(String(r.type ?? 'Other')),
      normalizedName: String(r.normalized_name ?? ''),
      flagActive: Boolean(r.flagActive ?? true),
      esbId: Number(r.esb_id ?? 0),
      syncedAt: String(r.synced_at ?? ''), updatedAt: String(r.updated_at ?? ''),
    };
  },

  /**
   * Create new product
   */
  createProduct: async (productData: Partial<Product>): Promise<Product> => {
    const now = new Date().toISOString();
    return {
      productId: Date.now(), esbId: 0,
      productCode: productData.productCode || '', name: productData.name || '',
      categoryId: productData.categoryId || 0, categoryName: productData.categoryName || '',
      subCategoryId: productData.subCategoryId || 0, subCategoryName: '',
      bomId: productData.bomId || null, bomName: productData.bomName || '',
      categoryTypeName: productData.categoryTypeName || 'Beverage',
      normalizedName: productData.normalizedName || '', flagActive: productData.flagActive !== undefined ? productData.flagActive : true,
      syncedAt: now, updatedAt: now, unitPrice: productData.unitPrice, unit: productData.unit || '',
    };
  },

  /**
   * Update product
   */
  updateProduct: async (productId: number, productData: Partial<Product>): Promise<Product> => {
    const existing = await apiClient.getProductById(productId);
    return { ...existing, ...productData, updatedAt: new Date().toISOString() };
  },

  /**
   * Delete product
   */
  deleteProduct: async (productId: number): Promise<void> => {
    return; // Backend has no DELETE for master_product yet.
  },

  /**
   * Get all categories — maps esb_data.master_category rows.
   */
  getCategories: async (): Promise<Category[]> => {
    const data = await getMasterEntityRows('CATEGORY', { limit: 500 });
    return data.rows.map((r) => ({
      categoryId: Number(r.id ?? r.category_id ?? r.categoryId ?? 0),
      esbId: Number(r.esb_id ?? 0),
      name: String(r.name ?? ''),
      typeName: normalizeCategoryType(r.type_name as string ?? '') as Category['typeName'],
      parentId: r.parent_id !== undefined ? Number(r.parent_id) : r.parentId !== undefined ? Number(r.parentId) : null,
      isActive: Boolean(r.is_active ?? r.isActive ?? r.flagActive ?? true),
      // extra fields from DB
      code: String(r.code ?? ''),
      typeId: Number(r.type_id ?? r.typeId ?? 0),
      notes: String(r.notes ?? ''),
      syncedAt: String(r.synced_at ?? ''),
      updatedAt: String(r.updated_at ?? ''),
      flagActive: Boolean(r.is_active ?? r.isActive ?? r.flag_active ?? r.flagActive ?? true),
    })) as Category[];
  },

  /**
   * Get all UOM data — maps esb_data.master_unit rows.
   * Note: master_unit only has basic columns (code, name, flag_active).
   * No category, base_unit, conversion_factor, or description fields in DB.
   */
  getUOMs: async (): Promise<Uom[]> => {
    const data = await getMasterEntityRows('UNIT', { limit: 500 });
    return data.rows.map((r): Uom => ({
      uomID: Number(r.id ?? r.uom_id ?? r.uomID ?? 0),
      uomCode: String(r.code ?? r.uom_code ?? r.uomCode ?? ''),
      uomName: String(r.name ?? r.uom_name ?? r.uomName ?? ''),
      category: 'Unit' as Uom['category'], // master_unit has no category field
      baseUnit: String(r.code ?? ''),      // use code as base unit
      conversionFactor: 1,                  // master_unit has no conversion factor
      description: '',                      // master_unit has no description field
      isActive: Boolean(r.is_active ?? r.isActive ?? r.flag_active ?? r.flagActive ?? true),
      syncedAt: String(r.synced_at ?? r.syncedAt ?? ''),
      updatedAt: String(r.updated_at ?? r.updatedAt ?? ''),
    }));
  },

  /**
   * Get all sub-categories — maps esb_data.master_sub_category rows.
   * Note: categoryName requires a lookup from esb_data.master_category.
   *   deadStock maps to dead_stock_threshold.
   */
  getSubCategories: async (): Promise<SubCategory[]> => {
    const [subCatData, catData] = await Promise.all([
      getMasterEntityRows('SUB_CATEGORY', { limit: 500 }),
      getMasterEntityRows('CATEGORY', { limit: 500 }),
    ]);
    // Build category lookup: category's esb_id -> name (sub_category.category_esb_id references category.esb_id)
    const catNameMap: Record<string, string> = {};
    for (const r of catData.rows) {
      catNameMap[String(r.esb_id ?? '')] = String(r.name ?? '');
    }
    return subCatData.rows.map((r): SubCategory => ({
      subCategoryId: Number(r.id ?? r.sub_category_id ?? r.subCategoryId ?? 0),
      esbId: Number(r.esb_id ?? 0),
      code: String(r.code ?? ''),
      name: String(r.name ?? ''),
      // category_esb_id references Category.esb_id — look up by esbId
      categoryId: Number(r.category_esb_id ?? 0),
      categoryName: catNameMap[String(r.category_esb_id ?? '')] ?? '',
      deadStock: Number(r.dead_stock_threshold ?? r.deadStock ?? 30),
      flagActive: Boolean(r.is_active ?? r.isActive ?? r.flagActive ?? true),
      syncedAt: String(r.synced_at ?? ''),
      updatedAt: String(r.updated_at ?? ''),
    }));
  },

  /**
   * Get all unit data — maps esb_data.master_unit rows.
   * Note: DB has id, company_id, esb_id, code, name, flag_active, raw_data, synced_at, updated_at.
   */
  getUnits: async (): Promise<Unit[]> => {
    const data = await getMasterEntityRows('UNIT', { limit: 500 });
    return data.rows.map((r): Unit => ({
      id: Number(r.id ?? 0),
      companyId: Number(r.company_id ?? r.companyId ?? 1),
      esbId: Number(r.esb_id ?? 0),
      code: String(r.code ?? ''),
      name: String(r.name ?? ''),
      flagActive: Boolean(r.is_active ?? r.isActive ?? r.flag_active ?? r.flagActive ?? true),
      syncedAt: String(r.synced_at ?? ''),
      updatedAt: String(r.updated_at ?? ''),
    }));
  },

  /**
   * Get all BOM data — maps esb_data.master_bill_of_material rows.
   */
  getBOMs: async (): Promise<BOM[]> => {
    const data = await getMasterEntityRows('BILL_OF_MATERIAL', { limit: 500 });
    return data.rows.map((r): BOM => ({
      bomId: Number(r.id ?? r.bom_id ?? r.bomId ?? 0),
      esbId: Number(r.esb_id ?? 0),
      companyId: Number(r.company_id ?? 1),
      productEsbId: Number(r.product_esb_id ?? 0),
      code: String(r.code ?? ''),
      name: String(r.name ?? r.bom_name ?? ''),
      uomId: Number(r.uom_id ?? 0),
      uomName: String(r.uom_name ?? r.uomName ?? ''),
      outputQty: Number(r.output_qty ?? r.outputQty ?? 1),
      flagActive: Boolean(r.is_active ?? r.isActive ?? r.flagActive ?? true),
      bomTypeId: Number(r.bom_type_id ?? r.bomTypeId ?? 1),
      bomTypeName: String(r.bom_type_name ?? r.bomTypeName ?? 'Standard'),
      productName: String(r.product_name ?? r.productName ?? ''),
      syncedAt: String(r.synced_at ?? ''),
      updatedAt: String(r.updated_at ?? ''),
    }));
  },

  /**
   * Get all price list data — maps esb_data.master_pricelist rows.
   * DB columns: id, company_id, esb_id, product_esb_id, branch_esb_id, price,
   *   flag_active, price_date, supplier_name, product_name, product_code,
   *   unit_name, currency, expired_date, price_list_num, product_detail_esb_id,
   *   uom_id, currency_id, applicable_branch, raw_data, synced_at, updated_at
   */
  getPriceLists: async (): Promise<PriceList[]> => {
    const data = await getMasterEntityRows('PRICELIST', { limit: 500 });
    return data.rows.map((r): PriceList => ({
      id: Number(r.id ?? 0),
      companyId: Number(r.company_id ?? 1),
      esbId: Number(r.esb_id ?? 0),
      productEsbId: Number(r.product_esb_id ?? 0),
      branchEsbId: (r.branch_esb_id ?? r.branchEsbId ?? 'ALL') as number | 'ALL',
      price: Number(r.price ?? 0),
      flagActive: Boolean(r.is_active ?? r.isActive ?? r.flag_active ?? r.flagActive ?? true),
      priceDate: String(r.price_date ?? r.priceDate ?? ''),
      supplierName: String(r.supplier_name ?? r.supplierName ?? ''),
      productName: String(r.product_name ?? r.productName ?? ''),
      productCode: String(r.product_code ?? r.productCode ?? ''),
      unitName: String(r.unit_name ?? r.unitName ?? ''),
      currency: String(r.currency ?? 'IDR'),
      expiredDate: String(r.expired_date ?? r.expiredDate ?? ''),
      pricelistNum: String(r.price_list_num ?? r.pricelistNum ?? ''),
      syncedAt: String(r.synced_at ?? ''),
      updatedAt: String(r.updated_at ?? ''),
    }));
  },

  /**
   * Get all staff data — maps esb_data.master_user rows.
   * Note: master_user has username, full_name, role_id, role_desc.
   * No email, phone, branch_name, branch_code fields in DB.
   */
  getStaff: async (): Promise<Staff[]> => {
    const data = await getMasterEntityRows('USER', { limit: 500 });
    return data.rows.map((r): Staff => ({
      staffId: Number(r.id ?? r.staff_id ?? 0),
      esbId: Number(r.esb_id ?? 0),
      name: String(r.full_name ?? r.name ?? r.username ?? ''),
      role: String(r.role_desc ?? r.role_id ?? r.role ?? ''),
      isActive: Boolean(r.is_active ?? r.isActive ?? r.flagActive ?? true),
      flagActive: Boolean(r.is_active ?? r.isActive ?? r.flagActive ?? true),
      syncedAt: String(r.synced_at ?? ''),
      updatedAt: String(r.updated_at ?? ''),
    }));
  },

  // ============================================================================
  // SALES REPORTING ENDPOINTS
  // ============================================================================
  
  /**
   * Get sales recap detail data from v_sales_recap_detail
   * @param period Period in YYYY-MM format
   * @param branchCode Optional branch code filter
   */
  getSalesRecapDetail: async (period: string, branchCode?: string): Promise<SalesRecapDetail[]> => {
    if (USE_MOCK_DATA) {
      return [];
    }

    const params = new URLSearchParams({ period });
    if (branchCode) {
      params.append('branch_code', branchCode);
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/sales/recap-detail?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    return handleResponse<SalesRecapDetail[]>(response);
  },

  /**
   * Get sales recap head data
   * @param period Period in YYYY-MM format
   * @param branchCode Optional branch code filter
   */
  getSalesRecapHead: async (period: string, branchCode?: string): Promise<SalesRecapHead[]> => {
    if (USE_MOCK_DATA) {
      return [];
    }

    const params = new URLSearchParams({ period });
    if (branchCode) {
      params.append('branch_code', branchCode);
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/sales/recap-head?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    return handleResponse<SalesRecapHead[]>(response);
  },

  /**
   * Get sales summary for reporting
   * @param period Period in YYYY-MM format
   */
  getSalesSummary: async (period: string): Promise<any> => {
    if (USE_MOCK_DATA) {
      return {
        totalRevenue: 0,
        totalTransactions: 0,
        totalItems: 0,
        avgTicketSize: 0,
        branchBreakdown: [],
      };
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/sales/summary?period=${period}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    return handleResponse(response);
  },

  // ============================================================================
  // STOCK SYSTEM ENDPOINTS
  // ============================================================================
  
  /**
   * Get system stock data for all locations
   */
  getStockSystem: async (): Promise<StockSystemItem[]> => {
    if (USE_MOCK_DATA) {
      return [];
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/stock/system`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    return handleResponse<StockSystemItem[]>(response);
  },

  /**
   * Update stock system data
   */
  updateStockSystem: async (stockData: StockSystemItem[]): Promise<void> => {
    if (USE_MOCK_DATA) {
      return;
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/stock/system`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stocks: stockData }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Stock update failed: ${errorText}`);
    }
  },

  /**
   * Get stock for specific branch and product
   */
  getBranchStock: async (branchId: number, productId: number): Promise<number> => {
    if (USE_MOCK_DATA) {
      return 0;
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/stock/branch/${branchId}/product/${productId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await handleResponse<{ quantity: number }>(response);
    return data.quantity;
  },

  // ============================================================================
  // STOCK OPNAME ENDPOINTS
  // ============================================================================
  
  /**
   * Get stock opname records
   * @param periodType Optional filter by period type
   * @param branchId Optional filter by branch ID
   * @param status Optional filter by status
   */
  getStockOpnames: async (periodType?: string, branchId?: number, status?: string): Promise<StockOpname[]> => {
    if (USE_MOCK_DATA) {
      const { MOCK_STOCK_OPNAMES } = await import('@/lib/mockData');
      let data = [...MOCK_STOCK_OPNAMES];
      if (periodType) data = data.filter(so => so.periodType === periodType);
      if (branchId) data = data.filter(so => so.branchId === branchId);
      if (status) data = data.filter(so => so.status === status);
      return data;
    }

    const params = new URLSearchParams();
    if (periodType) params.append('period_type', periodType);
    if (branchId) params.append('branch_id', branchId.toString());
    if (status) params.append('status', status);

    const response = await fetch(`${BACKEND_URL}/api/v1/stock-opname?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    return handleResponse<StockOpname[]>(response);
  },

  /**
   * Get stock opname by ID with details
   */
  getStockOpnameById: async (soId: number): Promise<{ header: StockOpname; details: StockOpnameDetail[] }> => {
    if (USE_MOCK_DATA) {
      const { MOCK_STOCK_OPNAMES, MOCK_STOCK_OPNAME_DETAILS } = await import('@/lib/mockData');
      const header = MOCK_STOCK_OPNAMES.find(so => so.soId === soId);
      if (!header) throw new Error('Stock Opname not found');
      const details = MOCK_STOCK_OPNAME_DETAILS.filter(d => d.soId === soId);
      return { header, details };
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/stock-opname/${soId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    return handleResponse(response);
  },

  /**
   * Create new stock opname
   */
  createStockOpname: async (stockOpnameData: {
    branchId: number;
    periodType: 'daily_packaging' | 'weekly' | 'monthly';
    soDate: string;
    submittedBy: string;
    details: Omit<StockOpnameDetail, 'detailId' | 'soId'>[];
  }): Promise<StockOpname> => {
    if (USE_MOCK_DATA) {
      const newSO: StockOpname = {
        soId: Date.now(),
        branchId: stockOpnameData.branchId,
        branchName: 'Mock Branch',
        branchCode: 'MOCK',
        branchType: 'OUTLET',
        periodType: stockOpnameData.periodType,
        soDate: stockOpnameData.soDate,
        periodLabel: 'Mock Period',
        totalValue: stockOpnameData.details.reduce((sum, d) => sum + d.actualStock * d.unitPrice, 0),
        varianceValue: 0,
        status: 'draft',
        submittedBy: stockOpnameData.submittedBy,
        approvedBy: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newSO;
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/stock-opname`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stockOpnameData),
    });

    return handleResponse<StockOpname>(response);
  },

  /**
   * Update stock opname
   */
  updateStockOpname: async (soId: number, stockOpnameData: Partial<StockOpname>): Promise<StockOpname> => {
    if (USE_MOCK_DATA) {
      const { MOCK_STOCK_OPNAMES } = await import('@/lib/mockData');
      const so = MOCK_STOCK_OPNAMES.find(s => s.soId === soId);
      if (!so) throw new Error('Stock Opname not found');
      return { ...so, ...stockOpnameData, updatedAt: new Date().toISOString() } as StockOpname;
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/stock-opname/${soId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stockOpnameData),
    });

    return handleResponse<StockOpname>(response);
  },

  /**
   * Submit stock opname for approval
   */
  submitStockOpname: async (soId: number): Promise<StockOpname> => {
    return apiClient.updateStockOpname(soId, { status: 'submitted' });
  },

  /**
   * Approve stock opname
   */
  approveStockOpname: async (soId: number, approvedBy: string): Promise<StockOpname> => {
    return apiClient.updateStockOpname(soId, { status: 'approved', approvedBy });
  },

  /**
   * Reject stock opname
   */
  rejectStockOpname: async (soId: number): Promise<StockOpname> => {
    return apiClient.updateStockOpname(soId, { status: 'rejected', approvedBy: null });
  },

  /**
   * Delete stock opname
   */
  deleteStockOpname: async (soId: number): Promise<void> => {
    if (USE_MOCK_DATA) {
      return;
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/stock-opname/${soId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Delete failed: ${errorText}`);
    }
  },

  // ============================================================================
  // WASTE TRACKING ENDPOINTS
  // ============================================================================
  
  /**
   * Get waste records
   * @param branchId Optional filter by branch ID
   * @param status Optional filter by status
   * @param startDate Optional start date filter
   * @param endDate Optional end date filter
   */
  getWasteRecords: async (branchId?: number, status?: string, startDate?: string, endDate?: string): Promise<WasteRecord[]> => {
    if (USE_MOCK_DATA) {
      const { MOCK_WASTE_RECORDS } = await import('@/lib/mockData');
      let data = [...MOCK_WASTE_RECORDS];
      if (branchId) data = data.filter(w => w.branchId === branchId);
      if (status) data = data.filter(w => w.status === status);
      if (startDate) data = data.filter(w => w.wasteDate >= startDate);
      if (endDate) data = data.filter(w => w.wasteDate <= endDate);
      return data;
    }

    const params = new URLSearchParams();
    if (branchId) params.append('branch_id', branchId.toString());
    if (status) params.append('status', status);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await fetch(`${BACKEND_URL}/api/v1/waste?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    return handleResponse<WasteRecord[]>(response);
  },

  /**
   * Get waste record by ID with details
   */
  getWasteById: async (wasteId: number): Promise<{ header: WasteRecord; details: WasteDetail[] }> => {
    if (USE_MOCK_DATA) {
      const { MOCK_WASTE_RECORDS, MOCK_WASTE_DETAILS } = await import('@/lib/mockData');
      const header = MOCK_WASTE_RECORDS.find(w => w.wasteId === wasteId);
      if (!header) throw new Error('Waste record not found');
      const details = MOCK_WASTE_DETAILS.filter(d => d.wasteId === wasteId);
      return { header, details };
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/waste/${wasteId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    return handleResponse(response);
  },

  /**
   * Create new waste record
   */
  createWasteRecord: async (wasteData: {
    branchId: number;
    wasteDate: string;
    submittedBy: string;
    notes?: string;
    details: Omit<WasteDetail, 'detailId' | 'wasteId' | 'totalValue'>[];
  }): Promise<WasteRecord> => {
    if (USE_MOCK_DATA) {
      const totalValue = wasteData.details.reduce((sum, d) => sum + (d.qty * d.unitPrice), 0);
      const totalQty = wasteData.details.reduce((sum, d) => sum + d.qty, 0);
      
      const newWaste: WasteRecord = {
        wasteId: Date.now(),
        branchId: wasteData.branchId,
        branchName: 'Mock Branch',
        branchCode: 'MOCK',
        branchType: 'OUTLET',
        wasteDate: wasteData.wasteDate,
        periodLabel: 'Mock Period',
        totalValue,
        totalQty,
        status: 'draft',
        submittedBy: wasteData.submittedBy,
        approvedBy: null,
        notes: wasteData.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newWaste;
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/waste`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(wasteData),
    });

    return handleResponse<WasteRecord>(response);
  },

  /**
   * Update waste record
   */
  updateWasteRecord: async (wasteId: number, wasteData: Partial<WasteRecord>): Promise<WasteRecord> => {
    if (USE_MOCK_DATA) {
      const { MOCK_WASTE_RECORDS } = await import('@/lib/mockData');
      const waste = MOCK_WASTE_RECORDS.find(w => w.wasteId === wasteId);
      if (!waste) throw new Error('Waste record not found');
      return { ...waste, ...wasteData, updatedAt: new Date().toISOString() } as WasteRecord;
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/waste/${wasteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(wasteData),
    });

    return handleResponse<WasteRecord>(response);
  },

  /**
   * Submit waste record for approval
   */
  submitWasteRecord: async (wasteId: number): Promise<WasteRecord> => {
    return apiClient.updateWasteRecord(wasteId, { status: 'submitted' });
  },

  /**
   * Approve waste record
   */
  approveWasteRecord: async (wasteId: number, approvedBy: string): Promise<WasteRecord> => {
    return apiClient.updateWasteRecord(wasteId, { status: 'approved', approvedBy });
  },

  /**
   * Delete waste record
   */
  deleteWasteRecord: async (wasteId: number): Promise<void> => {
    if (USE_MOCK_DATA) {
      return;
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/waste/${wasteId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Delete failed: ${errorText}`);
    }
  },

  /**
   * Get waste analysis for COGS impact
   * @param period Period in YYYY-MM format
   * @param branchId Optional branch ID filter
   */
  getWasteAnalysis: async (period: string, branchId?: number): Promise<any> => {
    if (USE_MOCK_DATA) {
      return {
        totalWasteCost: 0,
        wasteCount: 0,
        topWasteProducts: [],
        wasteByReason: {
          expired: { count: 0, totalCost: 0, totalQty: 0 },
          damaged: { count: 0, totalCost: 0, totalQty: 0 },
          spill: { count: 0, totalCost: 0, totalQty: 0 },
          other: { count: 0, totalCost: 0, totalQty: 0 },
        },
        riskLevel: 'low' as const,
      };
    }

    const params = new URLSearchParams({ period });
    if (branchId) params.append('branch_id', branchId.toString());

    const response = await fetch(`${BACKEND_URL}/api/v1/waste/analysis?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    return handleResponse(response);
  },

  /**
   * Get COGS Ratio data for all branches
   * @param period Period in YYYY-MM format
   * @param branchType Optional filter by branch type
   */
  getCOGSRatio: async (period: string, branchType?: string): Promise<COGSRatioResponse> => {
    if (USE_MOCK_DATA) {
      const { MOCK_COGS_RATIO_DATA } = await import('@/lib/mockData');
      type ExtendedCOGSData = COGSRatioData & { materialCost?: number; wasteCost?: number };
      const data: ExtendedCOGSData[] = branchType
        ? MOCK_COGS_RATIO_DATA.filter((d) => d.branchType === branchType)
        : MOCK_COGS_RATIO_DATA.map((item) => ({
            ...item,
            period,
            materialCost: item.cogs * 0.85,
            wasteCost: item.cogs * 0.15,
          }));

      return {
        summary: {
          totalBranches: data.length,
          flaggedBranches: data.filter((d) => d.flagged).length,
          avgCogsRatio: data.reduce((sum, d) => sum + d.cogsRatio, 0) / data.length,
          avgUsageRatio: data.reduce((sum, d) => sum + d.usageRatio, 0) / data.length,
          totalRevenue: data.reduce((sum, d) => sum + d.revenue, 0),
          totalCogs: data.reduce((sum, d) => sum + d.cogs, 0),
          totalMaterialCost: data.reduce((sum, d) => sum + (d.materialCost || 0), 0),
          totalWasteCost: data.reduce((sum, d) => sum + (d.wasteCost || 0), 0),
          dataCompleteness: 85,
          period,
        },
        data,
        metadata: {
          lastUpdated: new Date().toISOString(),
          dataSource: 'mock',
          hasStockOpnameData: false,
          hasWasteData: false,
        },
      };
    }

    const params = new URLSearchParams({ period });
    if (branchType) {
      params.append('branch_type', branchType);
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/cogs-ratio?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    return handleResponse<COGSRatioResponse>(response);
  },

  /**
   * Get COGS Ratio data for a specific branch with detailed analysis
   * @param branchId Branch ID
   * @param period Period in YYYY-MM format
   */
  getCOGSRatioByBranch: async (branchId: number, period: string): Promise<BranchCogsDetail> => {
    if (USE_MOCK_DATA) {
      const { MOCK_COGS_RATIO_DATA } = await import('@/lib/mockData');
      const data = MOCK_COGS_RATIO_DATA.find((d) => d.branchId === branchId);
      if (!data) {
        throw new Error('Branch not found');
      }

      return {
        branchId: data.branchId,
        branchCode: data.branchCode,
        branchName: data.branchName,
        branchType: data.branchType,
        period,
        revenue: data.revenue,
        materialCost: data.cogs * 0.85,
        wasteCost: data.cogs * 0.15,
        totalCogs: data.cogs,
        cogsRatio: data.cogsRatio,
        targetCogsRatio: data.targetCogsRatio,
        gap: data.gap,
        teoretisUsage: data.teoretisUsage,
        actualUsage: data.actualUsage,
        usageRatio: data.usageRatio,
        productLevelAnalysis: [],
        stockOpnameHistory: [],
        wasteHistory: [],
      };
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/cogs-ratio/${branchId}?period=${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    return handleResponse<BranchCogsDetail>(response);
  },

  /**
   * Get available periods for COGS analysis
   */
  getAvailablePeriods: async (): Promise<PeriodOption[]> => {
    if (USE_MOCK_DATA) {
      const currentDate = new Date();
      const periods: PeriodOption[] = [];
      
      for (let i = 0; i < 12; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const value = date.toISOString().slice(0, 7);
        const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        periods.push({ value, label });
      }
      
      return periods;
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/cogs-ratio/periods`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<PeriodOption[]>(response);
  },

  /**
   * Get COGS trend analysis for multiple periods
   * @param branchId Optional branch ID for branch-specific trends
   * @param periods Array of periods to analyze
   */
  getCOGSTrend: async (branchId?: number, periods?: string[]): Promise<any[]> => {
    if (USE_MOCK_DATA) {
      const trendData = [];
      const currentDate = new Date();
      
      const numberOfPeriods = periods?.length || 6;
      const targetPeriods = periods || Array.from({ length: numberOfPeriods }, (_, i) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        return date.toISOString().slice(0, 7);
      });

      for (const period of targetPeriods) {
        trendData.push({
          period,
          avgCogsRatio: 65 + Math.random() * 10 - 5,
          avgUsageRatio: 100 + Math.random() * 10 - 5,
          totalRevenue: 35_000_000 + Math.random() * 10_000_000,
          totalCogs: 22_000_000 + Math.random() * 5_000_000,
          flaggedBranches: Math.floor(Math.random() * 10),
        });
      }

      return trendData.reverse();
    }

    const params = new URLSearchParams();
    if (branchId) params.append('branch_id', branchId.toString());
    if (periods) periods.forEach(p => params.append('periods', p));

    const response = await fetch(`${BACKEND_URL}/api/v1/cogs-ratio/trend?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<any[]>(response);
  },

  /**
   * Get companies data
   */
  getCompanies: async () => {
    const response = await fetch(`${BACKEND_URL}/api/v1/companies`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  /**
   * Get data inventory
   */
  getDataInventory: async () => {
    const response = await fetch(`${BACKEND_URL}/api/v1/data-inventory`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  /**
   * Get Stock Opname data for COGS calculation
   * @param branchId Branch ID
   * @param period Period in YYYY-MM format
   */
  getStockOpnameData: async (branchId: number, period: string) => {
    if (USE_MOCK_DATA) {
      return {
        branchId,
        period,
        stockOpnameRecords: [],
        hasData: false,
        message: 'Mock data - Stock Opname integration pending',
      };
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/stock-opname/branch/${branchId}?period=${period}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return handleResponse(response);
  },

  /**
   * Get Waste Tracking data for COGS impact analysis
   * @param branchId Branch ID
   * @param period Period in YYYY-MM format
   */
  getWasteTrackingData: async (branchId: number, period: string) => {
    if (USE_MOCK_DATA) {
      return {
        branchId,
        period,
        wasteRecords: [],
        totalWasteCost: 0,
        hasData: false,
        message: 'Mock data - Waste Tracking integration pending',
      };
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/waste/branch/${branchId}?period=${period}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return handleResponse(response);
  },

  /**
   * Export COGS data to CSV
   * @param period Period in YYYY-MM format
   * @param branchType Optional filter by branch type
   */
  exportCOGSToCSV: async (period: string, branchType?: string): Promise<string> => {
    const data = await apiClient.getCOGSRatio(period, branchType);
    
    const headers = [
      'Branch ID', 'Branch Code', 'Branch Name', 'Branch Type', 'Period',
      'Revenue', 'COGS', 'COGS Ratio', 'Target COGS Ratio', 'Gap',
      'Theoretical Usage', 'Actual Usage', 'Usage Ratio', 'Flagged', 'Trend', 'Last Updated'
    ];

    const csvRows = [
      headers.join(','),
      ...data.data.map(row => [
        row.branchId,
        row.branchCode,
        `"${row.branchName}"`,
        row.branchType,
        row.period,
        row.revenue,
        row.cogs,
        row.cogsRatio.toFixed(1),
        row.targetCogsRatio,
        row.gap.toFixed(1),
        row.teoretisUsage,
        row.actualUsage,
        row.usageRatio.toFixed(1),
        row.flagged,
        row.trend,
        row.lastUpdated
      ].join(','))
    ];

    return csvRows.join('\n');
  },

  /**
   * Get dashboard summary statistics
   * @param period Period in YYYY-MM format
   */
  getDashboardSummary: async (period: string) => {
    if (USE_MOCK_DATA) {
      return {
        period,
        avgCogsRatio: 67.4,
        avgUsageRatio: 103.5,
        totalRevenue: 395_100_000,
        totalCogs: 266_221_000,
        flaggedOutlets: 3,
        pendingApprovals: 12,
        criticalStockItems: 5,
        wasteValueMTD: 4_520_000,
        dataCompleteness: 85,
        hasStockOpnameData: false,
        hasWasteData: false,
      };
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/dashboard/summary?period=${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },
};

export type { 
  COGSRatioData, 
  COGSRatioResponse, 
  PeriodOption, 
  BranchCogsDetail,
  ProductCogsDetail 
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};
