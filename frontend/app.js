// Register module aliases first
require('./lib/module-alias');

const express = require('express');
const next = require('next');
const { createProxyMiddleware } = require('http-proxy-middleware');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

app.prepare().then(() => {
  const server = express();

  // API proxy for backend
  server.use('/api', createProxyMiddleware({
    target: backendUrl,
    changeOrigin: true,
    pathRewrite: { '^/api': '/api' },
  }));

  // Default handler for all other routes
  server.all('*', (req, res) => {
    return handle(req, res);
});

  const port = process.env.PORT || 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
}); 