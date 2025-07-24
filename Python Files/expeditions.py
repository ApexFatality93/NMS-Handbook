
import xml.etree.ElementTree as ET
import json

# --- CONFIG ---
expeditions_mxml = './Game Files/HISTORICALSEASONDATATABLE.MXML'
rewards_mxml = './Game Files/UNLOCKABLESEASONREWARDS.MXML'
lang_json_file = './JSON Files/All_Lang_Data.json'
product_file = './JSON Files/Product_Table.json'
substance_file = './JSON Files/Substance_Table.json'
output_json_file = './JSON Files/Expedition_Table.json'

# --- LOAD JSON FILES ---
with open(lang_json_file, 'r', encoding='utf-8') as f:
    lang_entries = json.load(f)

with open(product_file, 'r', encoding='utf-8') as f:
    product_table = json.load(f)

with open(substance_file, 'r', encoding='utf-8') as f:
    substance_table = json.load(f)

lang_lookup = {entry['Id']: entry['English'] for entry in lang_entries}
product_lookup = {key: value for key, value in product_table.items()}
substance_lookup = {key: value for key, value in substance_table.items()}

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

# --- PARSE EXPEDITION SEASONS ---
expedition_tree = ET.parse(expeditions_mxml)
expedition_root = expedition_tree.getroot()
expedition_data = {}

for expedition in expedition_root.findall('.//Property[@value="GcHistoricalSeasonData"]'):
    data = extract_data(expedition)
    display_number = data.get('DisplayNumber')
    if not display_number:
        continue

    expedition_data[display_number] = {
        'SeasonName': lang_lookup.get(data.get('SeasonName', ''), ''),
        'SeasonNumber': data.get('SeasonNumber', ''),
        'RemixNumber': data.get('RemixNumber', ''),
        'DisplayNumber': display_number,
        'Icon_Filename': data.get('MainIcon', {}).get('Filename', ''),
        'Description': lang_lookup.get(data.get('Description', ''), ''),
        'FinalReward': lang_lookup.get(data.get('FinalReward', ''), ''),
        'UnlockedTitle': lang_lookup.get(data.get('UnlockedTitle', ''), ''),
        'Rewards': {} 
    }

# --- PARSE EXPEDITION REWARDS ---
reward_tree = ET.parse(rewards_mxml)
reward_root = reward_tree.getroot()
expedition_rewards = {}

for reward in reward_root.findall('.//Property[@value="GcUnlockableSeasonReward"]'):
    data = extract_data(reward)
    reward_id = data.get('ID')
    season_ids = data.get('SeasonIds', {}).get('SeasonIds', [])
    stage_id = data.get('StageIds', {}).get('StageIds', '')
    product = product_lookup.get(reward_id, {})

    reward_data = {
        'ID': reward_id,
        'RewardName': product.get('NameLower_Text', ''),
        'RewardSubtitle': product.get('Subtitle_Text', ''),
        'RewardDescription': product.get('Description_Text', ''),
        'Icon_Filename': product.get('Icon_Filename', ''),
        'Colour_R': product.get('Colour_R', ''),
        'Colour_G': product.get('Colour_G', ''),
        'Colour_B': product.get('Colour_B', ''),
        'Colour_A': product.get('Colour_A', ''),
        'MustBeUnlocked': data.get('MustBeUnlocked', ''),
        'UniqueInventoryItem': data.get('UniqueInventoryItem', ''),
        'SwitchExclusive': data.get('SwitchExclusive', ''),
        'StageIds': data.get('StageIds', {}).get('StageIds', ''),
        'SpecificMilestoneLoc': data.get('SpecificMilestoneLoc', '')
    }

    if stage_id not in expedition_data[season_ids]['Rewards'].keys():

        expedition_data[season_ids]['Rewards'][stage_id] = []

    expedition_data[season_ids]['Rewards'][stage_id].append(reward_data)

# --- OUTPUT TO JSON ---
with open(output_json_file, 'w', encoding='utf-8') as out:
    json.dump(expedition_data, out, indent=4, ensure_ascii=False)

print(f"✅ Combined expedition data written to: {output_json_file}")
print(f"🧾 Total Expeditions: {len(expedition_data)}")
