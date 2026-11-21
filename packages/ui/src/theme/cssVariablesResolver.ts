import type { CSSVariablesResolver } from '@mantine/core';

/**
 * Bridges Mantine's core surface/text/border variables to our semantic tokens
 * declared in `packages/ui/src/styles/semantic.css` without duplicating definitions.
 */
export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {
    '--mantine-color-body': 'var(--surface-canvas)',
    '--mantine-color-text': 'var(--text-primary)',
    '--mantine-color-dimmed': 'var(--text-muted)',
    '--mantine-color-default-border': 'var(--border-default)',
  },
  light: {},
  dark: {},
});
