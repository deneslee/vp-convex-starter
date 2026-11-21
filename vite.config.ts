import { oxfmt, oxlint } from 'oxc-config-mantine';
import { defineConfig } from 'vite-plus';

const baseSortImports =
  typeof oxfmt.sortImports === 'object' && oxfmt.sortImports !== null ? oxfmt.sortImports : {};
const baseGroups = baseSortImports.groups ?? [];
const packageStylesIndex = baseGroups.indexOf('package_styles');
const sortImportGroups =
  packageStylesIndex >= 0
    ? [
        ...baseGroups.slice(0, packageStylesIndex + 1),
        'blocknote_styles',
        'ui_styles',
        ...baseGroups.slice(packageStylesIndex + 1),
      ]
    : ['core_styles', 'package_styles', 'blocknote_styles', 'ui_styles', ...baseGroups];

export default defineConfig({
  staged: {
    '*': 'vp fmt --no-error-on-unmatched-pattern',
    '**/*.module.css': 'vp exec stylelint --fix --allow-empty-input',
  },

  run: {
    cache: {
      scripts: false,
      tasks: true,
    },
    tasks: {
      check: 'vp check',
      lint: 'vp lint',
      'fmt:check': 'vp fmt --check',
      stylelint:
        'vp exec stylelint "apps/**/*.css" "packages/**/*.css" --cache --allow-empty-input',
      test: 'vp test run',
      'convex:typecheck': {
        command: 'pnpm --filter @repo/backend exec convex typecheck',
        cache: {
          input: [
            'packages/backend/convex/**/*.ts',
            'packages/backend/convex/tsconfig.json',
            'packages/backend/package.json',
            '!packages/backend/convex/_generated/**',
          ],
          output: [],
        },
      },
      fallow: 'vp exec fallow --skip health',
      'env:audit': 'vp exec varlock audit --path apps/web',
      build: 'vp run -r build',
      dev: {
        command: 'vp run -r --parallel dev',
        cache: false,
      },
      'convex:dev': {
        command: 'pnpm --filter @repo/backend exec convex dev',
        cache: false,
      },
      'test:watch': {
        command: 'vp test watch',
        cache: false,
      },
    },
  },

  fmt: {
    ...oxfmt,
    proseWrap: 'preserve',
    sortPackageJson: true,
    sortImports: {
      ...baseSortImports,
      customGroups: [
        ...(baseSortImports.customGroups ?? []),
        {
          groupName: 'blocknote_styles',
          elementNamePattern: ['@blocknote/mantine/blocknoteStyles.css'],
        },
        {
          groupName: 'ui_styles',
          elementNamePattern: ['@repo/ui/styles'],
        },
      ],
      groups: sortImportGroups,
    },
    ignorePatterns: [
      ...(oxfmt.ignorePatterns ?? []),
      'pnpm-lock.yaml',
      '**/routeTree.gen.ts',
      'packages/backend/convex/_generated/**',
      'apps/web/env.d.ts',
      'dist/',
      '_refs/',
      '.agents/skills/',
      '.agents/plugins/',
      '.fallow/',
      '.vitest/',
    ],
  },

  lint: {
    ...oxlint,
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [
      ...(oxlint.jsPlugins ?? []),
      { name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' },
      { name: 'eslint-tanstack-router', specifier: '@tanstack/eslint-plugin-router' },
      { name: 'eslint-tanstack-query', specifier: '@tanstack/eslint-plugin-query' },
    ],
    rules: {
      ...(oxlint.rules ?? {}),
      'vite-plus/prefer-vite-plus-imports': 'warn',
      'eslint-tanstack-router/create-route-property-order': 'warn',
      'eslint-tanstack-query/exhaustive-deps': 'warn',
      'eslint-tanstack-query/stable-query-client': 'warn',
      'eslint-tanstack-query/no-rest-destructuring': 'warn',
      'eslint-tanstack-query/no-unstable-deps': 'warn',
      'eslint-tanstack-query/infinite-query-property-order': 'warn',
      'eslint-tanstack-query/no-void-query-fn': 'warn',
      'eslint-tanstack-query/mutation-property-order': 'warn',
    },
    overrides: [
      ...(oxlint.overrides ?? []),
      {
        files: ['packages/backend/convex/**'],
        jsPlugins: [{ name: 'convex', specifier: '@convex-dev/eslint-plugin' }],
        rules: {
          'convex/no-old-registered-function-syntax': 'error',
          'convex/require-args-validator': 'error',
          'convex/explicit-table-ids': 'error',
          'convex/no-filter-in-query': 'warn',
          'convex/no-top-of-hour-crons': 'warn',
          'convex/no-schema-import-cycle': 'error',
          'convex/no-duplicate-indexes': 'warn',
          'convex/no-process-env': 'error',
          'convex/no-collect-in-query': 'warn',
        },
      },
    ],
    ignorePatterns: [
      ...(oxlint.ignorePatterns ?? []),
      'dist/',
      '**/routeTree.gen.ts',
      'packages/backend/convex/_generated/**',
      'apps/web/env.d.ts',
      '_refs/',
      '.agents/skills/',
      '.agents/plugins/',
      '.fallow/',
      '.vitest/',
    ],
  },

  test: {
    passWithNoTests: true,
    projects: [
      {
        test: {
          name: 'domain',
          include: ['packages/domain/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'backend',
          include: ['packages/backend/convex/**/*.test.ts'],
          environment: 'edge-runtime',
        },
      },
      {
        test: {
          name: 'ui',
          include: ['packages/ui/**/*.test.{ts,tsx}'],
          environment: 'jsdom',
          setupFiles: ['./packages/ui/test-utils/vitest.setup.mjs'],
        },
      },
      {
        test: {
          name: 'web',
          include: ['apps/web/**/*.test.{ts,tsx}'],
          environment: 'jsdom',
          setupFiles: ['./packages/ui/test-utils/vitest.setup.mjs'],
        },
      },
    ],
  },
});
