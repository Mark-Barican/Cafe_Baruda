"use strict";

const path = require("path");
const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const firefox = require("selenium-webdriver/firefox");

const DEFAULT_BASE_URL = "http://localhost:3000/";

function getBaseUrl() {
  return process.env.TEST_BASE_URL || process.env.BASE_URL || DEFAULT_BASE_URL;
}

function isHeadless() {
  if (process.env.SELENIUM_HEADLESS === "0" || process.env.SELENIUM_HEADLESS === "false") {
    return false;
  }
  return true;
}

function defaultBravePaths() {
  if (process.platform === "win32") {
    return [
      path.join(process.env.PROGRAMFILES || "C:\\Program Files", "BraveSoftware/Brave-Browser/Application/brave.exe"),
      path.join(process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)", "BraveSoftware/Brave-Browser/Application/brave.exe"),
      "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe"
    ];
  }
  if (process.platform === "darwin") {
    return ["/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"];
  }
  return ["/usr/bin/brave-browser", "/usr/bin/brave", "/snap/bin/brave"];
}

function resolveBraveBinary() {
  if (process.env.BRAVE_BINARY) {
    return process.env.BRAVE_BINARY;
  }
  const fs = require("fs");
  for (const p of defaultBravePaths()) {
    try {
      if (p && fs.existsSync(p)) {
        return p;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

/**
 * BROWSER: chrome | brave | firefox (default chrome)
 */
async function createDriver() {
  const browser = (process.env.BROWSER || "chrome").toLowerCase();
  const headless = isHeadless();

  if (browser === "firefox") {
    const options = new firefox.Options();
    if (headless) {
      options.addArguments("-headless");
    }
    return new Builder().forBrowser("firefox").setFirefoxOptions(options).build();
  }

  const chromeOptions = new chrome.Options();
  if (headless) {
    chromeOptions.addArguments("--headless=new", "--disable-gpu", "--window-size=1280,900");
  }

  if (browser === "brave") {
    const bravePath = resolveBraveBinary();
    if (!bravePath) {
      throw new Error(
        "Brave not found. Set BRAVE_BINARY to the full path to brave.exe (or install Brave in the default location)."
      );
    }
    chromeOptions.setChromeBinaryPath(bravePath);
  }

  return new Builder().forBrowser("chrome").setChromeOptions(chromeOptions).build();
}

module.exports = {
  createDriver,
  getBaseUrl,
  isHeadless
};
