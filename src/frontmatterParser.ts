/**
 * YAML Front Matter Parser
 * Detects and parses YAML front matter from document text.
 */

export interface FrontMatterInfo {
    /** Whether front matter was found */
    found: boolean;
    /** Raw YAML content (without delimiters) */
    rawYaml: string;
    /** Parsed key-value pairs */
    data: Record<string, unknown>;
    /** Start line of the opening '---' (0-based) */
    startLine: number;
    /** End line of the closing '---' (0-based) */
    endLine: number;
    /** Full raw block including delimiters */
    fullBlock: string;
}

const FRONTMATTER_REGEX = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/;

/**
 * Parse YAML front matter from document text.
 */
export function parseFrontMatter(text: string): FrontMatterInfo {
    const noResult: FrontMatterInfo = {
        found: false,
        rawYaml: '',
        data: {},
        startLine: 0,
        endLine: 0,
        fullBlock: '',
    };

    if (!text.startsWith('---')) {
        return noResult;
    }

    const match = FRONTMATTER_REGEX.exec(text);
    if (!match) {
        return noResult;
    }

    const fullBlock = match[0];
    const rawYaml = match[1];

    // Count lines
    const startLine = 0;
    const endLine = fullBlock.split(/\r?\n/).length - 1;

    // Simple YAML parser (handles common cases without heavy dependency)
    const data = parseSimpleYaml(rawYaml);

    return {
        found: true,
        rawYaml,
        data,
        startLine,
        endLine: Math.max(endLine - 1, startLine),
        fullBlock,
    };
}

/**
 * Simple YAML key-value parser for front matter.
 * Handles flat key: value pairs, simple arrays, and quoted strings.
 * For deeply nested YAML, falls back to showing raw text.
 */
function parseSimpleYaml(yaml: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const lines = yaml.split(/\r?\n/);

    let currentKey = '';
    let currentArray: string[] | null = null;

    for (const line of lines) {
        // Skip empty lines and comments
        if (!line.trim() || line.trim().startsWith('#')) {
            continue;
        }

        // Array item (  - value)
        const arrayMatch = line.match(/^\s+-\s+(.+)$/);
        if (arrayMatch && currentKey && currentArray) {
            currentArray.push(unquote(arrayMatch[1].trim()));
            result[currentKey] = currentArray;
            continue;
        }

        // Key: value pair
        const kvMatch = line.match(/^([a-zA-Z_][\w.-]*)\s*:\s*(.*)$/);
        if (kvMatch) {
            // Save previous array if any
            currentArray = null;

            currentKey = kvMatch[1];
            const rawValue = kvMatch[2].trim();

            if (rawValue === '' || rawValue === '|' || rawValue === '>') {
                // Could be start of array or multiline
                currentArray = [];
                result[currentKey] = rawValue || '';
            } else if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
                // Inline array: [a, b, c]
                const items = rawValue
                    .slice(1, -1)
                    .split(',')
                    .map((s) => unquote(s.trim()))
                    .filter(Boolean);
                result[currentKey] = items;
            } else {
                result[currentKey] = unquote(rawValue);
            }
        }
    }

    return result;
}

function unquote(s: string): string {
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
        return s.slice(1, -1);
    }
    return s;
}
