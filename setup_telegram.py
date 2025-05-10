import os
import sys
import requests
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

def print_setup_instructions():
    print("\n=== TELEGRAM NOTIFICATION SETUP GUIDE ===")
    print("To enable Telegram notifications, you need to:")
    print("1. Create a bot using BotFather:")
    print("   - Open Telegram and search for @BotFather")
    print("   - Send /newbot to create a new bot")
    print("   - Follow the instructions to name your bot")
    print("   - Copy the API token provided")
    
    print("\n2. Add the bot token to your .env file:")
    print("   TELEGRAM_BOT_TOKEN=your_bot_token_here")
    
    print("\n3. Start a chat with your bot:")
    print("   - Search for your bot by username")
    print("   - Send any message to it")
    
    print("\n4. Run this script again to automatically find your chat ID")
    
    print("\n5. Add the chat ID to your .env file:")
    print("   TELEGRAM_CHAT_ID=your_chat_id_here")
    
    print("\n6. Run this script again to test the notifications")
    print("   (If successful, you'll receive a test message on Telegram)\n")

def get_chat_id(token):
    """
    Get the chat ID from the most recent message sent to the bot.
    You must send at least one message to the bot for this to work.
    """
    try:
        # Get updates from the bot
        url = f"https://api.telegram.org/bot{token}/getUpdates"
        response = requests.get(url)
        response.raise_for_status()
        
        updates = response.json()
        
        if updates.get("ok") and updates.get("result"):
            # Get the most recent message's chat ID
            for update in reversed(updates["result"]):
                if "message" in update and "chat" in update["message"]:
                    return str(update["message"]["chat"]["id"])
        
        print("\n=== NO CHAT ID FOUND ===")
        print("Please follow these steps to get your chat ID:")
        print("1. Search for your bot in Telegram (you should have received its username from BotFather)")
        print("2. Send any message to your bot")
        print("3. Run this code again to automatically get your chat ID")
        print("4. Add the chat ID to your .env file as TELEGRAM_CHAT_ID\n")
        
        return None
        
    except Exception as e:
        print(f"Error getting chat ID: {e}")
        return None

def send_test_notification(token, chat_id):
    """Send a test notification via Telegram"""
    try:
        message = "🔔 Test notification from Portfolio Backend\n\nIf you see this, your notifications are working!"
        emoji = "ℹ️"
        formatted_message = f"{emoji} INFO\n{message}\n📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        data = {
            "chat_id": chat_id,
            "text": formatted_message,
            "parse_mode": "HTML"
        }
        
        response = requests.post(url, json=data)
        return response.status_code == 200
        
    except Exception as e:
        print(f"Error sending Telegram notification: {e}")
        return False

def update_env_file(env_file_path, key, value):
    """Update or add an environment variable in .env file"""
    try:
        # Read existing content
        if os.path.exists(env_file_path):
            with open(env_file_path, 'r') as file:
                lines = file.readlines()
        else:
            lines = []
        
        # Check if key already exists
        key_exists = False
        for i, line in enumerate(lines):
            if line.startswith(f"{key}="):
                lines[i] = f"{key}={value}\n"
                key_exists = True
                break
        
        # Add key if it doesn't exist
        if not key_exists:
            lines.append(f"{key}={value}\n")
        
        # Write back to file
        with open(env_file_path, 'w') as file:
            file.writelines(lines)
        
        return True
    except Exception as e:
        print(f"Error updating .env file: {e}")
        return False

def main():
    env_file = os.path.join("backend", ".env")
    
    # Check for command line arguments
    if len(sys.argv) > 1 and sys.argv[1] == "--help":
        print_setup_instructions()
        return
    
    # Check if token and chat ID are configured
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    
    # If a token is provided as an argument, use that
    if len(sys.argv) > 1 and sys.argv[1].startswith("TELEGRAM_BOT_TOKEN="):
        token = sys.argv[1].split("=", 1)[1]
        print(f"Using provided token: {token[:5]}...")
        if update_env_file(env_file, "TELEGRAM_BOT_TOKEN", token):
            print(f"✅ Added token to {env_file}")
    
    if not token:
        print("\n❌ ERROR: TELEGRAM_BOT_TOKEN not set in .env file")
        print_setup_instructions()
        
        # Prompt for token input
        token = input("\nIf you have a token already, enter it now (or press Enter to skip): ").strip()
        if token:
            if update_env_file(env_file, "TELEGRAM_BOT_TOKEN", token):
                print(f"✅ Added token to {env_file}")
            else:
                return
        else:
            return
        
    if not chat_id:
        print("\n⚠️ TELEGRAM_CHAT_ID not set in .env file")
        print("Attempting to retrieve chat ID automatically...")
        
        retrieved_chat_id = get_chat_id(token)
        if retrieved_chat_id:
            print(f"\n✅ FOUND YOUR CHAT ID: {retrieved_chat_id}")
            
            # Update .env file with the chat ID
            if update_env_file(env_file, "TELEGRAM_CHAT_ID", retrieved_chat_id):
                print(f"✅ Added chat ID to {env_file}")
                chat_id = retrieved_chat_id
            else:
                print(f"Add this to your .env file manually: TELEGRAM_CHAT_ID={retrieved_chat_id}")
                return
        else:
            print("\n❌ Could not retrieve chat ID automatically")
            print_setup_instructions()
            return
    
    # Test notification
    print("\n🔔 Sending test notification...")
    if send_test_notification(token, chat_id):
        print("✅ Test notification sent successfully!")
        print("Check your Telegram app for the message.")
    else:
        print("❌ Failed to send test notification. Please check your credentials.")

if __name__ == "__main__":
    main() 