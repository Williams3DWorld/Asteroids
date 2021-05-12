import { Game } from "./Game";

// Prevent right click contextBox
document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

const game = new Game();
