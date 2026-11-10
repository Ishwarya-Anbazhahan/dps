const ITEMS = [
  "Land",
  "Homes",
  "Guidance",
  "Agaram, Venus",
  "Chennai 600 082",
  "S. Sathish, Managing Director",
];

export default function Marquee() {
  // Two identical halves so the loop is seamless.
  const half = (suffix) =>
    ITEMS.map((item) => (
      <span key={item + suffix}>
        {item}
        <i aria-hidden="true">✦</i>
      </span>
    ));
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        <div className="marquee-half">{half("a")}</div>
        <div className="marquee-half">{half("b")}</div>
      </div>
    </div>
  );
}
