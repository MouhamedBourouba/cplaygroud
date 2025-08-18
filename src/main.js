import { EditorView, basicSetup } from "codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import Split from "split.js";
import "./style.css";

document.querySelector("#app").innerHTML = `
<div class="split size-full">
    <div id="split-editor" class=""></div>
    <div id="split-output" class="bg-green-700"></div>
</div>
`;

Split(["#split-editor", "#split-output"], {
  direction: "vertical",
});

new EditorView({
  doc: "printf('Hello, from web ide buddy!');",
  extensions: [basicSetup, oneDark],
  parent: document.getElementById("split-editor"),
});
