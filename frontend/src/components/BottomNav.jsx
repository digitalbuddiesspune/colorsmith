import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import AuthModal from './AuthModal';

export default function BottomNav() {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [authModal, setAuthModal] = useState(null);

  const isHome = location.pathname === '/';

  const goHome = () => {
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const handleAccountClick = () => {
    if (user) {
      navigate('/account');
    } else {
      setAuthModal('login');
    }
  };

  const base = 'flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[11px] font-medium transition-colors relative';
  const active = 'text-amber-500';
  const inactive = 'text-slate-400';

  return (
    <>
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-[#FFF8F0] border-t border-[#F0E6D6] shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
        <div className="flex items-stretch h-16 max-w-lg mx-auto px-2">
          {/* Home */}
          <button
            type="button"
            onClick={goHome}
            className={`${base} ${isHome ? active : inactive}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span>Home</span>
          </button>

          {/* Catalog */}
          <NavLink
            to="/catalog"
            className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            <span>Catalog</span>
          </NavLink>

          {/* Cart */}
          <NavLink
            to="/cart"
            className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
          >
            <span className="relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white px-1">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </span>
            <span>Cart</span>
          </NavLink>

          {/* Orders */}
          <NavLink
            to="/orders"
            className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
            <span>Orders</span>
          </NavLink>

          {/* Account */}
          <button
            type="button"
            onClick={handleAccountClick}
            className={`${base} ${
              ['/account', '/orders', '/my-color-sets'].some((p) => location.pathname.startsWith(p)) && user
                ? active
                : inactive
            }`}
          >
            {user ? (
              <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-semibold">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            )}
            <span>{user ? 'Account' : 'Log in'}</span>
          </button>
        </div>

        {/* Safe area padding for phones with home indicator */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>

      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onSuccess={() => setAuthModal(null)}
        />
      )}
    </>
  );
}
