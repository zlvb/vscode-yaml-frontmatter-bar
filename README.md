# YAML Front Matter Bar

> Display YAML front matter as a beautiful, styled info bar at the top of your Markdown preview.

![VS Code](https://img.shields.io/badge/VS%20Code-v1.60%2B-blue?logo=visualstudiocode)
![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-0.1.0-orange)

---

## ✨ Features

**YAML Front Matter Bar** automatically detects `---` delimited YAML front matter in Markdown files and renders it as a clean, readable info card at the top of the **Markdown Preview**.

- 🏷️ **Tag-style field display** — each key-value pair is shown as a compact, readable row
- 🎨 **Theme-aware styling** — seamlessly adapts to both light and dark themes
- 📐 **Responsive layout** — fields wrap gracefully on narrow viewports
- ⚡ **Performance optimized** — cached parsing avoids redundant processing on every keystroke

---

## 📦 Installation

### From Marketplace

Search for **YAML Front Matter Bar** in the Extensions view (`Ctrl+Shift+X`).

### From VSIX file

1. Open the Extensions view (`Ctrl+Shift+X`)
2. Click `···` at the top-right → **Install from VSIX...**
3. Select `yaml-frontmatter-bar-0.1.0.vsix`

---

## 🚀 Usage

Simply open any Markdown file that contains YAML front matter and open the **Markdown Preview** (`Ctrl+Shift+V` or `Ctrl+K V`):

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
3. **Renders** a styled info bar at the top of the Markdown preview

---

## 🧩 Supported YAML Patterns

| Pattern | Example | Display |
|---------|---------|---------|
| Simple key-value | `title: Hello` | `title: Hello` |
| Quoted strings | `title: "Hello World"` | `title: Hello World` |
| Inline arrays | `tags: [a, b, c]` | `tags: a, b, c` |
| Block arrays | `tags:`<br>`  - a`<br>`  - b` | `tags: a, b` |
| Boolean values | `draft: true` | `draft: true` |

---

## 🎨 Theme Support

The info bar uses VS Code's native theme variables, ensuring perfect integration with any color theme — including Dark+, Light+, One Dark Pro, Dracula, Solarized, GitHub Theme, and more.

---

## ⚙️ Extension Settings

This extension works out of the box with **zero configuration**.

---


**Enjoy!** 🎉
