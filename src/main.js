import { app, BrowserWindow, shell, screen } from "electron";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import electronContextMenu from "electron-context-menu";
import { config } from "./config/index.js";

const NOTION_INTERNAL_HOST_SUFFIXES = [
    "notion.so",
    "notion.com",
    "notion.site",
    "notion-static.com",
    "notionusercontent.com",
];

function isProbablyNotionInternal(targetUrl) {
    try {
        const u = new URL(targetUrl);

        if (u.protocol !== "http:" && u.protocol !== "https:") return true;

        const host = u.hostname.toLowerCase();
        return NOTION_INTERNAL_HOST_SUFFIXES.some(
            (suffix) => host === suffix || host.endsWith(`.${suffix}`)
        );
    } catch {
        return true;
    }
}

electronContextMenu({ showSaveImageAs: true });

const appUrl = "https://www.notion.so/login";
const stateFile = path.join(app.getPath("userData"), "window-state.json");

let window = null;

function getDefaultState() {
    const display = screen.getPrimaryDisplay();
    const { width, height } = display.workAreaSize;
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
        if (typeof state.width !== "number" || state.width < 200)
            state.width = fallback.width;
        if (typeof state.height !== "number" || state.height < 200)
            state.height = fallback.height;

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

    window.webContents.setWindowOpenHandler(({ url }) => {
        console.log("[setWindowOpenHandler]", url);

        if (!isProbablyNotionInternal(url)) {
            shell.openExternal(url);
            return { action: "deny" };
        }
        return { action: "allow" };
    });

    window.webContents.on("will-navigate", (event, url) => {
        console.log("[will-navigate]", url);

        if (!isProbablyNotionInternal(url)) {
            event.preventDefault();
            shell.openExternal(url);
        }
    });

    window.webContents.on("will-redirect", (event, url) => {
        console.log("[will-redirect]", url);

        if (!isProbablyNotionInternal(url)) {
            event.preventDefault();
            shell.openExternal(url);
        }
    });
};

app.whenReady().then(createWindow);
