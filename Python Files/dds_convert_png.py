import os
from PIL import Image
import imageio

def dds_to_png(dds_file, png_file):
    try:
        dds_image = imageio.imread(dds_file, format='dds')
        pil_image = Image.fromarray(dds_image)
        os.makedirs(os.path.dirname(png_file), exist_ok=True)
        pil_image.save(png_file, 'PNG')
        print(f"✅ Converted: {dds_file} → {png_file}")
    except Exception as e:
        print(f"❌ Failed to convert {dds_file}: {e}")

def convert_all_dds_in_tree(input_root, output_root):
    for dirpath, _, filenames in os.walk(input_root):
        for filename in filenames:
            if filename.lower().endswith('.dds'):
                input_file = os.path.join(dirpath, filename)

                # Preserve folder structure relative to input_root
                rel_path = os.path.relpath(input_file, input_root)
                rel_path_png = os.path.splitext(rel_path)[0] + '.png'
                output_file = os.path.join(output_root, rel_path_png)

                dds_to_png(input_file, output_file)

# --- USAGE ---
input_folder = './TEXTURES/UI/FRONTEND/ICONS'
output_folder = './TEXTURES_PNG/UI/FRONTEND/ICONS'

convert_all_dds_in_tree(input_folder, output_folder)
