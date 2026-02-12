/**
 * Scrolls the window to the top with smooth behavior.
 * Use with NavLink onClick so each navigation starts at the top of the page.
 */
export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
