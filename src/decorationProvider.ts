/**
 * Decoration Provider
 * Manages editor decorations for YAML front matter display.
 */

import * as vscode from 'vscode';
import { FrontMatterInfo } from './frontmatterParser';

// Decoration type for the front matter banner line
let bannerDecorationType: vscode.TextEditorDecorationType | undefined;
// Decoration type for dimming the YAML content
let dimDecorationType: vscode.TextEditorDecorationType | undefined;
// Decoration type for the closing delimiter
let closingDecorationType: vscode.TextEditorDecorationType | undefined;

function ensureDecorationTypes() {
    if (!bannerDecorationType) {
        bannerDecorationType = vscode.window.createTextEditorDecorationType({
            isWholeLine: true,
            overviewRulerColor: new vscode.ThemeColor('yamlFrontmatterBar.bannerAccent'),
            overviewRulerLane: vscode.OverviewRulerLane.Left,
            before: {
                contentText: ' ⚙ YAML Front Matter',
                color: new vscode.ThemeColor('yamlFrontmatterBar.bannerForeground'),
                backgroundColor: new vscode.ThemeColor('yamlFrontmatterBar.bannerBackground'),
                fontStyle: 'normal',
                fontWeight: 'bold',
                margin: '0 8px 0 0',
                textDecoration: ';padding:2px 10px;border-radius:3px;font-size:0.85em',
            },
        });
    }

    if (!dimDecorationType) {
        dimDecorationType = vscode.window.createTextEditorDecorationType({
            isWholeLine: true,
            backgroundColor: new vscode.ThemeColor('yamlFrontmatterBar.contentBackground'),
            border: '1px solid',
            borderColor: new vscode.ThemeColor('yamlFrontmatterBar.borderColor'),
        });
    }

    if (!closingDecorationType) {
        closingDecorationType = vscode.window.createTextEditorDecorationType({
            isWholeLine: true,
            backgroundColor: new vscode.ThemeColor('yamlFrontmatterBar.contentBackground'),
            after: {
                contentText: '  ▲ End of Front Matter',
                color: new vscode.ThemeColor('yamlFrontmatterBar.bannerForeground'),
                fontStyle: 'italic',
                fontWeight: 'normal',
                textDecoration: ';font-size:0.8em;opacity:0.7',
            },
        });
    }
}

/**
 * Apply decorations to show front matter bar in editor.
 */
export function applyDecorations(
    editor: vscode.TextEditor,
    info: FrontMatterInfo,
    collapsed: boolean
): void {
    ensureDecorationTypes();

    if (!info.found) {
        clearDecorations(editor);
        return;
    }

    // Banner on the opening '---' line
    const bannerRange = new vscode.Range(info.startLine, 0, info.startLine, 3);
    editor.setDecorations(bannerDecorationType!, [
        {
            range: bannerRange,
            hoverMessage: buildHoverMessage(info),
        },
    ]);

    if (collapsed) {
        // When collapsed, dim the entire front matter block
        if (info.endLine > info.startLine + 1) {
            const dimRange = new vscode.Range(info.startLine + 1, 0, info.endLine, 3);
            editor.setDecorations(dimDecorationType!, [{ range: dimRange }]);
        }
        // Closing delimiter annotation
        const closingRange = new vscode.Range(info.endLine, 0, info.endLine, 3);
        editor.setDecorations(closingDecorationType!, [{ range: closingRange }]);
    } else {
        // When expanded, show content background and closing marker
        if (info.endLine > info.startLine + 1) {
            const contentRange = new vscode.Range(info.startLine + 1, 0, info.endLine, 3);
            editor.setDecorations(dimDecorationType!, [{ range: contentRange }]);
        }
        const closingRange = new vscode.Range(info.endLine, 0, info.endLine, 3);
        editor.setDecorations(closingDecorationType!, [{ range: closingRange }]);
    }
}

/**
 * Clear all front matter decorations.
 */
export function clearDecorations(editor: vscode.TextEditor): void {
    if (bannerDecorationType) {
        editor.setDecorations(bannerDecorationType, []);
    }
    if (dimDecorationType) {
        editor.setDecorations(dimDecorationType, []);
    }
    if (closingDecorationType) {
        editor.setDecorations(closingDecorationType, []);
    }
}

/**
 * Dispose all decoration types.
 */
export function disposeDecorations(): void {
    bannerDecorationType?.dispose();
    dimDecorationType?.dispose();
    closingDecorationType?.dispose();
    bannerDecorationType = undefined;
    dimDecorationType = undefined;
    closingDecorationType = undefined;
}

/**
 * Build rich hover message for front matter.
 */
function buildHoverMessage(info: FrontMatterInfo): vscode.MarkdownString {
    const md = new vscode.MarkdownString();
    md.isTrusted = true;
    md.supportHtml = true;

    md.appendMarkdown('### 📋 YAML Front Matter\n\n');
    md.appendMarkdown('---\n\n');

    // Show parsed key-value pairs as a table
    const entries = Object.entries(info.data);
    if (entries.length > 0) {
        md.appendMarkdown('| Key | Value |\n');
        md.appendMarkdown('|-----|-------|\n');
        for (const [key, value] of entries) {
            const displayValue = formatValue(value);
            md.appendMarkdown(`| \`${key}\` | ${displayValue} |\n`);
        }
        md.appendMarkdown('\n---\n\n');
    }

    // Show raw YAML in code block
    md.appendMarkdown('<details><summary>Raw YAML</summary>\n\n');
    md.appendCodeblock(info.rawYaml, 'yaml');
    md.appendMarkdown('\n</details>\n\n');

    md.appendMarkdown(
        '_Click the $(symbol-property) button in editor title to toggle • [Copy to clipboard](command:yamlFrontmatterBar.copyFrontmatter)_'
    );

    return md;
}

function formatValue(value: unknown): string {
    if (Array.isArray(value)) {
        return value.map((v) => `\`${v}\``).join(', ');
    }
    if (typeof value === 'string' && value.length > 60) {
        return `\`${value.slice(0, 57)}...\``;
    }
    return `\`${String(value)}\``;
}
