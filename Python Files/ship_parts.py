
import xml.etree.ElementTree as ET
import json

# --- CONFIG ---
mxml_file = './Game Files/NMS_MODULARCUSTOMISATIONPRODUCTS.MXML'
lang_json_file = './JSON Files/All_Lang_Data.json'
output_json_file = './JSON Files/Ship_Part_Table.json'

# --- LOAD LANG FILE ---
with open(lang_json_file, 'r', encoding='utf-8') as f:
    lang_entries = json.load(f)

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

def extract_ship_type(name):
    parts = name.split('_')
    if len(parts) >= 3:
        second_word = parts[1].lower().capitalize()
        if second_word == "Dropship":
            second_word = "Hauler"
        elif second_word == "Scientific":
            second_word = "Explorer"
        elif second_word == "Sail":
            second_word = "Solar"
        elif name.startswith("UI_SHIP_CORE_"):
            second_word = "Reactor"
        return second_word
    return ""

# --- PARSE MXML ---
tree = ET.parse(mxml_file)
root = tree.getroot()
product_data_dict = {}

for product in root.findall('.//Property[@value="GcProductData"]'):
    data = extract_data(product)
    product_id = data.get('ID', None)
    product_category = data.get('Type', {}).get('ProductCategory', '')

    if product_id and product_category == "CustomisationPart":
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
            'Level': data.get('Level', ''),
            'Icon_Filename': data.get('Icon', {}).get('Filename', ''),
            'Colour_R': data.get('Colour', {}).get('R', ''),
            'Colour_G': data.get('Colour', {}).get('G', ''),
            'Colour_B': data.get('Colour', {}).get('B', ''),
            'Colour_A': data.get('Colour', {}).get('A', ''),
            'Category': data.get('Category', {}).get('SubstanceCategory', ''),
            'Type': extract_ship_type(name_id),
            'Rarity': data.get('Rarity', {}).get('Rarity', ''),
            'Legality': data.get('Legality', {}).get('Legality', ''),
            'Consumable': data.get('Consumable', ''),
            'ChargeValue': data.get('ChargeValue', ''),
            'StackMultiplier': data.get('StackMultiplier', ''),
        }

# --- WRITE TO JSON ---
with open(output_json_file, 'w', encoding='utf-8') as json_out:
    json.dump(product_data_dict, json_out, indent=4, ensure_ascii=False)

print(f"✅ Ship parts data written to: {output_json_file}")
print(f"🧾 Total ship parts: {len(product_data_dict)}")
