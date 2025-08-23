import { EditorView, basicSetup } from "codemirror";
import { githubDark } from "@fsegurai/codemirror-theme-github-dark";
import Split from "split.js";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import RunC from "picoc-web";

import "@xterm/xterm/css/xterm.css";
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
  doc: "printf('Hello, from web ide buddy!');",
  extensions: [basicSetup, githubDark],
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

terminal.write("Welcome to your Web IDE 🚀\r\n$ ");

document.getElementById("runBtn").addEventListener("click", () => {
  terminal.clear();

  const code = editor.state.doc.toString();
  RunC(code).then((result) => {
    terminal.write(result.stdout);
  });
});

document.getElementById("shareBtn").addEventListener("click", () => {});
