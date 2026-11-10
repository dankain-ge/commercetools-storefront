import 'server-only';
import { unstable_cache } from 'next/cache';
import { apiRoot } from './client';
import { mapCategory, buildCategoryTree } from '@/lib/mappers/category';
import type { Category, BreadcrumbItem } from '@/lib/types';

async function fetchCategoryTree(locale: string): Promise<Category[]> {
  const { body } = await apiRoot.categories().get({ queryArgs: { limit: 500, sort: 'orderHint asc' } }).execute();
  return buildCategoryTree(body.results.map((c) => mapCategory(c, locale)));
}

export const getCategoryTree = unstable_cache(fetchCategoryTree, ['category-tree'], { revalidate: 60 });

export async function getCategoryBySlug(slug: string, locale: string): Promise<Category | null> {
  const { body } = await apiRoot.categories()
    .get({ queryArgs: { where: `slug(${locale}="${slug.replace(/"/g, '')}")`, limit: 1 } })
    .execute();
  const c = body.results[0];
  return c ? mapCategory(c, locale) : null;
}

/** Walk the in-memory tree to find a category and its ancestors. No extra API calls. */
export function findCategoryPath(tree: Category[], id: string, trail: Category[] = []): Category[] | null {
  for (const c of tree) {
    if (c.id === id) return [...trail, c];
    const found = findCategoryPath(c.children, id, [...trail, c]);
    if (found) return found;
  }
  return null;
}

export function breadcrumbFor(tree: Category[], categoryId: string): BreadcrumbItem[] {
  const path = findCategoryPath(tree, categoryId) ?? [];
  return path.map((c) => ({ name: c.name, href: `/category/${c.slug}` }));
}
