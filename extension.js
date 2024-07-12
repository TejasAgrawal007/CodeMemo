const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "extension.makeNotes",
    () => {
      const panel = vscode.window.createWebviewPanel(
        "makeNotes",
        "Make Notes",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );

      panel.webview.html = getWebviewContent();

      panel.webview.onDidReceiveMessage(
        (message) => {
          switch (message.command) {
            case "downloadNotes":
              saveNotesToFile(message.text);
              return;
            case "editFile":
              vscode.workspace
                .openTextDocument(
                  path.join(
                    vscode.workspace.rootPath || "",
                    "Notes",
                    "notes.txt"
                  )
                )
                .then((doc) => {
                  vscode.window.showTextDocument(doc);
                });
              return;
            case "changeFont":
              panel.webview.postMessage({
                command: "changeFont",
                font: message.font,
              });
              return;
          }
        },
        undefined,
        context.subscriptions
      );
    }
  );

  context.subscriptions.push(disposable);
}

function deactivate() {}

function getWebviewContent() {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Make Notes</title>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Poppins:wght@400;700&family=Courier+Prime:wght@400;700&family=Arial:wght@400;700&family=Times+New+Roman:wght@400;700&display=swap" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 p-6 font-roboto">
        <textarea id="notes" class="w-full h-64 p-4 text-gray-700 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" style="font-family: 'Roboto', sans-serif;"></textarea>
        <div class="mt-4 flex space-x-2">
            <button class="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700" onclick="downloadNotes()">Download Notes</button>
            <button class="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-700" onclick="changeColor('red')">Red</button>
            <button class="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700" onclick="changeColor('green')">Green</button>
            <button class="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700" onclick="changeColor('blue')">Blue</button>
            <button class="bg-purple-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-purple-700" onclick="editFile()">Edit File</button>
        </div>
        <div class="mt-4">
            <label for="fontSelect" class="block mb-2">Choose Font:</label>
            <select id="fontSelect" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" onchange="changeFont()">
                <option value="'Roboto', sans-serif">Roboto</option>
                <option value="'Poppins', sans-serif">Poppins</option>
                <option value="'Courier Prime', monospace">Courier Prime</option>
                <option value="'Arial', sans-serif">Arial</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
            </select>
        </div>
        <script>
            const vscode = acquireVsCodeApi();
            function downloadNotes() {
                const text = document.getElementById('notes').value;
                vscode.postMessage({
                    command: 'downloadNotes',
                    text: text
                });
            }

            function changeColor(color) {
                document.getElementById('notes').style.color = color;
            }

            function changeFont() {
                const font = document.getElementById('fontSelect').value;
                document.getElementById('notes').style.fontFamily = font;
                vscode.postMessage({
                    command: 'changeFont',
                    font: font
                });
            }

            function editFile() {
                vscode.postMessage({
                    command: 'editFile'
                });
            }
        </script>
    </body>
    </html>`;
}

// duvckjto2juie7tibzxmayl7cyzj2jx4x5n4nl57ypl5lompevkq

function saveNotesToFile(text) {
  const notesDir = path.join(vscode.workspace.rootPath || "", "Notes");
  if (!fs.existsSync(notesDir)) {
    fs.mkdirSync(notesDir);
  }
  const filePath = path.join(notesDir, "notes.txt");
  fs.writeFileSync(filePath, text, "utf8");
  vscode.window.showInformationMessage("Notes saved to Notes/notes.txt");
}

module.exports = {
  activate,
  deactivate,
};
