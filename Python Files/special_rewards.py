
import xml.etree.ElementTree as ET
import json
from path_utils import resolve_case_path

# --- CONFIG ---
expeditions_mxml = resolve_case_path('./Game Files/UNLOCKABLESEASONREWARDS.MXML')
twitch_mxml = resolve_case_path('./Game Files/UNLOCKABLETWITCHREWARDS.MXML')
lang_json_file = './JSON_Files/All_Lang_Data.json'
product_file = './JSON_Files/Product_Table.json'
substance_file = './JSON_Files/Substance_Table.json'
output_json_file = './JSON_Files/Special_Rewards_Table.json'

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

# --- PARSE EXPEDITION REWARDS ---
reward_tree = ET.parse(expeditions_mxml)
reward_root = reward_tree.getroot()
special_reward_data = {}

for reward in reward_root.findall('.//Property[@value="GcUnlockableSeasonReward"]'):
    data = extract_data(reward)
    reward_id = data.get('ID')
    product = product_lookup.get(reward_id, {})

    if reward_id not in special_reward_data:
        special_reward_data[reward_id] = {
            'ID': reward_id,
            'RewardName': product.get('NameLower_Text', ''),
            'RewardType': ['Expedition'],
        }
    else:
        if 'Expedition' not in special_reward_data[reward_id]['RewardType']:
            special_reward_data[reward_id]['RewardType'].append('Expedition')

# --- PARSE TWITCH REWARDS ---
twitch_tree = ET.parse(twitch_mxml)
twitch_root = twitch_tree.getroot()

for twitch in twitch_root.findall('.//Property[@value="GcUnlockableTwitchReward"]'):
    data = extract_data(twitch)
    product_id = data.get('ProductId')
    product = product_lookup.get(product_id, {})

    if product_id not in special_reward_data:
        special_reward_data[product_id] = {
            'ID': product_id,
            'RewardName': product.get('NameLower_Text', ''),
            'RewardType': ['Twitch'],
        }
    else:
        if 'Twitch' not in special_reward_data[product_id]['RewardType']:
            special_reward_data[product_id]['RewardType'].append('Twitch')

# --- OUTPUT TO JSON ---
with open(output_json_file, 'w', encoding='utf-8') as out:
    json.dump(special_reward_data, out, indent=4, ensure_ascii=False)

print(f"✅ Special reward data written to: {output_json_file}")
print(f"🧾 Total special rewards: {len(special_reward_data)}")
