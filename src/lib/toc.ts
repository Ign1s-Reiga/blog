export interface TocEntry {
  id: string;
  text: string;
  level: number;
}

export function extractHeadings(html: string): TocEntry[] {
  const entries: TocEntry[] = [];
  const re = /<h([234])[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    // Strip anchor elements (class="anchor") then remaining tags
    const inner = m[3]
      .replace(/<a[^>]+class="[^"]*\banchor\b[^"]*"[^>]*>[\s\S]*?<\/a>/g, '')
      .replace(/<[^>]+>/g, '')
      .trim();
    if (inner) entries.push({ id: m[2], text: inner, level: parseInt(m[1]) });
  }
  return entries;
}
