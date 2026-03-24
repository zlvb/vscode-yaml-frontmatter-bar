/**
 * CodeLens Provider
 * Provides CodeLens items at the top of documents with front matter.
 */

import * as vscode from 'vscode';
import { FrontMatterInfo } from './frontmatterParser';

export class FrontMatterCodeLensProvider implements vscode.CodeLensProvider {
    private _onDidChangeCodeLenses = new vscode.EventEmitter<void>();
    readonly onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;

    private currentInfo: FrontMatterInfo | undefined;
    private collapsed = false;

    update(info: FrontMatterInfo, collapsed: boolean): void {
        this.currentInfo = info;
        this.collapsed = collapsed;
        this._onDidChangeCodeLenses.fire();
    }

    provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
        if (!this.currentInfo?.found) {
            return [];
        }

        const info = this.currentInfo;
        const topRange = new vscode.Range(0, 0, 0, 0);

        const lenses: vscode.CodeLens[] = [];

        // Toggle lens
        lenses.push(
            new vscode.CodeLens(topRange, {
                title: this.collapsed
                    ? '$(chevron-right) Show Front Matter'
                    : '$(chevron-down) Hide Front Matter',
                command: 'yamlFrontmatterBar.toggle',
                tooltip: 'Toggle YAML Front Matter visibility',
            })
        );

        // Copy lens
        lenses.push(
            new vscode.CodeLens(topRange, {
                title: '$(copy) Copy',
                command: 'yamlFrontmatterBar.copyFrontmatter',
                tooltip: 'Copy front matter to clipboard',
            })
        );

        // Show summary of key-value pairs
        if (!this.collapsed) {
            const entries = Object.entries(info.data);
            const summary = entries
                .slice(0, 5)
                .map(([k, v]) => {
                    const val = Array.isArray(v) ? `[${v.length} items]` : truncate(String(v), 30);
                    return `${k}: ${val}`;
                })
                .join('  •  ');

            if (summary) {
                lenses.push(
                    new vscode.CodeLens(topRange, {
                        title: `$(info) ${summary}${entries.length > 5 ? '  …' : ''}`,
                        command: '',
                        tooltip: 'Front matter properties',
                    })
                );
            }
        }

        return lenses;
    }

    dispose(): void {
        this._onDidChangeCodeLenses.dispose();
    }
}

function truncate(s: string, max: number): string {
    return s.length > max ? s.slice(0, max - 1) + '…' : s;
}
