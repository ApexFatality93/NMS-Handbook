import xml.etree.ElementTree as ET
import json

# --- CONFIG ---
mxml_file = './Game Files/FISHDATATABLE.MXML'
lang_json_file = './JSON Files/All_Lang_Data.json'
output_json_file = './JSON Files/Fish_Table.json'

# --- LOAD LANG JSON ---
with open(lang_json_file, 'r', encoding='utf-8') as f:
    lang_entries = json.load(f)

# --- LOAD PRODUCT TABLE JSON ---
with open('./JSON Files/Product_Table.json', 'r', encoding='utf-8') as f:
    product_table = json.load(f)

product_lookup = {key: value for key, value in product_table.items()}

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
fish_data_dict = {}

for fish in root.findall('.//Property[@value="GcFishData"]'):
    data = extract_data(fish)
    fish_id = data.get('ProductID', '')

    if fish_id:
        # Get product info for this fish
        product = product_lookup.get(fish_id, {})

        name_id = product.get('Name', '')
        name_lower_id = product.get('NameLower', '')
        subtitle_id = product.get('Subtitle', '')
        description_id = product.get('Description', '')
        icon = product.get('Icon_Filename', '')

        Colour_R = product.get('Colour_R', '')
        Colour_G = product.get('Colour_G', '')
        Colour_B = product.get('Colour_B', '')
        Colour_A = product.get('Colour_A', '')

        # Extract biome flags
        biome_flags = data.get('Biome', {})
        biomes = [biome for biome, val in biome_flags.items() if val == "true"]

        fish_data_dict[fish_id] = {
            'ProductID': fish_id,
            'Name': name_id,
            'Name_Text': lang_lookup.get(name_id, ''),
            'NameLower': name_lower_id,
            'NameLower_Text': lang_lookup.get(name_lower_id, ''),
            'Subtitle': subtitle_id,
            'Subtitle_Text': lang_lookup.get(subtitle_id, ''),
            'Description': description_id,
            'Description_Text': lang_lookup.get(description_id, ''),
            'Icon_Filename': icon,
            'Colour_R': Colour_R,
            'Colour_G': Colour_G,
            'Colour_B': Colour_B,
            'Colour_A': Colour_A,

            'Quality': data.get('Quality', {}).get('ItemQuality', ''),
            'Size': data.get('Size', {}).get('FishSize', ''),
            'Time': data.get('Time', {}).get('FishingTime', ''),
            'NeedsStorm': data.get('NeedsStorm', ''),
            'RequiresMissionActive': data.get('RequiresMissionActive', ''),
            'MissionSeed': data.get('MissionSeed', ''),
            'MissionMustAlsoBeSelected': data.get('MissionMustAlsoBeSelected', ''),
            'MissionCatchChanceOverride': data.get('MissionCatchChanceOverride', ''),
            'Biomes': biomes
        }

# --- WRITE TO JSON ---
with open(output_json_file, 'w', encoding='utf-8') as json_out:
    json.dump(fish_data_dict, json_out, indent=4, ensure_ascii=False)

print(f"✅ Fish data written to: {output_json_file}")
print(f"🧾 Total fish: {len(fish_data_dict)}")
