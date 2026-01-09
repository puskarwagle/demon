#!/usr/bin/env python3
"""
Simple script to test DeepSeek API key authentication
"""
import os
import sys

try:
    from openai import OpenAI
except ImportError:
    print("Error: openai package not installed")
    print("Install with: pip install openai")
    sys.exit(1)

def test_deepseek_api():
    """Test DeepSeek API authentication and basic call"""

    # Get API key from environment
    api_key = os.environ.get('DEEPSEEK_API_KEY')

    if not api_key:
        print("❌ Error: DEEPSEEK_API_KEY environment variable not set")
        print("\nSet it with:")
        print("export DEEPSEEK_API_KEY='your-api-key-here'")
        sys.exit(1)

    print(f"✓ API key found: {api_key[:8]}...{api_key[-4:]}")
    print("\n🔄 Testing DeepSeek API connection...")

    try:
        # Initialize OpenAI client with DeepSeek endpoint
        client = OpenAI(
            api_key=api_key,
            base_url="https://api.deepseek.com"
        )

        # Make a simple test call
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "user", "content": "Say 'Hello, API test successful!'"}
            ],
            max_tokens=50
        )

        result = response.choices[0].message.content
        print(f"✅ Success! API Response: {result}")
        print(f"\n📊 Model used: {response.model}")
        print(f"📊 Tokens used: {response.usage.total_tokens}")

        return True

    except Exception as e:
        print(f"❌ Error testing API: {type(e).__name__}")
        print(f"Details: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_deepseek_api()
    sys.exit(0 if success else 1)
