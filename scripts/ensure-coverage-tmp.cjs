const fs = require('fs');
const path = require('path');

const tmpDir = path.resolve(process.cwd(), 'coverage', '.tmp');
fs.mkdirSync(tmpDir, { recursive: true });
