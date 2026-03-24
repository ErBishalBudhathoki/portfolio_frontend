// Register module aliases first
try {
  import('./lib/module-alias.js');
  console.log('Module aliases registered successfully');
} catch (error) {
  console.error('Failed to register module aliases:', error);
}

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';
import next from 'next';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Get backend URL from environment variable
const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

app.prepare().then(() => {
  const server = express();

  // Add health check endpoint
  server.get('/health', (req, res) => {
    res.status(200).send('OK');
  });

  // API routes proxy to backend
  server.use('/api', createProxyMiddleware({
    target: backendUrl,
    changeOrigin: true,
    pathRewrite: { '^/api': '/api' },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxying ${req.method} ${req.url} to ${backendUrl}/api${req.url}`);
    }
  }));

  // Handle all other routes with Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
});

  // Start server
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`Backend URL: ${backendUrl}`);
  });
}); 