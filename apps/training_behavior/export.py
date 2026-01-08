import argparse
import shutil
import os

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dest', required=True)
    args = parser.parse_args()
    src_dir = os.path.dirname(__file__)
    artifacts = ['model.joblib', 'feature_schema.json', 'metrics.json']
    os.makedirs(args.dest, exist_ok=True)
    for fname in artifacts:
        src = os.path.join(src_dir, 'artifacts', fname)
        if os.path.exists(src):
            shutil.copy2(src, os.path.join(args.dest, fname))
            print(f"Copied {fname} to {args.dest}")
        else:
            print(f"Warning: {fname} not found in artifacts/")

if __name__ == '__main__':
    main()
