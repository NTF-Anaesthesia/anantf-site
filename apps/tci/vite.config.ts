import { defineConfig, Plugin } from 'vite';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, extname, join } from 'node:path';

const site = resolve(__dirname, '../..');
// Version shown in Settings: package version + a hash of the app's own source, so a rebuild of unchanged source is
// byte-identical and CI can detect a stale tci/ build.
const srcFiles = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
  d.isDirectory() ? srcFiles(join(dir, d.name)) : [join(dir, d.name)]).sort();
const hash = createHash('sha256');
for (const f of [...srcFiles(resolve(__dirname, 'src')), resolve(__dirname, 'index.html'), resolve(__dirname, 'pump/index.html')]) hash.update(readFileSync(f));
const version = `${JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf8')).version} (${hash.digest('hex').slice(0, 8)})`;

// In dev, serve the site's shared kit and fonts (/assets, /fonts, /eeg/fonts) from the repository root, as GitHub Pages does.
const siteFiles = (): Plugin => ({
  name: 'site-files',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = (req.url ?? '').split('?')[0];
      if (!/^\/(assets\/app|fonts|eeg\/fonts)\//.test(url)) return next();
      const f = resolve(site, '.' + url);
      if (!f.startsWith(site) || !existsSync(f)) return next();
      const types: Record<string, string> = { '.css': 'text/css', '.woff2': 'font/woff2' };
      res.setHeader('Content-Type', types[extname(f)] ?? 'application/octet-stream');
      res.end(readFileSync(f));
    });
  },
});

export default defineConfig({
  base: './',
  plugins: [siteFiles()],
  define: { __APP_VERSION__: JSON.stringify(version) },
  // Multi-page: the app (tci/) and the pump emulator (tci/pump/).
  build: { outDir: resolve(site, 'tci'), emptyOutDir: true, target: 'es2020', assetsDir: 'assets',
    rollupOptions: { input: { main: resolve(__dirname, 'index.html'), pump: resolve(__dirname, 'pump/index.html') } } },
  test: { include: ['test/**/*.test.ts'] },
} as never);
