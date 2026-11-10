import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NAV_LINKS } from "../data/site.js";
import { useScrollState } from "../hooks/useReveal.js";

/** Which section is currently in view (for the active nav link). */
function useActiveSection(ids) {
  const [active, setActive] = useState("");
  useEffect(() => {
    const onScroll = () => {
      const line = window.innerHeight * 0.35;
      let current = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ids]);
  return active;
}

const SECTION_IDS = NAV_LINKS.map((l) => l.href.slice(1));

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { progress, scrolled } = useScrollState();
  const active = useActiveSection(SECTION_IDS);

  const listRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [pill, setPill] = useState({ left: 0, width: 0, show: false });

  const target = hovered ?? (active ? `#${active}` : null);

  // Slide the highlight pill under the hovered / active link.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || !target) {
      setPill((p) => ({ ...p, show: false }));
      return;
    }
    const link = list.querySelector(`[data-href="${target}"]`);
    if (!link) return;
    setPill({ left: link.offsetLeft, width: link.offsetWidth, show: true });
  }, [target, scrolled]);

  const close = () => setMenuOpen(false);

  return (
    <header className={scrolled ? "header is-scrolled" : "header"}>
      <span
        className="progress"
        aria-hidden="true"
        style={{ transform: `scaleX(${progress})` }}
      />
      <div className="wrap">
        <div className="navbar">
          <a className="brand" href="#top" onClick={close}>
            <img src="/brand/logo.jpg" alt="DPS Enterprises" />
          </a>

          <button
            className={menuOpen ? "menu-btn is-open" : "menu-btn"}
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={menuOpen ? "nav open" : "nav"}>
            <div
              className="nav-links"
              ref={listRef}
              onMouseLeave={() => setHovered(null)}
            >
              <span
                className={pill.show ? "nav-pill show" : "nav-pill"}
                aria-hidden="true"
                style={{ transform: `translateX(${pill.left}px)`, width: pill.width }}
              />
              {NAV_LINKS.map((link, i) => (
                <a
                  key={link.href}
                  href={link.href}
                  data-href={link.href}
                  className={active === link.href.slice(1) ? "is-active" : undefined}
                  style={{ "--i": i }}
                  onMouseEnter={() => setHovered(link.href)}
                  onFocus={() => setHovered(link.href)}
                  onBlur={() => setHovered(null)}
                  onClick={close}
                >
                  {link.label}
                </a>
              ))}
            </div>
            <span className="welcome" style={{ "--i": NAV_LINKS.length }}>
              <span className="wave" aria-hidden="true">
                👋
              </span>
              Welcome
            </span>
          </nav>
        </div>
      </div>
    </header>
  );
}
