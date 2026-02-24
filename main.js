import { initGL, loadTexture } from "./render/glRenderer.js";
import { Keyboard } from "./input/keyboard.js";
import { StateStack } from "./gameStates/stateStack.js";
import { TitleState } from "./gameStates/titleState.js";
import { MenuState } from "./gameStates/menuState.js";
import { LevelState } from "./gameStates/levelState.js";
import { GameState } from "./gameStates/gameState.js";

const canvas = document.getElementById("game");
const hud = document.getElementById("hud");
canvas.width = 800;
canvas.height = 600;

initGL(canvas);

const keyboard = new Keyboard(window);
keyboard.attach();

const image = new Image();
image.src = "assets/player.png";

image.onload = () => {
  const texture = loadTexture(image);

  const createGameState = () => {
    const gameState = new GameState(texture);
    gameState.setTitleStateFactory(createTitleState);
    return gameState;
  };

  const createLevelState = () => new LevelState(createGameState);
  const createMenuState = () => new MenuState(createLevelState);
  const createTitleState = () => new TitleState(createMenuState);

  const context = {
    canvas,
    hud,
    input: keyboard
  };

  const stateStack = new StateStack(context);
  stateStack.push(createTitleState());

  let previousTime = performance.now();

  function loop(now) {
    const deltaTime = Math.min((now - previousTime) / 1000, 0.033);
    previousTime = now;

    stateStack.update(deltaTime);
    keyboard.endFrame();

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
};
