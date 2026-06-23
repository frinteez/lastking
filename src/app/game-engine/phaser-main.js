import Phaser from 'phaser';
import GameScene from './GameScene.js';

export function createGame(parentContainerId) {
  const config = {
    type: Phaser.AUTO,
    parent: parentContainerId,
    transparent: true,
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: '100%',
      height: '100%'
    },
    dom: { createContainer: true },
    scene: [GameScene],
    physics: { default: 'arcade' },
    render: { pixelArt: true, antialias: false }
  };

  const game = new Phaser.Game(config);
  window.__DER_LETZTE_KOENIG_GAME__ = game;
  return game;
}