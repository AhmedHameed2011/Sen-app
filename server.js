const http = require('http');
const admin = require('firebase-admin');
const url = require('url');
const { StringDecoder } = require('string_decoder');

// Initialize Firebase Admin (service account JSON must be placed at ./firebase/serviceAccountKey.json)
try {
  const serviceAccount = require('./firebase/serviceAccountKey.json');
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  console.log('✅ Firebase Admin initialized');
} catch (e) {
  console.warn('⚠️ Firebase Admin not initialized – ensure serviceAccountKey.json exists');
}

// Helper to parse JSON body
function parseJsonBody(req, callback) {
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', (data) => {
    buffer += decoder.write(data);
  });
  req.on('end', () => {
    buffer += decoder.end();
    try {
      const parsed = buffer ? JSON.parse(buffer) : {};
      callback(null, parsed);
    } catch (err) {
      callback(err);
    }
  });
}

// Simple API router for POST endpoints
function handleApi(req, res, pathname) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }
  parseJsonBody(req, (err, data) => {
    if (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
      return;
    }
    const db = admin.firestore();
    if (pathname === '/api/link-parent') {
      // Expected: { studentId, parentId }
      const { studentId, parentId } = data;
      if (!studentId || !parentId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing studentId or parentId' }));
        return;
      }
      db.collection('students').doc(studentId).set({ parentId }, { merge: true })
        .then(() => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'linked' }));
        })
        .catch((e) => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        });
    } else if (pathname === '/api/presence') {
      // Expected: { studentId }
      const { studentId } = data;
      if (!studentId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing studentId' }));
        return;
      }
      const studentRef = db.collection('students').doc(studentId);
      studentRef.get().then(doc => {
        const studentData = doc.exists ? doc.data() : {};
        const timestamp = admin.firestore.FieldValue.serverTimestamp();
        // Save presence log
        db.collection('presence').add({ studentId, timestamp })
          .catch(()=>{});
        // Notify parent if registered
        if (studentData.parentId) {
          db.collection('students').doc(studentId).get().then(stud => {
            const tokens = stud.data()?.parentTokens || [];
            if (tokens.length) {
              const message = {
                notification: {
                  title: 'Student Activity',
                  body: `${studentId} is now active`,
                },
                tokens,
              };
              admin.messaging().sendMulticast(message).catch(()=>{});
            }
          });
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'recorded' }));
      }).catch(e => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      });
    } else if (pathname === '/api/register-parent-token') {
      // Expected: { studentId, parentId, token }
      const { studentId, parentId, token } = data;
      if (!studentId || !parentId || !token) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing fields' }));
        return;
      }
      const studentRef = db.collection('students').doc(studentId);
      studentRef.set({ parentId }, { merge: true })
        .then(() => studentRef.update({ parentTokens: admin.firestore.FieldValue.arrayUnion(token) }))
        .then(() => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'token registered' }));
        })
        .catch(e => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        });
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'API not found' }));
    }
  });
}

const fs = require('fs');
const path = require('path');

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3300;
const PUBLIC_DIR = fs.existsSync(path.join(__dirname, 'public'))
  ? path.resolve(__dirname, 'public')
  : path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg'
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');

  // 1. Strip query/hash, decode safely
  const rawPath = req.url.split('?')[0].split('#')[0];
  let decoded;
  try {
    decoded = decodeURIComponent(rawPath);
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('400 Bad Request');
    return;
  }

  // 2. Reject null bytes
  if (decoded.includes('\0')) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('400 Bad Request');
    return;
  }

  // 3. Root -> index.html
  if (decoded === '/' || decoded === '\\' || decoded === '') {
    decoded = '/index.html';
  }

  // 4. Resolve and verify path is inside PUBLIC_DIR
  // Check for API routes first
  const parsedUrl = url.parse(req.url, true);
  if (parsedUrl.pathname.startsWith('/api/')) {
    handleApi(req, res, parsedUrl.pathname);
    return;
  }



  const filePath = path.resolve(PUBLIC_DIR, '.' + path.sep + decoded.replace(/^[\/\\]+/, ''));
  const rel = path.relative(PUBLIC_DIR, filePath);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

let currentPort = DEFAULT_PORT;

function tryListen() {
  server.listen(currentPort, () => {
    console.log(`Sanad App is running at http://localhost:${currentPort}`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${currentPort} in use, trying ${currentPort + 1}...`);
    currentPort++;
    setTimeout(tryListen, 200);
  } else {
    console.error('Server error:', err);
  }
});

tryListen();