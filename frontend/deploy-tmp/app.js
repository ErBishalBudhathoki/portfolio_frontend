const express = require('express');
const app = express();

// Backend URL from environment variable or default
const backendUrl = process.env.BACKEND_URL || 'https://portfolio-backend-824962762241.us-central1.run.app';

// Serve static files
app.use(express.static('.'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// API endpoint to get backend URL
app.get('/api/backend-url', (req, res) => {
  res.json({ url: backendUrl });
});

// For all other routes, serve the index.html
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Start the server
const port = parseInt(process.env.PORT) || 8080;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
  console.log(`Backend URL: ${backendUrl}`);
}); 