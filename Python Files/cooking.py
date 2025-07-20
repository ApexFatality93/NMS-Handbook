import xml.etree.ElementTree as ET
import json

# --- CONFIG ---
mxml_file = './Game Files/NMS_REALITY_GCRECIPETABLE.MXML'
lang_json_file = './JSON_Files/All_Lang_Data.json'
output_json_file = './JSON_Files/Cooking_Table.json'

# --- LOAD LANG JSON ---
with open(lang_json_file, 'r', encoding='utf-8') as f:
    lang_entries = json.load(f)

# --- LOAD PRODUCT & SUBSTANCE TABLE JSON ---
with open('./JSON_Files/Product_Table.json', 'r', encoding='utf-8') as f:
    product_table = json.load(f)

with open('./JSON_Files/Substance_Table.json', 'r', encoding='utf-8') as f:
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
cooking_data_dict = {}

for cooking_product in root.findall('.//Property[@value="GcRefinerRecipe"]'):
    data = extract_data(cooking_product)
    if data.get('Cooking') != 'true':
        continue

    result_data = data.get('Result', {})
    product_id = result_data.get('Id', '')
    if not product_id:
        continue

    product = product_lookup.get(product_id, {})

    # General product info
    if product_id not in cooking_data_dict:
        cooking_data_dict[product_id] = {
            'ProductID': product_id,
            'Name': product.get('Name', ''),
            'Name_Text': lang_lookup.get(product.get('Name', ''), ''),
            'NameLower': product.get('NameLower', ''),
            'NameLower_Text': lang_lookup.get(product.get('NameLower', ''), ''),
            'Subtitle': product.get('Subtitle', ''),
            'Subtitle_Text': lang_lookup.get(product.get('Subtitle', ''), ''),
            'Description': product.get('Description', ''),
            'Description_Text': lang_lookup.get(product.get('Description', ''), ''),
            'Icon_Filename': product.get('Icon_Filename', ''),
            'Colour_R': product.get('Colour_R', ''),
            'Colour_G': product.get('Colour_G', ''),
            'Colour_B': product.get('Colour_B', ''),
            'Colour_A': product.get('Colour_A', ''),
            'Recipes': []
        }

    # Extract ingredients
    ingredients = []
    ingredient_node = cooking_product.find('./Property[@name="Ingredients"]')
    if ingredient_node is not None:
        for prop in ingredient_node.findall('./Property'):
            id_node = prop.find('./Property[@name="Id"]')
            amt_node = prop.find('./Property[@name="Amount"]')

            ing_id = id_node.get('value') if id_node is not None else ''
            ing_amt = amt_node.get('value') if amt_node is not None else ''

            if ing_id:
                if ing_id in product_lookup:
                    ing_data = product_lookup[ing_id]
                    ing_type = "Product"
                elif ing_id in substance_lookup:
                    ing_data = substance_lookup[ing_id]
                    ing_type = "Substance"
                else:
                    ing_data = {}
                    ing_type = "Unknown"

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

    # Add recipe entry
    cooking_data_dict[product_id]['Recipes'].append({
        'RecipeType': lang_lookup.get(data.get('RecipeType', ''), ''),
        'RecipeName': lang_lookup.get(data.get('RecipeName', ''), ''),
        'TimeToMake': data.get('TimeToMake', ''),
        'Amount': result_data.get('Amount', ''),
        'Ingredients': ingredients
    })

# --- WRITE TO JSON ---
with open(output_json_file, 'w', encoding='utf-8') as json_out:
    json.dump(cooking_data_dict, json_out, indent=4, ensure_ascii=False)

print(f"✅ Cooking data written to: {output_json_file}")
print(f"🧾 Total unique cooking products: {len(cooking_data_dict)}")
