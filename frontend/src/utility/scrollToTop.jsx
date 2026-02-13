import { NavLink } from 'react-router-dom';

/**
 * Scrolls the window to the top with smooth behavior.
 * Call this when user clicks a nav link so the new page starts at the top.
 */
export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * A NavLink that scrolls to top on click (smooth). Use instead of NavLink
 * for every nav link so the page scrolls to top on navigation.
 */
export function ScrollToTopNavLink({ onClick, children, ...props }) {
  return (
    <NavLink
      {...props}
      onClick={(e) => {
        scrollToTop();
        onClick?.(e);
      }}
    >
      {children}
    </NavLink>
  );
}
