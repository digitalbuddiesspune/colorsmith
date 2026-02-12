import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import CategoriesDropdown from "./CategoriesDropdown";
import  Logo  from "../assets/logo.png";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [authModal, setAuthModal] = useState(null);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ⭐ Scroll Navbar Logic
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      // ignore tiny scrolls
      if (Math.abs(currentScroll - lastScrollY.current) < 10) return;

      if (currentScroll > lastScrollY.current && currentScroll > 80) {
        setShowNavbar(false); // scroll DOWN
      } else {
        setShowNavbar(true); // scroll UP
      }

      lastScrollY.current = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setAccountDropdownOpen(false);
    navigate("/");
  };

  const openLogin = () => setAuthModal("login");
  const closeAuthModal = () => setAuthModal(null);

  const scrollToSection = (sectionId) => {
    if (location.pathname === "/") {
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-brand-500/15 text-brand-600"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    }`;

  return (
    <>
      {/* ⭐ UPDATED HEADER */}
      <header
        className={` bg-black fixed top-0 left-0 w-full z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-sm transform transition-transform duration-300 ${
          showNavbar ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-0">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
             <img src={Logo} alt="Color Smith" className="h-10" />
              
            </Link>

            <nav className="hidden sm:flex items-center gap-1">
              <button
                onClick={() => scrollToSection("hero")}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                Home
              </button>

              <button
                onClick={() => scrollToSection("categories")}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                Categories
              </button>

              <NavLink to="/catalog" className={navLinkClass}>
                Catalog
              </NavLink>

              <NavLink to="/color-tools" className={navLinkClass}>
                Color Tools
              </NavLink>
            </nav>

            <div className="flex items-center lg:gap-3 gap-1">
              <Link
                to="/cart"
                className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                🛒
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() =>
                      setAccountDropdownOpen(!accountDropdownOpen)
                    }
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                      <span className="text-slate-100 text-sm font-medium">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                  </button>

                  {accountDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2">
                      <Link
                        to="/account"
                        className="block px-4 py-2 hover:bg-slate-50"
                      >
                        My Account
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={openLogin}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-500 text-white hover:bg-amber-600"
                >
                  Log in
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ⭐ IMPORTANT: Prevent content hiding behind fixed navbar */}
      <div className="h-16" />

      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={closeAuthModal}
          onSuccess={closeAuthModal}
        />
      )}
    </>
  );
}
