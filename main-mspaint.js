const { app, shell, session, dialog, ipcMain, BrowserWindow, Menu, MenuItem } = require("electron");
const fs = require("fs");
const path = require("path");

// 开发模式检测
const isDev = process.env.ELECTRON_DEBUG === "1" || !app.isPackaged;

// 允许的文件路径列表
const allowed_file_paths = [];

// 立即移除应用菜单 - 在应用启动时就执行
app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
});

// 全局窗口引用
let editor_window;

const createWindow = () => {
  // 立即移除应用菜单
  Menu.setApplicationMenu(null);
  
  // 创建浏览器窗口
  editor_window = new BrowserWindow({
    useContentSize: true,
    autoHideMenuBar: false,  // 完全禁用菜单栏
    width: 800,
    height: 600,
    minWidth: 260,
    minHeight: 360,
    // icon: path.join(__dirname, 'app-icon.png'), // 暂时注释掉以避免GLib错误
    title: "MSPaint画图",
    show: false,  // 先不显示窗口
    frame: true,  // 恢复窗口框架
    titleBarStyle: 'default',  // 恢复标题栏
    webPreferences: {
      preload: path.join(__dirname, 'mspaint', 'src', 'electron-injected.js'),
      contextIsolation: false,
    },
  });

  // 强制设置窗口图标（仅在非Linux系统上）
  // 在Linux上跳过图标设置以避免GLib错误
  if (process.platform !== 'linux') {
    try {
      const iconPath = path.join(__dirname, 'app-icon.png');
      console.log('Setting icon to:', iconPath);
      editor_window.setIcon(iconPath);
    } catch (error) {
      console.log('Icon setting skipped due to platform compatibility');
    }
  }

  // 立即移除菜单栏
  editor_window.setMenu(null);
  Menu.setApplicationMenu(null);
  
  // 确保菜单栏被移除 - 多重检查
  setTimeout(() => {
    editor_window.setMenu(null);
    Menu.setApplicationMenu(null);
  }, 100);
  
  // 再次确保菜单栏被移除
  setTimeout(() => {
    editor_window.setMenu(null);
    Menu.setApplicationMenu(null);
  }, 500);
  
  // 窗口显示后再次移除菜单栏
  setTimeout(() => {
    editor_window.setMenu(null);
    Menu.setApplicationMenu(null);
  }, 1000);

  // 加载 MSPaint 应用
  const mspaintPath = path.join(__dirname, 'mspaint', 'index.html');
  console.log('Loading MSPaint from:', mspaintPath);
  editor_window.loadFile(mspaintPath);

  // 窗口加载完成后显示并确保菜单栏被移除
  editor_window.once('ready-to-show', () => {
    editor_window.setMenu(null);
    Menu.setApplicationMenu(null);
    editor_window.show();
    
    // 注入CSS来隐藏菜单栏
    editor_window.webContents.insertCSS(`
      #menu-bar, .menu-bar, menubar, [role="menubar"] {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        overflow: hidden !important;
      }
      body > menubar,
      body > div[role="menubar"],
      body > nav[role="menubar"] {
        display: none !important;
      }
    `);
  });

  // 窗口关闭事件
  editor_window.on("closed", () => {
    editor_window = null;
  });

  // 窗口即将关闭事件
  editor_window.on("close", (event) => {
    editor_window.webContents.send("close-window-prompt");
    event.preventDefault();
  });

  // 处理外部链接
  editor_window.webContents.on("will-navigate", (e, url) => {
    if (!url.includes("file://")) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });

  editor_window.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.includes("file://")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  // 设置 CSP 头
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [`
          default-src 'self';
          script-src 'self' blob:;
          style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
          img-src 'self' data: blob: http: https:;
          font-src 'self' https://fonts.gstatic.com;
          connect-src * data: blob:;
        `],
      },
    });
  });

  // 处理文件拖放
  editor_window.webContents.on("did-finish-load", () => {
    function handle_one_drop() {
      editor_window.webContents.executeJavaScriptInIsolatedWorld(777, [
        {
          code: `
            new Promise((resolve, reject) => {
              window.addEventListener("drop", (event) => {
                const file_path = event.dataTransfer.files[0].path;
                resolve(file_path);
              }, { once: true });
            })
          `,
        },
      ]).then((file_path) => {
        console.log("Allowing write access to dropped file:", file_path);
        allowed_file_paths.push(file_path);
        editor_window.webContents.send("open-file", file_path);
        handle_one_drop();
      });
    }
    handle_one_drop();
  });
};

// IPC 处理器
ipcMain.on("get-env-info", (event) => {
  const env_info = {
    isDev,
    isMacOS: process.platform === "darwin",
    initialFilePath: null,
  };
  event.returnValue = env_info;
});

ipcMain.on("set-represented-filename", (_event, filePath) => {
  if (!allowed_file_paths.includes(filePath)) {
    filePath = "";
  }
  editor_window.setRepresentedFilename(filePath);
});

ipcMain.on("set-document-edited", (_event, isEdited) => {
  editor_window.setDocumentEdited(isEdited);
});

ipcMain.handle("show-save-dialog", async (_event, options) => {
  const { filePath, canceled } = await dialog.showSaveDialog(editor_window, {
    title: options.title,
    defaultPath: options.defaultPath || (options.defaultFileName ? path.basename(options.defaultFileName) : undefined),
    filters: options.filters,
  });
  if (!canceled) {
    const fileName = path.basename(filePath);
    allowed_file_paths.push(filePath);
    return { filePath, fileName, canceled };
  }
  return { filePath: null, fileName: null, canceled };
});

ipcMain.handle("show-open-dialog", async (_event, options) => {
  const { filePaths, canceled } = await dialog.showOpenDialog(editor_window, {
    title: options.title,
    defaultPath: options.defaultPath,
    filters: options.filters,
    properties: options.properties,
  });
  if (!canceled) {
    allowed_file_paths.push(...filePaths);
    return { filePaths, canceled };
  }
  return { filePaths: [], canceled };
});

ipcMain.handle("write-file", async (_event, file_path, data) => {
  if (!allowed_file_paths.includes(file_path)) {
    return { responseCode: "ACCESS_DENIED" };
  }
  if (data instanceof ArrayBuffer) {
    try {
      await fs.promises.writeFile(file_path, Buffer.from(data));
    } catch (error) {
      return { responseCode: "WRITE_FAILED", error };
    }
    return { responseCode: "SUCCESS" };
  } else {
    return { responseCode: "INVALID_DATA" };
  }
});

ipcMain.handle("read-file", async (_event, file_path) => {
  if (!allowed_file_paths.includes(file_path)) {
    return { responseCode: "ACCESS_DENIED" };
  }
  try {
    const buffer = await fs.promises.readFile(file_path);
    return { responseCode: "SUCCESS", data: new Uint8Array(buffer), fileName: path.basename(file_path) };
  } catch (error) {
    return { responseCode: "READ_FAILED", error };
  }
});

// 应用事件处理
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// 处理文件打开
app.on("open-file", (event, filePath) => {
  event.preventDefault();
  if (editor_window) {
    allowed_file_paths.push(filePath);
    editor_window.webContents.send("open-file", filePath);
  }
}); 