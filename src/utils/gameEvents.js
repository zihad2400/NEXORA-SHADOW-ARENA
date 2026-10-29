import { soundEngine } from './soundEngine';

export function triggerGameOver(score, metrics = {}) {
  // Play the game over sound
  soundEngine.playGameOver();
  
  // Dispatch the event for the server to save
  window.dispatchEvent(new CustomEvent('nexora:gameover', {
    detail: { score, metrics }
  }));
}
