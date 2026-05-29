#!/bin/bash
set -e

echo "=== Personal Info Scrubber - Setup ==="

cd "$(dirname "$0")/backend"

python3 -m venv .venv
source .venv/bin/activate

pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

# Download spaCy model (small English model for NER)
python -m spacy download en_core_web_sm --quiet

echo ""
echo "=== Setup complete! ==="
echo "Run: ./run.sh"
