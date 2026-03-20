const express = require('express');
const cors = require('cors');
const path = require('path');
const { google } = require('googleapis');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/api/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

// Google Drive — Service Account
async function getDriveClient() {
  const json = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const auth = new google.auth.GoogleAuth({
    credentials: json,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  return google.drive({ version: 'v3', auth });
}

app.get('/api/drive/files', async (req, res) => {
  const { folderId } = req.query;
  if (!folderId) return res.status(400).json({ error: 'folderId is required' });
  try {
    const drive = await getDriveClient();
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType,size,modifiedTime,webViewLink,webContentLink)',
      pageSize: 100,
    });
    res.json({ files: response.data.files });
  } catch (e) {
    res.status(500).json({ error: e.message, details: e.message });
  }
});

// ElevenLabs TTS
app.post('/api/elevenlabs/tts', async (req, res) => {
  const { text, voice_id, model_id, voice_settings, api_key } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });
  try {
    const key = api_key || process.env.ELEVENLABS_API_KEY;
    const vid = voice_id || 'cBHXjRyIGRfO4Qyu1oNV';
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': key },
      body: JSON.stringify({ text, model_id: model_id || 'eleven_multilingual_v2', voice_settings: voice_settings || { stability: 0.5, similarity_boost: 0.75 } }),
    });
    if (!r.ok) throw new Error((await r.json()).detail?.message || 'ElevenLabs error');
    res.set('Content-Type', 'audio/mpeg');
    r.body.pipe(res);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Runway generate
app.post('/api/runway/generate', async (req, res) => {
  const { promptImage, promptText, duration, ratio, model } = req.body;
  if (!promptImage) return res.status(400).json({ error: 'promptImage is required' });
  try {
    const r = await fetch('https://api.dev.runwayml.com/v1/image_to_video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`, 'X-Runway-Version': '2024-11-06' },
      body: JSON.stringify({ model: model || 'gen4_turbo', promptImage, promptText, duration: duration || 10, ratio: ratio || '1280:768' }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || `HTTP ${r.status}`);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Runway status
app.get('/api/runway/status/:taskId', async (req, res) => {
  try {
    const r = await fetch(`https://api.dev.runwayml.com/v1/tasks/${req.params.taskId}`, {
      headers: { 'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`, 'X-Runway-Version': '2024-11-06' },
    });
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Keep-alive
setInterval(async () => {
  try {
    await fetch(`https://video-tool-backend.onrender.com/api/healthz`);
    console.log('[keep-alive] ping OK');
  } catch {}
}, 60000);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
