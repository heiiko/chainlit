const pnpm = 'corepack pnpm';
const pnpmExec = `${pnpm} exec`;

module.exports = {
  // Prettier: globs only — skip nested `.(cursor|claude)/**` and symlink names (see `.shared/`).
  '!(.(cursor|claude))/**': [`${pnpmExec} prettier --write --ignore-unknown`],
  '.(cursor|claude)/!(agents|commands|rules|skills)': [
    `${pnpmExec} prettier --write --ignore-unknown`
  ],

  '**/*.{ts,tsx,js,cjs,mjs}': [`${pnpmExec} eslint --fix`],

  'frontend/**/*.{ts,tsx}': [() => `${pnpm} --filter @chainlit/app type-check`],

  'libs/react-client/**/*.{ts,tsx}': [
    () => `${pnpm} --filter @chainlit/react-client type-check`
  ],

  // TODO: Re-enable copilot type-check after fixing cross-project path alias mismatch.
  // See docs/research/copilot-type-checking.md for analysis and proposed solutions.
  // 'libs/copilot/**/*.{ts,tsx}': [
  //   () => `${pnpm} --filter @chainlit/copilot type-check`
  // ],

  'backend/**/*.py': [
    'uv run scripts/lint.py --fix',
    'uv run scripts/format.py',
    () => 'uv run scripts/type_check.py'
  ],

  '.github/workflows/**': ['uv run actionlint']
};
