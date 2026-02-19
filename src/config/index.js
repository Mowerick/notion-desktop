const platform = process.platform; // 'darwin', 'win32', 'linux'
const arch = process.arch; // 'x64', 'arm64', ...

function osInfoToken() {
    if (platform === "darwin") {
        const cpu = arch === "arm64" ? "Apple" : "Intel";
        return `(Macintosh; ${cpu} Mac OS X 10_15_7)`;
    }

    if (platform === "win32") {
        return `(Windows NT 10.0; Win64; x64)`;
    }

    return `(X11; Linux x86_64)`;
}

const config = {
    userAgent: `Mozilla/5.0 ${osInfoToken()} AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${
        process.versions.chrome
    } Safari/537.36`,
};

export { config };
