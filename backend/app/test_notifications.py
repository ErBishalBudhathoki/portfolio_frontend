from notification_helper import NotificationHelper

def main():
    print("\n=== Telegram Notification Setup Helper ===\n")
    
    # Initialize the notification helper
    notifier = NotificationHelper()
    
    # Print debug information
    print(f"Bot Token exists: {'Yes' if notifier.telegram_bot_token else 'No'}")
    print(f"Chat ID exists: {'Yes' if notifier.telegram_chat_id else 'No'}")
    print(f"Notifications enabled: {'Yes' if notifier.is_enabled else 'No'}")
    
    # If we have a bot token but no chat ID, try to get it
    if notifier.telegram_bot_token and not notifier.telegram_chat_id:
        print("\nTrying to get chat ID...")
        chat_id = notifier.get_chat_id()
        if chat_id:
            print(f"\nFound your chat ID: {chat_id}")
            print("Add this to your .env file as:")
            print(f"TELEGRAM_CHAT_ID={chat_id}\n")
    
    # If we have both token and chat ID, send a test notification
    if notifier.is_enabled:
        print("\nSending test notification...")
        if notifier.test_notification():
            print("✅ Test notification sent successfully! Check your Telegram.")
        else:
            print("❌ Failed to send test notification.")
    else:
        if not notifier.telegram_bot_token:
            print("\n❌ ERROR: TELEGRAM_BOT_TOKEN not set in .env file")
            print("\nTo set up your bot:")
            print("1. Open Telegram and search for @BotFather")
            print("2. Send /newbot and follow the instructions")
            print("3. Copy the bot token you receive")
            print("4. Add it to your .env file as TELEGRAM_BOT_TOKEN=your_token_here")
        elif not notifier.telegram_chat_id:
            print("\n❌ ERROR: TELEGRAM_CHAT_ID not set in .env file")
            print("\nTo get your chat ID:")
            print("1. Search for your bot in Telegram")
            print("2. Send any message to your bot")
            print("3. Run this script again to get your chat ID")

if __name__ == "__main__":
    main() 