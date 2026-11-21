// fallow-ignore-file unused-file
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { describe, it } from 'node:test';
import { existsInRepo, repoPath, sha256File, walkFiles } from '../helpers/workspace.ts';

describe('Tier 1 — F14 Directory Preservation', () => {
  it('T1-F14-01: .agents/plugins/mantine/plugin.json exists and matches original SHA256', () => {
    const filePath = repoPath('.agents', 'plugins', 'mantine', 'plugin.json');
    assert.ok(existsInRepo('.agents', 'plugins', 'mantine', 'plugin.json'));
    assert.equal(
      sha256File(filePath),
      '63C4DCA3CE9EABF7E9FC42411F7C48F91FDCB18D426616A1CC5EFD5BCB0CE84A'
    );
  });

  it('T1-F14-02: .agents/plugins/mantine/mcp_config.json exists, matches SHA256, and contains no extra files', () => {
    const pluginDir = repoPath('.agents', 'plugins', 'mantine');
    const mcpPath = repoPath('.agents', 'plugins', 'mantine', 'mcp_config.json');
    assert.ok(existsInRepo('.agents', 'plugins', 'mantine', 'mcp_config.json'));
    assert.equal(
      sha256File(mcpPath),
      'EE0B2F32F304FADA835A7F7979FE532AC4B2916CE49B3A54CC29DFAECFBD51BE'
    );
    const entries = readdirSync(pluginDir).sort((a, b) => a.localeCompare(b));
    assert.deepEqual(entries, ['mcp_config.json', 'plugin.json']);
  });

  it('T1-F14-03: _refs/ retains all 5 reference subdirectories and key marker files', () => {
    const expectedMarkers: readonly string[] = [
      '_refs/convex-ref/skills-lock.json',
      '_refs/cove-monorepo/.fallowrc.jsonc',
      '_refs/paper-upper/pnpm-workspace.yaml',
      '_refs/tanstack-spa/vite.config.ts',
      '_refs/vite-template/.stylelintrc.json',
    ];
    for (const marker of expectedMarkers) {
      assert.ok(existsInRepo(marker), `Expected preserved marker missing: ${marker}`);
    }
  });

  it('T1-F14-04: working directory contains zero .agents/teamwork/ folder', () => {
    assert.equal(existsInRepo('.agents', 'teamwork'), false);
  });

  it('T1-F14-05: _refs/convex-ref/.agents/skills/ preserves all 33 original skill directories and mantine plugin has no stray code', () => {
    const skillsDir = repoPath('_refs', 'convex-ref', '.agents', 'skills');
    const skillDirs = readdirSync(skillsDir, { withFileTypes: true }).filter((d) =>
      d.isDirectory()
    );
    assert.equal(skillDirs.length, 33);

    const pluginFiles = walkFiles(repoPath('.agents', 'plugins', 'mantine'));
    const strayFiles = pluginFiles.filter(
      (file) => file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.tmp')
    );
    assert.deepEqual(strayFiles, []);
  });
});
