import os
import requests
from typing import Optional
from dotenv import load_dotenv
import asyncio
from datetime import datetime
import threading
import time
from concurrent.futures import ThreadPoolExecutor

load_dotenv()

class NotificationHelper:
    def __init__(self):
        """Initialize the notification helper with Telegram credentials"""
        self.telegram_bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
        self.telegram_chat_id = os.getenv("TELEGRAM_CHAT_ID")
        self.is_telegram_configured = bool(self.telegram_bot_token and self.telegram_chat_id)
        self.is_enabled = self.is_telegram_configured  # For backwards compatibility
        self.last_update_id = 0
        self.command_handlers = {}
        self.loop = asyncio.new_event_loop()
        self.executor = ThreadPoolExecutor(max_workers=1)
        
        # Start message polling in a separate thread if enabled
        if self.is_telegram_configured:
            self.running = True
            self.polling_thread = threading.Thread(target=self._poll_messages)
            self.polling_thread.daemon = True
            self.polling_thread.start()
        
        if not self.is_telegram_configured and self.telegram_bot_token:
            # If we have a token but no chat ID, try to get it
            chat_id = self.get_chat_id()
            if chat_id:
                print(f"\n=== FOUND YOUR CHAT ID: {chat_id} ===")
                print("Add this to your .env file as TELEGRAM_CHAT_ID\n")
    
    def register_command(self, command: str, handler):
        """Register a handler function for a specific command"""
        self.command_handlers[command.lower()] = handler
    
    def _run_async(self, coro):
        """Run an async function from a sync context"""
        asyncio.set_event_loop(self.loop)
        return self.loop.run_until_complete(coro)
    
    def _poll_messages(self):
        """Poll for new messages in a loop"""
        while self.running:
            try:
                updates = self._get_updates()
                for update in updates:
                    if 'message' in update and 'text' in update['message']:
                        message_text = update['message']['text'].lower()
                        chat_id = update['message']['chat']['id']
                        
                        # Handle commands
                        if message_text.startswith('/'):
                            command = message_text[1:].split()[0]  # Remove '/' and get first word
                            if command in self.command_handlers:
                                try:
                                    self.send_notification(f"Received command: {command}")
                                    handler = self.command_handlers[command]
                                    
                                    # Execute the handler in the executor if it's async
                                    if asyncio.iscoroutinefunction(handler):
                                        result = self._run_async(handler())
                                    else:
                                        result = handler()
                                        
                                    self.send_notification(f"Command completed: {command}")
                                except Exception as e:
                                    error_msg = f"Error executing command {command}: {str(e)}"
                                    print(error_msg)
                                    self.send_notification(error_msg, "ERROR")
                        
                        # Update last_update_id
                        self.last_update_id = update['update_id'] + 1
                
                time.sleep(1)  # Wait before next poll
            except Exception as e:
                print(f"Error in message polling: {e}")
                time.sleep(5)  # Wait longer on error
    
    def _get_updates(self):
        """Get updates from Telegram API"""
        if not self.is_telegram_configured:
            return []
            
        try:
            url = f"https://api.telegram.org/bot{self.telegram_bot_token}/getUpdates"
            params = {
                "offset": self.last_update_id,
                "timeout": 30
            }
            response = requests.get(url, params=params)
            if response.status_code == 200:
                return response.json().get("result", [])
        except Exception as e:
            print(f"Error getting updates: {e}")
        return []
    
    def get_chat_id(self) -> Optional[str]:
        """
        Get the chat ID from the most recent message sent to the bot.
        You must send at least one message to the bot for this to work.
        """
        try:
            # Get updates from the bot
            url = f"https://api.telegram.org/bot{self.telegram_bot_token}/getUpdates"
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
    
    def test_notification(self) -> dict:
        """
        Send a test notification to verify the setup
        """
        if not self.telegram_bot_token:
            print("ERROR: TELEGRAM_BOT_TOKEN not set in .env file")
            return {"success": False, "message": "TELEGRAM_BOT_TOKEN not set in .env file"}
            
        message = "🔔 Test notification from LinkedIn Scraper\n\nIf you see this, your notifications are working!"
        return self.send_notification(message, "INFO")
    
    def send_notification(self, message, message_type="INFO"):
        """Send a notification to Telegram if configured"""
        if not self.is_telegram_configured:
            print(f"Telegram not configured, can't send notification: {message}")
            return {"success": False, "message": "Telegram not configured"}
        
        # Prefix the message with environment information to distinguish between local and production
        is_production = os.environ.get('PORT') == '8080'  # Cloud Run sets PORT=8080
        env_prefix = "🌎 PROD" if is_production else "🧪 LOCAL"
        
        # Format the message with type and timestamp
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Choose emoji based on message type
        if message_type == "ERROR":
            emoji = "❌"
        elif message_type == "SUCCESS":
            emoji = "✅"
        elif message_type == "WARNING":
            emoji = "⚠️"
        else:
            emoji = "ℹ️"
        
        formatted_message = f"{env_prefix} | {emoji} {message_type}: {message}\n\n🕒 {timestamp}"
        
        try:
            url = f"https://api.telegram.org/bot{self.telegram_bot_token}/sendMessage"
            data = {
                "chat_id": self.telegram_chat_id,
                "text": formatted_message,
                "parse_mode": "HTML"
            }
            
            response = requests.post(url, json=data)
            response_json = response.json()
            
            if response_json.get("ok", False):
                print(f"Notification sent: {message}")
                return {"success": True, "message": "Notification sent successfully"}
            else:
                print(f"Failed to send notification: {response_json}")
                return {"success": False, "message": f"Failed to send notification: {response_json}"}
        except Exception as e:
            print(f"Error sending notification: {str(e)}")
            return {"success": False, "message": f"Error sending notification: {str(e)}"}
    
    def notify_scrape_start(self, profile_url: str) -> dict:
        """Send notification when scraping starts"""
        message = f"🔄 Starting LinkedIn profile scrape\nProfile: {profile_url}"
        return self.send_notification(message, "INFO")
    
    def notify_scrape_success(self, name: str, is_fallback: bool = False) -> dict:
        """Send notification when scraping completes successfully"""
        if is_fallback:
            message = f"✅ LinkedIn profile load completed (from FALLBACK data)\nProfile: {name}"
        else:
            message = f"✅ LinkedIn profile scrape completed successfully\nProfile: {name}"
        return self.send_notification(message, "SUCCESS")
    
    def notify_scrape_error(self, error: str) -> dict:
        """Send notification when scraping fails"""
        message = f"LinkedIn scrape failed: {error}"
        return self.send_notification(message, "ERROR")
    
    def stop(self):
        """Stop the message polling thread"""
        self.running = False
        if hasattr(self, 'polling_thread'):
            self.polling_thread.join()
    
    async def listen_for_messages(self):
        """
        Dummy async method for compatibility.
        Actual message handling is done in _poll_messages thread.
        """
        if not self.is_telegram_configured:
            print("Telegram not configured. Cannot listen for messages.")
            return False
            
        print("Telegram message handling is running in background thread.")
        # We don't need to do anything here since _poll_messages is already running in a thread
        return True 