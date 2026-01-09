#!/usr/bin/env python3
"""
Test litellm with DeepSeek to diagnose Aider authentication issue
"""
import os
import sys

try:
    import litellm
except ImportError:
    print("Error: litellm package not installed")
    print("Install with: pip install litellm")
    sys.exit(1)

def test_litellm_deepseek():
    """Test litellm with DeepSeek API"""

    api_key = "sk-40082e7dc3df459da42463b92d53a0ec"

    print(f"litellm version: {litellm.__version__}")
    print(f"API key: {api_key[:8]}...{api_key[-4:]}")
    print("\n🔄 Testing litellm with deepseek/deepseek-chat...")

    try:
        # Set environment variable
        os.environ['DEEPSEEK_API_KEY'] = api_key

        # Test with litellm
        response = litellm.completion(
            model="deepseek/deepseek-chat",
            messages=[{"role": "user", "content": "Say hello"}],
            api_key=api_key,
            base_url="https://api.deepseek.com"
        )

        print(f"✅ Success! Response: {response.choices[0].message.content}")
        return True

    except Exception as e:
        print(f"❌ Error: {type(e).__name__}")
        print(f"Details: {str(e)}")

        # Try alternative configuration
        print("\n🔄 Trying with different configuration...")
        try:
            response = litellm.completion(
                model="deepseek-chat",
                messages=[{"role": "user", "content": "Say hello"}],
                api_key=api_key,
                api_base="https://api.deepseek.com/v1"
            )
            print(f"✅ Success with alternative config! Response: {response.choices[0].message.content}")
            return True
        except Exception as e2:
            print(f"❌ Alternative also failed: {str(e2)}")
            return False

if __name__ == "__main__":
    success = test_litellm_deepseek()
    sys.exit(0 if success else 1)
