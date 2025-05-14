'use client';

import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function FirebaseTestPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testFirebaseConnection() {
      try {
        // Try to connect to Firestore and list collections
        const snapshot = await getDocs(collection(db, 'test-collection'));
        console.log('Firebase connection successful, found', snapshot.docs.length, 'documents');
        setStatus('success');
      } catch (err) {
        console.error('Firebase connection error:', err);
        setError(err instanceof Error ? err.message : String(err));
        setStatus('error');
      }
    }

    testFirebaseConnection();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Firebase Connection Test</h1>
      
      {status === 'loading' && (
        <div className="bg-blue-100 p-4 rounded">
          <p>Testing Firebase connection...</p>
        </div>
      )}
      
      {status === 'success' && (
        <div className="bg-green-100 p-4 rounded">
          <p className="text-green-700">Firebase connection successful!</p>
          <p className="mt-2">
            Your Firebase configuration is working correctly. Check the console for more details.
          </p>
        </div>
      )}
      
      {status === 'error' && (
        <div className="bg-red-100 p-4 rounded">
          <p className="text-red-700">Firebase connection error</p>
          {error && (
            <pre className="mt-2 p-2 bg-gray-100 overflow-auto text-sm">
              {error}
            </pre>
          )}
          <p className="mt-4">
            This could be due to:
          </p>
          <ul className="list-disc pl-5 mt-2">
            <li>Missing or incorrect Firebase configuration in your environment variables</li>
            <li>Firebase services not enabled for your project</li>
            <li>Network connectivity issues</li>
            <li>CORS restrictions if testing locally</li>
          </ul>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Environment Variables</h2>
        <p className="mb-4">Check that these environment variables are set correctly:</p>
        
        <ul className="list-disc pl-5">
          <li>NEXT_PUBLIC_FIREBASE_API_KEY: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Not set'}</li>
          <li>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Not set'}</li>
          <li>NEXT_PUBLIC_FIREBASE_PROJECT_ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Not set'}</li>
          <li>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Not set'}</li>
          <li>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: {process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✅ Set' : '❌ Not set'}</li>
          <li>NEXT_PUBLIC_FIREBASE_APP_ID: {process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ Set' : '❌ Not set'}</li>
        </ul>
      </div>
    </div>
  );
} 