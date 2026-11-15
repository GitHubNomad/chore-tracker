#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$SCRIPT_DIR/backend"

cd "$BACKEND"

if [ ! -d ".venv" ]; then
  echo "Run ./setup.sh first"
  exit 1
fi

source .venv/bin/activate

export DB_PATH="$BACKEND/scrubber.db"
export UPLOAD_DIR="$BACKEND/uploads"
mkdir -p "$UPLOAD_DIR"

echo "Starting Personal Info Scrubber at http://localhost:8765"
echo "Press Ctrl+C to stop"
echo ""

uvicorn main:app --host 0.0.0.0 --port 8765 --reload
