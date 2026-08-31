# Marres website

## Set up the development environment

1. Install Nix by following the [official Nix installation guide](https://nix.dev/install-nix).
2. Open a new terminal.
3. Confirm that Nix is available:

   ```sh
   nix --version
   ```

4. If Nix reports that flakes are disabled, add this line to `~/.config/nix/nix.conf`:

   ```text
   experimental-features = nix-command flakes
   ```

5. Enter the development shell from this repository:

   ```sh
   nix develop
   ```

The shell provides Node.js, npm, GitHub CLI (`gh`), actionlint, and the site commands below.

## Authenticate GitHub CLI

1. Start the browser-based sign-in flow:

   ```sh
   gh auth login --web
   ```

2. Follow the prompts for GitHub.com and your preferred Git protocol.
3. Confirm that authentication works:

   ```sh
   gh auth status
   ```

See the [GitHub CLI authentication manual](https://cli.github.com/manual/gh_auth_login) for other sign-in methods.

## Run the site

Install the JavaScript dependencies:

```sh
setup
```

Start the local development server:

```sh
run
```

Run the complete review sequence:

```sh
ci
```

Use the other site commands as needed:

```sh
format
check
build
preview
```
