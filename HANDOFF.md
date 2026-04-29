# Pasting this into Claude Code

The fastest path to getting your local Claude (Claude Code, Cursor, etc.) to implement this design system.

---

## Option 1 — Drop the whole folder in (recommended)

1. Download the `implementation/` folder from this project (use the download icon, or copy each file individually).
2. Drop it into your `referaus-app` repo at the root, alongside `src/`.
3. Open Claude Code in that repo.
4. Paste this prompt:

```
I've added an `implementation/` folder with a design system spec.
Read `implementation/CLAUDE_CODE_BRIEF.md` first — it contains the full plan.
Then execute Steps 1–4 in order:
1. Replace tailwind.config.ts and src/app/globals.css with the versions in implementation/.
2. (Optional) switch to next/font as described in Step 2.
3. Run the find-and-replace migration in Step 3 across src/.
4. Migrate pages in the order listed in Step 4 — start with the Footer.

After each page migration, run `npm run build` and report any errors.
Don't change any logic — only className strings and JSX layout. Keep all functionality, API calls, auth, modals intact.
```

That's it. Claude Code will work through it.

---

## Option 2 — One page at a time

If you'd rather steer it manually, paste this for each page you want migrated:

```
Apply the ReferAus design system (see implementation/CLAUDE_CODE_BRIEF.md) to <FILE_PATH>.

Rules:
- Replace text-gray-* with text-ink-*, border-gray-* with border-line-*, bg-gray-* with bg-surface-*
- Replace inline button styles with .btn-primary / .btn-secondary classes
- Replace inline pill/badge styles with .pill-verified / .pill-success / .pill-pending / .pill-neutral
- Replace inline form input styles with .input / .label
- Use text-h1 / text-h2 / text-h3 / text-body / eyebrow instead of arbitrary text sizes
- Don't change any logic, API calls, state, or functionality
- Run npm run build after to verify no errors
```

---

## Option 3 — Just the tokens, no migration

If you only want the foundation and will style new code yourself:

```
Copy implementation/tailwind.config.ts to ./tailwind.config.ts (replace existing).
Copy implementation/globals.css to ./src/app/globals.css (replace existing).
Restart dev server.
That's all — I'll use the new tokens (.btn-primary, .pill-verified, text-ink-700, etc.) myself going forward.
```

---

## What Claude Code will need access to

- Read/write everything in `src/`
- Read `implementation/` (don't let it modify these — they're the spec)
- Run `npm run build` and `npm run dev`

---

## Common gotchas

**"Tailwind class not found"** → Restart the dev server. Config changes don't hot-reload.

**"text-h1 doesn't exist"** → The new font sizes (`text-h1`, `text-h2`, etc.) are defined in `tailwind.config.ts` under `theme.extend.fontSize`. Make sure that file was actually replaced.

**"pill-verified is undefined"** → That's an `@layer components` class in `globals.css`. Make sure the new globals.css is loaded (check the `@tailwind components` line is present).

**Buttons look wrong size** → `.btn-primary` sets `min-height: 44px` (accessibility). If you need a smaller button, override with inline style or use a different class.

**Existing styles broke** → The new config *extends* the default theme, it doesn't replace it. If something broke, you probably had an inline override that's now conflicting. Search the file for hardcoded hex values like `#f97316` and replace with the token.
