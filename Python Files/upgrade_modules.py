
import json
import re
from collections import defaultdict
import xml.etree.ElementTree as ET
from path_utils import resolve_case_path

mxml_file = resolve_case_path('./Game Files/NMS_REALITY_GCPROCEDURALTECHNOLOGYTABLE.MXML')
lang_json_file = './JSON_Files/All_Lang_Data.json'
technology_json_file = './JSON_Files/Technology_Table.json'
output_json_file = './JSON_Files/Upgrade_Module_Table.json'

CLASSES = {
    'Normal': 'C',
    'Rare': 'B',
    'Epic': 'A',
    'Legendary': 'S',
    'Illegal': 'X',
}
QUALITY_ORDER = ['Normal', 'Rare', 'Epic', 'Legendary', 'Illegal', 'Sentinel', 'Robot']

# SeaTrash = Rusted upgrades, skip these
SKIPPED_QUALITIES = {'SeaTrash'}

CATEGORY_LABELS = {
    'Weapon': 'Multi-Tool',
    'Suit': 'Exosuit',
    'AllShipsExceptAlien': 'Starship',
    'AlienShip': 'Living Ship',
    'Freighter': 'Freighter',
    'Corvette': 'Corvette',
    'Exocraft': 'Exocraft',
    'Mech': 'Minotaur',
    'Submarine': 'Nautilon',
}

with open(lang_json_file, 'r', encoding='utf-8') as f:
    lang_lookup = {entry['Id'].upper(): entry['English'] for entry in json.load(f)}

with open(technology_json_file, 'r', encoding='utf-8') as f:
    technology = json.load(f)


def lang(key):
    """Language text for a key, ignoring capitalization. Some keys are cut short to 31 characters
    in the language files, so fall back to the longest matching shortened key (same as technology.py)."""
    if not key:
        return ''
    key = key.upper()
    if key in lang_lookup:
        return lang_lookup[key]
    matches = [k for k in lang_lookup if key.startswith(k) and len(k) >= 31]
    return lang_lookup[max(matches, key=len)] if matches else ''


def readable(text):
    """Some names are all lowercase or all uppercase in the game text (e.g. 'main engines'); title-case those."""
    return text.title() if text.islower() or text.isupper() else text


def stat_name(stat_type):
    return lang(stat_type) or re.sub(r'(?<=[a-z])(?=[A-Z])', ' ', stat_type).replace('_', ' ')


def text(node, path):
    found = node.find(path)
    return found.get('value', '') if found is not None else ''


root = ET.parse(mxml_file).getroot()
modules = []
for entry in root.findall(".//Property[@value='GcProceduralTechnologyData']"):
    stats = []
    for level in entry.findall("./Property[@name='StatLevels']/Property"):
        stats.append({
            'StatsType': text(level, "./Property[@name='Stat']/Property[@name='StatsType']"),
            'Min': float(text(level, "./Property[@name='ValueMin']") or 0),
            'Max': float(text(level, "./Property[@name='ValueMax']") or 0),
            'AlwaysChoose': text(level, "./Property[@name='AlwaysChoose']") == 'true',
        })
    if text(entry, "./Property[@name='Quality']") in SKIPPED_QUALITIES:
        continue
    modules.append({
        'Id': text(entry, "./Property[@name='ID']"),
        'Template': text(entry, "./Property[@name='Template']"),
        'Group': text(entry, "./Property[@name='Group']"),
        'Subtitle': text(entry, "./Property[@name='Subtitle']"),
        'Quality': text(entry, "./Property[@name='Quality']"),
        'NumStatsMin': int(text(entry, "./Property[@name='NumStatsMin']") or 0),
        'NumStatsMax': int(text(entry, "./Property[@name='NumStatsMax']") or 0),
        'Stats': stats,
    })

values_by_stat = defaultdict(list)
for module in modules:
    for stat in module['Stats']:
        values_by_stat[stat['StatsType']] += [stat['Min'], stat['Max']]


def display_type(values):
    if all(v == int(v) for v in values) or max(values) > 2.5:
        return 'number'
    if min(values) < 0.5:
        return 'fraction'
    return 'multiplier'


display_types = {stat: display_type(values) for stat, values in values_by_stat.items()}


def display_range(stat):
    kind = display_types[stat['StatsType']]
    low, high = stat['Min'], stat['Max']
    if kind == 'multiplier':
        low, high = abs(low - 1) * 100, abs(high - 1) * 100
    elif kind == 'fraction':
        low, high = low * 100, high * 100
    low, high = sorted((low, high))
    return round(low, 1), round(high, 1), '%' if kind != 'number' else ''


upgrade_types = {}
for module in modules:
    key = f"{module['Template']}:{module['Group']}"
    template = technology.get(module['Template'], {})
    name = readable(lang(module['Group']) or module['Group'])

    if key not in upgrade_types:
        upgrade_types[key] = {
            'Name_Text': name,
            'Template': module['Template'],
            'Category': CATEGORY_LABELS.get(template.get('Category', ''), template.get('Category', '') or 'Other'),
            'Icon_Filename': template.get('Icon_Filename', ''),
            'Colour_R': template.get('Colour_R', '0'),
            'Colour_G': template.get('Colour_G', '0'),
            'Colour_B': template.get('Colour_B', '0'),
            'Colour_A': template.get('Colour_A', '1'),
            'Classes': [],
        }

    stats = []
    for stat in module['Stats']:
        low, high, unit = display_range(stat)
        stats.append({
            'StatsType': stat['StatsType'],
            'Name_Text': stat_name(stat['StatsType']),
            'Low': low,
            'High': high,
            'Unit': unit,
            'AlwaysChoose': stat['AlwaysChoose'],
        })

    upgrade_types[key]['Classes'].append({
        'Id': module['Id'],
        'Quality': module['Quality'],
        'Class': CLASSES.get(module['Quality'], ''),
        'Subtitle_Text': lang(module['Subtitle']).replace('%NAME%', name),
        'NumStatsMin': module['NumStatsMin'],
        'NumStatsMax': module['NumStatsMax'],
        'Stats': stats,
    })

for upgrade in upgrade_types.values():
    upgrade['Classes'].sort(key=lambda c: QUALITY_ORDER.index(c['Quality']) if c['Quality'] in QUALITY_ORDER else 99)

for upgrade in upgrade_types.values():
    classes = upgrade['Classes']
    if len(classes) == 1 and not classes[0]['Class'] and classes[0]['Subtitle_Text']:
        upgrade['Name_Text'] = classes[0]['Subtitle_Text']

name_counts = defaultdict(int)
for upgrade in upgrade_types.values():
    name_counts[(upgrade['Category'], upgrade['Name_Text'])] += 1
for upgrade in upgrade_types.values():
    if name_counts[(upgrade['Category'], upgrade['Name_Text'])] > 1:
        first_stat = upgrade['Classes'][0]['Stats'][0]['Name_Text'] if upgrade['Classes'][0]['Stats'] else upgrade['Template']
        upgrade['Name_Text'] = f"{upgrade['Name_Text']} ({first_stat})"

with open(output_json_file, 'w', encoding='utf-8') as f:
    json.dump(upgrade_types, f, indent=4, ensure_ascii=False)

print(f"✅ {len(upgrade_types)} upgrade types ({len(modules)} modules) written to: {output_json_file}")
