export interface Frontmatter {
  tags: string[];
  posted?: string;
  updated?: string;
}

/**
 * Parses a YAML-lite frontmatter block delimited by `---`.
 * Only `tags:` is extracted; the rest of the block is ignored.
 *
 * Supported formats:
 *   tags: foo bar baz
 *   tags: foo, bar, baz
 */
export function parseFrontmatter(markdown: string): { frontmatter: Frontmatter; body: string } {
  const empty: Frontmatter = { tags: [] };

  if (!markdown.startsWith('---')) return { frontmatter: empty, body: markdown };

  const end = markdown.indexOf('\n---', 3);
  if (end === -1) return { frontmatter: empty, body: markdown };

  const block = markdown.slice(3, end);
  const body = markdown.slice(end + 4).trimStart();

  const tagsMatch = block.match(/^tags:\s*(.+)$/m);
  const tags = tagsMatch
    ? tagsMatch[1]
        .split(/[\s,]+/)
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const posted = block.match(/^posted:\s*(.+)$/m)?.[1].trim();
  const updated = block.match(/^updated:\s*(.+)$/m)?.[1].trim();

  return { frontmatter: { tags, posted, updated }, body };
}
