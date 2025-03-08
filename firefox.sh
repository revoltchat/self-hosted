#!/bin/bash

set -e

echo "Updating package lists..."
sudo apt update -y

echo "Installing Firefox..."
sudo apt install -y firefox

# Verify installation
if command -v firefox &> /dev/null; then
    echo "Firefox installed successfully!"
else
    echo "Firefox installation failed."
    exit 1
fi
