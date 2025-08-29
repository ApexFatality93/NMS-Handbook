
import xml.etree.ElementTree as ET
import json
from path_utils import resolve_case_path

# --- CONFIG ---
mxml_file = resolve_case_path('./Game Files/NMS_BASEPARTPRODUCTS.MXML')
lang_json_file = './JSON_Files/All_Lang_Data.json'
output_json_file = './JSON_Files/Building_Parts_Table.json'

# --- LOAD JSON FILES ---
with open(lang_json_file, 'r', encoding='utf-8') as f:
    lang_entries = json.load(f)

with open('./JSON_Files/Product_Table.json', 'r', encoding='utf-8') as f:
    product_table = json.load(f)

with open('./JSON_Files/Substance_Table.json', 'r', encoding='utf-8') as f:
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

for product in root.findall('.//Property[@value="GcProductData"]'):
    data = extract_data(product)
    product_id = data.get('ID', None)

    if product_id:

        name_id = data.get('Name', '')
        name_lower_id = data.get('NameLower', '')
        subtitle_id = data.get('Subtitle', '')
        description_id = data.get('Description', '')

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
            'BaseValue': data.get('BaseValue', ''),
            'Icon_Filename': data.get('Icon', {}).get('Filename', ''),
            'Colour_R': data.get('Colour', {}).get('R', ''),
            'Colour_G': data.get('Colour', {}).get('G', ''),
            'Colour_B': data.get('Colour', {}).get('B', ''),
            'Colour_A': data.get('Colour', {}).get('A', ''),
            # 'SubstanceCategory': data.get('Category', {}).get('SubstanceCategory', ''),
            # 'ProductCategory': data.get('Type', {}).get('ProductCategory', ''),
            # 'Rarity': data.get('Rarity', {}).get('Rarity', ''),
            # 'Legality': data.get('Legality', {}).get('Legality', ''),
            # 'Consumable': data.get('Consumable', ''),
            # 'ChargeValue': data.get('ChargeValue', ''),
            'StackMultiplier': data.get('StackMultiplier', ''),
            # 'DefaultCraftAmount': data.get('DefaultCraftAmount', ''),
            # 'CraftAmountStepSize': data.get('CraftAmountStepSize', ''),
            # 'CraftAmountMultiplier': data.get('CraftAmountMultiplier', ''),
            'WikiCategory': data.get('WikiCategory', ''),
            'Requirements': [],
        }

        # Extract Requirements list
        requirements_list = []
        requirements_node = product.find('./Property[@name="Requirements"]')
        if requirements_node is not None:
            for req in requirements_node.findall('./Property[@name="Requirements"]'):
                req_id_node = req.find('./Property[@name="ID"]')
                req_type_node = req.find('./Property[@name="Type"]/Property[@name="InventoryType"]')
                req_amount_node = req.find('./Property[@name="Amount"]')

                req_id = req_id_node.get('value') if req_id_node is not None else ''
                req_type = req_type_node.get('value') if req_type_node is not None else ''
                req_amount = req_amount_node.get('value') if req_amount_node is not None else ''

                if req_id in product_lookup:
                    value_data = product_lookup[req_id]
                    value_type = "product"
                elif req_id in substance_lookup:
                    value_data = substance_lookup[req_id]
                    value_type = "substance"
                else:
                    value_data = {}
                    value_type = "Unknown"

                requirements_list.append({
                    'Id': req_id,
                    'Type': req_type.lower(),
                    'Name_ID': value_data.get('NameLower', ''),
                    'NameLower_Text': lang_lookup.get(value_data.get('NameLower', ''), ''),
                    'Amount': req_amount,
                    'Icon_Filename': value_data.get('Icon_Filename', ''),
                    'Colour_R': value_data.get('Colour_R', ''),
                    'Colour_G': value_data.get('Colour_G', ''),
                    'Colour_B': value_data.get('Colour_B', ''),
                    'Colour_A': value_data.get('Colour_A', '')
                })

        product_data_dict[product_id]['Requirements'] = requirements_list

# --- WRITE TO JSON ---
with open(output_json_file, 'w', encoding='utf-8') as json_out:
    json.dump(product_data_dict, json_out, indent=4, ensure_ascii=False)

print(f"✅ Building part data written to: {output_json_file}")
print(f"🧾 Total building parts: {len(product_data_dict)}")
