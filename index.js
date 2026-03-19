const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// Google Drive files
app.get('/api/drive/files', async (req, res) => {
  const { folderId, token } = req.query;
  if (!folderId || !token) return res.status(400).json({ error: 'folderId and token required' });
  try {
    const query = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
    const fields = encodeURIComponent('files(id,name,mimeType,size,modifiedTime)');
    const r = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    res.json(await r.json());
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ElevenLabs TTS
app.post('/api/elevenlabs/tts', async (req, res) => {
  const { text, voice_id, model_id, api_key } = req.body;
  if (!text || !api_key) return res.status(400).json({ error: 'text and api_key required' });
  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id || 'cBHXjRyIGRfO4Qyu1oNV'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': api_key },
      body: JSON.stringify({ text, model_id: model_id || 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.75 } })
    });
    if (!r.ok) return res.status(r.status).json(await r.json());
    res.set('Content-Type', 'audio/mpeg');
    res.send(await r.buffer());
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Runway ML generate
app.post('/api/runway/generate', async (req, res) => {
  const { promptImage, promptText, duration, ratio, api_key } = req.body;
  if (!api_key) return res.status(400).json({ error: 'api_key required' });
  try {
    const r = await fetch('https://api.dev.runwayml.com/v1/image_to_video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${api_key}`, 'X-Runway-Version': '2024-11-06' },
      body: JSON.stringify({ model: 'gen4_turbo', promptImage, promptText, duration: duration || 5, ratio: ratio || '1280:768' })
    });
    res.json(await r.json());
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Runway task status
app.get('/api/runway/task/:id', async (req, res) => {
  const { api_key } = req.query;
  try {
    const r = await fetch(`https://api.dev.runwayml.com/v1/tasks/${req.params.id}`, {
      headers: { 'Authorization': `Bearer ${api_key}`, 'X-Runway-Version': '2024-11-06' }
    });
    res.json(await r.json());
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
