import type { Category as CtCategory } from '@commercetools/platform-sdk';
import type { Category } from '@/lib/types';
import { getLocalizedString } from '@/lib/utils';

export function mapCategory(c: CtCategory, locale: string): Category {
  return {
    id: c.id,
    key: c.key,
    name: getLocalizedString(c.name, locale),
    slug: getLocalizedString(c.slug, locale),
    parentId: c.parent?.id,
    children: [],
  };
}

/** Nest a flat list (already sorted by orderHint) into a tree of root categories. */
export function buildCategoryTree(flat: Category[]): Category[] {
  const byId = new Map(flat.map((c) => [c.id, { ...c, children: [] as Category[] }]));
  const roots: Category[] = [];
  for (const c of byId.values()) {
    if (c.parentId && byId.has(c.parentId)) byId.get(c.parentId)!.children.push(c);
    else roots.push(c);
  }
  return roots;
}
