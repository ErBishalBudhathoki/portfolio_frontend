'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Message {
  id: string;
  text: string;
  createdAt: Date;
}

export default function FirebaseExample() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'messages'));
        const fetchedMessages: Message[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedMessages.push({
            id: doc.id,
            text: data.text || '',
            createdAt: data.createdAt?.toDate() || new Date(),
          });
        });
        
        // Sort by date (newest first)
        fetchedMessages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        setMessages(fetchedMessages);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages. Please try again later.');
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        createdAt: serverTimestamp(),
      });
      
      setNewMessage('');
      
      // Refresh the messages
      const querySnapshot = await getDocs(collection(db, 'messages'));
      const updatedMessages: Message[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        updatedMessages.push({
          id: doc.id,
          text: data.text || '',
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });
      
      // Sort by date (newest first)
      updatedMessages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setMessages(updatedMessages);
    } catch (err) {
      console.error('Error adding message:', err);
      setError('Failed to send message. Please try again later.');
    }
  };

  if (loading) {
    return <div className="p-4">Loading messages...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>{error}</p>
        <p>Make sure Firebase is properly configured.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Firebase Messages Example</h2>
      
      <div className="mb-4">
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-l"
          />
          <button 
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r"
          >
            Send
          </button>
        </form>
      </div>
      
      <div className="space-y-2">
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet. Be the first to write something!</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="p-3 bg-gray-100 rounded">
              <p>{msg.text}</p>
              <p className="text-xs text-gray-500 mt-1">
                {msg.createdAt.toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 