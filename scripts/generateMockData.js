/**
 * Script to parse sample-master CSV files and generate mock data arrays
 * Run with: node scripts/generateMockData.js
 */
const fs = require('fs');
const path = require('path');

const CSV_DIR = path.join(__dirname, '../docs/sample-master');

function parseCSV(filename) {
  const content = fs.readFileSync(path.join(CSV_DIR, filename), 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const obj = {};
    headers.forEach((h, i) => {
      let val = values[i] || '';
      // Parse booleans
      if (val === 'true') val = true;
      else if (val === 'false') val = false;
      // Parse numbers
      else if (!isNaN(val) && val !== '') val = Number(val);
      obj[h] = val;
    });
    return obj;
  });
}

function generateBranchData() {
  const data = parseCSV('master_branch_rows.csv');
  const code = data.map((row, idx) => {
    const id = row.id ?? idx + 1;
    return `  { branchId: ${id}, esbId: ${row.esb_id ?? id}, code: '${row.code ?? ''}', name: '${(row.name || '').replace(/'/g, "\\'")}', type: '${row.type || ''}', brand: '${row.brand || ''}', flagActive: ${row.flag_active ?? true}, address: '${(row.address || '').replace(/'/g, "\\'")}', phone: '${row.phone || ''}', email: '${row.email || ''}', syncedAt: '${row.synced_at || ''}', updatedAt: '${row.updated_at || ''}' }`;
  });
  return `export const MOCK_BRANCHES: Branch[] = [\n${code.join(',\n')}\n];`;
}

function generateCategoryData() {
  const data = parseCSV('master_category_rows.csv');
  const code = data.map((row, idx) => {
    const id = row.id ?? idx + 1;
    return `  { categoryId: ${id}, esbId: ${row.esb_id ?? id}, code: '${row.code || ''}', name: '${(row.name || '').replace(/'/g, "\\'")}', type: '${row.type || ''}', typeId: ${row.type_id || 0}, flagActive: ${row.flag_active ?? true}, notes: '${(row.notes || '').replace(/'/g, "\\'")}', syncedAt: '${row.synced_at || ''}', updatedAt: '${row.updated_at || ''}' }`;
  });
  return `export const MOCK_CATEGORIES: Category[] = [\n${code.join(',\n')}\n];`;
}

function generateSubCategoryData() {
  const data = parseCSV('master_sub_category_rows.csv');
  const code = data.map((row, idx) => {
    const id = row.id ?? idx + 1;
    return `  { subCategoryId: ${id}, esbId: ${row.esb_id ?? id}, code: '${row.code || ''}', name: '${(row.name || '').replace(/'/g, "\\'")}', categoryId: ${row.category_id || 0}, categoryName: '${(row.category_name || '').replace(/'/g, "\\'")}', deadStock: ${row.dead_stock ?? 0}, flagActive: ${row.flag_active ?? true}, syncedAt: '${row.synced_at || ''}', updatedAt: '${row.updated_at || ''}' }`;
  });
  return `export const MOCK_SUB_CATEGORIES: SubCategory[] = [\n${code.join(',\n')}\n];`;
}

function generateProductData() {
  const data = parseCSV('master_product_rows.csv');
  const code = data.map((row, idx) => {
    const id = row.id ?? idx + 1;
    const name = (row.name || '').replace(/'/g, "\\'").replace(/\n/g, ' ');
    const categoryName = (row.category_name || '').replace(/'/g, "\\'");
    const subCategoryName = (row.sub_category_name || '').replace(/'/g, "\\'");
    const bomName = (row.bom_name || '').replace(/'/g, "\\'");
    const categoryTypeName = (row.category_type_name || '').replace(/'/g, "\\'");
    const normalizedName = (row.normalized_name || '').replace(/'/g, "\\'");
    return `  { productId: ${id}, esbId: ${row.esb_id ?? id}, productCode: '${row.product_code || ''}', name: '${name}', categoryId: 1, categoryName: '${categoryName}', subCategoryId: 1, subCategoryName: '${subCategoryName}', bomId: null, bomName: '${bomName || '—'}', categoryTypeName: '${categoryTypeName}', normalizedName: '${normalizedName}', flagActive: ${row.flag_active ?? true}, syncedAt: '${(row.synced_at || '').split('+')[0]}', updatedAt: '${(row.updated_at || '').split('+')[0]}' }`;
  });
  return `export const MOCK_PRODUCTS: Product[] = [\n${code.join(',\n')}\n];`;
}

function generateBomData() {
  const data = parseCSV('master_bill_of_material_rows.csv');
  const code = data.map((row, idx) => {
    const id = row.id ?? idx + 1;
    const name = (row.name || '').replace(/'/g, "\\'");
    const code2 = (row.code || '').replace(/'/g, "\\'");
    return `  { bomId: ${id}, esbId: ${row.esb_id ?? id}, code: '${code2}', name: '${name}', uomId: ${row.uom_id || 1}, uomName: '${row.uom_name || 'PCS'}', outputQty: ${row.output_qty || 1}, flagActive: ${row.flag_active ?? true}, syncedAt: '${(row.synced_at || '').split('+')[0]}', updatedAt: '${(row.updated_at || '').split('+')[0]}' }`;
  });
  return `export const MOCK_BOM_DATA: BomItem[] = [\n${code.join(',\n')}\n];`;
}

function generateUnitData() {
  const data = parseCSV('master_unit_rows.csv');
  const code = data.map((row, idx) => {
    const id = row.id ?? idx + 1;
    const name = (row.name || '').replace(/'/g, "\\'");
    const code2 = (row.code || '').replace(/'/g, "\\'");
    return `  { id: ${id}, companyId: ${row.company_id ?? 1}, esbId: ${row.esb_id ?? id}, code: '${code2}', name: '${name}', flagActive: ${row.flag_active ?? true}, syncedAt: '${(row.synced_at || '').split('+')[0]}', updatedAt: '${(row.updated_at || '').split('+')[0]}' }`;
  });
  return `export const MOCK_UNITS: Unit[] = [\n${code.join(',\n')}\n];`;
}

function generatePriceListData() {
  const data = parseCSV('master_pricelist_rows.csv');
  const code = data.map((row, idx) => {
    const id = row.id ?? idx + 1;
    const productName = (row.product_name || '').replace(/'/g, "\\'").replace(/\n/g, ' ');
    const supplierName = (row.supplier_name || '').replace(/'/g, "\\'");
    const productCode = (row.product_code || '').replace(/'/g, "\\'");
    const unitName = (row.unit_name || '').replace(/'/g, "\\'");
    const currency = (row.currency || 'Rupiah').replace(/'/g, "\\'");
    const expiredDate = row.expired_date || '';
    const priceDate = row.price_date || '';
    return `  { id: ${id}, companyId: ${row.company_id ?? 1}, esbId: ${row.esb_id ?? id}, productEsbId: ${row.product_esb_id ?? 0}, branchEsbId: ${row.branch_esb_id ?? 0}, price: ${row.price ?? 0}, flagActive: ${row.flag_active ?? true}, priceDate: '${priceDate}', supplierName: '${supplierName}', productName: '${productName}', productCode: '${productCode}', unitName: '${unitName}', currency: '${currency}', expiredDate: '${expiredDate}', pricelistNum: '${row.pricelist_num || ''}', syncedAt: '${(row.synced_at || '').split('+')[0]}', updatedAt: '${(row.updated_at || '').split('+')[0]}' }`;
  });
  return `export const MOCK_PRICELISTS: PriceList[] = [\n${code.join(',\n')}\n];`;
}

console.log('=== MOCK_BRANCHES ===');
console.log(generateBranchData());
console.log('\n=== MOCK_CATEGORIES ===');
console.log(generateCategoryData());
console.log('\n=== MOCK_SUB_CATEGORIES ===');
console.log(generateSubCategoryData());
console.log('\n=== MOCK_PRODUCTS ===');
console.log(generateProductData());
console.log('\n=== MOCK_BOM_DATA ===');
console.log(generateBomData());
console.log('\n=== MOCK_UNITS ===');
console.log(generateUnitData());
console.log('\n=== MOCK_PRICELISTS ===');
console.log(generatePriceListData());
