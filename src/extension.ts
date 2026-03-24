/**
 * YAML Front Matter Bar — VS Code Extension
 *
 * Displays YAML front matter as a styled info bar at the top of Markdown preview.
 * Uses the markdown-it plugin API (extendMarkdownIt).
 */

import * as vscode from 'vscode';
import { yamlFrontMatterBarPlugin } from './markdownItPlugin';

export function activate(_context: vscode.ExtensionContext): { extendMarkdownIt: (md: any) => any } {
    return {
        extendMarkdownIt(md: any) {
            yamlFrontMatterBarPlugin(md);
            return md;
        }
    };
}

export function deactivate(): void {
    // Nothing to clean up
}
