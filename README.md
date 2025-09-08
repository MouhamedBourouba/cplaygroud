# web-ide
A c-playgroud made with [picoc-web](https://github.com/MouhamedBourouba/picoc-web)

<!-- ## 1. Introduction -->
<!-- - **What is the purpose of this project?**   -->
<!-- self-hostable solution for educational institutions to manage software development practical work sessions by providing consistent, controlled, and pre-configured environments from any device. -->
<!---->
<!-- - **What problem does it solve?**   -->
<!--   - Infrastructure management (maintaining multiple physical computers). -->
<!--   - Environment inconsistency (“It works on my machine”). -->
<!-- --- -->
<!---->
<!-- ## 2. System Overview -->
<!-- - **key features**   -->
<!--   - Code Editing and excution: Run code in browser with lsp support ("Language Servers"). -->
<!--   - Terminal sessions: Access an interactive terminal connected to excution enviroment. -->
<!-- - **Main Components:** -->
<!--   - **Frontend (Web UI)**: Browser-based IDE built with React, Monaco Editor, and xterm.js.   -->
<!--   - **Backend API**: Go-based server for handling requests.   -->
<!--   - **Execution Service**: Docker-based sandbox for running user code securely.   -->
<!-- --- -->
<!---->
<!-- ## 3. Functional Requirements -->
<!-- - **FR1**: Create, open, edit, and save files directly in the browser.   -->
<!-- - **FR2**: Provide syntax highlighting, autocompletion, and other language features via **Language Server Protocol (LSP)**.   -->
<!-- - **FR3**: Execute code securely inside sandboxed env.   -->
<!-- - **FR4**: Allow administrators/instructors to preconfigure docker images with dependencies and tools.   -->
<!-- - **FR5**: Provide an interactive terminal connected to the execution environment.   -->
<!-- - **FR6**: Store user files and projects persistently. -->
<!-- - **FR7**: Display real-time output of code execution. -->
<!-- --- -->
