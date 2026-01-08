from pathlib import Path
import os

def get_repo_root() -> Path:
    # Walk up from this file to find the repo root (contains README.md)
    here = Path(__file__).resolve()
    for parent in here.parents:
        if (parent / 'README.md').exists():
            return parent
    raise RuntimeError('Could not find repo root (README.md not found)')

def get_careplan_db_path() -> Path:
    repo_root = get_repo_root()
    db_path = repo_root / 'apps' / 'server' / 'data' / 'careplan.db'
    return db_path
