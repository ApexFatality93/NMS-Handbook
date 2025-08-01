
import xml.etree.ElementTree as ET
import json
import re

# --- CONFIG ---
mxml_file = './Game Files/NMS_REALITY_GCTECHNOLOGYTABLE.MXML'
lang_json_file = './JSON Files/All_Lang_Data.json'
output_json_file = './JSON Files/Technology_Table.json'

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

def fuzzy_lang_lookup(key, lookup_dict):
    key_upper = key.upper()

    # Step 1: Exact match
    if key_upper in lookup_dict:
        return lookup_dict[key_upper]

    # Step 2: Truncation-safe prefix fallback
    matches = [
        k for k in lookup_dict
        if key_upper.startswith(k) and len(k) >= 31  # Exclude generic short matches like 'SHIP'
    ]

    if matches:
        # Return the longest matching truncated prefix
        best_match = max(matches, key=len)
        return lookup_dict[best_match]
    
    return ''

# --- PARSE MXML ---
tree = ET.parse(mxml_file)
root = tree.getroot()
legacy_data_dict = {}

for technology in root.findall('.//Property[@value="GcTechnology"]'):
    data = extract_data(technology)
    technology_id = data.get('ID', None)

    if technology_id:
            
        name_id = data.get('Name', '')
        name_lower_id = data.get('NameLower', '')
        subtitle_id = data.get('Subtitle', '')
        description_id = data.get('Description', '')
        
        ammo_id = data.get('AmmoId', '')
        if ammo_id:
            ammo_data = product_lookup[ammo_id]
        else:
            ammo_data = {}

        base_stat = data.get('BaseStat', {}).get('StatsType', '')

        legacy_data_dict[technology_id] = {
            'TechnologyId': technology_id,
            'Name': data.get('Name', ''),
            'Name_Text': lang_lookup.get(name_id, ''),
            'NameLower': name_lower_id,
            'NameLower_Text': lang_lookup.get(name_lower_id, ''),
            'Subtitle': subtitle_id,
            'Subtitle_Text': lang_lookup.get(subtitle_id, ''),
            'Description': description_id,
            'Description_Text': lang_lookup.get(description_id, ''),

            'Icon_Filename': data.get('Icon', {}).get('Filename', ''),
            'Colour_R': data.get('Colour', {}).get('R', ''),
            'Colour_G': data.get('Colour', {}).get('G', ''),
            'Colour_B': data.get('Colour', {}).get('B', ''),
            'Colour_A': data.get('Colour', {}).get('A', ''),

            'Chargeable': data.get('Chargeable', ''),
            'ChargeAmount': data.get('ChargeAmount', ''),
            'ChargeType': data.get('ChargeType', {}).get('SubstanceCategory', ''),
            'ChargeBy': [],

            'ChargeMultiplier': data.get('ChargeMultiplier', ''),
            'BuildFullyCharged': data.get('BuildFullyCharged', ''),
            'UsesAmmo': data.get('UsesAmmo', ''),
            'AmmoId': ammo_id,
            'AmmoNameText': lang_lookup.get(ammo_data.get('NameLower', ''), ''),
            'PrimaryItem': data.get('PrimaryItem', ''),
            'Upgrade': data.get('Upgrade', ''),
            'Core': data.get('Core', ''),
            'RepairTech': data.get('RepairTech', ''),
            'Procedural': data.get('Procedural', ''),
            'BrokenSlotTech': data.get('BrokenSlotTech', ''),
            'Category': data.get('Category', {}).get('TechnologyCategory', ''),
            'Rarity': data.get('Rarity', {}).get('TechnologyRarity', ''),
            'Value': data.get('Value', ''),
            'Requirements': [],

            'BaseStat': base_stat,
            'BaseStatText': lang_lookup.get(base_stat.upper(), ''),
            'StatBonuses': [],

            'RequiredTech': data.get('RequiredTech', ''),
            'RequiredLevel': data.get('RequiredLevel', ''),
            'RewardGroup': data.get('RewardGroup', ''),
            'RequiredRank': data.get('RequiredRank', ''),
            'DispensingRace': data.get('DispensingRace', {}).get('AlienRace', ''),
            'FragmentCost': data.get('FragmentCost', ''),
            'TechShopRarity': data.get('TechShopRarity', {}).get('TechnologyRarity', ''),
            'WikiEnabled': data.get('WikiEnabled', ''),
            'NeverPinnable': data.get('NeverPinnable', ''),
            'DamagedDescription': data.get('DamagedDescription', ''),
            'DamagedDescriptionText': lang_lookup.get(data.get('DamagedDescription', ''), ''),
            'ParentTechId': data.get('ParentTechId', ''),
            'IsTemplate': data.get('IsTemplate', ''),
            'ExclusivePrimaryStat': data.get('ExclusivePrimaryStat', '')
        }

        # Extract ChargeBy list
        charge_by_list = []
        charge_by_node = technology.find('./Property[@name="ChargeBy"]')
        if charge_by_node is not None:
            for charge_item in charge_by_node.findall('./Property[@name="ChargeBy"]'):
                value = charge_item.get('value')
                if value:

                    if value in product_lookup:
                        value_data = product_lookup[value]
                        value_type = "product"
                    elif value in substance_lookup:
                        value_data = substance_lookup[value]
                        value_type = "substance"
                    else:
                        value_data = {}
                        value_type = "Unknown"

                    charge_by_list.append({
                        'Id': value,
                        'Type': value_type,
                        'Name_ID': value_data.get('NameLower', ''),
                        'NameLower_Text': lang_lookup.get(value_data.get('NameLower', ''), ''),
                        'Icon_Filename': value_data.get('Icon_Filename', ''),
                        'Colour_R': value_data.get('Colour_R', ''),
                        'Colour_G': value_data.get('Colour_G', ''),
                        'Colour_B': value_data.get('Colour_B', ''),
                        'Colour_A': value_data.get('Colour_A', '')
                    })

        legacy_data_dict[technology_id]['ChargeBy'] = charge_by_list

        # Extract Requirements list
        requirements_list = []
        requirements_node = technology.find('./Property[@name="Requirements"]')
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

        legacy_data_dict[technology_id]['Requirements'] = requirements_list

        # Extract StatBonuses list
        stat_bonuses_list = []
        stat_bonuses_node = technology.find('./Property[@name="StatBonuses"]')
        if stat_bonuses_node is not None:
            for stat in stat_bonuses_node.findall('./Property[@name="StatBonuses"]'):
                stat_type_node = stat.find('./Property[@name="Stat"]/Property[@name="StatsType"]')
                bonus_node = stat.find('./Property[@name="Bonus"]')
                level_node = stat.find('./Property[@name="Level"]')

                stat_type = stat_type_node.get('value') if stat_type_node is not None else ''
                bonus = bonus_node.get('value') if bonus_node is not None else ''
                level = level_node.get('value') if level_node is not None else ''

                stat_bonuses_list.append({
                    'StatsType': stat_type,
                    # 'StatsTypeText': lang_lookup.get(stat_type.upper(), ''),
                    'StatsTypeText': fuzzy_lang_lookup(stat_type, lang_lookup),
                    'Bonus': bonus,
                    'Level': level
                })

        legacy_data_dict[technology_id]['StatBonuses'] = stat_bonuses_list

# --- WRITE TO JSON ---
with open(output_json_file, 'w', encoding='utf-8') as json_out:
    json.dump(legacy_data_dict, json_out, indent=4, ensure_ascii=False)

print(f"✅ Technology item data written to: {output_json_file}")
print(f"🧾 Total technology items: {len(legacy_data_dict)}")
