import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import Portal from "./portal/Portal.jsx";
import "./index.css";

// Scroll-reveal content stays visible if JavaScript never runs.
document.documentElement.classList.add("js");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {location.pathname.startsWith("/portal") ? <Portal /> : <App />}
  </StrictMode>,
);
