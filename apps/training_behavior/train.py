import argparse
import pandas as pd
import joblib
import json
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

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
    parser.add_argument('--schema', required=True)
    parser.add_argument('--model_type', choices=['logistic', 'rf'], default='logistic')
    args = parser.parse_args()
    df = pd.read_csv(args.csv)
    X = df[FEATURES]
    y = df['missed']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    if args.model_type == 'logistic':
        model = LogisticRegression(max_iter=1000)
    else:
        model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    joblib.dump(model, args.model)
    with open(args.schema, 'w') as f:
        json.dump({'features': FEATURES}, f, indent=2)
    print(f"Trained {args.model_type} model and saved to {args.model}")

if __name__ == '__main__':
    main()
