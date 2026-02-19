import { app, BrowserWindow, shell, screen } from "electron";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import electronContextMenu from "electron-context-menu";
import { config } from "./config/index.js";

electronContextMenu({ showSaveImageAs: true });

const appUrl = "https://www.notion.so/login";
const stateFile = path.join(app.getPath("userData"), "window-state.json");

let window = null;

// ---- Window state helpers ----

function getDefaultState() {
    const display = screen.getPrimaryDisplay();
    const { width, height } = display.workAreaSize;
    // sensible default; fit smaller screens
    const w = Math.min(1280, width);
    const h = Math.min(800, height);
    return { width: w, height: h, isMaximized: false, isFullScreen: false };
}

function isStateOnAnyDisplay(state) {
    if (
        typeof state.x !== "number" ||
        typeof state.y !== "number" ||
        typeof state.width !== "number" ||
        typeof state.height !== "number"
    )
        return false;

    const minVisible = 50; // px
    const rect = state;

    return screen.getAllDisplays().some((d) => {
        const b = d.workArea;

        const overlapX = Math.max(
            0,
            Math.min(rect.x + rect.width, b.x + b.width) - Math.max(rect.x, b.x)
        );
        const overlapY = Math.max(
            0,
            Math.min(rect.y + rect.height, b.y + b.height) -
                Math.max(rect.y, b.y)
        );

        return overlapX >= minVisible && overlapY >= minVisible;
    });
}

function readWindowState() {
    try {
        const raw = fs.readFileSync(stateFile, "utf8");
        const s = JSON.parse(raw);
        const fallback = getDefaultState();

        const state = {
            ...fallback,
            ...s,
        };
        // Basic sanity checks
        if (typeof state.width !== "number" || state.width < 200)
            state.width = fallback.width;
        if (typeof state.height !== "number" || state.height < 200)
            state.height = fallback.height;

        // If monitor setup changed, drop x/y so Electron can choose a safe position
        if (!isStateOnAnyDisplay(state)) {
            delete state.x;
            delete state.y;
        }

        return state;
    } catch {
        return getDefaultState();
    }
}

function writeWindowState(state) {
    try {
        fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
    } catch {
        // ignore
    }
}

function installWindowStatePersistence(win) {
    // Keep "normal" (non-maximized) bounds up to date
    let normalBounds = win.getBounds();

    const captureNormalBounds = () => {
        if (!win.isMaximized() && !win.isMinimized() && !win.isFullScreen()) {
            normalBounds = win.getBounds();
        }
    };

    // Update in common scenarios
    win.on("move", captureNormalBounds);
    win.on("resize", captureNormalBounds);

    // Save on close
    win.on("close", () => {
        const stateToSave = {
            ...normalBounds,
            isMaximized: win.isMaximized(),
            isFullScreen: win.isFullScreen(),
        };
        writeWindowState(stateToSave);
    });
}

// ---- create window ----

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const createWindow = () => {
    const state = readWindowState();

    window = new BrowserWindow({
        ...(typeof state.x === "number" ? { x: state.x } : {}),
        ...(typeof state.y === "number" ? { y: state.y } : {}),
        width: state.width,
        height: state.height,
        icon: path.join(__dirname, "assets/icon.png"),
        autoHideMenuBar: true,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            nativeWindowOpen: true,
            preload: path.join(__dirname, "preload.js"),
            webSecurity: true,
        },
    });

    installWindowStatePersistence(window);

    window.loadURL(appUrl, { userAgent: config.userAgent });

    window.once("ready-to-show", () => {
        if (
            !state.isFullScreen &&
            !state.isMaximized &&
            typeof state.x === "number" &&
            typeof state.y === "number"
        ) {
            // this does not work on wayland as windows can not programmatically set bounds
            window.setBounds(
                {
                    x: state.x,
                    y: state.y,
                    width: state.width,
                    height: state.height,
                },
                false
            );
        }

        if (state.isFullScreen) window.setFullScreen(true);
        else if (state.isMaximized) window.maximize();

        window.show();
    });

    // your external-link handling stays as-is...
};

app.whenReady().then(createWindow);
