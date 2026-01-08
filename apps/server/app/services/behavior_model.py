import os
import joblib
import json
from threading import Lock

class BehaviorModelCache:
    _instance = None
    _lock = Lock()
    def __init__(self, model_dir):
        self.model_dir = model_dir
        self.model = None
        self.schema = None
        self.version = None
        self._load()
    def _load(self):
        model_path = os.path.join(self.model_dir, 'model.joblib')
        schema_path = os.path.join(self.model_dir, 'feature_schema.json')
        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
        if os.path.exists(schema_path):
            with open(schema_path) as f:
                self.schema = json.load(f)
        self.version = self._get_version()
    def _get_version(self):
        # Use model file mtime as version
        model_path = os.path.join(self.model_dir, 'model.joblib')
        if os.path.exists(model_path):
            return str(int(os.path.getmtime(model_path)))
        return None
    @classmethod
    def get_instance(cls, model_dir):
        with cls._lock:
            if cls._instance is None:
                cls._instance = BehaviorModelCache(model_dir)
            return cls._instance
