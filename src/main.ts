import { Game } from "./Game";

const main = () => {
  const elem = document.getElementById("viewport");
  if (elem === null) {
    throw new Error("No viewport element");
  }
  const game = new Game(elem);
  game.registerEvents();

  function animate() {
    requestAnimationFrame(animate);

    game.update();
    game.render();
  }
  animate();
};

main();
