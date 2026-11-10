import { useState } from "react";
import Reveal from "./Reveal.jsx";
import Particles from "./Particles.jsx";
import { ADDRESS, EMAIL, PHONE, PHONE_HREF } from "../data/site.js";

export default function Contact() {
  const [sent, setSent] = useState("");

  function onSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const message = String(data.get("message") || "").trim();
    const subject = encodeURIComponent(`Enquiry from ${name || "website"}`);
    const body = encodeURIComponent(`Name: ${name}\nPhone: ${phone}\n\n${message}`);
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    setSent("Your email app should open with this enquiry addressed to DPS Enterprises.");
    form.reset();
  }

  return (
    <section className="section contact" id="contact">
      <Particles />
      <span className="blob blob-d" aria-hidden="true" />
      <span className="blob blob-e" aria-hidden="true" />
      <div className="wrap contact-grid">
        <Reveal direction="left" className="contact-copy">
          <p className="kicker">Visit or call</p>
          <h2>Speak with S. Sathish.</h2>
          <p>
            Enquiries go to the managing director. Call, write, or use the form
            to open an email from your own mail app.
          </p>
          <div className="details">
            <p>
              <span>Managing Director</span>
              S. Sathish
            </p>
            <p>
              <span>Office</span>
              {ADDRESS}
            </p>
            <a href={PHONE_HREF}>
              <span>Phone</span>
              {PHONE}
            </a>
            <a href={`mailto:${EMAIL}`}>
              <span>Email</span>
              {EMAIL}
            </a>
          </div>
        </Reveal>
        <Reveal direction="right" delay={120} className="panel">
          <h3>Send an enquiry</h3>
          <p>This opens your email with the message filled in.</p>
          <form onSubmit={onSubmit}>
            <label>
              Name
              <input name="name" type="text" required autoComplete="name" />
            </label>
            <label>
              Phone
              <input name="phone" type="tel" required autoComplete="tel" />
            </label>
            <label>
              Message
              <textarea name="message" rows={4} required />
            </label>
            <button className="btn btn-red" type="submit">
              Write to DPS Enterprises
            </button>
            <p className="note" role="status">
              {sent}
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
