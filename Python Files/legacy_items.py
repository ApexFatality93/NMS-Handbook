
import xml.etree.ElementTree as ET
import json
from path_utils import resolve_case_path

# --- CONFIG ---
mxml_file = resolve_case_path('./Game Files/LEGACYITEMTABLE.MXML')
lang_json_file = './JSON_Files/All_Lang_Data.json'
output_json_file = './JSON_Files/Legacy_Item_Table.json'

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
legacy_data_dict = {}

for product in root.findall('.//Property[@value="GcLegacyItem"]'):
    data = extract_data(product)
    product_id = data.get('ID', None)

    if product_id:
        try:
            product_info = product_lookup[product_id]
            name_id = product_info['Name']
            name_text = lang_lookup.get(name_id, '')
            name_lower_id = product_info['NameLower']
            name_lower_text = lang_lookup.get(name_lower_id, '')
            print(name_lower_text)
            subtitle_id = product_info['Subtitle']
            subtitle_text = lang_lookup.get(subtitle_id, '')
            description_id = product_info['Description']
            description_text = lang_lookup.get(description_id, '')

            convert_info = product_lookup[data.get('ConvertID', None)]
            convert_name_lower_id = convert_info['NameLower']
            convert_name_lower_text = convert_info['NameLower_Text']

            legacy_data_dict[product_id] = {
                'ProductId': product_id,
                'Name': name_id,
                'Name_Text': name_text,
                'NameLower': name_lower_id,
                'NameLower_Text': name_lower_text,
                'Subtitle': subtitle_id,
                'Subtitle_Text': subtitle_text,
                'Description': description_id,
                'Description_Text': description_text,

                'ConvertID': data.get('ConvertID', ''),
                'ConvertName': convert_name_lower_text,
                'ConvertRatio': data.get('ConvertRatio', ''),
                'AddNewRecipe': data.get('AddNewRecipe', ''),
                'RemoveOldRecipe': data.get('RemoveOldRecipe', ''),
                
                'GameFile': 'Yes'
            }
        
        except :
            continue
            

# -- ADD IN OTHER LEGACY ITEMS --
legacy_ids = [
    'FUELPROD3', 'LANDPROD3', 'CAVEPROD3', 'WATERPROD3', 'CATAPROD3', 'OXYPROD3', 
    'OXY_CRAFT', 'WATER_CRAFT', 'CAVE_CRAFT', 'CATA_CRAFT', 'PRODFUEL1', 'POWERCELL2'
]

for item in legacy_ids:
    try:
        product_info = product_lookup[item]
        name_id = product_info['Name']
        name_text = lang_lookup.get(name_id, '')
        name_lower_id = product_info['NameLower']
        name_lower_text = lang_lookup.get(name_lower_id, '')
        subtitle_id = product_info['Subtitle']
        subtitle_text = lang_lookup.get(subtitle_id, '')
        description_id = product_info['Description']
        description_text = lang_lookup.get(description_id, '')

        legacy_data_dict[item] = {
            'ProductId': item,
            'Name': name_id,
            'Name_Text': name_text,
            'NameLower': name_lower_id,
            'NameLower_Text': name_lower_text,
            'Subtitle': subtitle_id,
            'Subtitle_Text': subtitle_text,
            'Description': description_id,
            'Description_Text': description_text,

            'ConvertID': '',
            'ConvertName': '',
            'ConvertRatio': '',
            'AddNewRecipe': '',
            'RemoveOldRecipe': '',

            'GameFile': 'No'
            }
    except:
        continue

# --- WRITE TO JSON ---
with open(output_json_file, 'w', encoding='utf-8') as json_out:
    json.dump(legacy_data_dict, json_out, indent=4, ensure_ascii=False)

print(f"✅ Legacy item data written to: {output_json_file}")
print(f"🧾 Total legacy items: {len(legacy_data_dict)}")
