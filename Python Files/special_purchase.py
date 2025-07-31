
import xml.etree.ElementTree as ET
import json

# --- CONFIG ---
mxml_file = './Game Files/PURCHASEABLESPECIALS.MXML'
lang_json_file = './JSON Files/All_Lang_Data.json'
output_json_file = './JSON Files/Special_Purchase_Table.json'

# --- LOAD JSON FILES ---
with open(lang_json_file, 'r', encoding='utf-8') as f:
    lang_entries = json.load(f)

with open('./JSON Files/Product_Table.json', 'r', encoding='utf-8') as f:
    product_table = json.load(f)

with open('./JSON Files/Substance_Table.json', 'r', encoding='utf-8') as f:
    substance_table = json.load(f)

product_lookup = {key: value for key, value in product_table.items()}
substance_lookup = {key: value for key, value in substance_table.items()}
lang_lookup = {entry['Id']: entry['English'] for entry in lang_entries}

# --- UTILITY ---
def extract_data(property_node):
    data = {}
    for prop in property_node:
        name = prop.get('name')
        value = prop.get('value')
        if len(prop):
            nested_data = extract_data(prop)
            if name:
                data[name] = nested_data
        else:
            data[name] = value
    return data

# --- PARSE MXML ---
tree = ET.parse(mxml_file)
root = tree.getroot()
product_data_dict = {}

for product in root.findall('.//Property[@value="GcPurchaseableSpecial"]'):
    data = extract_data(product)
    product_id = data.get('ID', None)

    if product_id:

        product = product_lookup.get(product_id, {})

        name_id = product.get('Name', '')
        name_lower_id = product.get('NameLower', '')
        subtitle_id = product.get('Subtitle', '')
        description_id = product.get('Description', '')

        product_data_dict[product_id] = {
            'ProductId': product_id,
            'Name': name_id,
            'Name_Text': lang_lookup.get(name_id, ''),
            'NameLower': name_lower_id,
            'NameLower_Text': lang_lookup.get(name_lower_id, ''),
            'Subtitle': subtitle_id,
            'Subtitle_Text': lang_lookup.get(subtitle_id, ''),
            'Description': description_id,
            'Description_Text': lang_lookup.get(description_id, ''),
            'BaseValue': product.get('BaseValue', ''),

            'Icon_Filename': product.get('Icon_Filename', ''),
            'Colour_R': product.get('Colour_R', ''),
            'Colour_G': product.get('Colour_G', ''),
            'Colour_B': product.get('Colour_B', ''),
            'Colour_A': product.get('Colour_A', ''),

            'ShopNumber': data.get('ShopNumber', '',),
            'MissionTier': data.get('MissionTier', '',),
            'IsConsumable': data.get('IsConsumable', '',)
        }

# --- WRITE TO JSON ---
with open(output_json_file, 'w', encoding='utf-8') as json_out:
    json.dump(product_data_dict, json_out, indent=4, ensure_ascii=False)

print(f"✅ Special purchase data written to: {output_json_file}")
print(f"🧾 Total special purchase items: {len(product_data_dict)}")
