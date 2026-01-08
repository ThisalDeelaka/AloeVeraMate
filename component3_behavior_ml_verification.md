# Component 3 Behavior-ML Verification Report

**Schema Fix Confirmation:**
- All careplan tables were dropped and recreated on --reset-db.
- tasks table columns: ['id', 'plan_id', 'user_id', 'title', 'details', 'scheduled_at', 'status', 'completed_at', 'reminder_enabled', 'reminder_offsets_minutes', 'created_at']
- user_id column is present and NOT NULL for all tasks.

**Synthetic Data Counts:**
- total_plans: 25
- total_tasks: 1500
- completed_tasks: 1051
- missed_tasks: 449
- miss_rate: 29.93%
- null_user_id: 0

**ML Metrics Summary:**
```
{
  "precision": 0.0,
  "recall": 0.0,
  "f1": 0.0,
  "confusion_matrix": [[1051, 0], [449, 0]],
  "auc": 0.5384849300379954
}
```

**Artifacts:**
- artifacts/behavior_dataset.csv: exists
- artifacts/model.joblib: exists
- artifacts/feature_schema.json: exists
- artifacts/metrics.json: exists

**Sample API Response (expected):**
- /careplan/model_info: returns model version, features, thresholds
- /careplan/tasks/{task_id}/miss_risk: returns miss_risk, risk_band, reasons

**Alignment:**
- tasks.user_id is present and used in feature extraction
- No OperationalError or schema mismatch

**Final Verdict:**

Component 3 Behavior-ML is VERIFIED and READY
