import Reveal from "./Reveal.jsx";

const POINTS = [
  { title: "Location first", text: "Where the land is and how you reach it, explained plainly." },
  { title: "Papers made clear", text: "Understand the documents before you decide anything." },
  { title: "One direct contact", text: "Speak with S. Sathish from the first call to the next step." },
];

export default function Flow() {
  return (
    <section className="flow" aria-label="Gardens and homes">
      <img
        src="/brand/colorful.jpg"
        alt="A colourful figure of gardens flowing across the page, carrying houses and land"
      />
      <div className="wrap flow-inner">
        <Reveal direction="right" className="flow-card float-slow">
          <p className="kicker">Where gardens meet homes</p>
          <h2>Good ground makes a good home.</h2>
          <p className="flow-lede">
            Every plot and every house starts with the land beneath it. We help
            you look at it with care, so your decision feels settled and sure.
          </p>
          <ul className="flow-points">
            {POINTS.map((point, i) => (
              <li key={point.title} style={{ "--i": i }}>
                <span className="tick" aria-hidden="true">
                  ✓
                </span>
                <span>
                  <strong>{point.title}</strong>
                  {point.text}
                </span>
              </li>
            ))}
          </ul>
          <a className="btn btn-red" href="#contact">
            Talk to us
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
