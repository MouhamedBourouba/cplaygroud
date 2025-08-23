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

const componentIds = {
  runButton: "runBtn",
  shareButton: "shareBtn",
  shareModal: "shareModal",
  dismissModalBtn: "shareModalClose",
  editorContainer: "split-editor",
  outputContainer: "split-output",
  copyUrlBtn: "copyUrlBtn",
  shareUrlInput: "shareUrlInput",
};

document.querySelector("#app").innerHTML = `
  <div id="container" class="h-full w-full flex flex-col">
    <div
      class="flex items-center gap-2 bg-[#1e1e1e] text-gray-200 px-2 py-1 text-sm"
    >
      <button id="${componentIds.runButton}" class="px-2 py-0.5 rounded hover:bg-gray-700">
        ▶ Run
      </button>
      <button id="${componentIds.shareButton}" class="px-2 py-0.5 rounded hover:bg-gray-700">
        Share
      </button>
    </div>

    <div class="h-full w-full flex-1">
      <div id="${componentIds.editorContainer}"></div>
      <div id="${componentIds.outputContainer}" class="bg-[#1e1e1e]"></div>
    </div>
  </div>
  <div id="${componentIds.shareModal}" 
    class="hidden fixed inset-0 flex items-center justify-center z-50 h-screen w-screen">
    <div class="bg-[#1e1e1e] text-white rounded-2xl shadow-xl max-w-md w-full p-6 relative animate-fadeIn">

      <h2 class="text-xl font-bold mb-4">Share Code Snippet</h2>
      <p class="mb-4">Copy the link below to share your code:</p>

      <!-- URL Box -->
      <div class="flex items-center bg-gray-800 rounded-lg overflow-hidden">
        <input 
          id="${componentIds.shareUrlInput}"
          type="text" 
          readonly 
          value=""
          class="flex-grow px-3 py-2 bg-transparent text-sm focus:outline-none"
        />
        <button 
          id="${componentIds.copyUrlBtn}" 
          class="px-2 py-2 bg-blue-600 hover:bg-blue-500 text-sm font-medium">
          Copy
        </button>
      </div>

      <!-- Actions -->
      <div class="mt-6 flex justify-end">
        <button id="${componentIds.dismissModalBtn}" 
          class="px-4 py-2 bg-white text-black rounded-lg">
          Close
        </button>
      </div>
    </div>
  </div>
`;

const shareModal = document.getElementById(componentIds.shareModal);
const shareButton = document.getElementById(componentIds.shareButton);
const shareUrlInput = document.getElementById(componentIds.shareUrlInput);
const dismissModalBtn = document.getElementById(componentIds.dismissModalBtn);

dismissModalBtn.addEventListener("click", (event) => {
  if (!shareModal.classList.contains("hidden")) {
    shareModal.classList.add("hidden");
  }
});

shareButton.addEventListener("click", () => {
  shareModal.classList.remove("hidden");
  const code = editor.state.doc.toString();
  const base64 = btoa(encodeURIComponent(code));
  shareUrlInput.value = `${window.location.origin.toString()}/s/${base64}`;
});

Split(
  [`#${componentIds.editorContainer}`, `#${componentIds.outputContainer}`],
  {
    direction: "vertical",
    sizes: [90, 10],
    minSize: [100, 100],
    cursor: "row-resize",
  },
);

const editor = new EditorView({
  doc: (() => {
    const defaultCode = `#include <stdio.h>
int main() {
  printf("Hello, World!\\n");
  return 0;
}`;
    let regex = /^\/s\/(.*)$/;
    let match = window.location.pathname.match(regex);
    let base64EncodedCode = match ? match[1] : null;

    if (base64EncodedCode == null) {
      return defaultCode;
    }

    let code = decodeURIComponent(atob(base64EncodedCode));

    return code;
  })(),
  extensions: [
    basicSetup,
    githubDark,
    keymap.of([indentWithTab, ...defaultKeymap]),
    cpp(),
  ],
  parent: document.getElementById(componentIds.editorContainer),
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

let xtermContainer = document.getElementById(componentIds.outputContainer);

const fitAddon = new FitAddon();
terminal.loadAddon(fitAddon);

const observer = new ResizeObserver((_) => fitAddon.fit());
observer.observe(xtermContainer);

terminal.open(xtermContainer);

document
  .getElementById(componentIds.runButton)
  .addEventListener("click", async () => {
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
    document.getElementById(componentIds.runButton).click();
  }
});
