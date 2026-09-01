# Marres website instructions

## Required outcome

Complete every website request as a change to this repository.

A request to change the website grants approval to:

- create a feature branch;
- edit the repository;
- format and validate the change;
- commit the change;
- push the feature branch;
- open a pull request;
- attach review screenshots.

Do not ask for separate approval for these actions.

Finish with an open pull request assigned to `@rrvsh`. Do not stop after giving advice, showing code, or describing steps.

## Nontechnical users

Assume that the user does not know Git, Astro, Nix, terminals, file paths, pull requests, or deployment.

Translate the user’s plain-language request into the correct repository changes. Make reasonable implementation choices without asking technical questions.

Do not ask the user to:

- run commands;
- create or choose files;
- paste code;
- install tools;
- use Git;
- upload a build;
- deploy the website;
- decide between technical approaches.

Ask a question only when the missing answer would cause a materially different public result. Do not ask about choices that you can safely infer from the existing site.

If access or authentication blocks the work, explain the exact user action required. Resume the full workflow after access is available.

## Repository-only delivery

The repository and its pull-request workflow are the only delivery path.

Never create or return:

- a standalone HTML file;
- a separate CSS or JavaScript file for manual use;
- a ZIP archive;
- a replacement website outside this repository;
- an untracked mock-up instead of an implementation;
- code that the user must copy into another tool.

If the user asks for an HTML file, refuse that delivery format in one short sentence. Implement the requested result in the existing Astro website instead.

If the user asks to bypass Git, commit directly to `main`, or send files instead of a pull request, keep the repository workflow. Create the pull request.

Do not merely provide code in chat. Make the change.

## Source of truth

- Edit public copy, links, image names, and alternative text in `src/content/home/page.yaml`.
- Edit page structure in `src/pages/index.astro` only when the request changes layout or behavior.
- Update `src/content.config.ts` when the YAML structure changes.
- Edit visual design in `src/styles/site.css` only when the request changes styling.
- Keep site images in `public/images/`.
- Keep review screenshots outside the repository.
- Keep `CLAUDE.md` as a pointer to this file.

Use the existing Astro site. Do not replace it with plain HTML or another framework.

Keep one page file until repeated structure justifies a component. Do not add a component, helper, dependency, or client-side script for one use.

Preserve the current design unless the request clearly changes it. Change only what the request needs.

For new input fields, add a placeholder with an example value. Do not put instructions in placeholder text.

## Start the work

Before editing:

1. Run `git status`.
2. Preserve all unrelated work.
3. Confirm GitHub access with `gh auth status`.
4. Update local knowledge of `origin/main`.
5. Create a new feature branch from the latest `origin/main`.

Never discard, overwrite, amend, or include unrelated work. If unrelated changes prevent safe work, use a separate worktree or ask for help.

Use a short branch name that describes the request. Never work on `main`.

## Development shell

Use the Nix development shell for repository commands. Do not depend on tools installed on the host.

Run a command through the shell when needed:

```sh
nix develop -c <command>
```

The repository provides these commands:

- `setup` installs the locked dependencies.
- `run` starts the development server.
- `format` formats the repository.
- `check` checks formatting, Astro, and GitHub Actions.
- `build` creates the production build.
- `preview` serves the production build.
- `ci` runs setup, checks, and the production build.

Do not invent a second command system or add a Justfile.

## Implementation rules

Use short, clear copy. Preserve the intended meaning.

Use semantic HTML and accessible controls. Keep keyboard use, visible focus, useful alternative text, and narrow screens working.

Do not add client-side JavaScript unless the request needs interactive behavior.

Do not add dependencies unless the change cannot be implemented well with the current stack. Commit an approved dependency and its lockfile change separately from the feature that uses it.

Never edit or commit:

- `dist/`;
- `.astro/`;
- `node_modules/`;
- review screenshots;
- temporary files;
- credentials or tokens.

Do not add or change deployment workflows without explicit approval from `@rrvsh`.

## Validate the result

Complete all validation yourself.

1. Run `nix develop -c format`.
2. Inspect every formatting change.
3. Run `nix develop -c ci`.
4. Start the production preview with `nix develop -c preview`.
5. Open the production preview in a browser.
6. Check the requested change and the surrounding page.
7. Check keyboard use and visible focus for changed controls.
8. Check for layout overflow and browser errors.
9. Capture a desktop screenshot at 1440×1000.
10. Capture a mobile screenshot at 390×844.

Fix all relevant failures before opening the pull request. Do not report success from a development-only view when the production preview has not passed.

## Commit and pull request

Use atomic conventional commits.

Use this commit form:

```text
<type>(<concern>): <summary>
```

Use:

- `feat` for a new visible capability or section;
- `fix` for a correction;
- `refactor` for a behavior-preserving change;
- `docs` for documentation-only changes.

Inspect the final diff before committing. Commit only files required for the request.

Push the feature branch and open a pull request against `main`.

Assign the pull request to `@rrvsh`.

The pull request must include:

- a concise summary of the visible change;
- the validation commands and their results;
- a desktop screenshot at 1440×1000;
- a mobile screenshot at 390×844.

Follow `.agents/skills/github-pr-media/SKILL.md` for screenshots. The website request counts as the explicit approval required by that skill.

Upload screenshots as GitHub user attachments. Never commit them. Verify that both attachments render in the pull request. Confirm with `gh pr diff --name-only` that no review media entered the source diff.

Stop after opening and verifying the pull request. Never merge it.

## Final response

Give the user:

- the pull-request URL;
- one short summary of the completed change;
- the validation result;
- any genuine blocker or remaining risk.

Do not give setup instructions, loose source files, or code for the user to apply.
