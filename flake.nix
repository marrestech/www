{
  description = "Marres website development environment";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs =
    { nixpkgs, ... }:
    let
      systems = [
        "aarch64-darwin"
        "aarch64-linux"
        "x86_64-darwin"
        "x86_64-linux"
      ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
    in
    {
      devShells = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          npmScript =
            name: script:
            pkgs.writeShellApplication {
              inherit name;
              runtimeInputs = [ pkgs.nodejs_22 ];
              text = ''
                npm run ${script} -- "$@"
              '';
            };
          commands = rec {
            setup = pkgs.writeShellApplication {
              name = "setup";
              runtimeInputs = [ pkgs.nodejs_22 ];
              text = ''
                npm ci "$@"
              '';
            };
            run = npmScript "run" "dev";
            format = npmScript "format" "format";
            check = pkgs.writeShellApplication {
              name = "check";
              runtimeInputs = [
                pkgs.actionlint
                pkgs.nodejs_22
              ];
              text = ''
                npm run format:check
                npm run check
                actionlint .github/workflows/*.yml
              '';
            };
            build = npmScript "build" "build";
            test-site = npmScript "test-site" "test";
            preview = npmScript "preview" "preview";
            ci = pkgs.writeShellApplication {
              name = "ci";
              runtimeInputs = [
                setup
                check
                build
                test-site
              ];
              text = ''
                setup
                check
                build
                test-site
              '';
            };
          };
        in
        {
          default = pkgs.mkShell {
            packages = [
              pkgs.actionlint
              pkgs.gh
              pkgs.nodejs_22
            ]
            ++ builtins.attrValues commands;
          };
        }
      );
    };
}
