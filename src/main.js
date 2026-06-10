import Phaser from 'phaser';
import GameScene from './game/GameScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  transparent: true,
  scale: {
    mode: Phaser.Scale.RESIZE, // Движок теперь растягивается на весь экран
    width: '100%',
    height: '100%'
  },
  scene: [GameScene],
  physics: { default: 'arcade' },
  render: { pixelArt: false, antialias: true }
};

window.addEventListener('load', () => {
  const game = new Phaser.Game(config);
  window.__DER_LETZTE_KOENIG_GAME__ = game;
  // Expose scene for testing
  setTimeout(() => {
    window.gameScene = game.scene.getScene('GameScene');
  }, 100);
});

export default config;