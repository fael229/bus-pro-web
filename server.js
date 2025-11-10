import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

// Vérifier que dist existe
console.log('Current directory:', __dirname);
console.log('Dist path:', distPath);
console.log('Dist exists:', existsSync(distPath));
console.log('Index.html exists:', existsSync(indexPath));

// Logger les requêtes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Servir les fichiers statiques avec headers corrects
app.use(express.static(distPath, {
  maxAge: '1d',
  etag: true,
  lastModified: true,
  index: false // Ne pas servir index.html automatiquement
}));

// Fallback pour toutes les routes (SPA)
app.get('*', (req, res) => {
  console.log(`Serving index.html for: ${req.url}`);
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send(`
      <h1>Error: Build files not found</h1>
      <p>Current directory: ${__dirname}</p>
      <p>Looking for: ${indexPath}</p>
      <p>Exists: ${existsSync(indexPath)}</p>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving static files from: ${distPath}`);
});
