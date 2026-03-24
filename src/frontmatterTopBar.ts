/**
 * Front Matter Top Bar — WebviewViewProvider
 *
 * Renders a compact info bar showing YAML front matter fields.
 * This view is registered in package.json and can be dragged to
 * the top of the editor area (just below tabs) by the user.
 *
 * Updates automatically when the active file changes.
 */

import * as vscode from 'vscode';
import { FrontMatterInfo } from './frontmatterParser';

export class FrontMatterTopBarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'yamlFrontmatterBar.topBar';

    private _view?: vscode.WebviewView;
    private _currentInfo?: FrontMatterInfo;
    private _currentFileName?: string;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };

        // Handle messages from webview
        webviewView.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case 'copy':
                    if (this._currentInfo?.rawYaml) {
                        vscode.env.clipboard.writeText(
                            `---\n${this._currentInfo.rawYaml}\n---`
                        );
                        vscode.window.showInformationMessage('Front matter copied to clipboard!');
                    }
                    break;
                case 'showPanel':
                    vscode.commands.executeCommand('yamlFrontmatterBar.showPanel');
                    break;
                case 'toggleExpand':
                    // Re-render with toggled expand state
                    this._render();
                    break;
            }
        });

        // Render current state
        this._render();
    }

    /**
     * Update the top bar with new front matter info.
     */
    update(info: FrontMatterInfo | undefined, fileName?: string): void {
        this._currentInfo = info;
        this._currentFileName = fileName;
        this._render();
    }

    /**
     * Clear the top bar (no front matter).
     */
    clear(): void {
        this._currentInfo = undefined;
        this._currentFileName = undefined;
        this._render();
    }

    private _render(): void {
        if (!this._view) {
            return;
        }

        const info = this._currentInfo;
        const fileName = this._currentFileName || '';

        if (!info || !info.found) {
            this._view.webview.html = this._getEmptyHtml();
            // Collapse the view when no front matter
            this._view.description = '';
            this._view.title = 'Front Matter';
            return;
        }

        const entries = Object.entries(info.data);
        this._view.title = 'Front Matter';
        this._view.description = `${fileName} — ${entries.length} field${entries.length !== 1 ? 's' : ''}`;
        this._view.webview.html = this._getHtml(info, fileName);
    }

    private _getEmptyHtml(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-descriptionForeground);
            padding: 6px 12px;
            margin: 0;
            display: flex;
            align-items: center;
            min-height: 20px;
        }
        .empty {
            opacity: 0.5;
            font-style: italic;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <span class="empty">No YAML front matter detected</span>
</body>
</html>`;
    }

    private _getHtml(info: FrontMatterInfo, fileName: string): string {
        const entries = Object.entries(info.data);

        // Build compact tag-style display for each field
        const fieldTags = entries.map(([key, value]) => {
            const displayVal = this._formatValue(value);
            return `<span class="field" title="${this._escHtml(key)}: ${this._escHtml(String(value))}">
                <span class="key">${this._escHtml(key)}</span><span class="sep">:</span><span class="val">${this._escHtml(displayVal)}</span>
            </span>`;
        }).join('\n');

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-editor-foreground);
            padding: 4px 8px;
            margin: 0;
            overflow: hidden;
        }

        .bar {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 4px 6px;
            line-height: 1.6;
        }

        .icon {
            color: var(--vscode-textLink-foreground);
            font-weight: bold;
            font-size: 0.85em;
            margin-right: 2px;
            flex-shrink: 0;
        }

        .field {
            display: inline-flex;
            align-items: baseline;
            background: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            border-radius: 3px;
            padding: 1px 6px;
            font-size: 0.88em;
            line-height: 1.4;
            max-width: 260px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            cursor: default;
        }

        .field:hover {
            filter: brightness(1.15);
        }

        .key {
            font-weight: 600;
            color: var(--vscode-textLink-foreground);
            margin-right: 1px;
        }

        .sep {
            opacity: 0.5;
            margin-right: 3px;
        }

        .val {
            opacity: 0.85;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .actions {
            display: inline-flex;
            align-items: center;
            gap: 2px;
            margin-left: 4px;
            flex-shrink: 0;
        }

        .action-btn {
            background: none;
            border: none;
            color: var(--vscode-textLink-foreground);
            cursor: pointer;
            font-size: 0.82em;
            padding: 1px 4px;
            border-radius: 3px;
            opacity: 0.7;
        }

        .action-btn:hover {
            opacity: 1;
            background: var(--vscode-toolbar-hoverBackground);
        }
    </style>
</head>
<body>
    <div class="bar">
        <span class="icon">⚙ FM</span>
        ${fieldTags}
        <span class="actions">
            <button class="action-btn" onclick="copyFM()" title="Copy front matter to clipboard">📋</button>
            <button class="action-btn" onclick="showPanel()" title="Show detail panel">🔍</button>
        </span>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        function copyFM() { vscode.postMessage({ command: 'copy' }); }
        function showPanel() { vscode.postMessage({ command: 'showPanel' }); }
    </script>
</body>
</html>`;
    }

    private _formatValue(value: unknown): string {
        if (Array.isArray(value)) {
            if (value.length <= 3) {
                return value.join(', ');
            }
            return `${value.slice(0, 2).join(', ')}… +${value.length - 2}`;
        }
        const s = String(value);
        return s.length > 40 ? s.slice(0, 37) + '…' : s;
    }

    private _escHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
}
