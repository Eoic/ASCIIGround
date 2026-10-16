import process from 'node:process';
import { verifyDocsRelease, verifyNpmRelease, waitForPublication } from './release/publication-checks.mjs';

const checks = {
    npm: verifyNpmRelease,
    package: version => verifyNpmRelease(version, { requireTag: false }),
    docs: verifyDocsRelease,
};
const [target, version] = process.argv.slice(2);
const check = checks[target];

if (!check || !/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version ?? ''))
    throw new Error('Usage: node scripts/verify-release.mjs <npm|package|docs> <version>');

await waitForPublication(() => check(version));
