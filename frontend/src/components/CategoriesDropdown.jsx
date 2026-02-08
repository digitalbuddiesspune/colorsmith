import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const categories = [
  'Nail Lacquers',
  'Liquid Lipstick',
  'Lip Gloss',
  'Eyeliner',
  'Mascara',
  'Face Primer',
  'Nail Remover',
  'Traditional Sindoor',
  'Raw Materials',
];

export default function CategoriesDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [openedByClick, setOpenedByClick] = useState(false);
  const containerRef = useRef(null);
  const { pathname } = useLocation();
  const isCategoriesPage = pathname === '/categories';

  // Close on click outside when opened by click
  useEffect(() => {
    if (!openedByClick || !isOpen) return;
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setOpenedByClick(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openedByClick, isOpen]);

  const openByHover = () => {
    setOpenedByClick(false);
    setIsOpen(true);
  };

  const closeByLeave = () => {
    if (!openedByClick) setIsOpen(false);
  };

  const toggleByClick = (e) => {
    e.preventDefault();
    setOpenedByClick(true);
    setIsOpen((prev) => !prev);
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={openByHover}
      onMouseLeave={closeByLeave}
    >
      <button
        type="button"
        onClick={toggleByClick}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isOpen || isCategoriesPage ? 'bg-brand-500/15 text-brand-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        Categories
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-full pt-1 min-w-[220px]"
          onMouseEnter={openByHover}
          onMouseLeave={closeByLeave}
        >
          <div className="rounded-xl border border-slate-200 bg-white shadow-lg py-2">
            {categories.map((name) => (
              <Link
                key={name}
                to="/catalog"
                className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                onClick={() => {
                  setIsOpen(false);
                  setOpenedByClick(false);
                }}
              >
                {name}
              </Link>
            ))}
            <div className="border-t border-slate-100 mt-1 pt-1">
              <Link
                to="/categories"
                className="block px-4 py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-50"
                onClick={() => {
                  setIsOpen(false);
                  setOpenedByClick(false);
                }}
              >
                View all categories →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
