// Register module aliases first
try {
  require('./lib/module-alias');
  console.log('Module aliases registered successfully');
} catch (error) {
  console.error('Failed to register module aliases:', error);
}

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Backend URL: ${process.env.BACKEND_URL || 'https://portfolio-backend-824962762241.us-central1.run.app'}`);
}); 