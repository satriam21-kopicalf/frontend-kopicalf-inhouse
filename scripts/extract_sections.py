#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Extract each section from mock_data_output.ts and prepare for replacement in mockData.ts"""
import re

OUTPUT_FILE = r"D:\kopicalf-projection\fe-kopicalf-internal\scripts\mock_data_output.ts"
MOCK_DATA_FILE = r"D:\kopicalf-projection\fe-kopicalf-internal\lib\mockData.ts"

with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')

# Find section boundaries
def find_section(name):
    start = end = None
    for i, line in enumerate(lines):
        if line.strip() == f"=== {name} ===":
            start = i + 2  # Skip the header comment and array declaration line
        if start and line.strip() == '];':
            end = i
            break
    return start, end

sections = {
    'MOCK_BRANCHES': find_section('MOCK_BRANCHES'),
    'MOCK_CATEGORIES': find_section('MOCK_CATEGORIES'),
    'MOCK_SUB_CATEGORIES': find_section('MOCK_SUB_CATEGORIES'),
    'MOCK_PRODUCTS': find_section('MOCK_PRODUCTS'),
    'MOCK_BOM_DATA': find_section('MOCK_BOM_DATA'),
    'MOCK_UNITS': find_section('MOCK_UNITS'),
    'MOCK_PRICELISTS': find_section('MOCK_PRICELISTS'),
}

for name, (start, end) in sections.items():
    if start and end:
        print(f"{name}: lines {start}-{end} ({end - start + 1} lines)")
    else:
        print(f"{name}: NOT FOUND (start={start}, end={end})")
