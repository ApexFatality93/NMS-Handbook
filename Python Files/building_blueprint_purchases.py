
import xml.etree.ElementTree as ET
import json

# --- CONFIG ---
mxml_file = './Game Files/PURCHASEABLEBUILDINGBLUEPRINTS.MXML'
lang_json_file = './JSON Files/All_Lang_Data.json'
output_json_file = './JSON Files/Purchaseable_Building_Blueprints.json'

# --- LOAD JSON FILES ---
with open(lang_json_file, 'r', encoding='utf-8') as f:
    lang_entries = json.load(f)

with open('./JSON Files/Building_Parts_Table.json', 'r', encoding='utf-8') as f:
    building_table = json.load(f)

product_lookup = {key: value for key, value in building_table.items()}
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

for product in root.findall('.//Property[@value="GcBuildingBlueprint"]'):
    data = extract_data(product)
    product_id = data.get('ProductID', None)

    if product_id:

        product = product_lookup.get(product_id, {})
        name_lower_text = product.get('NameLower_Text', '')

        product_data_dict[product_id] = {
            'ProductId': product_id,
            'NameLower_Text': name_lower_text,
        }

# --- WRITE TO JSON ---
with open(output_json_file, 'w', encoding='utf-8') as json_out:
    json.dump(product_data_dict, json_out, indent=4, ensure_ascii=False)

print(f"✅ Building Blueprint Purchaseables data written to: {output_json_file}")
print(f"🧾 Total purchaseable building blueprints: {len(product_data_dict)}")
