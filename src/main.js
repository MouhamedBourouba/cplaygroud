import { EditorView, basicSetup } from "codemirror";
import { githubDark } from "@fsegurai/codemirror-theme-github-dark";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { keymap } from "@codemirror/view";
import { cpp } from "@codemirror/lang-cpp";

import Split from "split.js";

import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

import RunC from "picoc-web";

import "./style.css";

document.querySelector("#app").innerHTML = `
  <div id="container" class="h-full w-full flex flex-col">
    <div class="flex items-center gap-2 bg-[#1e1e1e] text-gray-200 px-2 py-1 text-sm">
      <button id="runBtn" class="px-2 py-0.5 rounded hover:bg-gray-700">▶ Run</button>
      <button id="shareBtn" class="px-2 py-0.5 rounded hover:bg-gray-700">Share</button>
    </div>

    <div class="h-full w-full flex-1">
      <div id="split-editor"></div>
      <div id="split-output" class="bg-[#1e1e1e]"></div>
    </div>
  </div>
`;

Split(["#split-editor", "#split-output"], {
  direction: "vertical",
  sizes: [90, 10],
  minSize: [100, 100],
  cursor: "row-resize",
});

const editor = new EditorView({
  doc: `#include <stdio.h>
int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
  extensions: [
    basicSetup,
    githubDark,
    keymap.of([
      indentWithTab, // 👈 makes Tab insert indentation
      ...defaultKeymap,
    ]),
    cpp(),
  ],
  parent: document.getElementById("split-editor"),
});

const terminal = new Terminal({
  theme: {
    background: "#1e1e1e",
    foreground: "#ffffff",
    cursor: "#ffffff",
  },
  fontSize: 14,
  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
});

let xtermContainer = document.getElementById("split-output");

const fitAddon = new FitAddon();
terminal.loadAddon(fitAddon);

const observer = new ResizeObserver((_) => fitAddon.fit());
observer.observe(xtermContainer);

terminal.open(xtermContainer);

document.getElementById("runBtn").addEventListener("click", async () => {
  terminal.clear();
  const code = editor.state.doc.toString();

  try {
    const result = await RunC(code);
    terminal.clear();

    // Banner
    terminal.write("\x1b[1;44;97m▶ Running Program...\x1b[0m\r\n\r\n");

    if (result.stdout) {
      const fixedOutput = result.stdout.replace(/\n/g, "\r\n");
      terminal.write(fixedOutput);
    }

    if (result.stderr) {
      const fixedError = result.stderr.replace(/\n/g, "\r\n");
      terminal.write(`\x1b[31m${fixedError}\x1b[0m\r\n`);
    }

    if (!result.stdout && !result.stderr) {
      terminal.write(
        "\x1b[1;32m✔ Program executed successfully (no output)\x1b[0m\r\n",
      );
    }
  } catch (error) {
    terminal.clear();
    terminal.write("\x1b[1;41;97m⚠ Runtime Error\x1b[0m\r\n");
    terminal.write(`\x1b[31m${error.message}\x1b[0m\r\n`);
    console.error("RunC execution error:", error);
  }
});

document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    document.getElementById("runBtn").click();
  }
});

document.getElementById("shareBtn").addEventListener("click", () => {});
