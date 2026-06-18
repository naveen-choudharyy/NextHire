#!/bin/bash

# NextHire ML Service Startup Script
# Set script directory to the python service folder
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "============================================="
echo " Starting NextHire Python ML Service Setup..."
echo "============================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null
then
    echo "ERROR: python3 could not be found. Please install Python 3."
    exit 1
fi

# Set up virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment in $DIR/venv..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to create virtual environment."
        exit 1
    fi
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements
echo "Installing dependencies from requirements.txt..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install python dependencies."
    exit 1
fi

# Run the Flask app
echo "Starting Flask ML Service on port 5002..."
export PORT=5002
python app.py
