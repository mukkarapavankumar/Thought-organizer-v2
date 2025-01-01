const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

function createServer(userDataPath, log) {
  const server = express();
  server.use(cors());
  server.use(express.json());

  // Helper functions
  async function readJsonFile(filename) {
    try {
      const filePath = path.join(userDataPath, filename);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async function writeJsonFile(filename, data) {
    const filePath = path.join(userDataPath, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  // Routes
  server.get('/api/thoughts/:sectionId', async (req, res) => {
    try {
      const { sectionId } = req.params;
      const thoughts = await readJsonFile(`thoughts_${sectionId}.json`) || [];
      res.json(thoughts);
    } catch (error) {
      log(`Error reading thoughts: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  });

  server.post('/api/thoughts/:sectionId', async (req, res) => {
    try {
      const { sectionId } = req.params;
      const thoughts = await readJsonFile(`thoughts_${sectionId}.json`) || [];
      const newThoughts = Array.isArray(req.body) ? req.body : [req.body];
      await writeJsonFile(`thoughts_${sectionId}.json`, newThoughts);
      res.json(newThoughts);
    } catch (error) {
      log(`Error saving thoughts: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  });

  server.get('/api/sections', async (req, res) => {
    try {
      const sections = await readJsonFile('sections.json') || [];
      res.json(sections);
    } catch (error) {
      log(`Error reading sections: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  });

  server.post('/api/sections', async (req, res) => {
    try {
      const sections = Array.isArray(req.body) ? req.body : [req.body];
      await writeJsonFile('sections.json', sections);
      res.json(sections);
    } catch (error) {
      log(`Error saving sections: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  });

  return server;
}

module.exports = createServer; 