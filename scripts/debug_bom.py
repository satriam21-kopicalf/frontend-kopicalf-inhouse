#!/usr/bin/env python3
import csv, os, re
BOM_RE = re.compile(r'\ufeff')
def clean_str(s):
    if s is None:
        return ''
    s = str(s).strip()
    s = BOM_RE.sub('', s)
    # Escape backslashes first, then single quotes
    s = s.replace('\\', '\\\\')
    s = s.replace("'", "\\'")
    s = s.replace('\n', ' ').replace('\r', '').replace('\t', ' ')
    # Remove other control chars
    s = ''.join(ch for ch in s if ord(ch) >= 32 or ch in '\t\n')
    return s

with open(r'D:/kopicalf-projection/fe-kopicalf-internal/docs/sample-master/master_product_rows.csv', 'r', encoding='utf-8-sig') as f:
    r = csv.DictReader(f)
    rows = [x for x in r]
f.close()

bom = rows[1]['bom_name']
print('Raw bom_name:', repr(bom))
print('Stripped:', repr(bom.strip()))
print('Bool:', bool(bom))
print('Bool(stripped):', bool(bom.strip()))
display_name = bom if bom.strip() else 'EMDASH'
print('Display name:', repr(display_name))
result = "bomName: '" + clean_str(display_name) + "'"
print('Result:', result)
