const { execFileSync } = require('node:child_process');
const { mkdirSync, writeFileSync, rmSync } = require('node:fs');
try {
  execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', 'src/core/MusicScore.ts', 'src/core/ScoreImport.ts', '--outDir', '.test-build', '--module', 'commonjs', '--target', 'ES2020', '--strict', '--skipLibCheck'], { stdio: 'inherit' });
  mkdirSync('.test-build', { recursive: true });
  writeFileSync('.test-build/package.json', '{"type":"commonjs"}');
  execFileSync(process.execPath, ['--test', 'tests/score.test.cjs'], { stdio: 'inherit' });
} finally { rmSync('.test-build', { recursive: true, force: true }); }
