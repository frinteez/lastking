const fs = require('fs');

let code = fs.readFileSync('src/app/game-engine/GameScene.js', 'utf8');

// Mock Phaser
const PhaserMock = `
const Phaser = {
  Scene: class {
    constructor() {
      this.events = { emit: () => {}, on: () => {} };
      this.add = {
        image: () => ({ setOrigin: () => ({ setScale: () => ({ setDepth: () => ({}) }), setDisplaySize: () => ({ setDepth: () => ({}) }) }), setDisplaySize: () => ({ setTint: () => {}, setAlpha: () => {}, setInteractive: () => {}, on: () => {}, clearTint: () => {} }) }),
        graphics: () => ({ setAlpha: () => ({ lineStyle: () => ({ moveTo: () => ({ lineTo: () => ({}) }), strokePath: () => {} }) }) }),
        rectangle: () => ({ setOrigin: () => ({ setVisible: () => ({ setPosition: () => ({ setDisplaySize: () => {} }) }) }) })
      };
      this.load = { image: () => {} };
      this.cameras = { main: { setBounds: () => {}, centerOn: () => {}, setZoom: () => {}, fade: () => {}, scrollX: 0, scrollY: 0, getWorldPoint: () => ({x:0,y:0}) } };
      this.input = { on: () => {} };
      this.scene = { pause: () => {}, resume: () => {} };
      this.tweens = { add: () => {}, killTweensOf: () => {} };
      this.time = { delayedCall: (t, cb) => { setTimeout(cb, 10) } };
    }
  },
  Math: { Clamp: (val, min, max) => Math.max(min, Math.min(max, val)) }
};
`;

// Remove imports and exports
code = code.replace(/import .*? from .*?;/g, '');
code = code.replace(/export default /g, '');
code = code.replace(/export /g, '');
code = code.replace(/import \{.*?\} from .*?;/g, '');

const edHelpers = `
function getTotalPopulation(state) {
  if (!state) return 0;
  return (
    Math.max(0, state.popChildren || 0) +
    Math.max(0, state.popWorkers || 0) +
    Math.max(0, state.popEngineers || 0)
  );
}
`;

const domMock = `
const window = {};
const document = {
  createElement: () => ({ className: '', style: {}, classList: { add: ()=>{}, remove: ()=>{} }, innerHTML: '' }),
  getElementById: () => ({ appendChild: ()=>{}, classList: { remove: ()=>{} } }),
  body: { appendChild: ()=>{} }
};
`;

const scriptContent = PhaserMock + '\\n' + domMock + '\\n' + edHelpers + '\\n' + code;

eval(scriptContent);

const simLog = [];
const log = (msg) => simLog.push(msg);

const game = new GameScene();
game.events.emit = (event, data) => {
  if (event === 'cosmic-event') log('[EVENT] ' + data);
  if (event === 'toast-event') log('[TOAST] ' + data.msg);
  if (event === 'trigger-ending') log('[ENDING TRIGGERED] ' + data);
};

game.create();

const classes = ['wealthy', 'scientific', 'dictator'];

classes.forEach(cls => {
  log('\\n=== Starting Class: ' + cls + ' ===');
  // recreate initial state so it doesn't leak
  game.state = game.createInitialState();
  game.startWithPreset(cls);
  
  log('Initial state: geld=' + game.state.geld + ' pop=' + getTotalPopulation(game.state));
  
  // play 10 days
  for(let i=1; i<=10; i++) {
    game.nextDay();
    log('Day ' + i + ': nahrung=' + game.state.nahrung + ' o2=' + game.state.sauerstoff + ' pop=' + getTotalPopulation(game.state) + ' h=' + game.state.zufriedenheit);
  }
});

console.log(simLog.join('\\n'));
