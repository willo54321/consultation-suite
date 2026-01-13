import * as esbuild from 'esbuild';
import { existsSync, mkdirSync } from 'fs';

const buildDir = './build';

// Create build directory
if (!existsSync(buildDir)) {
  mkdirSync(buildDir, { recursive: true });
}

const buildOptions = {
  entryPoints: ['src/widget.js'],
  bundle: true,
  minify: true,
  sourcemap: true,
  format: 'iife',
  target: ['es2018'],
  outfile: 'build/widget.js',
};

const isWatch = process.argv.includes('--watch');

if (isWatch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await esbuild.build(buildOptions);
  console.log('Build complete: build/widget.js');
}
