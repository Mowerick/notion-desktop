# default.nix
{ pkgs ? import <nixpkgs> {} }:

pkgs.buildNpmPackage rec {
  pname = "notion-desktop";
  version = "v1.0.0";
  
  src = pkgs.fetchFromGitHub {
    owner = "Mowerick";
    repo = "notion-desktop";
    rev = "main";
    sha256 = "sguONxIaoOgjEEQjJyDEnYf8Xaynw+JpcwsAIf2tOX0="; # You'll need to update this
  };
  
  npmDepsHash = "sha256-GFJMZSub+a4sXymZP4498jOcHglBGahPgRHuozm9oNw="; # You'll need to update this
  
  nativeBuildInputs = with pkgs; [
    nodejs
    python3
    pkg-config
    makeWrapper
  ];
  
  buildInputs = with pkgs; [
    # Electron dependencies
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
  
  # Skip npm audit and install
  npmFlags = [ "--ignore-scripts" ];
  
  # Build phase
  buildPhase = ''
    runHook preBuild
    
    # Install dependencies
    npm ci --ignore-scripts
    
    # Build the application for distribution
    npm run dist 2>/dev/null || npm run build 2>/dev/null || echo "No dist/build script found"
    
    runHook postBuild
  '';
  
  # Installation phase
  installPhase = ''
    runHook preInstall
    
    mkdir -p $out/lib/notion-desktop
    mkdir -p $out/bin
    mkdir -p $out/share/applications
    mkdir -p $out/share/icons/hicolor/256x256/apps
    
    # Copy application files
    cp -r . $out/lib/notion-desktop/
    
    # Create wrapper script
    makeWrapper ${pkgs.electron}/bin/electron $out/bin/notion-desktop \
      --add-flags "$out/lib/notion-desktop" \
      --set NODE_ENV production \
      --prefix LD_LIBRARY_PATH : "${pkgs.lib.makeLibraryPath buildInputs}"
    
    # Create desktop entry
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
    
    # Add icon if available (check multiple possible locations)
    for icon_path in assets/icon.png src/assets/icon.png icon.png resources/icon.png build/icon.png; do
      if [ -f "$icon_path" ]; then
        cp "$icon_path" $out/share/icons/hicolor/256x256/apps/notion-desktop.png
        break
      fi
    done
    
    runHook postInstall
  '';
  
  meta = with pkgs.lib; {
    description = "Cross-platform desktop application for Notion";
    longDescription = ''
      Notion Desktop is a cross-platform desktop application that allows you to
      use Notion directly on your computer, making it easier to chat with friends
      and family while working. Features include full Notion functionality,
      single instance management, custom user-agent, window management,
      Google Sign-In support, and popup handling.
    '';
    homepage = "https://github.com/Mowerick/notion-desktop";
    license = licenses.mit;
    maintainers = [ ];
    platforms = platforms.linux;
    mainProgram = "notion-desktop";
  };
}
