import { existsSync, mkdirSync, writeFileSync, readdirSync, statSync, copyFileSync } from 'fs'
import { join, resolve } from 'path'
import { build as buildForProduction } from 'vite'

function copyDir(src: string, dest: string) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  const entries = readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

async function build() {
  const production = await buildForProduction()
  if ('output' in production) {
    const outputHtml = production.output.find(output => output.type === 'asset' && output.fileName === 'index.html') as any

    const dist = join(__dirname, 'dist')
    if (!existsSync(dist)) { mkdirSync(dist) }

    const outputFile = join(dist, 'index.html')
    outputHtml && writeFileSync(outputFile, outputHtml.source)

    const addonsDir = join(__dirname, 'addons');
    if (existsSync(addonsDir)) {
      const destAddonsDir = join(dist, 'addons');
      copyDir(addonsDir, destAddonsDir);
    }
  }
}

build()