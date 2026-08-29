#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate TypeScript mock data from sample-master CSV files.
Maps CSV fields to the existing TypeScript interface field names.
"""
import csv
import re
import os

CSV_DIR = r"D:\kopicalf-projection\fe-kopicalf-internal\docs\sample-master"
OUTPUT_FILE = r"D:\kopicalf-projection\fe-kopicalf-internal\scripts\mock_data_output.ts"

BOM_RE = re.compile(r'\ufeff')

def clean_str(s):
    if s is None:
        return ''
    s = str(s).strip()
    s = BOM_RE.sub('', s)
    backslash = chr(92)
    s = s.replace(backslash, backslash + backslash).replace("'", backslash + "'")
    s = s.replace('\n', ' ').replace('\r', '').replace('\t', ' ')
    s = ''.join(ch for ch in s if ord(ch) >= 32 or ch in '\t\n')
    return s

def clean_date(s):
    if not s:
        return ''
    s = str(s).strip()
    s = re.sub(r'\.\d+\+\d+$', '', s)
    s = re.sub(r'\+\d+$', '', s)
    s = re.sub(r'[T]', ' ', s)
    return s

def parse_csv(filename):
    filepath = os.path.join(CSV_DIR, filename)
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        content = f.read()
    content = content.replace('\r\n', '\n').replace('\r', '\n')
    lines = content.strip().split('\n')
    headers = [h.strip().replace('"', '') for h in lines[0].split(',')]
    rows = []
    for line in lines[1:]:
        values = []
        current = ''
        in_quotes = False
        for ch in line:
            if ch == '"':
                in_quotes = not in_quotes
            elif ch == ',' and not in_quotes:
                values.append(current.strip())
                current = ''
            else:
                current += ch
        values.append(current.strip())
        obj = {}
        for j, h in enumerate(headers):
            v = values[j] if j < len(values) else ''
            if v == 'true':
                obj[h] = True
            elif v == 'false':
                obj[h] = False
            elif v == '' or v == '{}':
                obj[h] = ''
            elif re.match(r'^-?\d+$', v):
                obj[h] = int(v)
            elif re.match(r'^-?\d+\.\d+$', v):
                obj[h] = float(v)
            else:
                obj[h] = clean_str(v)
        rows.append(obj)
    return rows

# =============================================================================
# BRANCH: CSV fields -> Branch interface fields
# CSV: id, company_id, esb_id, name, branch_code, is_active, location_name, stock, available_stock, normalized_name, raw_data, synced_at, updated_at
# Interface: branchID, branchName, branchCode, branchType, brandName, address, phone, omsVersion, isActive, esbId
# =============================================================================
BRANCH_TYPE_MAP = {
    'OUTLET': 'OUTLET',
    'WAREHOUSE': 'HUB WH',
    'HUB CK': 'HUB CK',
    'CENTRAL KITCHEN': 'HUB CK',
    'HUB WH': 'HUB WH',
    'HEAD OFFICE': 'HEAD OFFICE',
    'BULK ORDER': 'BULK ORDER',
    'COTR': 'COTR',
}

def infer_branch_type(name):
    name_upper = name.upper()
    if 'HUB CK' in name_upper or 'CENTRAL KITCHEN' in name_upper or 'CK ' in name_upper:
        return 'HUB CK'
    if 'HUB WH' in name_upper or 'WAREHOUSE' in name_upper:
        return 'HUB WH'
    if 'HEAD OFFICE' in name_upper or 'HEADQUARTER' in name_upper:
        return 'HEAD OFFICE'
    if 'BULK ORDER' in name_upper or 'BULK' in name_upper:
        return 'BULK ORDER'
    if 'OUTLET' in name_upper or 'KOPI CALF' in name_upper or 'KOPICA' in name_upper or 'KSUT' in name_upper or 'RMBV' in name_upper:
        return 'OUTLET'
    return 'OUTLET'

def infer_brand_name(name):
    name_upper = name.upper()
    if 'KOPI CALF' in name_upper or 'KOPICA' in name_upper:
        return 'Kopicaf'
    if 'CALF WAREHOUSE' in name_upper or 'CALF.STORE' in name_upper:
        return 'Calf Warehouse'
    if 'KSUT' in name_upper or 'RMBV' in name_upper:
        return 'Kopicaf'
    return 'Kopicaf'

def gen_branches(rows):
    lines = ['export const MOCK_BRANCHES: Branch[] = [']
    for i, r in enumerate(rows):
        bid = r.get('id', i + 1)
        esbid = r.get('esb_id', bid)
        name = r.get('name', '')
        code = r.get('branch_code', r.get('code', ''))
        branch_type = infer_branch_type(name)
        brand = infer_brand_name(name)
        is_active = r.get('is_active', r.get('flag_active', True))
        synced = clean_date(r.get('synced_at', ''))
        updated = clean_date(r.get('updated_at', ''))
        c = ',' if i < len(rows) - 1 else ''
        lines.append(
            f"  {{ branchID: {bid}, branchName: '{name}', branchCode: '{code}', "
            f"branchType: '{branch_type}' as const, brandName: '{brand}', address: '', phone: '', omsVersion: '', "
            f"isActive: {str(is_active).lower()}, esbId: {esbid}, syncedAt: '{synced}', updatedAt: '{updated}' }}{c}"
        )
    lines.append('];')
    return '\n'.join(lines)

# =============================================================================
# CATEGORY: CSV fields -> Category interface fields
# CSV: id, company_id, esb_id, code, name, type_name, flag_active, category_type_id, notes, raw_data, synced_at, updated_at
# Interface: categoryId, esbId, code, name, type, typeId, flagActive, notes, syncedAt, updatedAt
# =============================================================================
def gen_categories(rows):
    lines = ['export const MOCK_CATEGORIES: Category[] = [']
    for i, r in enumerate(rows):
        cid = r.get('id', i + 1)
        esbid = r.get('esb_id', cid)
        name = r.get('name', '')
        code = r.get('code', '')
        type_name = r.get('type_name', '')
        type_id_val = r.get('category_type_id', 0)
        type_id = int(type_id_val) if type_id_val not in ('', None) else 0
        flag = r.get('flag_active', True)
        notes = r.get('notes', '')
        synced = clean_date(r.get('synced_at', ''))
        updated = clean_date(r.get('updated_at', ''))
        c = ',' if i < len(rows) - 1 else ''
        lines.append(
            f"  {{ categoryId: {cid}, esbId: {esbid}, code: '{code}', name: '{name}', "
            f"type: '{type_name}', typeId: {type_id}, flagActive: {str(flag).lower()}, "
            f"notes: '{notes}', syncedAt: '{synced}', updatedAt: '{updated}' }}{c}"
        )
    lines.append('];')
    return '\n'.join(lines)

# =============================================================================
# SUB CATEGORY: CSV fields -> SubCategory interface fields
# CSV: id, company_id, esb_id, category_esb_id, code, name, flag_active, dead_stock_threshold, notes, raw_data, synced_at, updated_at
# Interface: subCategoryId, esbId, code, name, categoryId, categoryName, deadStock, flagActive, syncedAt, updatedAt
# =============================================================================
def gen_sub_categories(rows):
    lines = ['export const MOCK_SUB_CATEGORIES: SubCategory[] = [']
    for i, r in enumerate(rows):
        sid = r.get('id', i + 1)
        esbid = r.get('esb_id', sid)
        name = r.get('name', '')
        code = r.get('code', '')
        cat_esbid_val = r.get('category_esb_id', 0)
        cat_esbid = int(cat_esbid_val) if cat_esbid_val not in ('', None) else 0
        cat_name = r.get('category_name', '')
        dead = r.get('dead_stock_threshold', 0)
        flag = r.get('flag_active', True)
        notes = r.get('notes', '')
        synced = clean_date(r.get('synced_at', ''))
        updated = clean_date(r.get('updated_at', ''))
        c = ',' if i < len(rows) - 1 else ''
        lines.append(
            f"  {{ subCategoryId: {sid}, esbId: {esbid}, code: '{code}', name: '{name}', "
            f"categoryId: {cat_esbid}, categoryName: '{cat_name}', deadStock: {dead}, "
            f"flagActive: {str(flag).lower()}, syncedAt: '{synced}', updatedAt: '{updated}' }}{c}"
        )
    lines.append('];')
    return '\n'.join(lines)

# =============================================================================
# PRODUCT: CSV fields -> Product interface fields
# CSV: id, company_id, esb_id, name, product_code, bom_name, category_name, sub_category_name, category_type_name, flag_active, normalized_name, raw_data, synced_at, updated_at
# Interface: productId, esbId, productCode, name, categoryId, categoryName, subCategoryId, subCategoryName, bomId, bomName, categoryTypeName, normalizedName, flagActive, syncedAt, updatedAt
# =============================================================================
def gen_products(rows):
    lines = ['export const MOCK_PRODUCTS: Product[] = [']
    for i, r in enumerate(rows):
        pid = r.get('id', i + 1)
        esbid = r.get('esb_id', pid)
        name = r.get('name', '')
        code = r.get('product_code', '')
        cat_name = r.get('category_name', '')
        sub_cat_name = r.get('sub_category_name', '')
        bom_name = r.get('bom_name', '')
        cat_type = r.get('category_type_name', '')
        norm = r.get('normalized_name', '')
        flag = r.get('flag_active', True)
        synced = clean_date(r.get('synced_at', ''))
        updated = clean_date(r.get('updated_at', ''))
        bom_display = bom_name.strip() if bom_name.strip() else '—'
        c = ',' if i < len(rows) - 1 else ''
        lines.append(
            f"  {{ productId: {pid}, esbId: {esbid}, productCode: '{code}', name: '{name}', "
            f"categoryId: 1, categoryName: '{cat_name}', subCategoryId: 1, subCategoryName: '{sub_cat_name}', "
            f"bomId: null, bomName: '{bom_display}', categoryTypeName: '{cat_type}', "
            f"normalizedName: '{norm}', flagActive: {str(flag).lower()}, "
            f"syncedAt: '{synced}', updatedAt: '{updated}' }}{c}"
        )
    lines.append('];')
    return '\n'.join(lines)

# =============================================================================
# BOM: CSV fields -> BomItem interface fields
# CSV: id, company_id, esb_id, product_esb_id, code, name, output_qty, flag_active, bom_type_id, bom_type_name, product_name, uom_name, raw_data, synced_at, updated_at
# Interface: bomId, esbId, companyId, productEsbId, code, name, uomId, uomName, outputQty, flagActive, bomTypeId, bomTypeName, productName, syncedAt, updatedAt
# =============================================================================
def gen_bom(rows):
    lines = ['export const MOCK_BOM_DATA: BomItem[] = [']
    for i, r in enumerate(rows):
        bid = r.get('id', i + 1)
        esbid = r.get('esb_id', bid)
        company_id = r.get('company_id', 1)
        prod_esb_id_val = r.get('product_esb_id', 0)
        prod_esb_id = int(prod_esb_id_val) if prod_esb_id_val not in ('', None) else 0
        code = r.get('code', '')
        name = r.get('name', '')
        uom_id = r.get('uom_id', 1)
        uom_name = r.get('uom_name', 'PCS')
        output_qty = r.get('output_qty', 1)
        flag = r.get('flag_active', True)
        bom_type_id = r.get('bom_type_id', 1)
        bom_type_name = r.get('bom_type_name', 'Standard')
        product_name = r.get('product_name', '')
        synced = clean_date(r.get('synced_at', ''))
        updated = clean_date(r.get('updated_at', ''))
        c = ',' if i < len(rows) - 1 else ''
        lines.append(
            f"  {{ bomId: {bid}, esbId: {esbid}, companyId: {company_id}, productEsbId: {prod_esb_id}, code: '{code}', name: '{name}', "
            f"uomId: {uom_id}, uomName: '{uom_name}', outputQty: {output_qty}, "
            f"flagActive: {str(flag).lower()}, bomTypeId: {bom_type_id}, bomTypeName: '{bom_type_name}', productName: '{product_name}', "
            f"syncedAt: '{synced}', updatedAt: '{updated}' }}{c}"
        )
    lines.append('];')
    return '\n'.join(lines)

# =============================================================================
# UNITS: CSV fields -> Unit interface fields
# =============================================================================
def gen_units(rows):
    lines = ['export const MOCK_UNITS: Unit[] = [']
    for i, r in enumerate(rows):
        uid = r.get('id', i + 1)
        cid = r.get('company_id', 1)
        esbid = r.get('esb_id', uid)
        code = r.get('code', '')
        name = r.get('name', '')
        flag = r.get('flag_active', True)
        synced = clean_date(r.get('synced_at', ''))
        updated = clean_date(r.get('updated_at', ''))
        c = ',' if i < len(rows) - 1 else ''
        lines.append(
            f"  {{ id: {uid}, companyId: {cid}, esbId: {esbid}, code: '{code}', "
            f"name: '{name}', flagActive: {str(flag).lower()}, "
            f"syncedAt: '{synced}', updatedAt: '{updated}' }}{c}"
        )
    lines.append('];')
    return '\n'.join(lines)

# =============================================================================
# PRICELISTS: CSV fields -> PriceList interface fields
# =============================================================================
def gen_pricelists(rows):
    lines = ['export const MOCK_PRICELISTS: PriceList[] = [']
    for i, r in enumerate(rows):
        pid = r.get('id', i + 1)
        cid = r.get('company_id', 1)
        esbid = r.get('esb_id', pid)
        prod_esbid_val = r.get('product_esb_id', 0)
        prod_esbid = int(prod_esbid_val) if str(prod_esbid_val).strip() not in ('', None) else 0
        branch_esb = r.get('branch_esb_id', 0)
        if str(branch_esb).strip().upper() == 'ALL':
            branch_esb_str = "'ALL'"
        elif str(branch_esb).strip() in ('', None):
            branch_esb_str = '0'
        else:
            branch_esb_str = str(int(float(branch_esb)) if '.' in str(branch_esb) else int(branch_esb))
        price = r.get('price', 0)
        flag = r.get('flag_active', True)
        price_date = r.get('price_date', '')
        supplier = r.get('supplier_name', '')
        prod_name = r.get('product_name', '')
        prod_code = r.get('product_code', '')
        unit_name = r.get('unit_name', '')
        currency = r.get('currency', 'Rupiah')
        expired = r.get('expired_date', '')
        pl_num = r.get('pricelist_num', '')
        synced = clean_date(r.get('synced_at', ''))
        updated = clean_date(r.get('updated_at', ''))
        c = ',' if i < len(rows) - 1 else ''
        lines.append(
            f"  {{ id: {pid}, companyId: {cid}, esbId: {esbid}, productEsbId: {prod_esbid}, "
            f"branchEsbId: {branch_esb_str}, price: {price}, flagActive: {str(flag).lower()}, "
            f"priceDate: '{price_date}', supplierName: '{supplier}', "
            f"productName: '{prod_name}', productCode: '{prod_code}', "
            f"unitName: '{unit_name}', currency: '{currency}', "
            f"expiredDate: '{expired}', pricelistNum: '{pl_num}', "
            f"syncedAt: '{synced}', updatedAt: '{updated}' }}{c}"
        )
    lines.append('];')
    return '\n'.join(lines)

if __name__ == '__main__':
    branches = parse_csv('master_branch_rows.csv')
    categories = parse_csv('master_category_rows.csv')
    sub_categories = parse_csv('master_sub_category_rows.csv')
    products = parse_csv('master_product_rows.csv')
    bom_rows = parse_csv('master_bill_of_material_rows.csv')
    units = parse_csv('master_unit_rows.csv')
    pricelists = parse_csv('master_pricelist_rows.csv')

    output = []
    output.append("=== MOCK_BRANCHES ===")
    output.append(gen_branches(branches))
    output.append(f"// Total: {len(branches)} branches")
    output.append("")
    output.append("=== MOCK_CATEGORIES ===")
    output.append(gen_categories(categories))
    output.append(f"// Total: {len(categories)} categories")
    output.append("")
    output.append("=== MOCK_SUB_CATEGORIES ===")
    output.append(gen_sub_categories(sub_categories))
    output.append(f"// Total: {len(sub_categories)} sub_categories")
    output.append("")
    output.append("=== MOCK_PRODUCTS ===")
    output.append(gen_products(products))
    output.append(f"// Total: {len(products)} products")
    output.append("")
    output.append("=== MOCK_BOM_DATA ===")
    output.append(gen_bom(bom_rows))
    output.append(f"// Total: {len(bom_rows)} BOM items")
    output.append("")
    output.append("=== MOCK_UNITS ===")
    output.append(gen_units(units))
    output.append(f"// Total: {len(units)} units")
    output.append("")
    output.append("=== MOCK_PRICELISTS ===")
    output.append(gen_pricelists(pricelists))
    output.append(f"// Total: {len(pricelists)} pricelists")

    content = '\n'.join(output)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Generated {OUTPUT_FILE}")
    print(f"  Branches: {len(branches)}")
    print(f"  Categories: {len(categories)}")
    print(f"  SubCategories: {len(sub_categories)}")
    print(f"  Products: {len(products)}")
    print(f"  BOMs: {len(bom_rows)}")
    print(f"  Units: {len(units)}")
    print(f"  PriceLists: {len(pricelists)}")
