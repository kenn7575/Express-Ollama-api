#!/bin/bash
API_HOST=${API_HOST:-"http://localhost:3000"}

echo "Waiting for Express API to be ready..."
sleep 5  # Allow time for API to start

echo "Testing connection to Express API..."
curl -X POST "$API_HOST/ollama" -H "Content-Type: application/json" -d '{"model": "llama3.2:3b", "prompt": "Tell me a joke"}'
echo ""
