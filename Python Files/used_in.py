
import json

technology_file = './JSON_Files/Technology_Table.json'
building_parts_file = './JSON_Files/Building_Parts_Table.json'
corvette_parts_file = './JSON_Files/Corvette_Parts_Table.json'
output_json_file = './JSON_Files/Used_In_Table.json'


def load(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


technology = load(technology_file)
building_parts = load(building_parts_file)
corvette_ids = set(load(corvette_parts_file))  # corvette parts are also in the building parts table

items = {}
used_in = {}


def remember(item_id, source, item_type):
    if item_id not in items:
        items[item_id] = {
            'NameLower_Text': source.get('NameLower_Text', ''),
            'Icon_Filename': source.get('Icon_Filename', ''),
            'Colour_R': source.get('Colour_R', '0'),
            'Colour_G': source.get('Colour_G', '0'),
            'Colour_B': source.get('Colour_B', '0'),
            'Colour_A': source.get('Colour_A', '1'),
            'Type': item_type,
        }


def add_uses(item_id, item, item_type, category):
    if not item.get('NameLower_Text'):
        return  # unused in-game (placeholder or not fully added), so don't list it

    requirements = item.get('Requirements') or []
    if not requirements:
        return

    remember(item_id, item, item_type)
    for req in requirements:
        remember(req['Id'], req, str(req.get('Type', '')).lower())

    entry = {
        'Id': item_id,
        'Requirements': [[req['Id'], req.get('Amount', '1')] for req in requirements],
    }
    for ingredient_id in {req['Id'] for req in requirements}:
        used_in.setdefault(ingredient_id, {}).setdefault(category, []).append(entry)


for item_id, item in technology.items():
    add_uses(item_id, item, 'technology', 'technology')

for item_id, item in building_parts.items():
    add_uses(item_id, item, 'construction', 'corvette' if item_id in corvette_ids else 'construction')

for categories in used_in.values():
    for entries in categories.values():
        entries.sort(key=lambda e: items[e['Id']]['NameLower_Text'].lower())

with open(output_json_file, 'w', encoding='utf-8') as f:
    json.dump({'items': items, 'usedIn': used_in}, f, indent=4, ensure_ascii=False)

total = sum(len(entries) for categories in used_in.values() for entries in categories.values())
print(f"✅ {total} uses across {len(used_in)} items written to: {output_json_file}")
