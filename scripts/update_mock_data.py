#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Update mockData.ts with data from mock_data_output.ts"""
import re

OUTPUT_FILE = r"D:\kopicalf-projection\fe-kopicalf-internal\scripts\mock_data_output.ts"
MOCK_DATA_FILE = r"D:\kopicalf-projection\fe-kopicalf-internal\lib\mockData.ts"

# Read generated output
with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
    output_lines = f.read().split('\n')

# Find section boundaries (0-indexed)
def find_section(name):
    """
    Find the data lines for a section.
    Returns (header_line, data_lines) where header_line is the array declaration
    and data_lines is a list of data record lines (excluding the closing '];')
    """
    start = end = None
    for i, line in enumerate(output_lines):
        if line.strip() == f"=== {name} ===":
            start = i + 1  # Array declaration line is next
        if start is not None and line.strip() == '];':
            end = i
            break
    if start and end:
        header = output_lines[start]  # e.g. "export const MOCK_BRANCHES: Branch[] = ["
        data = output_lines[start+1:end]  # Data lines
        return header, data
    return None, None

sections_meta = {
    'MOCK_BRANCHES': 'MOCK_BRANCHES',
    'MOCK_CATEGORIES': 'MOCK_CATEGORIES',
    'MOCK_SUB_CATEGORIES': 'MOCK_SUB_CATEGORIES',
    'MOCK_PRODUCTS': 'MOCK_PRODUCTS',
    'MOCK_BOM_DATA': 'MOCK_BOM_DATA',
    'MOCK_UNITS': 'MOCK_UNITS',
    'MOCK_PRICELISTS': 'MOCK_PRICELISTS',
}

sections = {}
for name in sections_meta:
    header, data = find_section(name)
    if data:
        sections[name] = (header, data)
        print(f"{name}: {len(data)} records")
    else:
        print(f"WARNING: {name} not found!")

# Read mockData.ts
with open(MOCK_DATA_FILE, 'r', encoding='utf-8') as f:
    mock_content = f.read()

# Replace each section using regex
def replace_array_section(content, array_name, header, new_data):
    """Replace the data inside an array literal, keeping the header line"""
    if new_data is None:
        print(f"  WARNING: No data for {array_name}")
        return content

    new_data_str = '\n'.join(new_data)

    # Pattern: find "export const MOCK_X...: T[] = [\n...];"
    pattern = rf'(export const {re.escape(array_name)}: [^\[]+\[[\s\S]*?\n)([\s\S]*?)(\n\];)'
    replacement = rf'\1\n{new_data_str}\n];'

    new_content, count = re.subn(pattern, replacement, content)
    if count == 0:
        print(f"  WARNING: Could not find {array_name} in mockData.ts - trying simpler pattern")
        # Simpler pattern
        simple_pattern = rf'(export const {re.escape(array_name)}: [^\[]+\[[^\]]*?)([\s\S]*?)(\n\];)'
        new_content, count = re.subn(simple_pattern, replacement, content)
        if count == 0:
            print(f"  ERROR: Could not find {array_name}")
        else:
            print(f"  Updated {array_name}: {len(new_data)} records (simple pattern)")
    else:
        print(f"  Updated {array_name}: {len(new_data)} records")
    return new_content

print("\nUpdating mockData.ts...")
for name, (header, data) in sections.items():
    mock_content = replace_array_section(mock_content, name, header, data)

# Write back
with open(MOCK_DATA_FILE, 'w', encoding='utf-8') as f:
    f.write(mock_content)

print("\nDone! mockData.ts has been updated.")
