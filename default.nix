# default.nix
{ pkgs ? import <nixpkgs> { } }:

pkgs.buildNpmPackage rec {
  pname = "notion-desktop";
  version = "v1.0.0";

  # Use local sources
  src = pkgs.lib.cleanSourceWith {
    src = ./.;
    # exclude result folder
    filter = path: type:
      let base = baseNameOf path;
      in (pkgs.lib.cleanSourceFilter path type) && base != "result";
  };

  # If this mismatches, set to pkgs.lib.fakeHash once, build, then copy printed hash here
  npmDepsHash = "sha256-GFJMZSub+a4sXymZP4498jOcHglBGahPgRHuozm9oNw=";

  nativeBuildInputs = with pkgs; [ nodejs python3 pkg-config makeWrapper ];

  buildInputs = with pkgs; [
    # Needed so shell.openExternal() can find xdg-open
    xdg-utils

    # Electron deps
    gtk3
    glib
    nss
    nspr
    atk
    at-spi2-atk
    libdrm
    xorg.libxcb
    xorg.libXcomposite
    xorg.libXdamage
    xorg.libXrandr
    mesa
    expat
    libxkbcommon
    gtk4
    pango
    cairo
    gdk-pixbuf
    xorg.libX11
    xorg.libXext
    xorg.libXfixes
    xorg.libXrender
    xorg.libXi
    xorg.libXtst
    xorg.libxshmfence
    alsa-lib
    at-spi2-core
    cups
    dbus
    libappindicator-gtk3
    libnotify
    libuuid
  ];

  npmFlags = [ "--ignore-scripts" ];

  buildPhase = ''
    runHook preBuild

    npm ci --ignore-scripts

    npm run dist 2>/dev/null || npm run build 2>/dev/null || echo "No dist/build script found"

    runHook postBuild
  '';

  installPhase = ''
        runHook preInstall

        mkdir -p $out/lib/notion-desktop
        mkdir -p $out/bin
        mkdir -p $out/share/applications
        mkdir -p $out/share/icons/hicolor/256x256/apps

        cp -r . $out/lib/notion-desktop/

        # IMPORTANT: keep this as ONE command so no stray line breaks turn flags into commands
        makeWrapper ${pkgs.electron}/bin/electron $out/bin/notion-desktop \
          --add-flags "$out/lib/notion-desktop" \
          --set NODE_ENV production \

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

  meta = with pkgs.lib; {
    description = "Cross-platform desktop application for Notion";
    homepage = "https://github.com/Mowerick/notion-desktop";
    license = licenses.mit;
    platforms = platforms.linux;
    mainProgram = "notion-desktop";
  };
}
