import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type Fix = {
  file: string;
  description: string;
  apply: (input: string) => string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const fixes: Fix[] = [
  {
    file: path.join(projectRoot, 'src/api/generated/services/PixelService.ts'),
    description:
      'Fix duplicate "origin" parameter emitted by openapi-typescript-codegen (header Origin + query origin).',
    apply: (input) => {
      if (!input.includes('public static bootstrapPixelApiV1PixelBootstrapGet(')) return input;

      // Only patch if the duplicated signature is present.
      const hasDup =
        input.includes('origin?: (string | null),\n        env?: (string | null),\n        origin?: (string | null),');
      if (!hasDup) return input;

      return input
        .replace(
          /(\s*public static bootstrapPixelApiV1PixelBootstrapGet\(\n\s*origin\?: \(string \| null\),\n\s*env\?: \(string \| null\),\n)\s*origin\?: \(string \| null\),/m,
          `$1        originQuery?: (string | null),`
        )
        .replace(/'origin': origin,\n(\s*)'env': env,/m, `'origin': originQuery,\n$1'env': env,`)
        .replace(/(\*\s*@param\s+)origin(\s*)\n(\*\s*@param\s+)referer/m, `$1origin$2\n$3originQuery\n$4referer`);
    },
  },
];

let changed = 0;
for (const fix of fixes) {
  if (!fs.existsSync(fix.file)) continue;
  const before = fs.readFileSync(fix.file, 'utf8');
  const after = fix.apply(before);
  if (after !== before) {
    fs.writeFileSync(fix.file, after, 'utf8');
    changed += 1;
    // eslint-disable-next-line no-console
    console.log(`postgen: patched ${path.relative(projectRoot, fix.file)} (${fix.description})`);
  }
}

if (changed === 0) {
  // eslint-disable-next-line no-console
  console.log('postgen: no patches applied');
}

