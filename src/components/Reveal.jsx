import { useReveal } from "../hooks/useReveal.js";

/**
 * Fades and slides its content in when scrolled into view.
 * direction: "up" | "left" | "right" | "zoom"
 */
export default function Reveal({
  as: Tag = "div",
  direction = "up",
  delay = 0,
  className = "",
  children,
  ...rest
}) {
  const [ref, shown] = useReveal();
  return (
    <Tag
      ref={ref}
      className={`reveal reveal-${direction} ${shown ? "in" : ""} ${className}`.trim()}
      style={shown ? undefined : { transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
