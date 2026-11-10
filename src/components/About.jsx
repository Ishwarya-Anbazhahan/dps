import Reveal from "./Reveal.jsx";

export default function About() {
  return (
    <section className="section" id="about">
      <div className="wrap about">
        <Reveal direction="left">
          <p className="kicker">The firm</p>
          <h2>A Chennai practice for land and property.</h2>
          <p>
            DPS Enterprises is based at No. 7/3, Parthasarathy Street, Agaram,
            Venus. The work is straightforward: help people with land and
            properties in and around the city.
          </p>
          <p>
            The garden figure on this page is the firm’s front-page mark. The
            head is planted ground. The hands carry the homes and plots the
            company looks after.
          </p>
        </Reveal>
        <Reveal direction="right" delay={120} className="about-stage">
          <figure className="about-art float-slow">
            <img
              src="/brand/garden.jpg"
              alt="Garden-headed figure holding a small landscape of homes and land"
            />
          </figure>
          <span className="orbit" aria-hidden="true" />
        </Reveal>
      </div>
    </section>
  );
}
