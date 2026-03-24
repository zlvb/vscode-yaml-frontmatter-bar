/**
 * Webview Panel Provider
 * Creates a detailed webview panel for viewing front matter.
 */

import * as vscode from 'vscode';
import { FrontMatterInfo } from './frontmatterParser';

let currentPanel: vscode.WebviewPanel | undefined;

/**
 * Show or update the front matter detail panel.
 */
export function showFrontMatterPanel(
    context: vscode.ExtensionContext,
    info: FrontMatterInfo,
    fileName: string
): void {
    if (currentPanel) {
        currentPanel.reveal(vscode.ViewColumn.Beside);
        currentPanel.webview.html = getWebviewContent(info, fileName);
        return;
    }

    currentPanel = vscode.window.createWebviewPanel(
        'yamlFrontmatterBar.detail',
        `Front Matter: ${fileName}`,
        { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
        {
            enableScripts: true,
            retainContextWhenHidden: false,
        }
    );

    currentPanel.webview.html = getWebviewContent(info, fileName);

    currentPanel.webview.onDidReceiveMessage(
        (message) => {
            if (message.command === 'copy') {
                vscode.env.clipboard.writeText(info.rawYaml);
                vscode.window.showInformationMessage('Front matter copied to clipboard!');
            }
        },
        undefined,
        context.subscriptions
    );

    currentPanel.onDidDispose(() => {
        currentPanel = undefined;
    });
}

function getWebviewContent(info: FrontMatterInfo, fileName: string): string {
    const entries = Object.entries(info.data);

    const tableRows = entries
        .map(([key, value]) => {
            const displayValue = formatHtmlValue(value);
            return `<tr><td class="key">${escapeHtml(key)}</td><td class="value">${displayValue}</td></tr>`;
        })
        .join('\n');

    const rawYamlEscaped = escapeHtml(info.rawYaml);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
    <title>Front Matter: ${escapeHtml(fileName)}</title>
    <style>
        :root {
            --bg: var(--vscode-editor-background);
            --fg: var(--vscode-editor-foreground);
            --border: var(--vscode-panel-border);
            --accent: var(--vscode-textLink-foreground);
            --badge-bg: var(--vscode-badge-background);
            --badge-fg: var(--vscode-badge-foreground);
            --input-bg: var(--vscode-input-background);
            --hover: var(--vscode-list-hoverBackground);
        }

        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--fg);
            background: var(--bg);
            padding: 16px;
            margin: 0;
        }

        .header {
            display: flex;
            align-items: center;
            gap: 10px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--border);
            margin-bottom: 16px;
        }

        .header h2 {
            margin: 0;
            font-size: 1.2em;
            font-weight: 600;
        }

        .header .icon {
            font-size: 1.4em;
        }

        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 0.8em;
            background: var(--badge-bg);
            color: var(--badge-fg);
        }

        .section {
            margin-bottom: 20px;
        }

        .section-title {
            font-weight: 600;
            font-size: 0.95em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--accent);
            margin-bottom: 8px;
            cursor: pointer;
            user-select: none;
        }

        .section-title:hover {
            opacity: 0.8;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            border-radius: 4px;
            overflow: hidden;
        }

        th, td {
            text-align: left;
            padding: 6px 10px;
            border-bottom: 1px solid var(--border);
        }

        th {
            background: var(--input-bg);
            font-weight: 600;
            font-size: 0.85em;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        td.key {
            font-weight: 500;
            color: var(--accent);
            white-space: nowrap;
            width: 30%;
        }

        td.value {
            word-break: break-word;
        }

        tr:hover {
            background: var(--hover);
        }

        .raw-yaml {
            background: var(--input-bg);
            border: 1px solid var(--border);
            border-radius: 4px;
            padding: 12px;
            font-family: var(--vscode-editor-font-family);
            font-size: var(--vscode-editor-font-size);
            white-space: pre-wrap;
            word-break: break-word;
            line-height: 1.5;
            overflow-x: auto;
        }

        .actions {
            display: flex;
            gap: 8px;
            margin-top: 16px;
        }

        .btn {
            padding: 6px 14px;
            border: 1px solid var(--border);
            border-radius: 4px;
            background: var(--input-bg);
            color: var(--fg);
            cursor: pointer;
            font-size: 0.9em;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .btn:hover {
            background: var(--hover);
        }

        .collapsible-content {
            overflow: hidden;
            transition: max-height 0.3s ease;
        }

        .collapsed {
            max-height: 0 !important;
        }

        .meta {
            font-size: 0.8em;
            opacity: 0.6;
            margin-top: 16px;
        }
    </style>
</head>
<body>
    <div class="header">
        <span class="icon">⚙</span>
        <h2>Front Matter</h2>
        <span class="badge">${entries.length} field${entries.length !== 1 ? 's' : ''}</span>
        <span class="badge">${fileName}</span>
    </div>

    <div class="section">
        <div class="section-title" onclick="toggleSection('parsed')">
            ▼ Parsed Properties
        </div>
        <div id="parsed" class="collapsible-content">
            <table>
                <thead>
                    <tr><th>Key</th><th>Value</th></tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    </div>

    <div class="section">
        <div class="section-title" onclick="toggleSection('raw')">
            ▼ Raw YAML
        </div>
        <div id="raw" class="collapsible-content">
            <div class="raw-yaml">${rawYamlEscaped}</div>
        </div>
    </div>

    <div class="actions">
        <button class="btn" onclick="copyToClipboard()">📋 Copy YAML</button>
    </div>

    <div class="meta">
        Lines ${info.startLine + 1}–${info.endLine + 1} in document
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        function toggleSection(id) {
            const el = document.getElementById(id);
            const title = el.previousElementSibling;
            if (el.classList.contains('collapsed')) {
                el.classList.remove('collapsed');
                el.style.maxHeight = el.scrollHeight + 'px';
                title.textContent = title.textContent.replace('▶', '▼');
            } else {
                el.style.maxHeight = '0px';
                el.classList.add('collapsed');
                title.textContent = title.textContent.replace('▼', '▶');
            }
        }

        function copyToClipboard() {
            vscode.postMessage({ command: 'copy' });
        }

        // Set initial max-height for animations
        document.querySelectorAll('.collapsible-content').forEach(el => {
            el.style.maxHeight = el.scrollHeight + 'px';
        });
    </script>
</body>
</html>`;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatHtmlValue(value: unknown): string {
    if (Array.isArray(value)) {
        return value.map((v) => `<span class="badge">${escapeHtml(String(v))}</span>`).join(' ');
    }
    if (typeof value === 'boolean') {
        return `<span class="badge">${value}</span>`;
    }
    return escapeHtml(String(value));
}

export function disposeFrontMatterPanel(): void {
    currentPanel?.dispose();
    currentPanel = undefined;
}
