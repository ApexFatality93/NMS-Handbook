
import html
import json
import os
import re
import shutil

SITE_URL = 'https://nmshandbook.com'
SITE_NAME = "No Man's Sky Handbook"
SHARE_DIR = './share'
FALLBACK_IMAGE = f'{SITE_URL}/android-chrome-512x512.png'
MAX_DESCRIPTION = 200

TYPE_TO_FILE = {
    'product': './JSON_Files/Product_Table.json',
    'substance': './JSON_Files/Substance_Table.json',
    'fossil': './JSON_Files/Fossil_Table.json',
    'fabrication': './JSON_Files/Ship_Part_Table.json',
    'technology': './JSON_Files/Technology_Table.json',
    'construction': './JSON_Files/Building_Parts_Table.json',
}


def clean_text(text):
    """Turn game text into plain text: drop button icons, unwrap colour tags, tidy spacing."""
    if not text:
        return ''
    text = re.sub(r'\s?\(?<IMG>[^<>]*<>\)?', '', text)
    text = re.sub(r'<[A-Z_]+>([^<>]*)<>', r'\1', text)
    text = re.sub(r'\s?\([A-Z_]+\)', '', text)
    return re.sub(r'\s+', ' ', text).strip()


def shorten(text, limit=MAX_DESCRIPTION):
    """Cut text at a word boundary so previews don't end mid-word."""
    if len(text) <= limit:
        return text
    return text[:limit].rsplit(' ', 1)[0].rstrip(' ,.;:') + '…'


def icon_url(icon_filename):
    """Match the item page's icon path rules, falling back to the site logo if the file is missing."""
    if not icon_filename:
        return FALLBACK_IMAGE
    path = re.sub(r'\.DDS$', '.png', icon_filename)
    prefix = 'TEXTURES/UI/FRONTEND/ICONS/'
    if path.startswith(prefix):
        path = prefix + path[len(prefix):].lower()
    if not os.path.isfile(path):
        return FALLBACK_IMAGE
    return f'{SITE_URL}/{path}'


def colour_hex(item):
    """Item colour as #rrggbb (Discord uses theme-color for the preview's side stripe)."""
    try:
        r, g, b = (round(float(item.get(c, 0)) * 255) for c in ('Colour_R', 'Colour_G', 'Colour_B'))
        return f'#{r:02x}{g:02x}{b:02x}'
    except (TypeError, ValueError):
        return '#4aa8ff'


def build_page(item_id, item_type, item):
    name = item.get('NameLower_Text') or item.get('Name') or item_id
    subtitle = clean_text(item.get('Subtitle_Text'))
    description = clean_text(item.get('Description_Text'))
    summary = shorten(f'{subtitle}. {description}' if subtitle and description else subtitle or description)

    share_url = f'{SITE_URL}/share/{item_type}/{item_id}/'
    item_path = f'/item/?id={item_id}&type={item_type}'

    e = lambda s: html.escape(s, quote=True)
    title = f'{name} - {SITE_NAME}'

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{e(title)}</title>
    <meta name="description" content="{e(summary)}">
    <meta name="theme-color" content="{colour_hex(item)}">
    <link rel="canonical" href="{e(share_url)}">

    <meta property="og:type" content="website">
    <meta property="og:site_name" content="{e(SITE_NAME)}">
    <meta property="og:url" content="{e(share_url)}">
    <meta property="og:title" content="{e(name)}">
    <meta property="og:description" content="{e(summary)}">
    <meta property="og:image" content="{e(icon_url(item.get('Icon_Filename')))}">

    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="{e(name)}">
    <meta name="twitter:description" content="{e(summary)}">
    <meta name="twitter:image" content="{e(icon_url(item.get('Icon_Filename')))}">

    <script>location.replace({json.dumps(item_path)});</script>
</head>
<body>
    <p><a href="{e(item_path)}">View {e(name)} on the {e(SITE_NAME)}</a></p>
</body>
</html>
'''


def main():
    if os.path.isdir(SHARE_DIR):
        shutil.rmtree(SHARE_DIR)

    total = 0
    for item_type, json_file in TYPE_TO_FILE.items():
        with open(json_file, 'r', encoding='utf-8') as f:
            items = json.load(f)

        for item_id, item in items.items():
            page_dir = os.path.join(SHARE_DIR, item_type, item_id)
            os.makedirs(page_dir, exist_ok=True)
            with open(os.path.join(page_dir, 'index.html'), 'w', encoding='utf-8') as f:
                f.write(build_page(item_id, item_type, item))

        print(f'{item_type}: {len(items)} pages')
        total += len(items)

    print(f'✅ {total} share pages written to {SHARE_DIR}/')


main()
