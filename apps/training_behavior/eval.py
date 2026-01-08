import argparse
import pandas as pd
import joblib
import json
from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix

FEATURES = [
    'day_of_week',
    'hour_of_day',
    'tasks_scheduled_same_day',
    'previous_misses_7d',
    'completion_streak',
    'avg_minutes_to_complete',
    'reminder_enabled',
    'number_of_reminders_sent_for_task'
]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--csv', required=True)
    parser.add_argument('--model', required=True)
    parser.add_argument('--metrics', required=True)
    args = parser.parse_args()
    df = pd.read_csv(args.csv)
    X = df[FEATURES]
    y = df['missed']
    model = joblib.load(args.model)
    y_pred = model.predict(X)
    y_prob = model.predict_proba(X)[:,1] if hasattr(model, 'predict_proba') else None
    metrics = {
        'precision': precision_score(y, y_pred),
        'recall': recall_score(y, y_pred),
        'f1': f1_score(y, y_pred),
        'confusion_matrix': confusion_matrix(y, y_pred).tolist()
    }
    if y_prob is not None:
        metrics['auc'] = roc_auc_score(y, y_prob)
    with open(args.metrics, 'w') as f:
        json.dump(metrics, f, indent=2)
    print(json.dumps(metrics, indent=2))

if __name__ == '__main__':
    main()
