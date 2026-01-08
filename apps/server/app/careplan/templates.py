import os
import json
from pathlib import Path
from typing import Dict

TEMPLATES_DIR = Path(__file__).parent.parent.parent / 'data' / 'careplan_templates'

def load_templates() -> Dict[str, Dict[str, dict]]:
    templates = {}
    for fname in os.listdir(TEMPLATES_DIR):
        if fname.endswith('.json'):
            with open(TEMPLATES_DIR / fname, 'r', encoding='utf-8') as f:
                tpl = json.load(f)
                disease_id = tpl.get('disease_id')
                mode = tpl.get('treatment_mode')
                if disease_id and mode:
                    if disease_id not in templates:
                        templates[disease_id] = {}
                    templates[disease_id][mode] = tpl
    return templates
