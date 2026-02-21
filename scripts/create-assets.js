const fs = require('fs');
const path = require('path');
// Minimal 1x1 transparent PNG (68 bytes)
const minimalPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);
const assetsDir = path.join(__dirname, '..', 'assets');
[ 'icon.png', 'splash-icon.png', 'adaptive-icon.png' ].forEach(name => {
  fs.writeFileSync(path.join(assetsDir, name), minimalPng);
});
