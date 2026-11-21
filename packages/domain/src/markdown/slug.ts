const LIGATURE_MAP: Record<string, string> = {
  ß: 'ss',
  æ: 'ae',
  Æ: 'ae',
  œ: 'oe',
  Œ: 'oe',
  ø: 'o',
  Ø: 'o',
  đ: 'd',
  Đ: 'd',
  ł: 'l',
  Ł: 'l',
};

export function slugifyTitle(title: string): string {
  const expanded = title.replace(/[ßæÆœŒøØđĐłŁ]/g, (char) => LIGATURE_MAP[char] ?? char);
  const ascii = expanded
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  const slug = ascii.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return slug.length > 0 ? slug : 'untitled';
}
