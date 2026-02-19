# Notion Desktop

Notion Desktop is a cross-platform desktop application that allows you to use Notion directly on your computer, making it easier to chat with friends and family while working.

![Image](https://github.com/Mowerick/notion-desktop/blob/main/screenshots/notion-desktop.jpeg)

#### Information
I am using this forked repository to use this as an overlay for the notion-desktop package in nixpkgs as there was no package that fulfilled my needs or were not buggy or poorly maintained. There are some minor tweaks to it so check out the release history to know whats changed.

## 📦 **Installation**

### Building with Nix (Flakes)

This project uses **Nix flakes** for reproducible builds.

#### Prerequisites

- [Nix package manager](https://nixos.org/download.html) installed on your system
- Flakes enabled (`nix-command` + `flakes`)

If you haven’t enabled flakes yet, see here for more information: [Nix Flakes](https://wiki.nixos.org/wiki/Flakes)

#### Build

1. **Clone the repository**:

```bash
git clone https://github.com/xanmoy/notion-desktop.git
cd notion-desktop
```

2. **Build with Nix**:

```bash
nix build .#notion-desktop
```

This will:

* Fetch all dependencies automatically
* Build the application in an isolated environment
* Create a `result` symlink pointing to the built application

3. **Run the application**:

```bash
./result/bin/notion-desktop
```

#### Run directly (without `result`)

You can also run it directly via flakes:

```bash
nix run .#notion-desktop
```

Or simply:

```bash
nix run
```

#### Development with Nix Dev Shell

For active development, use the flake dev shell:

```bash
nix develop
```

Then install dependencies and run the app in development mode:

```bash
npm install
npm start
```
