import { Link } from '@/i18n/routing';
import type { Category } from '@/lib/types';
import MegaMenu from './MegaMenu';
import MobileMenu from './MobileMenu';
import SearchBar from './SearchBar';
import LocaleSwitcher from './LocaleSwitcher';
import AccountMenu from './AccountMenu';
import CartButton from './CartButton';

export default function Header({ categoryTree }: { categoryTree: Category[] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <MobileMenu categoryTree={categoryTree} />
        <Link href="/" className="shrink-0 text-xl font-semibold tracking-tight">
          Lifestyle<span className="text-terra">&amp;</span>Home
        </Link>
        <nav className="hidden flex-1 lg:block"><MegaMenu categoryTree={categoryTree} /></nav>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden md:block"><SearchBar /></div>
          <LocaleSwitcher />
          <AccountMenu />
          <CartButton />
        </div>
      </div>
      <div className="px-4 pb-3 md:hidden"><SearchBar /></div>
    </header>
  );
}
