import xml.etree.ElementTree as ET
import json

# --- CONFIG ---
mxml_file = './Game Files/STORIESTABLE.MXML'
lang_json_file = './JSON Files/All_Lang_Data.json'
output_json_file = './JSON Files/Story_Table.json'

# --- LOAD LANG JSON ---
with open(lang_json_file, 'r', encoding='utf-8') as f:
    lang_entries = json.load(f)

# --- LOAD PRODUCT & SUBSTANCE TABLE JSON ---
with open('./JSON Files/Product_Table.json', 'r', encoding='utf-8') as f:
    product_table = json.load(f)

with open('./JSON Files/Substance_Table.json', 'r', encoding='utf-8') as f:
    substance_table = json.load(f)

product_lookup = {key: value for key, value in product_table.items()}
substance_lookup = {key: value for key, value in substance_table.items()}

# Create lookup dictionary from lang JSON
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
story_data_dict = {}

for story in root.findall('.//Property[@value="GcStoryCategory"]'):
    data = extract_data(story)
    category_id = data.get('CategoryID', None)

    if category_id:
        story_entry = {
            'CategoryID': category_id,
            'CategoryText': lang_lookup.get(category_id, ''),
            'IconOn': data.get('IconOn', {}).get('Filename', ''),
            'IconOff': data.get('IconOff', {}).get('Filename', ''),
            'Pages': []
        }

        pages_element = story.find(".//Property[@name='Pages']")
        if pages_element is not None:
            for page_elem in pages_element.findall(".//Property[@value='GcStoryPage']"):
                page_data = extract_data(page_elem)

                page_entry = {
                    'PageID': page_data.get('ID', ''),
                    'PageText': lang_lookup.get(page_data.get('ID', ''), ''),
                    'PageIcon': page_data.get('Icon', {}).get('Filename', ''),
                    'Entries': []
                }

                entries_element = page_elem.find(".//Property[@name='Entries']")
                if entries_element is not None:
                    for entry_elem in entries_element.findall(".//Property[@value='GcStoryEntry']"):
                        entry_data = extract_data(entry_elem)

                        product_id = entry_data.get('ProductID', '')
                        substance_id = entry_data.get('SubstanceID', '')
                        tooltip_id = entry_data.get('TooltipTitle', '')

                        entry = {
                            'TitleID': entry_data.get('Title', ''),
                            'TitleText': lang_lookup.get(entry_data.get('Title', ''), ''),
                            'EntryID': entry_data.get('Entry', ''),
                            'EntryText': lang_lookup.get(entry_data.get('Entry', ''), ''),
                        }

                        page_entry['Entries'].append(entry)

                story_entry['Pages'].append(page_entry)

        story_data_dict[category_id] = story_entry

# --- WRITE TO JSON ---
with open(output_json_file, 'w', encoding='utf-8') as json_out:
    json.dump(story_data_dict, json_out, indent=4, ensure_ascii=False)

print(f"✅ Story data written to: {output_json_file}")
print(f"🧾 Total Stories: {len(story_data_dict)}")
