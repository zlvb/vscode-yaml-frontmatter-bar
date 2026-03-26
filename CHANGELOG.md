# Changelog

All notable changes to the **YAML Front Matter Bar** extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-03-26

### Fixed

- 🐛 **Multi-line block scalar support** — properly parse YAML `>` (folded) and `|` (literal) block scalars in both Markdown preview and front matter parser
- 📝 **Description display** — multi-line `description` and other block scalar fields now render their full content instead of appearing empty

## [0.1.0] - 2026-03-24

### Added

- 📄 **Markdown Preview Info Bar** — YAML front matter is rendered as a styled card at the top of Markdown preview
- 🏷️ **Tag-style field display** — key-value pairs shown as compact badges with theme-aware colors
- ✏️ **Editor decorations** — visual "YAML Front Matter" banner on the `---` delimiter line
- 🔍 **Rich hover details** — hover over front matter to see a formatted property table
- 📌 **CodeLens actions** — toggle visibility and copy front matter from inline code lenses
- 📋 **Copy to clipboard** — quickly copy raw YAML front matter
- 🗂️ **Detail panel** — dedicated side panel with full parsed properties and raw YAML view
- 🎨 **Theme support** — seamless light/dark theme integration using VS Code theme variables
- ⚡ **Performance caching** — parsed results are cached to avoid redundant processing
- 📝 **Comprehensive YAML support** — handles simple values, quoted strings, inline arrays, block arrays, and nested keys
