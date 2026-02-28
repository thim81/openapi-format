#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const runtimeExports = Object.keys(require('../openapi-format')).sort();
const dtsPath = path.join(__dirname, '..', 'types', 'openapi-format.d.ts');
const dts = fs.readFileSync(dtsPath, 'utf8');

const typeExportNames = new Set();
for (const match of dts.matchAll(/export\s+function\s+([A-Za-z0-9_]+)/g)) {
  typeExportNames.add(match[1]);
}

const typeExports = [...typeExportNames].sort();
const missingInTypes = runtimeExports.filter(name => !typeExportNames.has(name));
const extrasInTypes = typeExports.filter(name => !runtimeExports.includes(name));

if (missingInTypes.length || extrasInTypes.length) {
  console.error('Type export parity check failed.');
  if (missingInTypes.length) {
    console.error(`Missing in types: ${missingInTypes.join(', ')}`);
  }
  if (extrasInTypes.length) {
    console.error(`Missing at runtime: ${extrasInTypes.join(', ')}`);
  }
  process.exit(1);
}

console.log('Type export parity check passed.');
