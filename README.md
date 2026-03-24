# YAML Front Matter Bar

> Display YAML front matter as a beautiful, styled info bar at the top of your Markdown preview.

![VS Code](https://img.shields.io/badge/VS%20Code-v1.60%2B-blue?logo=visualstudiocode)
![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-0.1.0-orange)

---

## ✨ Features

**YAML Front Matter Bar** enhances your Markdown editing experience by turning raw YAML front matter into a clean, readable info bar — both in the **Markdown Preview** and the **editor itself**.

### 📄 Markdown Preview Info Bar

Front matter fields are rendered as a styled card at the top of the Markdown preview, with:

- 🏷️ **Tag-style field display** — each key-value pair is shown as a compact badge
- 🎨 **Theme-aware styling** — seamlessly adapts to both light and dark VS Code themes
- 📐 **Responsive layout** — fields wrap gracefully on narrow viewports

### ✏️ Editor Enhancements

- **Inline decorations** — the `---` delimiter line gets a visual "YAML Front Matter" banner
- **Hover details** — hover over the front matter block to see a rich, formatted table of all properties
- **CodeLens actions** — toggle visibility and copy front matter from inline code lenses

### 🔧 Additional Capabilities

- **Copy to clipboard** — quickly copy the raw front matter YAML
- **Detail panel** — open a dedicated side panel with full parsed properties and raw YAML view
- **Performance optimized** — cached parsing avoids redundant processing on every keystroke

---

## 📦 Installation

### From VS Code Marketplace

1. Open **Extensions** sidebar (`Ctrl+Shift+X`)
2. Search for **"YAML Front Matter Bar"**
3. Click **Install**

### From VSIX file

```bash
code --install-extension yaml-frontmatter-bar-0.1.0.vsix
```

---

## 🚀 Usage

Simply open any Markdown file that contains YAML front matter:

```markdown
---
title: My Blog Post
date: 2024-12-01
tags: [javascript, web, tutorial]
author: John Doe
draft: false
---

# Hello World

Your markdown content here...
```

The extension automatically:

1. **Detects** the `---` delimited YAML front matter block
2. **Parses** key-value pairs, arrays, and nested values
3. **Renders** a styled info bar in the Markdown preview
4. **Decorates** the editor with visual indicators

---

## 🧩 Supported YAML Patterns

| Pattern | Example | Display |
|---------|---------|---------|
| Simple key-value | `title: Hello` | `title: Hello` |
| Quoted strings | `title: "Hello World"` | `title: Hello World` |
| Inline arrays | `tags: [a, b, c]` | `tags: a, b, c` |
| Block arrays | `tags:`<br>`  - a`<br>`  - b` | `tags: a, b` |
| Boolean values | `draft: true` | `draft: true` |
| Nested keys | `author.name: John` | `author.name: John` |

---

## ⚙️ Extension Settings

This extension currently works out of the box with **zero configuration**.

Future releases may include customizable options for:

- Field visibility filters
- Custom color themes
- Bar position preferences
- Field sorting order

---

## 🎨 Theme Support

The extension uses VS Code's native theme variables, ensuring perfect integration with:

- ✅ Default Dark+ / Light+
- ✅ One Dark Pro
- ✅ Dracula
- ✅ Solarized
- ✅ GitHub Theme
- ✅ Any custom theme

---

## 📋 Commands

| Command | Description |
|---------|-------------|
| `YAML Front Matter: Toggle` | Show/hide the front matter display |
| `YAML Front Matter: Copy` | Copy front matter YAML to clipboard |
| `YAML Front Matter: Show Panel` | Open the detail panel |

---

## 🛠️ Development

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [VS Code](https://code.visualstudio.com/) >= 1.60.0

### Build from source

```bash
git clone https://github.com/zlvb/vscode-yaml-frontmatter-bar.git
cd vscode-yaml-frontmatter-bar
npm install
npm run compile
```

### Package as VSIX

```bash
npm run package
```

### Project Structure

```
├── src/
│   ├── extension.ts           # Extension entry point
│   ├── markdownItPlugin.ts    # markdown-it plugin for preview rendering
│   ├── frontmatterParser.ts   # YAML front matter parser
│   ├── frontmatterTopBar.ts   # WebviewView provider for top bar
│   ├── decorationProvider.ts  # Editor decoration manager
│   ├── codeLensProvider.ts    # CodeLens provider
│   └── webviewPanel.ts        # Detail panel webview
├── media/
│   ├── icon.png               # Extension icon
│   └── markdown-preview.css   # Preview styles
├── dist/                      # Compiled output
├── package.json
└── tsconfig.json
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a [Pull Request](https://github.com/zlvb/vscode-yaml-frontmatter-bar/pulls).

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🐛 Issues

Found a bug or have a feature request? Please [open an issue](https://github.com/zlvb/vscode-yaml-frontmatter-bar/issues).

---

**Enjoy!** 🎉
