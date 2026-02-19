{
  description = "notion-desktop (Electron + npm)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        lib = pkgs.lib;

        notion-desktop = pkgs.buildNpmPackage rec {
          pname = "notion-desktop";
          version = "1.0.0";

          src = lib.cleanSourceWith {
            src = ./.;
            filter = path: type:
              let base = baseNameOf path;
              in (lib.cleanSourceFilter path type) && base != "result";
          };

          npmDepsHash = "sha256-GFJMZSub+a4sXymZP4498jOcHglBGahPgRHuozm9oNw=";

          nativeBuildInputs = with pkgs; [ nodejs makeWrapper ];

          npmFlags = [ "--ignore-scripts" ];

          buildPhase = ''
            runHook preBuild
            npm ci --ignore-scripts
            npm run dist 2>/dev/null || npm run build 2>/dev/null || echo "No dist/build script found"
            runHook postBuild
          '';

          installPhase = ''
            runHook preInstall

            mkdir -p $out/lib/notion-desktop $out/bin $out/share/{applications,icons/hicolor/256x256/apps}
            cp -r . $out/lib/notion-desktop/

            makeWrapper ${pkgs.electron}/bin/electron $out/bin/notion-desktop \
              --add-flags "$out/lib/notion-desktop" \
              --set NODE_ENV production

            cat > $out/share/applications/notion-desktop.desktop << EOF
            [Desktop Entry]
            Name=Notion Desktop
            Comment=Cross-platform desktop application for Notion
            Exec=$out/bin/notion-desktop
            Icon=notion-desktop
            Type=Application
            Categories=Office;Productivity;
            StartupWMClass=notion-desktop
            EOF

            cp assets/icon.png $out/share/icons/hicolor/256x256/apps/notion-desktop.png

            runHook postInstall
          '';

          meta = with lib; {
            description = "Cross-platform desktop application for Notion";
            homepage = "https://github.com/Mowerick/notion-desktop";
            license = licenses.mit;
            platforms = platforms.linux;
            mainProgram = "notion-desktop";
          };
        };
      in {
        packages = {
          inherit notion-desktop;
          default = notion-desktop;
        };

        apps = {
          notion-desktop = flake-utils.lib.mkApp { drv = notion-desktop; };
          default = flake-utils.lib.mkApp { drv = notion-desktop; };
        };

        devShells.default = pkgs.mkShell {
          packages = with pkgs; [ nodejs electron ];
          # (Strongly recommended) don't auto-run installs on shell entry:
          # shellHook = ''npm install; npm start'';
        };
      });
}
