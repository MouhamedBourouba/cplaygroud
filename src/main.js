import { EditorView, basicSetup } from "codemirror";
import { githubDark } from "@fsegurai/codemirror-theme-github-dark";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { keymap } from "@codemirror/view";
import { cpp } from "@codemirror/lang-cpp";

import Split from "split.js";

import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

import * as Picoc from "picoc-web";

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
  runInput: "runInput",
  clearInputBtn: "clearInputBtn",
};

document.querySelector("#app").innerHTML = `
  <div id="container" class="h-full w-full flex flex-col">
    <div
      class="flex items-center gap-3 bg-[#1e1e1e] text-gray-200 px-4 py-4 text-sm border-b border-gray-700"
    >
      <button id="${componentIds.runButton}" 
        class="flex items-center gap-2 px-4 py-2 bg-green-800 text-xxl hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm">
        Run
      </button>
      
      <div class="flex items-center gap-2 flex-1 max-w-md">
        <label for="${componentIds.runInput}" class="text-gray-300 font-medium whitespace-nowrap">
          Input:
        </label>
        <div class="relative flex-1">
          <input
            type="text"
            id="${componentIds.runInput}"
            autocomplete = "off"
            placeholder="Enter program input (e.g., numbers, text)..."
            class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <button 
            id="${componentIds.clearInputBtn}"
            class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors duration-200"
            title="Clear input">
            ✕
          </button>
        </div>
      </div>
      
      <button id="${componentIds.shareButton}" 
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm">
        Share
      </button>
    </div>

    <div class="h-full w-full flex-1">
      <div id="${componentIds.editorContainer}"></div>
      <div id="${componentIds.outputContainer}" class="bg-[#1e1e1e]"></div>
    </div>
  </div>
  <div id="${componentIds.shareModal}" 
    class="hidden fixed inset-0 flex items-center justify-center z-50 h-screen w-screen bg-black bg-opacity-50">
    <div class="bg-[#1e1e1e] text-white rounded-2xl shadow-xl max-w-md w-full p-6 relative animate-fadeIn">

      <h2 class="text-xl font-bold mb-4">Share Code Snippet</h2>
      <p class="mb-4 text-gray-300">Copy the link below to share your code:</p>

      <!-- URL Box -->
      <div class="flex items-center bg-gray-800 rounded-lg overflow-hidden border border-gray-600">
        <input 
          id="${componentIds.shareUrlInput}"
          type="text" 
          readonly 
          value=""
          class="flex-grow px-3 py-2 bg-transparent text-sm focus:outline-none text-gray-200"
        />
        <button 
          id="${componentIds.copyUrlBtn}" 
          class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-sm font-medium transition-colors duration-200">
          Copy
        </button>
      </div>

      <!-- Actions -->
      <div class="mt-6 flex justify-end">
        <button id="${componentIds.dismissModalBtn}" 
          class="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors duration-200">
          Close
        </button>
      </div>
    </div>
  </div>
`;

const shareModal = document.getElementById(componentIds.shareModal);
const shareButton = document.getElementById(componentIds.shareButton);
const copyUrlButton = document.getElementById(componentIds.copyUrlBtn);
const shareUrlInput = document.getElementById(componentIds.shareUrlInput);
const dismissModalBtn = document.getElementById(componentIds.dismissModalBtn);
const runInput = document.getElementById(componentIds.runInput);
const clearInputBtn = document.getElementById(componentIds.clearInputBtn);

dismissModalBtn.addEventListener("click", (event) => {
  if (!shareModal.classList.contains("hidden")) {
    shareModal.classList.add("hidden");
  }
});

shareModal.addEventListener("click", (event) => {
  if (event.target === shareModal) {
    shareModal.classList.add("hidden");
  }
});

clearInputBtn.addEventListener("click", () => {
  runInput.value = "";
  runInput.focus();
});

runInput.addEventListener("input", () => {
  clearInputBtn.style.display = runInput.value ? "block" : "none";
});

clearInputBtn.style.display = runInput.value ? "block" : "none";

copyUrlButton.addEventListener("click", (event) => {
  const code = editor.state.doc.toString();
  const base64 = btoa(encodeURIComponent(code));
  const value = `${window.location.origin.toString()}/web-ide/s/${base64}`;
  navigator.clipboard
    .writeText(value)
    .then(() => {
      console.log("Copied to clipboard:", value);
      copyUrlButton.textContent = "Copied!";
      setTimeout(() => {
        copyUrlButton.textContent = "Copy";
      }, 2000);
    })
    .catch((err) => {
      console.error("Failed to copy:", err);
      copyUrlButton.textContent = "Failed";
      setTimeout(() => {
        copyUrlButton.textContent = "Copy";
      }, 2000);
    });
  if (!shareModal.classList.contains("hidden")) {
    shareModal.classList.add("hidden");
  }
});

shareButton.addEventListener("click", () => {
  shareModal.classList.remove("hidden");
  const code = editor.state.doc.toString();
  const base64 = btoa(encodeURIComponent(code));
  shareUrlInput.value = `${window.location.origin.toString()}/web-ide/s/${base64}`;
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
  printf("Hello world\\n");
  printf("Enter your name: ");
  
  char name[50];
  scanf("%s", name);
  
  printf("Hello, %s!\\n", name);
  return 0;
}
`;
    let regex = /^\/web-ide\/s\/(.*)$/;
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
    const input = document.getElementById(componentIds.runInput).value;

    try {
      terminal.clear();
      await Picoc.RunWithInputOutput(code, input ?? "", (value) =>
        terminal.writeln(value),
      );
      terminal.writeln("\r\n\x1b[1;32m✅ Program finished\x1b[0m");
    } catch (error) {
      terminal.clear();
      terminal.writeln("\x1b[1;41;97m ⚠ Runtime Error \x1b[0m\r\n");
      terminal.writeln(`\x1b[31m${error.message}\x1b[0m\r\n`);
      terminal.writeln(
        "\x1b[33m💡 Check your code for syntax errors or runtime issues\x1b[0m",
      );
      console.error("RunC execution error:", error);
    }
  });

document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    document.getElementById(componentIds.runButton).click();
  }

  if (event.key === "Escape" && !shareModal.classList.contains("hidden")) {
    shareModal.classList.add("hidden");
  }
});
