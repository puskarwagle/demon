#!/bin/bash
# Script to run Aider with DeepSeek API properly configured

# Load the API key from demon/.env
export DEEPSEEK_API_KEY=sk-40082e7dc3df459da42463b92d53a0ec

# Alternative: Try setting OPENAI_API_KEY as some tools use that
export OPENAI_API_KEY=$DEEPSEEK_API_KEY

# Verify the key is set
echo "API Key: ${DEEPSEEK_API_KEY:0:8}...${DEEPSEEK_API_KEY: -4}"

# Run aider with explicit configuration
cd /home/wagle/inquisitive_mind/ecom/demon/src/routes/templates/botcloud

echo "Starting Aider with DeepSeek..."
aider \
  --model deepseek/deepseek-chat \
  --openai-api-key "$DEEPSEEK_API_KEY" \
  --openai-api-base https://api.deepseek.com \
  "$@"
