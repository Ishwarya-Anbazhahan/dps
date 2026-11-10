import Reveal from "./Reveal.jsx";
import { SERVICES } from "../data/site.js";

const ICONS = {
  Land: (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M4 36l12-18 8 11 6-8 14 15z" />
      <circle cx="35" cy="12" r="4" />
    </svg>
  ),
  Homes: (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M6 24L24 8l18 16" />
      <path d="M10 22v18h28V22" />
      <path d="M20 40V28h8v12" />
    </svg>
  ),
  Guidance: (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="17" />
      <path d="M31 17l-5 10-10 5 5-10z" />
    </svg>
  ),
};

export default function Services() {
  return (
    <section className="section services" id="services">
      <div className="wrap">
        <Reveal>
          <p className="kicker">What we handle</p>
          <h2>Land, homes, and the ground they stand on.</h2>
        </Reveal>
        <div className="service-grid">
          {SERVICES.map((service, i) => (
            <Reveal
              key={service.title}
              as="article"
              delay={i * 120}
              className={`card tone-${service.tone}`}
            >
              <span className="num" aria-hidden="true">
                0{i + 1}
              </span>
              <span className="icon float-icon">{ICONS[service.title]}</span>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
