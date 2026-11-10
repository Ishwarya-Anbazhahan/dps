// Fixed layout so rendering is stable: [left %, size px, duration s, delay s, hue]
const SPECS = [
  [6, 14, 14, 0, "blue"],
  [14, 9, 11, 3, "gold"],
  [24, 18, 17, 6, "red"],
  [36, 10, 12, 1, "gold"],
  [48, 16, 16, 8, "blue"],
  [58, 8, 10, 4, "red"],
  [69, 14, 15, 2, "gold"],
  [78, 10, 13, 7, "blue"],
  [88, 18, 18, 5, "red"],
  [95, 9, 12, 9, "gold"],
];

/** Decorative bubbles that drift upward behind the content. */
export default function Particles() {
  return (
    <div className="particles" aria-hidden="true">
      {SPECS.map(([left, size, dur, delay, hue], i) => (
        <span
          key={i}
          className={`particle p-${hue}`}
          style={{
            left: `${left}%`,
            width: size,
            height: size,
            animationDuration: `${dur}s`,
            animationDelay: `-${delay}s`,
          }}
        />
      ))}
    </div>
  );
}
