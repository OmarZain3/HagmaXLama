import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from './Button';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return <>{children}</>;

  const nav = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/players', label: 'Player Market' },
    { to: '/transfers', label: 'Transfers' },
    { to: '/leaderboard', label: 'Leaderboard' },
    ...(user.isAdmin ? [{ to: '/admin' as const, label: 'Admin' }] : []),
  ];

  const handleNavClick = () => {
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen font-poppins">
      <nav className="sticky top-0 z-10 bg-[#083F5E] border-b border-[#EECC4E]/30">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Hagma X Lamma Fantasy" className="h-10 w-10 rounded-lg object-contain" />
            <span className="text-[#EECC4E] font-bold text-lg">Hagma X Lamma</span>
          </Link>
          
          {/* Hamburger Button */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex md:hidden flex-col gap-1.5 p-2"
            aria-label="Toggle menu"
          >
            <span className={`block h-0.5 w-6 bg-[#EECC4E] transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block h-0.5 w-6 bg-[#EECC4E] transition-all ${menuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block h-0.5 w-6 bg-[#EECC4E] transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex flex-wrap items-center gap-2">
            {nav.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  location.pathname === to
                    ? 'bg-[#EECC4E] text-[#083F5E]'
                    : 'text-[#F8ECA7] hover:bg-[#EECC4E]/20'
                }`}
              >
                {label}
              </Link>
            ))}
            <Button variant="ghost" className="!py-1 text-sm" onClick={logout}>
              Log out
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden flex flex-col gap-2 bg-[#083F5E]/95 px-4 py-3 border-t border-[#EECC4E]/20">
            {nav.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={handleNavClick}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition block ${
                  location.pathname === to
                    ? 'bg-[#EECC4E] text-[#083F5E]'
                    : 'text-[#F8ECA7] hover:bg-[#EECC4E]/20'
                }`}
              >
                {label}
              </Link>
            ))}
            <Button 
              variant="ghost" 
              className="!py-2 text-sm justify-start" 
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
            >
              Log out
            </Button>
          </div>
        )}
      </nav>
      <main className="mx-auto max-w-4xl px-4 py-6 pb-24">{children}</main>
    </div>
  );
}
