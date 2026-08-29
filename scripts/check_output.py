#!/usr/bin/env python3
# Check what's in the generated file for product 2 bom_name
with open(r'D:/kopicalf-projection/fe-kopicalf-internal/scripts/mock_data_output.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    # Find line with productId 2
    for line in lines:
        if 'productId: 2,' in line:
            print('Line:', repr(line))
            # Find the bomName part
            idx = line.find('bomName:')
            if idx >= 0:
                bom_part = line[idx:idx+30]
                print('bomName part:', repr(bom_part))
                # Check bytes
                print('Bytes:', bom_part.encode('utf-8'))
            break
