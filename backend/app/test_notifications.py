import os
import sys
from dotenv import load_dotenv
from .notification_helper import NotificationHelper

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
    print("   python -m app.test_notifications")
    
    print("\n5. Add the chat ID to your .env file:")
    print("   TELEGRAM_CHAT_ID=your_chat_id_here")
    
    print("\n6. Run this script again to test the notifications")
    print("   (If successful, you'll receive a test message on Telegram)\n")

def main():
    # Check for command line arguments
    if len(sys.argv) > 1 and sys.argv[1] == "--help":
        print_setup_instructions()
        return
    
    # Create notification helper
    notifier = NotificationHelper()
    
    # Check if token and chat ID are configured
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    
    if not token:
        print("\n❌ ERROR: TELEGRAM_BOT_TOKEN not set in .env file")
        print_setup_instructions()
        return
        
    if not chat_id:
        print("\n⚠️ TELEGRAM_CHAT_ID not set in .env file")
        print("Attempting to retrieve chat ID automatically...")
        
        retrieved_chat_id = notifier.get_chat_id()
        if retrieved_chat_id:
            print(f"\n✅ FOUND YOUR CHAT ID: {retrieved_chat_id}")
            print(f"Add this to your .env file as: TELEGRAM_CHAT_ID={retrieved_chat_id}")
        else:
            print("\n❌ Could not retrieve chat ID automatically")
            print_setup_instructions()
        return
    
    # Test notification
    print("\n🔔 Sending test notification...")
    if notifier.test_notification():
        print("✅ Test notification sent successfully!")
        print("Check your Telegram app for the message.")
    else:
        print("❌ Failed to send test notification. Please check your credentials.")

if __name__ == "__main__":
    main() 