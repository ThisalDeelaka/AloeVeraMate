## Quickstart: Generate Synthetic Data, Train, and Evaluate (Windows)

1. Generate synthetic data, train, and evaluate (fully automated):
```bat
cd apps\training_behavior
python simulate_data.py --reset-db
```

This will:
- Create the careplan.db and all required tables if missing
- Generate at least 1500 tasks (with at least 300 missed)
- Build the dataset, train the model, and evaluate metrics
- Output artifacts in `artifacts/`

2. To re-run only the training pipeline (after data exists):
```bat
python build_dataset.py --db_path ../../server/data/careplan.db --out_csv artifacts/behavior_dataset.csv
python train.py --csv artifacts/behavior_dataset.csv --model artifacts/model.joblib --schema artifacts/feature_schema.json --model_type logistic
python eval.py --csv artifacts/behavior_dataset.csv --model artifacts/model.joblib --metrics artifacts/metrics.json
```
# Missed Task Prediction Model Training

This module builds and trains a model to predict whether a care plan task will be missed, based on user behavior.

## Data Source
- SQLite: `apps/server/data/careplan.db`
- Uses `tasks` and `task_events` tables

## Feature Engineering
- `day_of_week` (0-6)
- `hour_of_day` (0-23)
- `tasks_scheduled_same_day` (count)
- `previous_misses_7d`
- `completion_streak`
- `avg_minutes_to_complete` (last N tasks)
- `reminder_enabled` (0/1)
- `number_of_reminders_sent_for_task`

## Label
- `missed = 1` if `task.status == "MISSED"`, else `0` for `COMPLETED` tasks
- Ignore `PENDING` tasks

## Workflow

### 1. Extract Features
```bash
python build_dataset.py --db_path ../../server/data/careplan.db --out_csv artifacts/dataset.csv
```

### 2. Train Model
```bash
python train.py --csv artifacts/dataset.csv --model artifacts/model.joblib --schema artifacts/feature_schema.json --model_type logistic
# or for random forest:
python train.py --csv artifacts/dataset.csv --model artifacts/model.joblib --schema artifacts/feature_schema.json --model_type rf
```

### 3. Evaluate Model
```bash
python eval.py --csv artifacts/dataset.csv --model artifacts/model.joblib --metrics artifacts/metrics.json
```

### 4. Export Artifacts
```bash
python export.py --dest ../../server/artifacts/behavior/
```

## Requirements
- Python 3.10+
- scikit-learn
- pandas
- joblib

Install requirements:
```bash
pip install -r requirements.txt
```
