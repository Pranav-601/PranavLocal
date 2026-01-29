const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Keep original filename but make it safe
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Store latest shared items in memory (you could use a database in production)
let latestShared = { file: null, text: null };

// API Routes
// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Remember latest file
    latestShared.file = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      uploadedAt: new Date().toISOString()
    };

    res.json({ 
      message: 'File uploaded successfully', 
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Text sharing endpoint
app.post('/api/send-text', (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    // Remember latest text
    latestShared.text = {
      text,
      sharedAt: new Date().toISOString()
    };

    res.json({ 
      message: 'Text shared successfully', 
      text 
    });
  } catch (error) {
    console.error('Text sharing error:', error);
    res.status(500).json({ error: 'Text sharing failed' });
  }
});

// Get latest shared items
app.get('/api/get-latest', (req, res) => {
  res.json(latestShared);
});

// Download file endpoint
app.get('/api/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(uploadsDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Send file as download
    res.download(filepath, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: 'Download failed' });
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

// List uploaded files
app.get('/api/files', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir).map(filename => {
      const filepath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filepath);
      return {
        filename,
        size: stats.size,
        uploadedAt: stats.mtime.toISOString()
      };
    });
    
    res.json(files);
  } catch (error) {
    console.error('File listing error:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Network info endpoint (useful for showing IP addresses)
app.get('/api/network-info', (req, res) => {
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const [name, nets] of Object.entries(networkInterfaces)) {
    for (const net of nets || []) {
      // Skip over non-IPv4 and internal addresses
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push({
          interface: name,
          address: net.address
        });
      }
    }
  }
  
  res.json({
    hostname: os.hostname(),
    addresses,
    port: PORT
  });
});

// Serve React app for all other routes (client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌐 Network: http://0.0.0.0:${PORT}`);
  console.log('📁 Frontend: Serving React app from dist folder');
  console.log('📡 API: Available at /api/*');
  
  // Show network addresses
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  for (const [name, nets] of Object.entries(networkInterfaces)) {
    for (const net of nets || []) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`🔗 Network access: http://${net.address}:${PORT}`);
      }
    }
  }
});
