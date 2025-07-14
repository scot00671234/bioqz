#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function buildProduction() {
  try {
    console.log('Building client...');
    execSync('vite build', { stdio: 'inherit' });
    
    console.log('Building server...');
    execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --define:import.meta.dirname=\'"/app"\'', { stdio: 'inherit' });
    
    console.log('Build completed successfully.');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildProduction();