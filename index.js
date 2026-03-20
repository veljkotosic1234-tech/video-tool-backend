process.on('uncaughtException', err => { console.error('UNCAUGHT:', err); });
const express = require('express');
const cors = require('cors');
const path = require('path');
const { google } = require('googleapis');
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/api/healthz', (req, res) => res.json({ status: 'ok' }));
async function getDriveClient() {
            const json = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
            const auth = new google.auth.GoogleAuth({ credentials: json, scopes: ['https://www.googleapis.com/auth/drive.readonly'] });
            return google.drive({ version: 'v3', auth });
}
app.get('/api/drive/files', async (req, res) => {
            const { folderId } = req.query;
            if (!folderId) return res.status(400).json({ error: 'folderId is required' });
            try {
                          const drive = await getDriveClient();
                          const response = await drive.files.list({ q: "'" + folderId + "' in parents and trashed=false", fields: 'files(id,name,mimeType,size,modifiedTime)', pageSize: 100 });
                          res.json({ files: response.data.files });
            } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get('/api/drive/file/:fileId', async (req, res) => {
            try {
                          const drive = await getDriveClient();
                          const meta = await drive.files.get({ fileId: req.params.fileId, fields: 'name,mimeType,size' });
                          const name = meta.data.name || '';
                          const ext = name.split('.').pop().toLowerCase();
                          let contentType = meta.data.mimeType;
                          if (['mov', 'avi', 'mkv'].includes(ext)) { contentType = 'video/mp4'; }
                          res.set('Content-Type', contentType);
                          res.set('Content-Disposition', 'inline; filename="' + name + '"');
                          res.set('Accept-Ranges', 'bytes');
                          res.set('Cache-Control', 'public, max-age=3600');
                          const stream = await drive.files.get({ fileId: req.params.fileId, alt: 'media' }, { responseType: 'stream' });
                          stream.data.pipe(res);
            } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/runway/generate', async (req, res) => {
            const { promptImage, promptText, duration, ratio, model, api_key } = req.body;
            if (!promptImage) return res.status(400).json({ error: 'promptImage is required' });
            const key = api_key || process.env.RUNWAY_API_KEY;
            if (!key) return res.status(400).json({ error: 'Runway API key is missing' });
            try {
                          let finalImage = promptImage;
                          if (promptImage.startsWith('http')) {
                                          const imgRes = await fetch(promptImage);
                                          if (!imgRes.ok) throw new Error('Ne mogu preuzeti sliku: HTTP ' + imgRes.status);
                                          const ct = imgRes.headers.get('content-type') || 'image/jpeg';
                                          const ab = await imgRes.arrayBuffer();
                                          finalImage = 'data:' + ct + ';base64,' + Buffer.from(ab).toString('base64');
                          }
                          const r = await fetch('https://api.dev.runwayml.com/v1/image_to_video', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key, 'X-Runway-Version': '2024-11-06' },
                                          body: JSON.stringify({ model: model || 'gen4_turbo', promptImage: finalImage, promptText, duration: duration || 10, ratio: ratio || '1280:768' }),
                          });
                          const data = await r.json();
                          if (!r.ok) throw new Error(data.message || JSON.stringify(data));
                          res.json(data);
            } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get('/api/runway/status/:taskId', async (req, res) => {
            const key = req.query.api_key || process.env.RUNWAY_API_KEY;
            try {
                          const r = await fetch('https://api.dev.runwayml.com/v1/tasks/' + req.params.taskId, { headers: { 'Authorization': 'Bearer ' + key, 'X-Runway-Version': '2024-11-06' } });
                          res.json(await r.json());
            } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/captions/generate', async (req, res) => {
            const { videoUrl, api_key, language } = req.body;
            if (!videoUrl) return res.status(400).json({ error: 'videoUrl is required' });
            const key = api_key || process.env.CAPTIONS_API_KEY;
            if (!key) return res.status(400).json({ error: 'Captions API key is missing' });
            try {
                          const r = await fetch('https://api.captions.ai/api/caption/create', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': key }, body: JSON.stringify({ videoUrl, language: language || 'en' }) });
                          const data = await r.json();
                          if (!r.ok) throw new Error(data.message || JSON.stringify(data));
                          res.json(data);
            } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get('/api/captions/status/:jobId', async (req, res) => {
            const key = req.query.api_key || process.env.CAPTIONS_API_KEY;
            try {
                          const r = await fetch('https://api.captions.ai/api/caption/result?jobId=' + req.params.jobId, { headers: { 'x-api-key': key } });
                          res.json(await r.json());
            } catch (e) { res.status(500).json({ error: e.message }); }
});
// Ping svakih 25 sekundi da server ne zaspi (Render free plan gasi nakon 50s neaktivnosti)
setInterval(async () => { try { await fetch('https://video-tool-backend.onrender.com/api/healthz'); } catch {} }, 25000);
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log('Server running on port ' + PORT));process.on('uncaughtException', err => { console.error('UNCAUGHT:', err); });
const express = require('express');
const cors = require('cors');
const path = require('path');
const { google } = require('googleapis');
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/api/healthz', (req, res) => res.json({ status: 'ok' }));
async function getDriveClient() {
          const json = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
          const auth = new google.auth.GoogleAuth({ credentials: json, scopes: ['https://www.googleapis.com/auth/drive.readonly'] });
          return google.drive({ version: 'v3', auth });
}
app.get('/api/drive/files', async (req, res) => {
          const { folderId } = req.query;
          if (!folderId) return res.status(400).json({ error: 'folderId is required' });
          try {
                      const drive = await getDriveClient();
                      const response = await drive.files.list({ q: "'" + folderId + "' in parents and trashed=false", fields: 'files(id,name,mimeType,size,modifiedTime)', pageSize: 100 });
                      res.json({ files: response.data.files });
          } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get('/api/drive/file/:fileId', async (req, res) => {
          try {
                      const drive = await getDriveClient();
                      const meta = await drive.files.get({ fileId: req.params.fileId, fields: 'name,mimeType,size' });
                      const name = meta.data.name || '';
                      const ext = name.split('.').pop().toLowerCase();
                      let contentType = meta.data.mimeType;
                      if (['mov', 'avi', 'mkv'].includes(ext)) { contentType = 'video/mp4'; }
                      res.set('Content-Type', contentType);
                      res.set('Content-Disposition', 'inline; filename="' + name + '"');
                      res.set('Accept-Ranges', 'bytes');
                      res.set('Cache-Control', 'public, max-age=3600');
                      const stream = await drive.files.get({ fileId: req.params.fileId, alt: 'media' }, { responseType: 'stream' });
                      stream.data.pipe(res);
          } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/runway/generate', async (req, res) => {
          const { promptImage, promptText, duration, ratio, model, api_key } = req.body;
          if (!promptImage) return res.status(400).json({ error: 'promptImage is required' });
          const key = api_key || process.env.RUNWAY_API_KEY;
          if (!key) return res.status(400).json({ error: 'Runway API key is missing' });
          try {
                      let finalImage = promptImage;
                      if (promptImage.startsWith('http')) {
                                    const imgRes = await fetch(promptImage);
                                    if (!imgRes.ok) throw new Error('Ne mogu preuzeti sliku: HTTP ' + imgRes.status);
                                    const ct = imgRes.headers.get('content-type') || 'image/jpeg';
                                    const ab = await imgRes.arrayBuffer();
                                    finalImage = 'data:' + ct + ';base64,' + Buffer.from(ab).toString('base64');
                      }
                      const r = await fetch('https://api.dev.runwayml.com/v1/image_to_video', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key, 'X-Runway-Version': '2024-11-06' },
                                    body: JSON.stringify({ model: model || 'gen4_turbo', promptImage: finalImage, promptText, duration: duration || 10, ratio: ratio || '1280:768' }),
                      });
                      const data = await r.json();
                      if (!r.ok) throw new Error(data.message || JSON.stringify(data));
                      res.json(data);
          } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get('/api/runway/status/:taskId', async (req, res) => {
          const key = req.query.api_key || process.env.RUNWAY_API_KEY;
          try {
                      const r = await fetch('https://api.dev.runwayml.com/v1/tasks/' + req.params.taskId, { headers: { 'Authorization': 'Bearer ' + key, 'X-Runway-Version': '2024-11-06' } });
                      res.json(await r.json());
          } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/captions/generate', async (req, res) => {
          const { videoUrl, api_key, language } = req.body;
          if (!videoUrl) return res.status(400).json({ error: 'videoUrl is required' });
          const key = api_key || process.env.CAPTIONS_API_KEY;
          if (!key) return res.status(400).json({ error: 'Captions API key is missing' });
          try {
                      const r = await fetch('https://api.captions.ai/api/caption/create', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': key }, body: JSON.stringify({ videoUrl, language: language || 'en' }) });
                      const data = await r.json();
                      if (!r.ok) throw new Error(data.message || JSON.stringify(data));
                      res.json(data);
          } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get('/api/captions/status/:jobId', async (req, res) => {
          const key = req.query.api_key || process.env.CAPTIONS_API_KEY;
          try {
                      const r = await fetch('https://api.captions.ai/api/caption/result?jobId=' + req.params.jobId, { headers: { 'x-api-key': key } });
                      res.json(await r.json());
          } catch (e) { res.status(500).json({ error: e.message }); }
});
setInterval(async () => { try { await fetch('https://video-tool-backend.onrender.com/api/healthz'); } catch {} }, 60000);
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log('Server running on port ' + PORT));
