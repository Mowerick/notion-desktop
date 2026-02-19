# Notion Desktop

Notion Desktop is a cross-platform desktop application that allows you to use Notion directly on your computer, making it easier to chat with friends and family while working.

![Image](https://github.com/xanmoy/notion-desktop/blob/main/screenshots/notion-desktop.jpeg)

## 🛠 **Features**

- **Full Notion Functionality**: Access all Notion features in a dedicated desktop app.
- **Single Instance**: Ensures only one instance of the app runs at a time.
- **Custom User-Agent**: Enhanced compatibility with Notion Web.
- **Window Management**: Automatically maximizes on startup for better visibility.
- **Google Sign-In Support**: Login via Google is supported with external browser fallback for security.
- **Popup Handling**: Popups are allowed to ensure smooth navigation and interactions.

---

![Image](https://github.com/xanmoy/notion-desktop/blob/main/screenshots/image1.png)

## 📦 **Installation**

### Building with Nix (Recommended)

This project includes a `default.nix` file for reproducible builds using the Nix package manager.

#### Prerequisites

- [Nix package manager](https://nixos.org/download.html) installed on your system

#### Development Build

1. **Clone the repository**:

```bash
git clone https://github.com/xanmoy/notion-desktop.git
cd notion-desktop
```

2. **Build with Nix**:

```bash
nix-build
```

This will:
- Fetch all dependencies automatically
- Build the application in an isolated environment
- Create a `result` symlink pointing to the built application

3. **Run the application**:

```bash
./result/bin/notion-desktop
```

#### Development with Nix Shell

For active development, you can use `nix-shell` to enter a development environment:

```bash
nix-shell -p nodejs electron python3 pkg-config
```

Then run the application in development mode:

```bash
npm install
npm start
```

### Alternative: Build from Source (Without Nix)

If you prefer not to use Nix, you can build manually:

1. **Clone the repository**:

### Alternative: Build from Source (Without Nix)

If you prefer not to use Nix, you can build manually:

1. **Clone the repository**:

```bash
git clone https://github.com/xanmoy/notion-desktop.git
cd notion-desktop
```

2. **Install dependencies**:

```bash
npm install
```

3. **Start the application in development mode**:

```bash
npm start
```

## ↩️ **Uninstallation**

If built with Nix, simply remove the `result` symlink and garbage collect:

```bash
rm result
nix-collect-garbage
```ia Snap:**
```bash
notion-desktop
```

**Via Nix build:**
```bash
./result/bin/notion-desktop
```

**Via desktop launcher:** Search for "Notion Desktop" in your application menu

## 🤝 **Contributing**

Contributions are welcome! If you'd like to contribute to this project, please fork the repository and submit a pull request.

## 📜 **License**

## 📖 **Usage**

After building, launch the application:

**Via Nix build:**
```bash
./result/bin/notion-desktop
```

**Via development mode:**
```bash
npm start
```

**Via desktop launcher:** Search for "Notion Desktop" in your application menu (if installed system-wide)