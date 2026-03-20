—ć—const express = require('express');
const cors = require('cors');
const path = require('path');
const { google } = require('googleapis');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/api/healthz', (req, res) => res.json({ status: 'ok' }));

// Google Drive client
async function getDriveClient() {
      const json = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      const auth = new google.auth.GoogleAuth({
              credentials: json,
              scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      });
      return google.drive({ version: 'v3', auth });
}

// List files in folder
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
              res.status(500).json({ error: e.message });
      }
});

// Proxy file from Drive
app.get('/api/drive/file/:fileId', async (req, res) => {
      try {
              const drive = await getDriveClient();
              const meta = await drive.files.get({ fileId: req.params.fileId, fields: 'name,mimeType,size' });
              res.set('Content-Type', meta.data.mimeType);
              res.set('Content-Disposition', `inline; filename="${meta.data.name}"`);
              res.set('Accept-Ranges', 'bytes');
              const stream = await drive.files.get(
                  { fileId: req.params.fileId, alt: 'media' },
                  { responseType: 'stream' }
                      );
              stream.data.pipe(res);
      } catch (e) {
              res.status(500).json({ error: e.message });
      }
});

// ElevenLabs TTS — fix: koristimo api_key iz requesta ako postoji, fallback env
app.post('/api/elevenlabs/tts', async (req, res) => {
      const { text, voice_id, model_id, voice_settings, api_key } = req.body;
      if (!text) return res.status(400).json({ error: 'text is required' });
      const key = api_key || process.env.ELEVENLABS_API_KEY;
      if (!key) return res.status(400).json({ error: 'ElevenLabs API key is missing' });
      try {
              const vid = voice_id || 'cBHXjRyIGRfO4Qyu1oNV';
              const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vid}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'xi-api-key': key },
                        body: JSON.stringify({
                                    text,
                                    model_id: model_id || 'eleven_multilingual_v2',
                                    voice_settings: voice_settings || { stability: 0.5, similarity_boost: 0.75 }
                        }),
              });
              if (!r.ok) {
                        const errText = await r.text();
                        return res.status(r.status).json({ error: `ElevenLabs error: ${errText}` });
              }
              res.set('Content-Type', 'audio/mpeg');
              r.body.pipe(res);
      } catch (e) {
              res.status(500).json({ error: e.message });
      }
});

// Runway generate — konvertuje URL slike u base64 data URI
app.post('/api/runway/generate', async (req, res) => {
      const { promptImage, promptText, duration, ratio, model, api_key } = req.body;
      if (!promptImage) return res.status(400).json({ error: 'promptImage is required' });
      const key = api_key || process.env.RUNWAY_API_KEY;
      if (!key) return res.status(400).json({ error: 'Runway API key is missing' });
      try {
              let finalImage = promptImage;
              if (promptImage.startsWith('http')) {
                        const imgRes = await fetch(promptImage);
                        if (!imgRes.ok) throw new Error(`Ne mogu preuzeti sliku: HTTP ${imgRes.status}`);
                        const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
                        const arrayBuffer = await imgRes.arrayBuffer();
                        const base64 = Buffer.from(arrayBuffer).toString('base64');
                        finalImage = `data:${contentType};base64,${base64}`;
              }
              const r = await fetch('https://api.dev.runwayml.com/v1/image_to_video', {
                        method: 'POST',
                        headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${key}`,
                                    'X-Runway-Version': '2024-11-06'
                        },
                        body: JSON.stringify({
                                    model: model || 'gen4_turbo',
                                    promptImage: finalImage,
                                    promptText,
                                    duration: duration || 10,
                                    ratio: ratio || '1280:768'
                        }),
              });
              const data = await r.json();
              if (!r.ok) throw new Error(data.message || JSON.stringify(data));
              res.json(data);
      } catch (e) {
              res.status(500).json({ error: e.message });
      }
});

// Runway status
app.get('/api/runway/status/:taskId', async (req, res) => {
      const key = req.query.api_key || process.env.RUNWAY_API_KEY;
      try {
              const r = await fetch(`https://api.dev.runwayml.com/v1/tasks/${req.params.taskId}`, {
                        headers: {
                                    'Authorization': `Bearer ${key}`,
                                    'X-Runway-Version': '2024-11-06'
                        },
              });
              res.json(await r.json());
      } catch (e) {
              res.status(500).json({ error: e.message });
      }
});

// Captions.ai — generate captions from video URL
app.post('/api/captions/generate', async (req, res) => {
      const { videoUrl, api_key, language } = req.body;
      if (!videoUrl) return res.status(400).json({ error: 'videoUrl is required' });
      const key = api_key || process.env.CAPTIONS_API_KEY;
      if (!key) return res.status(400).json({ error: 'Captions API key is missing' });
      try {
              const r = await fetch('https://api.captions.ai/api/caption/create', {
                        method: 'POST',
                        headers: {
                                    'Content-Type': 'application/json',
                                    'x-api-key': key
                        },
                        body: JSON.stringify({
                                    videoUrl,
                                    language: language || 'en',
                        }),
              });
              const data = await r.json();
              if (!r.ok) throw new Error(data.message || JSON.stringify(data));
              res.json(data);
      } catch (e) {
              res.status(500).json({ error: e.message });
      }
});

// Captions.ai — poll status
app.get('/api/captions/status/:jobId', async (req, res) => {
      const key = req.query.api_key || process.env.CAPTIONS_API_KEY;
      try {
              const r = await fetch(`https://api.captions.ai/api/caption/result?jobId=${req.params.jobId}`, {
                        headers: { 'x-api-key': key }
              });
              res.json(await r.json());
      } catch (e) {
              res.status(500).json({ error: e.message });
      }
});

// Keep-alive
setInterval(async () => {
      try { await fetch('https://video-tool-backend.onrender.com/api/healthz'); } catch {}
}, 60000);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
