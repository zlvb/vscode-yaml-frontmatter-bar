/**
 * markdown-it plugin for YAML Front Matter Bar
 *
 * Parses YAML front matter and injects a styled info bar into the token stream.
 * Uses markdown-it's core ruler API for VS Code Markdown preview compatibility.
 */

// --- Performance: cache to avoid re-parsing identical source ---
let _cachedSrc = '';
let _cachedHtml = '';

function yamlFmBarPlugin(md: any): void {
    md.core.ruler.push('yaml_fm_bar', function (state: any) {
        const src = state.src;
        if (!src || !src.startsWith('---')) { return; }

        // Cache hit — skip re-parsing
        if (src === _cachedSrc && _cachedHtml) {
            const token = new state.Token('html_block', '', 0);
            token.content = _cachedHtml;
            token.map = [0, 0];
            state.tokens.unshift(token);
            return;
        }

        const fmInfo = extractFrontMatter(src);
        if (!fmInfo) { return; }

        const barHtml = buildFrontMatterBar(fmInfo);

        // Update cache
        _cachedSrc = src;
        _cachedHtml = barHtml;

        const token = new state.Token('html_block', '', 0);
        token.content = barHtml;
        token.map = [0, 0];
        state.tokens.unshift(token);
    });
}

export { yamlFmBarPlugin as yamlFrontMatterBarPlugin };

// --- Types ---
interface FMField { key: string; value: string; }
interface FMInfo  { fields: FMField[]; }

// --- Pre-compiled regex (avoid per-call compilation) ---
const RE_FM_BLOCK = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;
const RE_ARRAY_ITEM = /^\s+-\s+(.+)$/;
const RE_KV_PAIR = /^([a-zA-Z_][\w.-]*)\s*:\s*(.*)$/;
const RE_NEWLINE = /\r?\n/;

function extractFrontMatter(text: string): FMInfo | null {
    let t = text;
    if (t.charCodeAt(0) === 0xFEFF) { t = t.slice(1); }
    if (!t.startsWith('---')) { return null; }

    const match = RE_FM_BLOCK.exec(t);
    if (!match) { return null; }

    const fields: FMField[] = [];
    const lines = match[1].split(RE_NEWLINE);

    let currentKey = '';
    let currentArrayItems: string[] = [];
    let inArray = false;

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.charCodeAt(0) === 35 /* # */) { continue; }

        if (inArray && currentKey) {
            const am = RE_ARRAY_ITEM.exec(line);
            if (am) { currentArrayItems.push(am[1].trim()); continue; }
            // Flush
            fields.push({ key: currentKey, value: currentArrayItems.join(', ') });
            currentArrayItems = [];
            inArray = false;
        }

        const kv = RE_KV_PAIR.exec(line);
        if (kv) {
            currentKey = kv[1];
            const raw = kv[2].trim();

            if (raw === '' || raw === '|' || raw === '>') {
                inArray = true;
                currentArrayItems = [];
            } else if (raw.charCodeAt(0) === 91 /* [ */ && raw.charCodeAt(raw.length - 1) === 93 /* ] */) {
                const items = raw.slice(1, -1).split(',').map(s => unquote(s.trim())).filter(Boolean);
                fields.push({ key: currentKey, value: items.join(', ') });
            } else {
                fields.push({ key: currentKey, value: unquote(raw) });
            }
        }
    }

    if (inArray && currentKey && currentArrayItems.length > 0) {
        fields.push({ key: currentKey, value: currentArrayItems.join(', ') });
    }

    return fields.length > 0 ? { fields } : null;
}

function unquote(s: string): string {
    const c = s.charCodeAt(0);
    if ((c === 34 || c === 39) && s.charCodeAt(s.length - 1) === c) {
        return s.slice(1, -1);
    }
    return s;
}

// --- HTML escape using a single replace pass ---
const ESC_MAP: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const RE_ESC = /[&<>"]/g;
function esc(text: string): string {
    return text.replace(RE_ESC, ch => ESC_MAP[ch]);
}

function buildFrontMatterBar(info: FMInfo): string {
    // Each field on its own row — using a simple table-like layout
    const rows = info.fields.map(f =>
        `<div style="display:flex;align-items:baseline;padding:2px 0;min-width:0;">` +
        `<span style="flex-shrink:0;font-weight:600;color:#3794ff;margin-right:2px;">${esc(f.key)}</span>` +
        `<span style="flex-shrink:0;opacity:0.5;margin-right:6px;">:</span>` +
        `<span style="opacity:0.85;word-break:break-word;">${esc(f.value)}</span>` +
        `</div>`
    ).join('\n');

    return `<div style="margin:0 0 16px 0;border:1px solid rgba(128,128,128,0.35);border-radius:6px;overflow:hidden;font-family:var(--vscode-font-family,sans-serif);font-size:0.9em;background:rgba(127,127,127,0.1);">
<div style="display:flex;align-items:center;gap:6px;padding:6px 12px;background:rgba(60,60,120,0.15);border-bottom:1px solid rgba(128,128,128,0.2);user-select:none;">
<span style="font-size:1.1em;">\u2699</span>
<span style="font-weight:600;color:#3794ff;font-size:0.92em;">YAML Front Matter</span>
</div>
<div style="display:flex;flex-direction:column;gap:1px;padding:8px 12px;line-height:1.5;">
${rows}
</div>
</div>\n`;
}
