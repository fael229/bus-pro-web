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

// Servir les fichiers statiques
app.use(express.static(distPath));

// Fallback pour toutes les routes (SPA)
app.get('*', (req, res) => {
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Index.html not found. Please run build first.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving static files from: ${distPath}`);
});
