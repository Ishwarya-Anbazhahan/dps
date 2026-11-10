import { EMAIL } from "../data/site.js";
import Particles from "./Particles.jsx";
import { useTilt } from "../hooks/useTilt.js";

export default function Hero() {
  const tilt = useTilt(9);
  return (
    <section className="hero">
      <Particles />
      <span className="blob blob-a" aria-hidden="true" />
      <span className="blob blob-b" aria-hidden="true" />
      <span className="blob blob-c" aria-hidden="true" />

      <div className="wrap hero-grid">
        <div className="hero-copy">
          <p className="kicker rise" style={{ "--d": "0ms" }}>
            Real estate · Chennai
          </p>
          <h1 className="rise" style={{ "--d": "100ms" }}>
            Land and properties, <em>held with care.</em>
          </h1>
          <p className="lede rise" style={{ "--d": "200ms" }}>
            DPS Enterprises works with land and homes from Agaram, Venus.
            Managing Director S. Sathish looks after each enquiry in person.
          </p>
          <div className="actions rise" style={{ "--d": "300ms" }}>
            <a className="btn btn-red" href="#contact">
              Send an enquiry
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
            <a className="btn btn-line" href="#about">
              About the firm
            </a>
            <a className="btn btn-line" href="/portal">
              Client login
            </a>
          </div>
          <div className="facts rise" style={{ "--d": "400ms" }}>
            <div>
              <strong>Office</strong>
              <span>Agaram, Venus, Chennai 600 082</span>
            </div>
            <div>
              <strong>Led by</strong>
              <span>S. Sathish, Managing Director</span>
            </div>
            <div>
              <strong>Email</strong>
              <span>{EMAIL}</span>
            </div>
          </div>
        </div>

        <div className="hero-stage rise" style={{ "--d": "250ms" }}>
          <div className="tilt" {...tilt}>
            <figure className="hero-art float-slow">
              <img
                src="/brand/professional.jpg"
                alt="A woman whose head is a garden, holding land and properties in her hands"
              />
            </figure>
          </div>
          <span className="chip chip-a float-a">
            <b>Land</b> &amp; plots
          </span>
          <span className="chip chip-b float-b">
            <b>Homes</b> for living
          </span>
          <span className="chip chip-c float-c">Agaram, Venus</span>
        </div>
      </div>
    </section>
  );
}
