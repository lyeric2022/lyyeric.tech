import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors()); // Allow requests from Vite dev server
app.use(express.json()); // Parse JSON request bodies

// Endpoint to save tier_list_published.json
app.post('/api/save-published', async (req, res) => {
  try {
    const data = req.body;
    
    // Validate that we received an array
    if (!Array.isArray(data)) {
      return res.status(400).json({ error: 'Expected an array of items' });
    }

    // Path to tier_list_published.json in the public folder
    const filePath = path.join(__dirname, '..', 'public', 'tier_list_published.json');
    
    // Write the file with pretty formatting (2-space indent)
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    res.json({ success: true, message: 'File saved successfully' });
  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).json({ error: 'Failed to save file', details: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});


