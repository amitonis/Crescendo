import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface NavItem {
  to: string;
  label: string;
}

export default function Navbar() {
  const { isAuthenticated, isArtist, isFan, isAdmin, user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 2);
    onScroll();
    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = [{ to: '/marketplace', label: 'Marketplace' }];

    if (isArtist) {
      items.push({ to: '/dashboard', label: 'Dashboard' });
    }

    if (isFan) {
      items.push({ to: '/collection', label: 'My Collection' });
    }

    if (isAdmin) {
      items.push({ to: '/admin', label: 'Admin' });
    }

    return items;
  }, [isAdmin, isArtist, isFan]);

  const activeClass = 'text-[#1A1A1A] border-b-2 border-[#1DA0C3]';
  const baseClass = 'px-2 py-1 text-sm font-medium text-[#666660] hover:text-[#1A1A1A] transition-colors';

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header
      className={`sticky top-0 z-40 bg-white border-b border-[#E0E0D8] transition-shadow ${isScrolled ? 'shadow-sm' : ''}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center" onClick={closeMobileMenu}>
          <span
            style={{
              background: 'linear-gradient(135deg, #A8A9AD, #D4D5D9, #6B6C70)',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              fontWeight: 700,
            }}
            className="text-xl tracking-tight"
          >
            Crescendo
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `${baseClass} ${isActive ? activeClass : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!isAuthenticated && (
            <>
              <Link
                to="/login"
                className="rounded-md border border-[#C9C9BF] px-4 py-2 text-sm font-medium text-[#1A1A1A] hover:bg-[#F5F5F2]"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-[#1DA0C3] px-4 py-2 text-sm font-medium text-white hover:bg-[#1689A6]"
              >
                Sign Up
              </Link>
            </>
          )}

          {isAuthenticated && user && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-[#E0E0D8] px-2 py-1">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E7ECEE] text-xs font-semibold text-[#1A1A1A]">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="max-w-24 truncate text-sm text-[#33332E]">{user.username}</span>
              </div>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="rounded-md border border-[#C9C9BF] px-4 py-2 text-sm font-medium text-[#1A1A1A] hover:bg-[#F5F5F2]"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="rounded-md p-2 text-[#1A1A1A] hover:bg-[#F5F5F2] md:hidden"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-[#E0E0D8] bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMobileMenu}
                className={({ isActive }) => `rounded-md px-3 py-2 text-sm ${isActive ? 'bg-[#EEF6F8] text-[#1DA0C3]' : 'text-[#1A1A1A] hover:bg-[#F5F5F2]'}`}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="mt-4 border-t border-[#E0E0D8] pt-4">
            {!isAuthenticated && (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="flex-1 rounded-md border border-[#C9C9BF] px-4 py-2 text-center text-sm font-medium text-[#1A1A1A]"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="flex-1 rounded-md bg-[#1DA0C3] px-4 py-2 text-center text-sm font-medium text-white"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {isAuthenticated && user && (
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-sm text-[#33332E]">{user.username}</span>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="rounded-md border border-[#C9C9BF] px-4 py-2 text-sm font-medium text-[#1A1A1A]"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
