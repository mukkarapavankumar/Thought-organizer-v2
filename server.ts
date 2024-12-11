import express from 'express';
import cors from 'cors';
import { storage } from './src/services/storage';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Load thoughts
app.get('/api/thoughts', async (req, res) => {
  try {
    const thoughts = await storage.loadThoughts();
    res.json(thoughts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load thoughts' });
  }
});

// Save thoughts
app.post('/api/thoughts', async (req, res) => {
  try {
    const { thoughts } = req.body;
    await storage.saveThoughts(thoughts);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save thoughts' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
