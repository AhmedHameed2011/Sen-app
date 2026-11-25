const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the project root (HTML, CSS, JS, etc.)
app.use(express.static(__dirname));

// Fallback for SPA routes – serve index.html for any unknown path
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server listening at http://localhost:${PORT}`);
});
