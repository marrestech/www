# Marres website guidance

## Source of truth

- Edit public copy, links, image names, and alternative text in `src/content/home/page.yaml`.
- Edit page structure in `src/pages/index.astro` only when the request changes layout or behavior.
- Update `src/content.config.ts` when the YAML structure changes.
- Edit the visual design in `src/styles/site.css` only when the request changes styling.
- Keep images in `public/images/`.

## Workflow

- Follow `README.md` for Nix installation and GitHub authentication.
- Enter `nix develop` to use the pinned tools and site commands.
- Start every change on a feature branch. Never commit or push to `main`.
- Preserve the current design unless the request explicitly changes it.
- Run `ci` before review.
- Run `preview` against the production build before review.
- Capture screenshots at 1440×1000 and 390×844.
- Open a pull request assigned to `@rrvsh`. Attach both screenshots, and include a concise summary and validation results.
- For review media, follow `.agents/skills/github-pr-media/SKILL.md`. Upload the file with the repository ID and `gh` token, then embed the returned GitHub attachment URL. Never commit review media.
- Stop after opening the pull request. Never merge it.

## Safety

- Never edit or commit `dist/`, `.astro/`, or `node_modules/`.
- Do not add client-side JavaScript unless the request requires interactive behavior.
- Do not add deployment workflows without explicit approval.
