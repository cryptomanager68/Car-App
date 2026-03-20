import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Inject cursor glow elements
const dot = document.createElement("div");
dot.id = "cursor-dot";
const ring = document.createElement("div");
ring.id = "cursor-ring";
document.body.appendChild(dot);
document.body.appendChild(ring);
document.body.classList.add("cursor-glow");

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  dot.style.left = mouseX + "px";
  dot.style.top = mouseY + "px";
});

// Smooth ring follow
function animateRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  ring.style.left = ringX + "px";
  ring.style.top = ringY + "px";
  requestAnimationFrame(animateRing);
}
animateRing();

// Hover expand on interactive elements
document.addEventListener("mouseover", (e) => {
  const target = e.target as HTMLElement;
  if (target.closest("button, a, [role='button'], .car-card-hover")) {
    dot.classList.add("hovered");
    ring.classList.add("hovered");
  }
});
document.addEventListener("mouseout", (e) => {
  const target = e.target as HTMLElement;
  if (target.closest("button, a, [role='button'], .car-card-hover")) {
    dot.classList.remove("hovered");
    ring.classList.remove("hovered");
  }
});

createRoot(document.getElementById("root")!).render(<App />);
