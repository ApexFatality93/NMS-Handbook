# import xml.etree.ElementTree as ET
# import json

# def extract_english_values_to_json(exml_file, output_json_file):
#     # Parse the EXML file
#     tree = ET.parse(exml_file)
#     root = tree.getroot()

#     results = []

#     # Iterate through the EXML structure
#     for entry in root.findall(".//Property[@value='TkLocalisationEntry']"):
#         id_node = entry.find("./Property[@name='Id']")
#         en_node = entry.find("./Property[@name='English']")

#         id_value = id_node.get('value', '') if id_node is not None else ''
#         english_value = en_node.get('value', '') if en_node is not None else ''

#         if english_value:
#             results.append({
#                 'Id': id_value,
#                 'English': english_value
#             })

#     # Write to JSON file
#     with open(output_json_file, 'w', encoding='utf-8') as json_file:
#         json.dump(results, json_file, indent=2, ensure_ascii=False)

#     print(f"✅ English values have been extracted to {output_json_file}")

# # Usage example
# exml_file = './Lang Files/NMS_UPDATE3_ENGLISH.MXML'
# output_json_file = './JSON Files/Lang_Data.json'
# extract_english_values_to_json(exml_file, output_json_file)



import os
import xml.etree.ElementTree as ET
import json

def extract_english_values_from_file(exml_path, source_filename):
    results = []
    try:
        tree = ET.parse(exml_path)
        root = tree.getroot()

        for entry in root.findall(".//Property[@value='TkLocalisationEntry']"):
            id_node = entry.find("./Property[@name='Id']")
            en_node = entry.find("./Property[@name='English']")

            id_value = id_node.get('value', '') if id_node is not None else ''
            english_value = en_node.get('value', '') if en_node is not None else ''

            if english_value:
                results.append({
                    'Id': id_value,
                    'English': english_value
                })
    except Exception as e:
        print(f"⚠️ Error processing {source_filename}: {e}")
    return results

def extract_from_all_mxml(folder_path, output_json_file):
    combined_results = []

    for filename in os.listdir(folder_path):
        if filename.lower().endswith('.mxml'):
            full_path = os.path.join(folder_path, filename)
            print(f"Processing {filename}...")
            file_results = extract_english_values_from_file(full_path, filename)
            combined_results.extend(file_results)

    with open(output_json_file, 'w', encoding='utf-8') as f:
        json.dump(combined_results, f, indent=2, ensure_ascii=False)

    print(f"✅ Combined English entries written to: {output_json_file}")

# Usage
lang_files_dir = "./Lang Files"
output_json_path = "./JSON Files/All_Lang_Data.json"

extract_from_all_mxml(lang_files_dir, output_json_path)
