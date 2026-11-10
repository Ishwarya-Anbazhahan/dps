import { useEffect, useRef, useState } from "react";
import { PHONE, PHONE_HREF, WHATSAPP_HREF } from "../data/site.js";
import WhatsAppIcon from "./WhatsAppIcon.jsx";

/**
 * Floating icon buttons (bottom-right).
 * WhatsApp opens the chat; the phone icon reveals the number when clicked.
 */
export default function CallFab() {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="fab-stack" ref={boxRef}>
      <a
        className="fab fab-wa"
        href={WHATSAPP_HREF}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <span className="fab-ring" aria-hidden="true" />
        <WhatsAppIcon />
      </a>

      <div className="fab-phone">
        <a
          className={open ? "fab-pop show" : "fab-pop"}
          href={PHONE_HREF}
          aria-hidden={!open}
          tabIndex={open ? 0 : -1}
        >
          <small>Call us</small>
          {PHONE}
        </a>
        <button
          type="button"
          className="fab fab-call"
          aria-label={open ? "Hide phone number" : "Show phone number"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="fab-ring" aria-hidden="true" />
          <svg viewBox="0 0 24 24" aria-hidden="true" className="phone-icon">
            <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
