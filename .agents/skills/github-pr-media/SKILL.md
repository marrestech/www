---
name: github-pr-media
description: Uploads screenshots, images, videos, and other review media to GitHub pull requests without committing the files. Use when a PR body or comment must show local media as a GitHub attachment.
compatibility: Requires GitHub CLI authentication, curl, repository access, and an authenticated GitHub web fallback.
---

# GitHub PR media

Attach review media through GitHub user attachments. Never commit screenshots, recordings, or other review-only files to the source branch.

## Preconditions

- Require explicit approval to create or edit the pull request or its comments.
- Run `gh auth status` and confirm access to the target repository.
- Keep the media outside the repository working tree.
- Use a short filename containing only letters, numbers, dots, hyphens, or underscores.
- Confirm the file is safe to share with everyone who can access the repository.

GitHub supports PNG, GIF, JPEG, SVG, MP4, MOV, WebM, MP3, and WAV media. Images and GIFs must not exceed 10 MB. Videos must not exceed 10 MB on GitHub Free or 100 MB on paid plans. Other supported files must not exceed 25 MB.

## Upload through the attachment endpoint

Set the repository, file, filename, and correct MIME type. Use the numeric REST repository ID.

```bash
REPOSITORY=owner/repository
FILE=/absolute/path/to/screenshot.png
NAME=screenshot.png
MIME=image/png
REPOSITORY_ID="$(gh api "repos/$REPOSITORY" --jq .id)"

curl --fail --silent --show-error \
  "https://uploads.github.com/user-attachments/assets" \
  --url-query "name=$NAME" \
  --url-query "content_type=$MIME" \
  --url-query "repository_id=$REPOSITORY_ID" \
  --request POST \
  --header "Authorization: Bearer $(gh auth token)" \
  --header "Accept: application/json" \
  --data-binary "@$FILE"
```

Read the `url` field from the JSON response. It has this form:

```text
https://github.com/user-attachments/assets/<identifier>
```

This endpoint is not part of GitHub's documented public API. Do not use `set -x`, print the token, save it in a file, or copy browser cookies. If the endpoint fails, use the authenticated web fallback.

## Add the attachment to the PR

Embed the returned URL in the PR body or a comment:

```markdown
![Desktop view at 1440 by 1000](https://github.com/user-attachments/assets/<identifier>)
```

For video, use the plain attachment URL on its own line. Keep useful alternative text for images.

Preserve the existing PR body when editing it. A PR comment is acceptable when changing the body would be unsafe.

## Authenticated web fallback

Open the pull request in an authenticated browser. Edit the body or start a comment. Drag the file into the editor, paste an image, or use GitHub's attachment control. Wait for GitHub to insert the anonymized attachment URL, then save the body or comment.

Do not extract browser cookies or upload private review media to a public third-party host.

## Verify

- Open the PR and confirm that each image or video renders.
- Confirm that private-repository media is visible only to users with repository access.
- Run `gh pr diff <number> --repo <owner/repository> --name-only` and confirm that no review media is committed.
- Report the PR URL and the attachment URLs.

References:

- GitHub file attachment documentation: https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/attaching-files
- Current attachment-endpoint note: https://island94.org/2026/08/programmatically-upload-attachments-to-github-issues-pull-requests-comments
