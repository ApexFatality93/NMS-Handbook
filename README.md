# NMS-Handbook

**NMS-Handbook** is a fan-made, open-source reference site for *No Man’s Sky* that helps explorers navigate the game’s vast universe with detailed inventory data, crafting info, and more.

## What It Does

This site displays structured information pulled directly from the game’s files, including:

- Cooking recipes  
- Refining recipes  
- Crafting recipes  
- Fishing locations  
- In-game item details  
- Color-coded icons and imagery  

Every recipe, stat, and item listed here reflects what’s actually in the game. No guesswork, no outdated info.

## How It Works

The site parses No Man’s Sky’s `MBIN/MXML` game files and transforms the data into structured `.json` files. These are rendered dynamically with JavaScript to create searchable, filterable, and visually clean pages.

Whenever the game receives an update, the data can be regenerated and replaced to reflect the newest version.

## About the Creator

Created by [**ApexFatality**](https://github.com/ApexFatality93), a long-time explorer and contributor in the *No Man’s Sky* community.

- [Discord](https://discord.com/users/123151755440553987)  
- [Reddit](https://www.reddit.com/user/ApexFatality/)  
- [GitHub](https://github.com/ApexFatality93)

## Contributing

This project is completely open source! Contributions, suggestions, or even bug reports are welcome. Whether you’re a developer, designer, or data guru, feel free to create your own fork and contribute!

## How to Update

When No Man's Sky receives an update, follow these steps to refresh the site data:

1. **Extract the updated game files** using:
   - [HGPAKTool](https://github.com/monkeyman192/HGPAKtool) – to unpack the game assets
   - [MBINCompiler](https://github.com/monkeyman192/MBINCompiler) – to convert `.MBIN` files to `.MXML`

2. **Replace the following folders with updated versions**:
   - `TEXTURES/`
   - `Lang Files/`
   - `Game Files/` (only replace exactly the handful of files in this folder, don't upload all game files)

3. **Run the Python scripts** in this order:
   - `lang_files.py`
   - `products.py`
   - `substances.py`
   - Then run any of the remaining `.py` files in any order

4. **Verify updates**:
   - Confirm that the output files in the `JSON Files/` folder are up to date and reflect any changes from the latest game version.

## License

This project is licensed under the **GNU General Public License v3.0**.

You are free to use, modify, and distribute this project under the terms of the [GPLv3 license](https://github.com/ApexFatality93/NMS-Handbook/blob/main/LICENSE), provided that any derivative works are also open source and carry the same license.

---

*This site is not affiliated with Hello Games. It is a labor of love by a community member, for the community.*

