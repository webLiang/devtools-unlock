---
name: /github-release
id: github-release
category: Release
description: Pack ZIP, commit, tag, push, and create GitHub Release (webLiang/devtools-unlock)
---

Publish a GitHub Release: https://github.com/webLiang/devtools-unlock/releases

**Script**: `scripts/github-release.mjs`  
**One-shot command**: `pnpm release:github:full` (= zip → notes → commit → tag → gh release → push)  
**Version**: root `package.json` `version` **and** `extension/manifest.json` `version` (must match and be bumped; `v<version>` must not already exist on GitHub)

---

## Pre-flight checks

1. Bump `package.json` **and** `extension/manifest.json` version above the latest tag (`git tag -l 'v*' --sort=-v:refname | head -1`).
2. GitHub CLI installed and authenticated: `gh auth status`  
   - Install (macOS): `brew install gh` then `gh auth login`
3. On the branch you intend to push (usually `main` / `master`).
4. `origin` points at `webLiang/devtools-unlock`.

---

## Modes

### A. Full release (recommended)

User invokes:

```
/github-release full
```

Agent runs immediately (no dry-run gate unless the user asks for preview first):

```bash
pnpm release:github:full
```

Equivalent to:

```bash
node scripts/github-release.mjs --full
```

**Pipeline (automatic, in order):**

1. `pnpm zip` → `releases/devtools-unlock_v<version>.zip`
2. Generate `releases/RELEASE_NOTES_v<version>.md` from git log + locale/theme mapping (see **Release notes format** below)
3. `git add -A && git commit -m "chore: release v<version>"` (skip if tree already clean)
4. Create annotated tag `v<version>`
5. `gh release create` with `.zip` + release notes
6. `git push origin <current-branch>` + `git push origin v<version>`

Requires `gh` CLI, `git_write`, and network permissions.

### B. Dry run only (preview)

```
/github-release dry-run
```

```bash
pnpm release:github:dry
```

Packs the zip and prints release notes. **No** commit, tag, release, or push.

Show the notes summary to the user. If they confirm, run mode A (`/github-release full`).

---

## Release notes format

Auto-generated notes in `releases/RELEASE_NOTES_v<version>.md` follow this structure:

### Changes (detailed)

Full commit list since the previous tag:

- Subject line with short hash
- Commit body lines indented underneath (when present)
- Release chore commits (`chore: release v…`) are excluded

### Release highlights (bilingual)

User-facing summaries in **English** and **简体中文**.

These describe **what changed for users**, not raw i18n key diffs. The script maps:

- Changed `extension/_locales` keys → themes (`THEME_HIGHLIGHTS` in `scripts/github-release.mjs`)
- Commit subject/body keywords → the same themes (`COMMIT_THEME_RULES`)

When adding major features, extend `THEME_HIGHLIGHTS`, `KEY_TO_THEME`, and `COMMIT_THEME_RULES` in the script so bilingual sections stay accurate.

### Install

Link to GitHub Releases and `.zip` download / load-unpacked instructions.

---

## Optional flags (script)

| Flag | Description |
|------|-------------|
| `--full` | `--publish --commit --push` |
| `--commit` | Commit before tagging |
| `--push` | Push branch + tag after `gh release create` |
| `--body-file <path>` | Full release body (skip auto-generation) |
| `--notes-file <path>` | Append to auto-generated notes |
| `--commit-message <msg>` | Custom commit message |
| `--title "v1.2.0"` | Override GitHub release title |
| `--asset <path>` | Extra attachment (repeatable) |
| `--skip-build` | Skip `pnpm zip` |

Examples:

```bash
node scripts/github-release.mjs --full --commit-message "chore: release v1.0.0"
node scripts/github-release.mjs --publish --commit --push --notes-file ./docs/extra.md
```

---

## Agent behavior

| User says | Agent runs |
|-----------|------------|
| `/github-release full` | `pnpm release:github:full` directly (warn if version ≤ latest tag) |
| `/github-release` | Dry run first → show notes → wait for **confirm release** → `--full` on confirm |
| `/github-release dry-run` | `pnpm release:github:dry` only |

After a successful full release, report:

- Version and tag
- GitHub Release URL
- Commit message used

---

## Do not

- **Do not** republish an existing GitHub Release for the same tag without bumping version.
- **Do not** use `--full` if `package.json` / `manifest.json` version was not bumped.
- If `gh release create` fails, fix and retry; delete local tag with `git tag -d vX.Y.Z` if needed.
