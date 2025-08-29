# path_utils.py
from pathlib import Path
import os

def resolve_case_path(path_str: str) -> str:
    """
    Return an existing filesystem path matching path_str, regardless of filename case.
    Strategy:
      1) Try the exact path.
      2) Try common variants (lower/upper basename).
      3) Scan the directory and return the file whose name matches case-insensitively.
    Raises FileNotFoundError if nothing matches.
    """
    p = Path(path_str)

    # 1) exact match
    if p.exists():
        return str(p)

    # 2) common variants (don’t change directories, only the final filename)
    variants = [
        p.with_name(p.name.lower()),
        p.with_name(p.name.upper()),
        # stem lower, keep original suffix
        p.with_name(p.stem.lower() + ''.join(p.suffixes)),
        # stem upper, keep original suffix
        p.with_name(p.stem.upper() + ''.join(p.suffixes)),
    ]
    for v in variants:
        if v.exists():
            return str(v)

    # 3) directory scan for a case-insensitive match
    parent = p.parent if p.parent.as_posix() not in ("", ".") else Path(".")
    target_name_cf = p.name.casefold()
    if parent.exists():
        for name in os.listdir(parent):
            if name.casefold() == target_name_cf:
                return str(parent / name)

    raise FileNotFoundError(
        f"Could not locate a file matching '{path_str}' (tried case variants and directory scan)."
    )
