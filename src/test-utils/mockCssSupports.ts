/**
 * JSdom doesn't implement CSS.supports
 * @ariakit/react (>= 0.4.34) calls for scrollbar-gutter detection when opening dialogs.
 * Stubbing it globally here
 */

if (typeof window.CSS === "undefined") {
  (window as any).CSS = {};
}
window.CSS.supports = () => false;

export default {};
