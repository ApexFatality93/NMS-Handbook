
import xml.etree.ElementTree as ET
import json
from path_utils import resolve_case_path

# --- CONFIG ---
mxml_file = resolve_case_path('./Game Files/NMS_MODULARCUSTOMISATIONPRODUCTS.MXML')
lang_json_file = './JSON_Files/All_Lang_Data.json'
output_json_file = './JSON_Files/Fossil_Table.json'

# --- LOAD JSON FILES ---
with open(lang_json_file, 'r', encoding='utf-8') as f:
    lang_entries = json.load(f)

# with open('./JSON Files/Product_Table.json', 'r', encoding='utf-8') as f:
#     product_table = json.load(f)

# with open('./JSON Files/Substance_Table.json', 'r', encoding='utf-8') as f:
#     substance_table = json.load(f)

# product_lookup = {key: value for key, value in product_table.items()}
# substance_lookup = {key: value for key, value in substance_table.items()}
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
    product_category = data.get('Type', {}).get('ProductCategory', '')

    if product_id and product_category == "ExhibitBone":
        name_id = data.get('Name', '')
        name_lower_id = data.get('NameLower', '')
        subtitle_id = data.get('Subtitle', '')
        description_id = data.get('Description', '')
        food_stat_type = data.get('FoodBonusStat', {}).get('StatsType', '')

        product_data_dict[product_id] = {
            'FossilID': product_id,
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
            'Type': data.get('Type', {}).get('ProductCategory', ''),
            'Rarity': data.get('Rarity', {}).get('Rarity', ''),
            'Legality': data.get('Legality', {}).get('Legality', ''),
            'Consumable': data.get('Consumable', ''),
            'ChargeValue': data.get('ChargeValue', ''),
            'StackMultiplier': data.get('StackMultiplier', ''),
            'WikiCategory': data.get('WikiCategory', ''),
            'FossilCategory': data.get('FossilCategory', {}).get('FossilCategory', ''),
            'CookingIngredient': data.get('CookingIngredient', ''),
            'CookingValue': data.get('CookingValue', ''),

            'FoodBonusStatType': data.get('FoodBonusStat', {}).get('StatsType', ''),
            'FoodBonusStatTypeText': lang_lookup.get(food_stat_type.upper(), ''),

            'GoodForSelling': data.get('GoodForSelling', ''),
            'GiveRewardOnSpecialPurchase': data.get('GiveRewardOnSpecialPurchase', ''),
            'EggModifierIngredient': data.get('EggModifierIngredient', ''),
            'IsTechbox': data.get('IsTechbox', ''),
            'CanSendToOtherPlayers': data.get('CanSendToOtherPlayers', '')
        }

    else:
        # print(product_id,product_category)
        continue

# --- WRITE TO JSON ---
with open(output_json_file, 'w', encoding='utf-8') as json_out:
    json.dump(product_data_dict, json_out, indent=4, ensure_ascii=False)

print(f"✅ Fossil data written to: {output_json_file}")
print(f"🧾 Total Fossils: {len(product_data_dict)}")
