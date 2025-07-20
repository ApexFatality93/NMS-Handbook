import xml.etree.ElementTree as ET
import json

# --- CONFIG ---
mxml_file = './Game Files/NMS_Reality_GCPRODUCTTABLE.MXML'
lang_json_file = './JSON Files/All_Lang_Data.json'
output_json_file = './JSON Files/Crafting_Table.json'

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

for product in root.findall('.//Property[@value="GcProductData"]'):
    data = extract_data(product)
    product_id = data.get('ID', None)
    is_craftable = data.get('IsCraftable', '')

    if product_id and is_craftable == 'true':
        name_id = data.get('Name', '')
        name_lower_id = data.get('NameLower', '')
        subtitle_id = data.get('Subtitle', '')
        description_id = data.get('Description', '')

        product_data_dict[product_id] = {
            'ProductId': product_id,
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
            'RecipeCost': data.get('RecipeCost', ''),
            'SpecificChargeOnly': data.get('SpecificChargeOnly', ''),
            'TradeCategory': data.get('TradeCategory', {}).get('TradeCategory', ''),
            'WikiCategory': data.get('WikiCategory', ''),
            'Ingredients': []
        }

        # --- FIXED INGREDIENT EXTRACTION ---
        ingredients = []
        requirements_node = product.find('./Property[@name="Requirements"]')
        if requirements_node is not None:
            for ing in requirements_node.findall('./Property[@value="GcTechnologyRequirement"]'):
                ing_id_node = ing.find('./Property[@name="ID"]')

                ing_amt_node = ing.find('./Property[@name="Amount"]')

                ing_id = ing_id_node.get('value') if ing_id_node is not None else ''
                ing_amt = ing_amt_node.get('value') if ing_amt_node is not None else ''
                type_node = ing.find('./Property[@name="Type"]/Property[@name="InventoryType"]')
                ing_type = type_node.get('value') if type_node is not None else ''
                
                if ing_id:
                    if ing_id in product_lookup:
                        ing_data = product_lookup[ing_id]
                        # ing_type = "Product"
                    elif ing_id in substance_lookup:
                        ing_data = substance_lookup[ing_id]
                        # ing_type = "Substance"
                    else:
                        ing_data = {}
                        # ing_type = "Unknown"

                    ingredients.append({
                        'Id': ing_id,
                        'Type': ing_type,
                        'Name_ID': ing_data.get('NameLower', ''),
                        'NameLower_Text': lang_lookup.get(ing_data.get('NameLower', ''), ''),
                        'Amount': ing_amt,
                        'Icon_Filename': ing_data.get('Icon_Filename', ''),
                        'Colour_R': ing_data.get('Colour_R', ''),
                        'Colour_G': ing_data.get('Colour_G', ''),
                        'Colour_B': ing_data.get('Colour_B', ''),
                        'Colour_A': ing_data.get('Colour_A', '')
                    })

        product_data_dict[product_id]['Ingredients'] = ingredients



# --- WRITE TO JSON ---
with open(output_json_file, 'w', encoding='utf-8') as json_out:
    json.dump(product_data_dict, json_out, indent=4, ensure_ascii=False)

print(f"✅ Crafting data written to: {output_json_file}")
print(f"🧾 Total Crafting products: {len(product_data_dict)}")