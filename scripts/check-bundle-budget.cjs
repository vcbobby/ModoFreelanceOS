const fs = require('fs');
const path = require('path');

const MB = (value) => Math.round(value * 1024 * 1024);
const KB = (value) => Math.round(value * 1024);

const defaultBudgets = [
  { name: 'app', pattern: /^assets\/App-.*\.(js|mjs)$/i, maxBytes: MB(0.3) },
  { name: 'react-vendor', pattern: /^assets\/react-vendor-.*\.(js|mjs)$/i, maxBytes: MB(2.1) },
  { name: 'firebase', pattern: /^assets\/firebase-.*\.(js|mjs)$/i, maxBytes: MB(2.0) },
  { name: 'pdf-export', pattern: /^assets\/pdf-export-.*\.(js|mjs)$/i, maxBytes: MB(2.8) },
  { name: 'pdfjs', pattern: /^assets\/pdfjs-.*\.(js|mjs)$/i, maxBytes: MB(1.1) },
  { name: 'gen-ai', pattern: /^assets\/gen-ai-.*\.(js|mjs)$/i, maxBytes: MB(0.15) },
];

const reportPath = process.env.BUNDLE_REPORT_PATH || 'bundle-report.html';
const resolvedPath = path.resolve(process.cwd(), reportPath);

if (!fs.existsSync(resolvedPath)) {
  console.error(`Bundle report not found: ${resolvedPath}`);
  process.exit(1);
}

const html = fs.readFileSync(resolvedPath, 'utf8');
const marker = 'const data = ';
const start = html.indexOf(marker);
if (start < 0) {
  console.error('Bundle report data marker not found.');
  process.exit(1);
}

const end = html.indexOf(';' + '\n', start);
if (end < 0) {
  console.error('Bundle report data end marker not found.');
  process.exit(1);
}

const data = JSON.parse(html.slice(start + marker.length, end));
const parts = data.nodeParts || {};
const metas = data.nodeMetas || {};

const bundleTotals = {};
const bundleGzipTotals = {};
const bundleBrotliTotals = {};

for (const metaUid of Object.keys(metas)) {
  const meta = metas[metaUid];
  const moduleParts = meta.moduleParts || {};

  for (const bundleName of Object.keys(moduleParts)) {
    const partUid = moduleParts[bundleName];
    const part = parts[partUid];
    const rendered = part ? part.renderedLength || 0 : 0;
    const gzip = part ? part.gzipLength || 0 : 0;
    const brotli = part ? part.brotliLength || 0 : 0;

    bundleTotals[bundleName] = (bundleTotals[bundleName] || 0) + rendered;
    bundleGzipTotals[bundleName] = (bundleGzipTotals[bundleName] || 0) + gzip;
    bundleBrotliTotals[bundleName] = (bundleBrotliTotals[bundleName] || 0) + brotli;
  }
}

const formatBytes = (value) => `${(value / 1024 / 1024).toFixed(2)} MB`;
const results = [];
let hasFailure = false;

for (const budget of defaultBudgets) {
  const matching = Object.keys(bundleTotals).filter((name) => budget.pattern.test(name));
  if (!matching.length) {
    results.push({
      name: budget.name,
      status: 'missing',
      rendered: 0,
      gzip: 0,
      brotli: 0,
      maxBytes: budget.maxBytes,
    });
    continue;
  }

  const rendered = matching.reduce((sum, name) => sum + (bundleTotals[name] || 0), 0);
  const gzip = matching.reduce((sum, name) => sum + (bundleGzipTotals[name] || 0), 0);
  const brotli = matching.reduce((sum, name) => sum + (bundleBrotliTotals[name] || 0), 0);
  const status = rendered > budget.maxBytes ? 'over' : 'ok';

  if (status === 'over') {
    hasFailure = true;
  }

  results.push({
    name: budget.name,
    status,
    rendered,
    gzip,
    brotli,
    maxBytes: budget.maxBytes,
  });
}

console.log('Bundle budget report (rendered size):');
for (const result of results) {
  if (result.status === 'missing') {
    console.log(`${result.name}: missing (budget ${formatBytes(result.maxBytes)})`);
    continue;
  }

  console.log(
    `${result.name}: ${formatBytes(result.rendered)} (budget ${formatBytes(result.maxBytes)})` +
      ` | gzip ${formatBytes(result.gzip)} | brotli ${formatBytes(result.brotli)}`
  );
}

if (hasFailure) {
  console.error('\nOne or more bundles exceeded the budget.');
  process.exit(1);
}

console.log('\nAll bundle budgets are within limits.');
