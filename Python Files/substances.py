import xml.etree.ElementTree as ET
import json
import os

# --- CONFIG ---
mxml_file = './Game Files/NMS_Reality_GCSUBSTANCETABLE.MXML'
lang_json_file = './JSON Files/All_Lang_Data.json'
output_json_file = './JSON Files/Substance_Table.json'

# --- LOAD LANG JSON ---
with open(lang_json_file, 'r', encoding='utf-8') as f:
    lang_entries = json.load(f)

# Create lookup dictionary from lang JSON: { "Id": "English text" }
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

for product in root.findall('.//Property[@value="GcRealitySubstanceData"]'):
    data = extract_data(product)
    product_id = data.get('ID', None)

    if product_id:
        name_id = data.get('Name', '')
        name_lower_id = data.get('NameLower', '')
        subtitle_id = data.get('Subtitle', '')
        description_id = data.get('Description', '')

        product_data_dict[product_id] = {
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
            'Category': data.get('Category', {}).get('SubstanceCategory', ''),
            'Rarity': data.get('Rarity', {}).get('Rarity', ''),
            'Legality': data.get('Legality', {}).get('Legality', ''),
            'ChargeValue': data.get('ChargeValue', ''),
            'StackMultiplier': data.get('StackMultiplier', ''),
            'Cost_SpaceStationMarkup': data.get('Cost', {}).get('SpaceStationMarkup', ''),
            'Cost_LowPriceMod': data.get('Cost', {}).get('LowPriceMod', ''),
            'Cost_HighPriceMod': data.get('Cost', {}).get('HighPriceMod', ''),
            'Cost_BuyBaseMarkup': data.get('Cost', {}).get('BuyBaseMarkup', ''),
            'Cost_BuyMarkupMod': data.get('Cost', {}).get('BuyMarkupMod', ''),
            'TradeCategory': data.get('TradeCategory', {}).get('TradeCategory', ''),
            'EconomyInfluenceMultiplier': data.get('EconomyInfluenceMultiplier', ''),
            'CookingIngredient': data.get('CookingIngredient', ''),
            'GoodForSelling': data.get('GoodForSelling', ''),
            'EasyToRefine': data.get('EasyToRefine', ''),
            'EggModifierIngredient': data.get('EggModifierIngredient', '')
        }

# --- WRITE TO JSON ---
with open(output_json_file, 'w', encoding='utf-8') as json_out:
    json.dump(product_data_dict, json_out, indent=4, ensure_ascii=False)

print(f"✅ Product data written to: {output_json_file}")
print(f"🧾 Total products: {len(product_data_dict)}")
