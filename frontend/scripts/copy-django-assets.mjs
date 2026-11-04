/** Copies existing image assets from a neighboring Selena Django repository.
 * Run from anywhere with `node frontend/scripts/copy-django-assets.mjs`.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const frontend = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(frontend, '..');
const variants = [root, resolve(root, '..')];
const sources = [
  ['pages/static/img/home', 'static/img/home'],
  ['identity/static/img', 'static/img'],
  ['catalog/static/img', 'static/img'],
];
let copied = 0;
for (const [sourceRelative, destRelative] of sources) {
  const source = variants.map(r => join(r, sourceRelative)).find(existsSync);
  if (!source) {console.warn('Нет исходной папки:', sourceRelative);continue;}
  function recurse(dir, suffix='') {
    for (const entry of readdirSync(dir, {withFileTypes:true})) {
      const tail = join(suffix, entry.name);
      if (entry.isDirectory()) { recurse(join(dir,entry.name), tail);continue; }
      if (!entry.isFile()) continue;
      const destination = join(frontend, 'public', destRelative, tail);
      mkdirSync(dirname(destination), {recursive:true}); copyFileSync(join(dir, entry.name), destination); copied++;
    }
  }
  recurse(source);
}
console.log(`Скопировано ${copied} файлов. ${copied ? 'Готово.' : 'Поместите frontend/ в корень репозитория Selena.'}`);
