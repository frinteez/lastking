import Phaser from 'phaser';
import { getTotalPopulation } from './educationHelpers.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.TILE_SIZE = 64;
    this.MAP_W = 16;
    this.MAP_H = 16;
    this.buildMode = null;
    this.isPanning = false;
    this.panStart = {x:0, y:0};
    this.isModalOpen = false;
  }

  setModalOpen(isOpen) {
    this.isModalOpen = isOpen;
    if (isOpen) {
      if (this.buildPreview) this.buildPreview.setVisible(false);
      this.hideBuildCostTooltip();
      this.events.emit('hide-map-tooltip');
    }
  }

  preload() {
    this.load.image('bg_planet', '/assets/bg_planet.png');
    this.load.image('bg_space_nebula', '/assets/bg_space_nebula.jpg');
    this.load.image('tile_palace', '/assets/tile_palace.png');
    this.load.image('tile_farm', '/assets/tile_farm.png');
    this.load.image('tile_o2', '/assets/tile_o2.png');
    this.load.image('drone', '/assets/drone.png');
    
    this.load.image('tile_mine', '/assets/tile_mine.png');
    this.load.image('tile_dronehub', '/assets/tile_dronehub.png');
    this.load.image('tile_uni', '/assets/tile_uni.png');
    this.load.image('planet_stabilizer', '/assets/planet_stabilizer.png');
    this.load.image('atmo_synthesizer', '/assets/atmo_synthesizer.png');
    this.load.image('planetary_cracker', '/assets/planetary_cracker.png');

    this.load.image('tile_housing', '/assets/housing_block.png');
    this.load.image('tile_school', '/assets/School.png');
    this.load.image('ark_ship', '/assets/Royal_Ark.png');
    
    this.load.image('citizen_educated', '/assets/engeneer.png');
    this.load.image('citizen_uneducated', '/assets/worker.png');
    this.load.image('citizen_child', '/assets/child.png');
  }

  create() {
    // Консольные команды для дебага (набери в консоли браузера: game.setRes('nahrung', 500))
    window.game = this;
    window.setRes = (res, val) => { 
        window.game.state[res] = val; 
        window.game.events.emit('state-updated', window.game.state); 
        console.log(`[DEBUG] ${res} set to ${val}`);
    };
    window.nextDayFast = (days) => { 
        for(let i=0; i<days; i++) window.game.nextDay(); 
        console.log(`[DEBUG] Skipped ${days} days`);
    };

    this.state = this.createInitialState();
    this.stateInitialized = true;
    const mapW = this.MAP_W * this.TILE_SIZE;
    const mapH = this.MAP_H * this.TILE_SIZE;

    // Create massive cosmic nebula background
    this.bgNebula = this.add.image(mapW / 2, mapH / 2, 'bg_space_nebula').setOrigin(0.5).setScale(4.0).setDepth(-2);
    
    // Aliveness breathing tween for the background nebula
    this.tweens.add({
      targets: this.bgNebula,
      scaleX: 4.2,
      scaleY: 4.2,
      alpha: 0.8,
      duration: 8000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // The actual map surface (planet), centered and STABLE - no rotation
    this.bgPlanet = this.add.image(mapW / 2, mapH / 2, 'bg_planet').setOrigin(0.5).setDisplaySize(mapW, mapH).setDepth(-1);


    this.tiles = Array(this.MAP_W * this.MAP_H).fill(null).map((_, i) => ({
      x: i % this.MAP_W, y: Math.floor(i / this.MAP_W), sprite: null, building: null, destroyed: false
    }));

    this.gridGraphics = this.add.graphics().setAlpha(0).lineStyle(1, 0x00e5ff, 0.4);
    for(let y=0; y<=this.MAP_H; y++) this.gridGraphics.moveTo(0, y*this.TILE_SIZE).lineTo(mapW, y*this.TILE_SIZE);
    for(let x=0; x<=this.MAP_W; x++) this.gridGraphics.moveTo(x*this.TILE_SIZE, 0).lineTo(x*this.TILE_SIZE, mapH);
    this.gridGraphics.strokePath();

    this.buildPreview = this.add.rectangle(0,0,this.TILE_SIZE,this.TILE_SIZE,0x00e5ff,0.4).setOrigin(0).setVisible(false);

    this.createBuildCostTooltip();

    const cam = this.cameras.main;
    // Set strict bounds to the massive background so player cannot scroll into void
    cam.setBounds(-1536, -1536, 4096, 4096);
    cam.centerOn(mapW/2, mapH/2);
    cam.setZoom(2.0);

    // Initial Start
    const palaceConfig = this.getBuildConfig('tile_palace');
    const farmConfig = this.getBuildConfig('tile_farm');
    const o2Config = this.getBuildConfig('tile_o2');
    
    this.executeBuild(7, 7, 'tile_palace', palaceConfig, false, true, false);
    this.palaceTile = this.tiles[7 + 7*this.MAP_W];

    this.executeBuild(7, 8, 'tile_farm', farmConfig, false, true, false);
    this.executeBuild(6, 7, 'tile_farm', farmConfig, false, true, false);
    this.executeBuild(8, 7, 'tile_o2', o2Config, false, true, false);
    this.executeBuild(7, 6, 'tile_o2', o2Config, false, true, false);

    // Calculate initial active drones (2 farms + 2 O2 = 4 drones needed)
    this.calculateActiveDrones();

    this.setupInputs(cam);
    this.setupEvents();

    // Calculate initial net income before pause
    this.calculateNetIncome();

    // Pause and wait for preset selection
    this.scene.pause();
    this.events.emit('state-updated', this.state);
      }

  createInitialState() {
    return {
      day: 1,
      geld: 1000, minerals: 50, nahrung: 100, sauerstoff: 200,
      gesundheit: 100, zufriedenheit: 100, happiness: 100, angst: 0, fear: 0, wissen: 50, planet: 100,

      taxLevel: 1,
      efficiency: 1.0,
      efficiencyOverrideDays: 0,

      popChildren: 0,
      popWorkers: 0,
      popEngineers: 10,
      popCap: 20,
      agingCounter: 0,

      workersLocked: 0,
      constructionEngineersLocked: 0,
      dronesEngineersLocked: 0,
      drones: { owned: 5, capacity: 5, active: 0 },
      droneQueue: [],
      citizenRoster: Array.from({ length: 10 }, () => ({
        type: 'engineer',
        isElite: true,
        homeTileIndex: 7 + 7 * this.MAP_W
      })),
      schoolEnrollments: [],
      academyEnrollments: [],

      netIncome: { food: 0, o2: 0 },
      starvationGraceDays: 3,
      martialLawDaysRemaining: 0,

      techs: {}, factionLoyalty: { rust: 50, order: 50, guild: 50 }, gameEnded: false,
      childLaborDaysRemaining: 0,
      cooldowns: { propaganda: 0, inquisition: 0, social: 0, suppressRiots: 0, manipulation: 0, publicHealth: 0, childLabor: 0, martialLaw: 0 }
    };
  }

  getTile(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= this.MAP_W || ty >= this.MAP_H) return null;
    return this.tiles[tx + ty * this.MAP_W];
  }

  calculateActiveDrones() {
    let requiredSlots = 0;
    for (const t of this.tiles) {
      if (t.building && !t.destroyed && t.building.daysRemaining === 0) {
        const b = t.building;
        if (['tile_farm', 'tile_o2', 'tile_mine'].includes(b.key) && b.workers > 0) {
          requiredSlots += (b.sprite && b.sprite.displayWidth > this.TILE_SIZE) ? 2 : 1;
        }
      }
    }
    this.state.drones.active = Math.min(requiredSlots, this.state.drones.owned, this.state.drones.capacity);
  }

  calculateNetIncome() {
    const E = this.state.efficiency;
    const dailyConsumption = (this.state.popChildren * 1) + (this.state.popWorkers * 2) + (this.state.popEngineers * 3);

    let foodProduction = 0;
    let o2Production = 0;
    let mineralsProduction = 0;

    // Simulate drone servicing logic
    this.calculateActiveDrones();
    let resourceBuildings = [];
    const processedBuildings = new Set();

    for (const t of this.tiles) {
      if (!t.building || t.destroyed || processedBuildings.has(t.building)) continue;
      if (t.building.daysRemaining > 0) continue;

      const b = t.building;
      const status = b.status || 'active';

      if (status === 'active') {
        if (['tile_farm', 'tile_o2', 'tile_mine'].includes(b.key) && b.workers > 0) {
          let childBonus = 0;
          if (this.state.childLaborDaysRemaining > 0) childBonus = Math.floor(this.state.popChildren * 0.5);
          resourceBuildings.push({tile: t, bld: b, childBonus});
        }
        if (b.key === 'atmo_synthesizer') {
          o2Production += Math.floor(50 * E);
        }
        if (b.key === 'planetary_cracker') {
          mineralsProduction += Math.floor(40 * E);
        }
      }
      processedBuildings.add(t.building);
    }

    resourceBuildings.sort((a, b) => {
      const priority = { tile_o2: 3, tile_farm: 2, tile_mine: 1 };
      return (priority[b.bld.key] || 0) - (priority[a.bld.key] || 0);
    });

    const produceCount = Math.min(this.state.drones.active, resourceBuildings.length);
    for(let i=0; i<produceCount; i++) {
      const target = resourceBuildings[i];
      if (target.bld.key === 'tile_farm') {
        const baseProduction = Math.floor(15 * E);
        const childBonus = target.childBonus ? Math.floor(target.childBonus * 7.5 * E) : 0;
        foodProduction += baseProduction + childBonus;
      }
      if (target.bld.key === 'tile_o2') {
        const baseProduction = Math.floor(15 * E);
        const childBonus = target.childBonus ? Math.floor(target.childBonus * 7.5 * E) : 0;
        o2Production += baseProduction + childBonus;
      }
      if (target.bld.key === 'tile_mine') {
        const baseProduction = Math.floor(10 * E);
        const childBonus = target.childBonus ? Math.floor(target.childBonus * 5 * E) : 0;
        mineralsProduction += baseProduction + childBonus;
      }
    }

    this.state.netIncome = {
      food: foodProduction - dailyConsumption,
      o2: o2Production - dailyConsumption,
      foodProduced: foodProduction,
      o2Produced: o2Production,
      mineralsProduced: mineralsProduction,
      consumed: dailyConsumption
    };
  }

  getNetIncome() {
    if (!this.state) return 0;
    const T = Phaser.Math.Clamp(this.state.taxLevel, 0, 4);
    const totalPop = getTotalPopulation(this.state);
    return Math.floor(T * 2.5 * totalPop);
  }

  syncSentimentAliases() {
    this.state.happiness = this.state.zufriedenheit;
    this.state.fear = this.state.angst;
  }

  setupInputs(cam) {
    this.input.on('pointerdown', (pointer) => {
      if(pointer.rightButtonDown() || pointer.middleButtonDown()) {
        this.isPanning = true; this.panStart = {x: pointer.x, y: pointer.y};
      } else if (this.buildMode) {
        const w = cam.getWorldPoint(pointer.x, pointer.y);
        this.placeBuilding(Math.floor(w.x/this.TILE_SIZE), Math.floor(w.y/this.TILE_SIZE));
      } else {
        // Check if clicking on School or Academy for education modal
        const w = cam.getWorldPoint(pointer.x, pointer.y);
        const tx = Math.floor(w.x / this.TILE_SIZE);
        const ty = Math.floor(w.y / this.TILE_SIZE);
        const tile = this.getTile(tx, ty);
        
        if (tile && tile.building && tile.building.daysRemaining === 0 && (tile.building.key === 'tile_school' || tile.building.key === 'tile_uni')) {
          this.events.emit('open-education-modal', tile.building.key === 'tile_school' ? 'school' : 'academy');
        }
        if (tile && tile.building && tile.building.daysRemaining === 0 && tile.building.key === 'tile_dronehub') {
          this.events.emit('open-drone-modal');
        }
      }
    });

    this.input.on('pointerup', () => this.isPanning = false);
    
    this.input.on('pointermove', (pointer) => {
      const w = cam.getWorldPoint(pointer.x, pointer.y);
      if (this.isPanning) {
        cam.scrollX -= (pointer.x - this.panStart.x) / cam.zoom;
        cam.scrollY -= (pointer.y - this.panStart.y) / cam.zoom;
        this.panStart = {x: pointer.x, y: pointer.y};
      }

      if (this.isModalOpen) {
        this.buildPreview.setVisible(false);
        this.hideBuildCostTooltip();
        this.events.emit('hide-map-tooltip');
        return;
      }

      if (this.buildMode) {
        const tx = Math.floor(w.x / this.TILE_SIZE);
        const ty = Math.floor(w.y / this.TILE_SIZE);
        if (tx>=0 && ty>=0 && tx<this.MAP_W && ty<this.MAP_H) {
          this.buildPreview.setVisible(true).setPosition(tx*this.TILE_SIZE, ty*this.TILE_SIZE);
          const config = this.getBuildConfig(this.buildMode);
          if(config.size === 2) this.buildPreview.setDisplaySize(this.TILE_SIZE*2, this.TILE_SIZE*2);
          else this.buildPreview.setDisplaySize(this.TILE_SIZE, this.TILE_SIZE);

          this.updateBuildCostTooltip(pointer.x, pointer.y, config);
        } else {
          this.buildPreview.setVisible(false);
          this.hideBuildCostTooltip();
        }
      } else {
        const tx = Math.floor(w.x / this.TILE_SIZE);
        const ty = Math.floor(w.y / this.TILE_SIZE);
        const tile = this.getTile(tx, ty);
        if (tile && tile.building && tile.building.key === 'tile_dronehub' && tile.building.daysRemaining === 0) {
          let qText = "Drone Hub Active";
          if (this.state.droneQueue && this.state.droneQueue.length > 0) {
            qText = "<strong>Production Queue:</strong><br>" + this.state.droneQueue.map(q => `⚙️ ${q.qty} drones in ${q.days} days`).join('<br>');
          }
          this.events.emit('show-map-tooltip', pointer.x, pointer.y, qText);
        } else if (tile && tile.building && tile.building.daysRemaining === 0) {
          const b = tile.building;
          const status = b.status || 'active';
          if (status !== 'active' && ['tile_farm', 'tile_o2', 'tile_mine', 'tile_uni', 'atmo_synthesizer', 'planetary_cracker', 'planet_stabilizer'].includes(b.key)) {
            let tooltipText = '';
            if (status === 'abandoned') {
              tooltipText = `<strong style="color:#ff4444;">🔴 ABANDONED</strong><br>Production: 0<br>Cause: ${b.statusCause || 'Starvation/No O2'}<br>Solution: Buy emergency supplies`;
            } else if (status === 'strike') {
              tooltipText = `<strong style="color:#ff4444;">✊ STRIKE</strong><br>Production: 0<br>Cause: ${b.statusCause || 'Happiness < 30%'}<br>Solution: Lower Taxes or Propaganda`;
            } else if (status === 'damaged') {
              tooltipText = `<strong style="color:#888844;">☢️ DAMAGED</strong><br>Production: 0<br>Cause: ${b.statusCause || 'Planet Health < 40%'}<br>Solution: Build Planet Stabilizer`;
            }
            if (tooltipText) this.events.emit('show-map-tooltip', pointer.x, pointer.y, tooltipText);
          } else if (b.forcedLabor && ['tile_farm', 'tile_o2', 'tile_mine', 'tile_uni', 'atmo_synthesizer', 'planetary_cracker', 'planet_stabilizer'].includes(b.key)) {
            const tooltipText = `<strong style="color:#ffaa00;">⚠️ FORCED LABOR</strong><br>Production: Active<br>Cause: Low Happiness, but High Fear keeps them working<br>Risk: Efficiency reduced if Fear drops`;
            this.events.emit('show-map-tooltip', pointer.x, pointer.y, tooltipText);
          } else {
            this.events.emit('hide-map-tooltip');
          }
        } else {
          this.events.emit('hide-map-tooltip');
        }
        this.hideBuildCostTooltip();
      }
    });

    this.input.on('wheel', (p, go, dx, dy) => { 
      // Clamp minimum zoom so camera never exceeds the 4096 bounds
      // Hard clamp - minimum 0.8 ensures nebula always fills the screen
      cam.setZoom(Phaser.Math.Clamp(cam.zoom - dy*0.001, 0.8, 2.5)); 
    });
  }

  setupEvents() {
    this.events.on('enter-build-mode', (key) => { this.buildMode = key; this.gridGraphics.setAlpha(1); });
    this.events.on('cancel-build-mode', () => {
      this.buildMode = null; this.gridGraphics.setAlpha(0);
      this.buildPreview.setVisible(false);
      this.hideBuildCostTooltip();
    });
    this.events.on('end-day', () => this.nextDay());
    this.events.on('action-decree', (type) => this.executeDecree(type));
    // Open Drone Modal (UI) when requested
    this.events.on('open-drone-modal', () => {
      const el = document.getElementById('drone-modal');
      if (el) el.classList.remove('hidden');
      this.events.emit('hide-map-tooltip');
    });

    // Start producing drones (payload: qty)
    this.events.on('produce-drones', (qty) => {
      const q = Math.max(1, Math.floor(qty || 1));
      const gCost = 50 * q;
      const mCost = 50 * q;
      const requiredEngineers = q * 2;
      const freeEngineers = Math.max(0, this.state.popEngineers - this.state.dronesEngineersLocked);

      // Capacity check - cannot exceed max capacity
      const queuedDrones = (this.state.droneQueue || []).reduce((sum, item) => sum + (item.qty || 0), 0);
      if (this.state.drones.owned + queuedDrones + q > this.state.drones.capacity) {
        this.events.emit('cosmic-event', `❌ Cannot produce ${q} drones: would exceed capacity of ${this.state.drones.capacity}.`);
        return;
      }

      if (freeEngineers < requiredEngineers) {
        this.events.emit('cosmic-event', `❌ Need ${requiredEngineers} free Engineers (have ${freeEngineers} available).`);
        return;
      }
      if (this.state.geld < gCost || this.state.minerals < mCost) {
        this.events.emit('cosmic-event', `❌ Insufficient Geld or Minerals.`);
        return;
      }

      this.state.geld -= gCost;
      this.state.minerals -= mCost;
      this.state.dronesEngineersLocked += requiredEngineers;
      if (!this.state.droneQueue) this.state.droneQueue = [];
      this.state.droneQueue.push({ qty: q, days: 3 });
      this.events.emit('cosmic-event', `⚙️ Assembly started: ${q} Drones. (${requiredEngineers} Engineers locked)`);
      this.events.emit('state-updated', this.state);
    });
  }

  getBuildConfig(key) {
    const dict = {
      tile_palace: { size: 1, cost: 0, mineralCost: 0, workers: 0, name: 'Palace', desc: 'The seat of your power.', days: 0 },
      tile_farm: { size: 1, cost: 80, mineralCost: 50, workers: 2, name: 'Agri-Farm', desc: 'Produces Food (Nahrung) to prevent starvation.', days: 3 },
      tile_o2: { size: 1, cost: 100, mineralCost: 60, workers: 2, name: 'O2 Generator', desc: 'Synthesizes breathable Oxygen (O2) for the colony.', days: 3 },
      tile_housing: { size: 1, cost: 50, mineralCost: 30, workers: 1, name: 'Housing Block', desc: 'Increases population capacity.', days: 3 },
      tile_mine: { size: 1, cost: 150, mineralCost: 80, workers: 3, name: 'Mine', desc: 'Extracts Minerals from the planet crust.', days: 3 },
      tile_dronehub: { size: 1, cost: 200, mineralCost: 100, workers: 2, name: 'Drone Hub', desc: 'Houses and maintains automated drones.', days: 3 },
      tile_school: { size: 1, cost: 150, mineralCost: 75, workers: 2, name: 'School', desc: 'Educates Children into Workers.', days: 3 },
      tile_uni: { size: 1, cost: 200, mineralCost: 120, workers: 4, name: 'Royal Academy', desc: 'Trains Workers into Engineers. Conducts Research.', days: 3 },
      atmo_synthesizer: { size: 2, cost: 1200, mineralCost: 650, workers: 8, name: 'Atmo-Synth', desc: 'Massively boosts O2 production.', days: 5 },
      planetary_cracker: { size: 2, cost: 1400, mineralCost: 700, workers: 10, name: 'Planetary Cracker', desc: 'Extreme mineral extraction. Damages planet health.', days: 5 },
      planet_stabilizer: { size: 2, cost: 800, mineralCost: 400, workers: 10, name: 'Stabilizer', desc: "Heals the planet's structural integrity.", days: 5 },
      ark_ship: { size: 2, cost: 1000, mineralCost: 500, workers: 10, name: 'Royal Ark', desc: 'A vessel to escape this dying world.', days: 5 }
    };
    return dict[key];
  }

  placeBuilding(tx, ty) {
    const config = this.getBuildConfig(this.buildMode);
    if(!config) return;

    if (this.state.geld < config.cost) {
      this.events.emit('toast-event', { msg: `Need ${config.cost} Credits.`, type: 'error' }); return;
    }
    
    if (this.state.minerals < config.mineralCost) {
      this.events.emit('toast-event', { msg: `Need ${config.mineralCost} Minerals.`, type: 'error' }); return;
    }
    
    const availableWorkers = Math.max(0, this.state.popWorkers - (this.state.workersLocked || 0));
    const availableEngineers = Math.max(0, this.state.popEngineers - (this.state.dronesEngineersLocked || 0) - (this.state.constructionEngineersLocked || 0));
    let availableConstructionLabor = availableWorkers + availableEngineers;
    if (this.state.childLaborDaysRemaining > 0) availableConstructionLabor += this.state.popChildren; // children act as temporary builders

    if (config.size === 2 && availableEngineers < config.workers) {
      this.events.emit('toast-event', { msg: `Need ${config.workers} Engineers (${availableEngineers} avail).`, type: 'error' }); return;
    } else if (config.size === 1 && availableConstructionLabor < config.workers) {
      this.events.emit('toast-event', { msg: `Need ${config.workers} Workers/Eng (${availableConstructionLabor} avail).`, type: 'error' }); return;
    }

    let lockedWorkers = 0;
    let lockedEngineers = 0;
    if (config.size === 2) {
      lockedEngineers = config.workers;
    } else {
      lockedWorkers = Math.min(availableWorkers, config.workers);
      const remaining = config.workers - lockedWorkers;
      if (remaining > 0) {
        lockedEngineers = Math.min(remaining, availableEngineers);
      }
    }

    if (config.size === 2) {
      if (tx+1 >= this.MAP_W || ty+1 >= this.MAP_H) return;
      for(let oy=0;oy<2;oy++) for(let ox=0;ox<2;ox++) if(this.tiles[(tx+ox)+(ty+oy)*this.MAP_W].building) return;
    } else {
      if(this.tiles[tx+ty*this.MAP_W].building) return;
    }

    this.executeBuild(tx, ty, this.buildMode, config, config.size === 2, false, true, lockedWorkers, lockedEngineers);
  }

  bindBuildingInteractions(spr, bld) {
    spr.setInteractive();
    spr.on('pointerover', () => {
      this.tweens.killTweensOf(spr);
      this.tweens.add({
        targets: spr,
        scaleX: (spr.originalScaleX || 1) * 1.05,
        scaleY: (spr.originalScaleY || 1) * 1.05,
        duration: 200,
        ease: 'Power1'
      });
    });
    spr.on('pointerout', () => {
      this.tweens.killTweensOf(spr);
      this.tweens.add({
        targets: spr,
        scaleX: spr.originalScaleX || 1,
        scaleY: spr.originalScaleY || 1,
        duration: 200,
        ease: 'Power1'
      });
    });
    spr.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown() || pointer.middleButtonDown()) return;
      if (this.buildMode) {
        const w = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        this.placeBuilding(Math.floor(w.x/this.TILE_SIZE), Math.floor(w.y/this.TILE_SIZE));
        return;
      }
      if (bld.daysRemaining === 0) {
        if (bld.key === 'tile_school' || bld.key === 'tile_uni') {
          this.events.emit('open-education-modal', bld.key === 'tile_school' ? 'school' : 'academy');
        } else if (bld.key === 'tile_dronehub') {
          this.events.emit('open-drone-modal');
        }
      }
    });
  }

  executeBuild(tx, ty, key, config, is2x2, instant, deductCost = true, lockedWorkers = 0, lockedEngineers = 0) {
    // Re-validate labor availability just before execution
    const currentAvailWorkers = Math.max(0, this.state.popWorkers - (this.state.workersLocked || 0));
    const currentAvailEngineers = Math.max(0, this.state.popEngineers - (this.state.dronesEngineersLocked || 0) - (this.state.constructionEngineersLocked || 0));
    
    if (lockedWorkers > currentAvailWorkers || lockedEngineers > currentAvailEngineers) {
      this.events.emit('toast-event', { msg: `Insufficient labor.`, type: 'error' });
      return;
    }
    
    if (deductCost) {
      this.state.geld -= config.cost;
      this.state.minerals -= config.mineralCost;
    }
    this.state.workersLocked += lockedWorkers;
    this.state.constructionEngineersLocked += lockedEngineers;

    const bld = { key, daysRemaining: instant ? 0 : (config.days || 3), totalDays: config.days || 3, workers: config.workers, active: false, lockedWorkers, lockedEngineers };
    
    let sprX = tx * this.TILE_SIZE + (is2x2 ? this.TILE_SIZE : this.TILE_SIZE / 2);
    let sprY = ty * this.TILE_SIZE + (is2x2 ? this.TILE_SIZE : this.TILE_SIZE / 2);

    const spr = this.add.image(sprX, sprY, key).setDisplaySize(this.TILE_SIZE*(is2x2?2:1), this.TILE_SIZE*(is2x2?2:1));
    spr.originalScaleX = spr.scaleX;
    spr.originalScaleY = spr.scaleY;

    if(!instant) { spr.setTint(0x4466aa); spr.setAlpha(0.6); }
    else {
      this.bindBuildingInteractions(spr, bld);
    }
    bld.sprite = spr;

    if (!instant) {
      // Angular overlay will handle the UI construction indicator
    }

    if (is2x2) {
      for(let oy=0;oy<2;oy++) for(let ox=0;ox<2;ox++) this.tiles[(tx+ox)+(ty+oy)*this.MAP_W].building = bld;
    } else {
      this.tiles[tx+ty*this.MAP_W].building = bld;
    }

    this.events.emit('cancel-build-mode');
    this.syncSentimentAliases();
    this.events.emit('state-updated', this.state);
    if(!instant) {
      const bConfig = this.getBuildConfig(key);
      const bName = bConfig ? bConfig.name : (key.split('_')[1] || key);
      this.events.emit('cosmic-event', `🏗️ Construction started: ${bName}`);
    }
  }

  createBuildCostTooltip() {
    const host = document.getElementById('ui-layer') || document.body;
    this.buildCostTooltipEl = document.createElement('div');
    this.buildCostTooltipEl.className = 'ui-build-cost-tooltip hidden';
    host.appendChild(this.buildCostTooltipEl);
  }

  updateBuildCostTooltip(screenX, screenY, config) {
    if (!this.buildCostTooltipEl) return;
    
    let html = `<strong>${config.name || 'Building'}</strong>`;
    if (config.desc) {
      html += `<div style="color: #a0aec0;">${config.desc}</div>`;
    }
    html += `<div class="tooltip-divider"></div>`;
    
    html += `<div style="display: flex; flex-direction: column; gap: 4px;">`;
    
    if (config.cost > 0 || config.mineralCost > 0) {
      html += `<div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                 <span>Cost:</span>
                 <span style="display: flex; align-items: center;">
                   ${config.cost > 0 ? `${config.cost} <img src="/assets/icon_money.png" alt="Money" style="margin-right: 4px;">` : ''}
                   ${config.mineralCost > 0 ? `${config.cost > 0 ? '+ ' : ''}${config.mineralCost} <img src="/assets/icon_min.png" alt="Minerals">` : ''}
                 </span>
               </div>`;
    }
    
    if (config.days > 0) {
      html += `<div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                 <span>Time:</span>
                 <span style="color: #4ade80;">${config.days} Days</span>
               </div>`;
    }
    
    if (config.workers > 0) {
      const laborType = config.size === 2 ? 'Engineers' : 'Workers';
      html += `<div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                 <span>Personnel:</span>
                 <span style="color: #60a5fa;">${config.workers} ${laborType}</span>
               </div>`;
    }
    
    html += `</div>`;
    
    this.buildCostTooltipEl.innerHTML = html;
    this.buildCostTooltipEl.style.left = `${screenX + 14}px`;
    this.buildCostTooltipEl.style.top = `${screenY + 14}px`;
    this.buildCostTooltipEl.classList.remove('hidden');
  }

  hideBuildCostTooltip() {
    if (!this.buildCostTooltipEl) return;
    this.buildCostTooltipEl.classList.add('hidden');
  }

  executeDecree(type) {
    if (this.state.cooldowns[type] > 0) return this.events.emit('toast-event', { msg: `Decree on cooldown.`, type: 'error' });
    
    let cost = 0;
    if (type === 'propaganda') cost = 300;
    else if (type === 'inquisition') cost = 500;
    else if (type === 'social') cost = 800;
    else if (type === 'suppressRiots') cost = 200;
    else if (type === 'manipulation') cost = 400;
    else if (type === 'publicHealth') cost = 300;
    else if (type === 'childLabor') cost = 100;
    
    if (this.state.geld < cost) return this.events.emit('toast-event', { msg: 'Insufficient Credits.', type: 'error' });

    this.state.geld -= cost;
    
    if (type === 'propaganda') {
      this.state.wissen = Math.max(0, this.state.wissen - 50);
      this.state.zufriedenheit = Math.min(100, this.state.zufriedenheit + 20);
      this.state.angst = Math.max(0, this.state.angst - 10);
      this.state.cooldowns.propaganda = 5;
    } else if (type === 'inquisition') {
      this.state.angst = Math.min(100, this.state.angst + 40);
      this.state.efficiency = 2.0;
      this.state.efficiencyOverrideDays = 3;
      this.state.gesundheit = Math.max(0, this.state.gesundheit - 20);
      this.state.cooldowns.inquisition = 7;
    } else if (type === 'social') {
      this.state.zufriedenheit = Math.min(100, this.state.zufriedenheit + 30);
      this.state.gesundheit = Math.min(100, this.state.gesundheit + 10);
      this.state.cooldowns.social = 10;
    } else if (type === 'suppressRiots') {
      this.state.angst = Math.min(100, this.state.angst + 60);
      this.state.zufriedenheit = Math.max(0, this.state.zufriedenheit - 10);
      this.state.cooldowns.suppressRiots = 8;
    } else if (type === 'manipulation') {
      // Random resource boost
      const rand = Math.random();
      if (rand < 0.33) this.state.nahrung += 100;
      else if (rand < 0.66) this.state.sauerstoff += 100;
      else this.state.minerals += 100;
      // Reduce loyalty for ALL factions when manipulating resources
      if (this.state.factionLoyalty) {
        this.state.factionLoyalty.rust = Math.max(-100, this.state.factionLoyalty.rust - 15);
        this.state.factionLoyalty.order = Math.max(-100, this.state.factionLoyalty.order - 15);
        this.state.factionLoyalty.guild = Math.max(-100, this.state.factionLoyalty.guild - 15);
      }
      this.state.cooldowns.manipulation = 6;
    } else if (type === 'publicHealth') {
      this.state.gesundheit = Math.min(100, this.state.gesundheit + 25);
      this.state.zufriedenheit = Math.min(100, this.state.zufriedenheit + 5);
      this.state.cooldowns.publicHealth = 5;
    } else if (type === 'childLabor') {
      this.state.zufriedenheit = Math.max(0, this.state.zufriedenheit - 30);
      this.state.angst = Math.min(100, this.state.angst + 20);
      this.state.childLaborDaysRemaining = 10;
      this.state.cooldowns.childLabor = 15;
    } else if (type === 'martialLaw') {
      if (this.state.geld < 500) {
        this.events.emit('toast-event', { msg: 'Not enough Credits for Martial Law.', type: 'error' });
        return;
      }
      this.state.geld -= 500;
      this.state.zufriedenheit = Math.max(0, this.state.zufriedenheit - 20);
      this.state.angst = Math.min(100, this.state.angst + 40);
      this.state.martialLawDaysRemaining = 5;
      this.state.cooldowns.martialLaw = 20;
    }

    const decreeNames = {
      propaganda: 'Propaganda Broadcast',
      inquisition: 'Inquisition',
      social: 'Social Relief',
      suppressRiots: 'Suppress Riots',
      manipulation: 'Market Manipulation',
      publicHealth: 'Public Health',
      childLabor: 'Child Labor',
      martialLaw: 'Martial Law'
    };

    this.events.emit('toast-event', { msg: `Decree Executed: ${decreeNames[type]}`, type: 'system' });
    this.syncSentimentAliases();
    this.events.emit('state-updated', this.state);
  }

  triggerRiot(name) {
    this.events.emit('cosmic-event', `🔥 RIOT: ${name}!`);
    if (name === 'Food Riot') {
      this.state.zufriedenheit -= 10;
      let farmFound = false;
      for (const t of this.tiles) {
        if (t.building && t.building.key === 'tile_farm' && !t.destroyed) {
          t.destroyed = true;
          t.building.sprite.setTint(0xff0000);
          // Release any locked workers/engineers from destroyed building
          if (t.building.lockedWorkers) this.state.workersLocked = Math.max(0, this.state.workersLocked - t.building.lockedWorkers);
          if (t.building.lockedEngineers) this.state.constructionEngineersLocked = Math.max(0, this.state.constructionEngineersLocked - t.building.lockedEngineers);
          farmFound = true;
          break;
        }
      }
    } else if (name === 'Tax Strike') {
      this.state.efficiencyOverrideDays = 3;
      this.state.efficiency = 0; 
    } else if (name === 'Eco-Protest') {
      this.state.efficiencyOverrideDays = 3;
      this.state.efficiency = 0;
    }
    this.syncSentimentAliases();
  }

  getEducationCapacity(type) {
    if (type === 'school') {
      const schoolCount = this.tiles.filter(tile => tile.building && tile.building.key === 'tile_school' && tile.building.daysRemaining === 0).length;
      return schoolCount * 5;
    }

    if (type === 'academy') {
      const academyCount = this.tiles.filter(tile => tile.building && tile.building.key === 'tile_uni' && tile.building.daysRemaining === 0).length;
      return academyCount * 5;
    }

    return 0;
  }

  enqueueEducation(type, quantity) {
    const amount = Math.max(0, Math.floor(quantity));
    if (amount <= 0) return 0;

    if (type === 'school') {
      const currentStudents = this.state.schoolEnrollments.reduce((sum, e) => sum + (e.qty || 1), 0);
      const freeSlots = this.getEducationCapacity('school') - currentStudents;
      const idleChildren = Math.max(0, this.state.popChildren - currentStudents);
      const enrolled = Math.min(amount, freeSlots, idleChildren);
      if (enrolled > 0) {
        this.state.schoolEnrollments.push({ daysRemaining: 5, qty: enrolled });
        this.events.emit('cosmic-event', `📚 ${enrolled} children enrolled in School.`);
      }
      return enrolled;
    }

    if (type === 'academy') {
      const currentWorkers = this.state.academyEnrollments.reduce((sum, e) => sum + (e.qty || 1), 0);
      const freeSlots = this.getEducationCapacity('academy') - currentWorkers;
      const idleWorkers = Math.max(0, this.state.popWorkers - currentWorkers);
      const enrolled = Math.min(amount, freeSlots, idleWorkers);
      if (enrolled > 0) {
        this.state.academyEnrollments.push({ daysRemaining: 7, qty: enrolled });
        this.events.emit('cosmic-event', `🎓 ${enrolled} workers enrolled in Academy.`);
      }
      return enrolled;
    }

    return 0;
  }

  processEducationQueues() {
    const nextSchool = [];
    for (const entry of this.state.schoolEnrollments) {
      entry.daysRemaining--;
      if (entry.daysRemaining <= 0) {
        const qty = entry.qty || 1;
        this.state.popChildren = Math.max(0, this.state.popChildren - qty);
        this.state.popWorkers += qty;
        let remaining = qty;
        for (const person of this.state.citizenRoster) {
          if (remaining <= 0) break;
          if (person.type === 'child') {
            person.type = 'worker';
            remaining--;
          }
        }
        this.events.emit('cosmic-event', `👨‍💼 ${qty} child${qty === 1 ? '' : 'ren'} graduated from School to Worker!`);
      } else {
        nextSchool.push(entry);
      }
    }
    this.state.schoolEnrollments = nextSchool;

    const nextAcademy = [];
    for (const entry of this.state.academyEnrollments) {
      entry.daysRemaining--;
      if (entry.daysRemaining <= 0) {
        const qty = entry.qty || 1;
        this.state.popWorkers = Math.max(0, this.state.popWorkers - qty);
        this.state.popEngineers += qty;
        let remaining = qty;
        for (const person of this.state.citizenRoster) {
          if (remaining <= 0) break;
          if (person.type === 'worker') {
            person.type = 'engineer';
            person.isElite = false;
            remaining--;
          }
        }
        this.events.emit('cosmic-event', `👨‍🔬 ${qty} worker${qty === 1 ? '' : 's'} graduated from Academy to Engineer!`);
      } else {
        nextAcademy.push(entry);
      }
    }
    this.state.academyEnrollments = nextAcademy;
  }

  nextDay() {
    if(this.state.gameEnded) return;
    this.state.day++;
    // Tax Implementation - if Tax > 2, Happiness -3 per day
    const T = Phaser.Math.Clamp(this.state.taxLevel, 0, 4);
    // Tax Income is dependent on Population size
    const totalPop = getTotalPopulation(this.state);
    this.state.geld += (T * 2.5 * totalPop);

    if (T > 2) {
      this.state.zufriedenheit -= 3;
    }
    
    for (const key in this.state.cooldowns) if (this.state.cooldowns[key] > 0) this.state.cooldowns[key]--;
    
    // Population & Lifecycle Engine
    const dailyFoodO2 = (this.state.popChildren * 1) + (this.state.popWorkers * 2) + (this.state.popEngineers * 3);

    this.state.nahrung -= dailyFoodO2;
    this.state.sauerstoff -= dailyFoodO2;

    // Clamp physical resources to 0 minimum
    this.state.nahrung = Math.max(0, this.state.nahrung);
    this.state.sauerstoff = Math.max(0, this.state.sauerstoff);

    const foodDeficit = this.state.nahrung === 0 ? dailyFoodO2 : 0;
    const o2Deficit = this.state.sauerstoff === 0 ? dailyFoodO2 : 0;

    // Starvation Grace Period (3 days)
    if (this.state.nahrung <= 0 || this.state.sauerstoff <= 0) {
      this.state.starvationGraceDays--;

      if (this.state.starvationGraceDays > 0) {
        this.events.emit('cosmic-event', `⚠️ CRITICAL: ${this.state.starvationGraceDays} days until death. Happiness -20.`);
        this.state.zufriedenheit -= 20;
      } else {
        const totalPop = this.state.popChildren + this.state.popWorkers + this.state.popEngineers;
        if (totalPop > 0) {
          let deadType = null;
          if (this.state.popChildren > 0) {
            this.state.popChildren--;
            deadType = 'child';
          } else if (this.state.popWorkers > 0) {
            this.state.popWorkers--;
            deadType = 'worker';
          } else if (this.state.popEngineers > 0) {
            this.state.popEngineers--;
            deadType = 'engineer';
          }
          
          if (deadType) {
            const deadIndex = this.state.citizenRoster.findIndex(c => c.type === deadType);
            if (deadIndex !== -1) {
              this.state.citizenRoster.splice(deadIndex, 1);
            }
            if (deadType === 'worker' && this.state.popWorkers < this.state.workersLocked) {
               this.state.workersLocked = Math.max(0, this.state.workersLocked - 1);
            }
            if (deadType === 'engineer') {
               const lockedConstruction = this.state.constructionEngineersLocked || 0;
               const lockedDrones = this.state.dronesEngineersLocked || 0;
               if (this.state.popEngineers < lockedConstruction + lockedDrones) {
                 if (lockedConstruction > 0) this.state.constructionEngineersLocked--;
                 else if (lockedDrones > 0) this.state.dronesEngineersLocked--;
               }
            }
            this.events.emit('cosmic-event', '💀 1 citizen has died from starvation.');
          }
        }
        this.state.starvationGraceDays = 3;
      }
    } else {
      this.state.starvationGraceDays = 3;
    }

    // BIRTHS: If Happiness > 60 and Food > 0
    if (this.state.nahrung > 0 && this.state.zufriedenheit > 60 && totalPop < this.state.popCap) {
      if(Math.random() < 0.3) {
        const houses = this.tiles.filter(t => t.building && t.building.key === 'tile_housing' && t.building.daysRemaining === 0);
        const birthIndex = this.state.citizenRoster.length;
        let homeTile = this.palaceTile;
        if (birthIndex >= 20 && houses.length > 0) {
          const houseIndex = Math.floor((birthIndex - 20) / 10);
          homeTile = houses[houseIndex] || this.palaceTile;
        }
        const homeTileIndex = homeTile.x + homeTile.y * this.MAP_W;
        this.state.citizenRoster.push({ type: 'child', isElite: false, homeTileIndex });
        this.state.popChildren++;
        this.events.emit('cosmic-event', `👶 New child born!`);
      }
    }

    this.processEducationQueues();

    // DETERMINISTIC BUILDING STATUS EVALUATION
    const processedForStatus = new Set();
    for (const t of this.tiles) {
      if (!t.building || t.destroyed || processedForStatus.has(t.building)) continue;
      if (t.building.daysRemaining > 0) continue;
      processedForStatus.add(t.building);

      const b = t.building;
      const prevStatus = b.status || 'active';
      let newStatus = 'active';
      let forcedLabor = false;

      // INSTANT RECOVERY: Buildings recover immediately when conditions resolve
      if (this.state.nahrung > 0 && this.state.sauerstoff > 0 && this.state.zufriedenheit >= 40 && this.state.planet >= 50) {
        newStatus = 'active';
      }
      // DETERMINISTIC: ALL buildings fail if critical resources = 0
      else if (this.state.nahrung <= 0 || this.state.sauerstoff <= 0) {
        newStatus = 'abandoned';
        b.statusCause = this.state.nahrung <= 0 ? 'Starvation' : 'No O2';
      }
      // STRIKE OR FORCED LABOR: happiness < 30
      else if (this.state.zufriedenheit < 30) {
        if (this.state.angst >= 50) {
          newStatus = 'active';
          forcedLabor = true;
          b.statusCause = 'Forced Labor - High Fear';
        } else {
          newStatus = 'strike';
          b.statusCause = 'Happiness < 30%';
        }
      }
      // DETERMINISTIC: ALL buildings damaged if planet < 40
      else if (this.state.planet < 40) {
        newStatus = 'damaged';
        b.statusCause = 'Planet Health < 40%';
      }

      // Apply status
      b.status = newStatus;
      b.forcedLabor = forcedLabor;

      // Visual feedback + Ensure interactivity
      if (newStatus === 'abandoned') {
        b.sprite.setTint(0x880000);
      } else if (newStatus === 'strike') {
        b.sprite.setTint(0xaa0000);
      } else if (newStatus === 'damaged') {
        b.sprite.setTint(0x334433);
      } else {
        b.sprite.clearTint();
      }

      // Ensure sprite remains interactive for tooltips
      if (!b.sprite.input) {
        b.sprite.setInteractive();
      }

      // Log status change
      const bConfig = this.getBuildConfig(b.key);
      const bName = bConfig ? bConfig.name : (b.key.split('_')[1] || b.key);

      if (prevStatus !== newStatus && newStatus !== 'active' && !forcedLabor) {
        const labels = { abandoned: '🔴 ABANDONED', strike: '✊ STRIKE', damaged: '☢️ DAMAGED' };
        this.events.emit('cosmic-event', `${labels[newStatus]}: ${bName}`);
      } else if (forcedLabor && prevStatus === 'strike') {
        this.events.emit('cosmic-event', `⚠️ Forced Labor: ${bName}`);
      } else if (prevStatus !== newStatus && newStatus === 'active' && !forcedLabor) {
        this.events.emit('cosmic-event', `✅ Building recovered: ${bName}`);
      }
    }

    // Happiness modifiers
    const taxImpact = 2 - (T * T);
    const knowCurse = -Math.floor(Math.min(this.state.wissen, 500) / 100) * (T + 1);
    const hungerPanic = this.state.nahrung === 0 && foodDeficit > 0 ? -Math.floor(foodDeficit / 10) * 2 : 0;
    const ecoPanic = this.state.planet < 50 ? -Math.floor((50 - this.state.planet) / 10) * (1 + Math.floor(this.state.wissen / 50)) : 0;
    
    this.state.zufriedenheit += (taxImpact + knowCurse + hungerPanic + ecoPanic);
    this.state.zufriedenheit = Phaser.Math.Clamp(this.state.zufriedenheit, 0, 100);
    if (this.state.zufriedenheit < 50) {
      let reasons = [];
      if (this.state.nahrung <= 0) reasons.push("Starvation");
      if (this.state.planet < 50) reasons.push("Dying Planet");
      if (this.state.wissen > 80) reasons.push("Existential Dread");
      if (this.state.taxLevel > 2) reasons.push("Oppressive Taxes");
      let reasonStr = reasons.length > 0 ? reasons.join(", ") : "General Unrest";
      this.events.emit('cosmic-event', `⚠️ MORALE CRITICAL: ${reasonStr}`);
    }

    if (this.state.nahrung > 0 && this.state.sauerstoff > 0) {
      this.state.gesundheit += 5;
    } else {
      this.state.gesundheit -= (foodDeficit + o2Deficit) * 0.5;
    }
    this.state.gesundheit = Phaser.Math.Clamp(this.state.gesundheit, 0, 100);

    // Fear Decay: Base 1 + floor(Engineers/5)
    let fearDecay = 1 + Math.floor(this.state.popEngineers / 5);
    this.state.angst = Math.max(0, this.state.angst - fearDecay);

    // Child Labor Buff Countdown
    if (this.state.childLaborDaysRemaining > 0) {
      this.state.childLaborDaysRemaining--;
    }

    // Martial Law countdown
    if (this.state.martialLawDaysRemaining > 0) {
      this.state.martialLawDaysRemaining--;
      if (this.state.martialLawDaysRemaining === 0) {
        this.events.emit('cosmic-event', '⚖️ Martial Law expired. Riot protection removed.');
      }
    }

    this.syncSentimentAliases();

    if (this.state.happiness <= 0 && this.state.fear < 40) {
      this.triggerEnding('Uprising');
      return;
    }



    if (this.state.efficiencyOverrideDays > 0) {
      this.state.efficiencyOverrideDays--;
      if (this.state.efficiencyOverrideDays === 0) {
        // Override expired, recalculate normally
        let baseE = (this.state.zufriedenheit + (this.state.angst * 1.5)) / 80;
        this.state.efficiency = Math.min(1.0, baseE);
        if (this.state.gesundheit < 50) this.state.efficiency *= 0.7;
      }
      // else keep current efficiency from riot/inquisition
    } else {
      let baseE = (this.state.zufriedenheit * 0.7 + this.state.angst * 0.3) / 100;
      this.state.efficiency = Math.min(1.0, baseE);
      if (this.state.gesundheit < 50) this.state.efficiency *= 0.7;
    }
    this.state.efficiency = Math.max(0, this.state.efficiency);

    if (this.state.nahrung <= 0 && this.state.angst < 40 && this.state.martialLawDaysRemaining <= 0) this.triggerRiot('Food Riot');
    else if (T >= 3 && this.state.zufriedenheit < 20 && this.state.martialLawDaysRemaining <= 0) this.triggerRiot('Tax Strike');
    else if (this.state.planet < 40 && this.state.wissen > 60 && this.state.martialLawDaysRemaining <= 0) this.triggerRiot('Eco-Protest');

    // Calculate population capacity once per day
    this.state.popCap = 20 + (this.tiles.filter(t => t.building && t.building.key === 'tile_housing' && t.building.daysRemaining === 0).length * 10);

    let resourceBuildings = [];
    let processedBuildings = new Set();
    const E = this.state.efficiency; 

    // Process buildings with workforce assignment logic
    for (const t of this.tiles) {
      if (!t.building || t.destroyed || processedBuildings.has(t.building)) continue;
      processedBuildings.add(t.building);

      const b = t.building;
      if (b.daysRemaining > 0) {
        b.daysRemaining--;
        if (b.daysRemaining <= 0) {
          b.sprite.clearTint(); b.sprite.setAlpha(1);
          this.state.workersLocked = Math.max(0, this.state.workersLocked - (b.lockedWorkers || 0));
          this.state.constructionEngineersLocked = Math.max(0, this.state.constructionEngineersLocked - (b.lockedEngineers || 0));
          if (b.overlay) b.overlay.destroy();
          if (b.timerText) b.timerText.destroy();
          if (b.domOverlay) b.domOverlay.destroy();
          
          // --- ANIMATION: Grid Shockwave & Thump ---
          const config = this.getBuildConfig(b.key);
          const is2x2 = config && config.size === 2;
          const bldW = this.TILE_SIZE * (is2x2 ? 2 : 1);
          
          // Thump bounce
          b.sprite.setScale((b.sprite.originalScaleX || 1) * 0.8, (b.sprite.originalScaleY || 1) * 0.8);
          this.tweens.add({
            targets: b.sprite,
            scaleX: b.sprite.originalScaleX || 1,
            scaleY: b.sprite.originalScaleY || 1,
            duration: 600,
            ease: 'Bounce.easeOut'
          });
          
          // Expanding neon shockwave
          const shockwave = this.add.rectangle(b.sprite.x, b.sprite.y, bldW, bldW);
          shockwave.setStrokeStyle(4, 0x00e5ff, 1);
          shockwave.setDepth(20);
          
          this.tweens.add({
            targets: shockwave,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 500,
            ease: 'Sine.easeOut',
            onComplete: () => shockwave.destroy()
          });

          // Bind interactions now that it is fully complete
          this.bindBuildingInteractions(b.sprite, b);
        } else {
          if (b.timerText) {
            const dayStr = b.daysRemaining === 1 ? 'DAY' : 'DAYS';
            b.timerText.setText(b.daysRemaining + '\n' + dayStr);
          }
        }
      } else {
        if(b.key === 'tile_housing') { /* popCap already updated */ }

        const status = b.status || 'active';

        // Only add to resource buildings if has workers assigned AND is active
        if(['tile_farm', 'tile_o2', 'tile_mine'].includes(b.key) && b.workers > 0 && status === 'active') {
          if (this.state.childLaborDaysRemaining > 0) {
            const childBonus = Math.floor(this.state.popChildren * 0.5);
            resourceBuildings.push({tile: t, bld: b, childBonus});
          } else {
            resourceBuildings.push({tile: t, bld: b});
          }
        }

        if(b.key === 'tile_uni' && status === 'active') this.state.wissen += Math.floor(5 * E);
        if(b.key === 'planet_stabilizer' && status === 'active') this.state.planet += Math.floor(5 * E);
        if(b.key === 'atmo_synthesizer' && status === 'active') this.state.sauerstoff += Math.floor(50 * E);
        if(b.key === 'planetary_cracker' && status === 'active') {
          this.state.minerals += Math.floor(40 * E);
          this.state.planet -= 3;
        }
      }
    }

    // Process drone production queue
    if (typeof this.state.drones.owned !== 'number') this.state.drones.owned = 5;
    // Capacity: base 5 (palace) + 5 for each completed drone hub
    const droneHubCount = this.tiles.filter(t => t.building && t.building.key === 'tile_dronehub' && t.building.daysRemaining === 0).length;
    this.state.drones.capacity = 5 + (droneHubCount * 5);
    if (Array.isArray(this.state.droneQueue) && this.state.droneQueue.length > 0) {
      const remainingQueue = [];
      for (const q of this.state.droneQueue) {
        q.days = (q.days || 1) - 1;
        if (q.days <= 0) {
          const space = Math.max(0, this.state.drones.capacity - this.state.drones.owned);
          const actuallyAdded = Math.min(q.qty || 0, space);
          if (actuallyAdded > 0) this.state.drones.owned += actuallyAdded;
          const released = (q.qty || 0) * 2;
          this.state.dronesEngineersLocked = Math.max(0, this.state.dronesEngineersLocked - released);
          if (actuallyAdded < q.qty) {
            this.events.emit('cosmic-event', `⚠️ Drone assembly partially blocked: produced ${actuallyAdded}/${q.qty} due to capacity.`);
          } else {
            this.events.emit('cosmic-event', `✅ Drone production complete: ${q.qty} unit(s)`);
          }
        } else {
          remainingQueue.push(q);
        }
      }
      this.state.droneQueue = remainingQueue;
    }

    // Calculate active drones
    this.calculateActiveDrones();
    let requiredSlots = 0;
    for (const rb of resourceBuildings) {
      requiredSlots += (rb.bld && rb.bld.sprite && rb.bld.sprite.displayWidth > this.TILE_SIZE) ? 2 : 1;
    }

    // Prioritize drones: O2 > Food > Minerals
    resourceBuildings.sort((a, b) => {
      const priority = { tile_o2: 3, tile_farm: 2, tile_mine: 1 };
      return (priority[b.bld.key] || 0) - (priority[a.bld.key] || 0);
    });

    const produceCount = Math.min(this.state.drones.active, resourceBuildings.length);
    for(let i=0; i<produceCount; i++) {
      const target = resourceBuildings[i];
      const status = target.bld.status || 'active';
      if (status === 'active') {
        if(target.bld.key === 'tile_farm') {
          const baseProduction = Math.floor(15 * E);
          const childBonus = target.childBonus ? Math.floor(target.childBonus * 7.5 * E) : 0;
          this.state.nahrung += baseProduction + childBonus;
        }
        if(target.bld.key === 'tile_o2') {
          const baseProduction = Math.floor(15 * E);
          const childBonus = target.childBonus ? Math.floor(target.childBonus * 7.5 * E) : 0;
          this.state.sauerstoff += baseProduction + childBonus;
        }
        if(target.bld.key === 'tile_mine') {
          const baseProduction = Math.floor(10 * E);
          const childBonus = target.childBonus ? Math.floor(target.childBonus * 5 * E) : 0;
          this.state.minerals += baseProduction + childBonus;
          this.state.planet -= 0.5;
        }
        this.animateDroneFlight(target.tile);
      }
    }

    this.state.planet = Phaser.Math.Clamp(this.state.planet, 0, 100);

    // Planet desaturation at low health
    if (this.bgPlanet && this.state.planet < 50) {
      const grayAmount = (50 - this.state.planet) / 50;
      const tintValue = 255 - Math.floor(grayAmount * 80);
      this.bgPlanet.setTint(Phaser.Display.Color.GetColor(tintValue, tintValue, tintValue));
    } else if (this.bgPlanet) {
      this.bgPlanet.clearTint();
    }

    if (requiredSlots > this.state.drones.active) {
      this.events.emit('cosmic-event', `⚠️ Logistics Failure: ${requiredSlots - this.state.drones.active} drone slots unavailable!`);
    }

    this.calculateNetIncome();
    this.animateCitizens(processedBuildings);
    this.checkEndings();

    this.events.emit('state-updated', this.state);
  }

  animateDroneFlight(targetTile) {
    if(!this.palaceTile) return;
    const sx = this.palaceTile.x * this.TILE_SIZE + 32;
    const sy = this.palaceTile.y * this.TILE_SIZE + 32;
    const tx = targetTile.x * this.TILE_SIZE + 32;
    const ty = targetTile.y * this.TILE_SIZE + 32;

    const drone = this.add.image(sx, sy, 'drone').setDisplaySize(16, 16);
    this.tweens.add({
      targets: drone, x: tx, y: ty, duration: 1500, yoyo: true, ease: 'Sine.easeInOut',
      onComplete: () => drone.destroy()
    });
  }

  animateCitizens(activeBuildingsSet) {
    if(!this.palaceTile) return;
    const totalPop = this.state.popChildren + this.state.popWorkers + this.state.popEngineers;
    if(totalPop <= 0) return;

    const workBuildings = Array.from(activeBuildingsSet).filter(b => b.daysRemaining === 0 && b.key !== 'tile_housing' && b.key !== 'tile_palace');
    if (workBuildings.length === 0) return;

    const roster = Array.isArray(this.state.citizenRoster) ? this.state.citizenRoster : [];
    const dotsToSpawn = Math.min(10, roster.length);

    for (let i = 0; i < dotsToSpawn; i++) {
      this.time.delayedCall(i * 50, () => {
        if (i >= roster.length) return;
        const citizen = roster[i];
        const citizenKey = citizen.type === 'worker'
          ? 'citizen_uneducated'
          : citizen.type === 'engineer'
            ? 'citizen_educated'
            : 'citizen_child';

        const homeTile = this.tiles[citizen.homeTileIndex] || this.palaceTile;
        const startX = homeTile.x * this.TILE_SIZE + 32;
        const startY = homeTile.y * this.TILE_SIZE + 32;

        const targetBld = Phaser.Math.RND.pick(workBuildings);
        const targetSpr = targetBld.sprite;
        const citizenSprite = this.add.image(startX, startY, citizenKey).setDisplaySize(20, 20);

        this.tweens.add({
          targets: citizenSprite,
          x: targetSpr.x,
          y: targetSpr.y,
          duration: 2000,
          ease: 'Power1',
          onComplete: () => {
            this.tweens.add({
              targets: citizenSprite,
              angle: 360,
              duration: 1000,
              repeat: 1,
              onComplete: () => {
                this.tweens.add({
                  targets: citizenSprite,
                  x: startX,
                  y: startY,
                  duration: 2000,
                  ease: 'Power1',
                  onComplete: () => citizenSprite.destroy()
                });
              }
            });
          }
        });
      });
    }
  }

  checkEndings() {
    const s = this.state;
    const totalPop = s.popChildren + s.popWorkers + s.popEngineers;
    if (totalPop <= 0 || s.planet <= 0) {
      this.triggerEnding('Collapse');
    } else if (s.happiness <= 0 && s.fear < 40) {
      this.triggerEnding('Uprising');
    } else if (s.day >= 100 && s.zufriedenheit > 80 && s.planet > 80 && s.techs.planetStabilizer) {
      this.triggerEnding('Ascension');
    } else if (s.techs.arkBlueprint && s.geld >= 30000 && this.tiles.some(t => t.building && t.building.key === 'ark_ship')) {
      this.triggerEnding('Escape');
    }
  }

  startWithPreset(presetName) {
    if (!this.stateInitialized || !this.state) {
      console.error('State not ready');
      return;
    }

    if (presetName === 'wealthy') {
      this.state.geld = 5000;
      this.state.popWorkers = 15;
      this.state.popEngineers = 2;
      this.state.popChildren = 0;
    } else if (presetName === 'scientific') {
      this.state.geld = 500;
      this.state.nahrung = 150;
      this.state.sauerstoff = 150;
      this.state.popWorkers = 0;
      this.state.popEngineers = 10;
      this.state.popChildren = 0;
      this.state.wissen = 60;
      this.state.techs.hydroponics = true;
      this.state.techs.basicSchooling = true;
    } else if (presetName === 'dictator') {
      this.state.geld = 300;
      this.state.minerals = 100;
      this.state.nahrung = 200;
      this.state.sauerstoff = 200;
      this.state.popWorkers = 20;
      this.state.popEngineers = 0;
      this.state.popChildren = 0;
      this.state.angst = 50;
      this.state.fear = 50;
      this.state.factionLoyalty = { rust: 0, order: 0, guild: 0 };
    }
    
    // Rebuild citizen roster based on preset
    this.state.citizenRoster = [];
    const hT = 7 + 7 * this.MAP_W;
    for (let i = 0; i < this.state.popWorkers; i++) this.state.citizenRoster.push({ type: 'worker', isElite: true, homeTileIndex: hT });
    for (let i = 0; i < this.state.popEngineers; i++) this.state.citizenRoster.push({ type: 'engineer', isElite: true, homeTileIndex: hT });
    for (let i = 0; i < this.state.popChildren; i++) this.state.citizenRoster.push({ type: 'child', isElite: true, homeTileIndex: hT });
    
    this.state.popCap = 20;
    this.syncSentimentAliases();
    this.calculateNetIncome();
    this.scene.resume();
    this.events.emit('state-updated', this.state);
  }

  triggerEnding(type) {
    const normalizedType = String(type).toLowerCase() === 'uprising' ? 'Uprising' : type;
    this.state.gameEnded = true;
    this.cameras.main.fade(3000, 0, 0, 0);
    this.time.delayedCall(3000, () => {
      this.events.emit('trigger-ending', normalizedType);
    });
  }

  researchTech(techId) {
    let costG = 0, costW = 0, req = null, reqEng = 0;
    // Basic mapping of costs
    if (techId === 'hydroponics') { costG = 100; costW = 20; }
    else if (techId === 'advO2') { costG = 150; costW = 30; req = 'hydroponics'; }
    else if (techId === 'deepExcavation') { costG = 200; costW = 40; }
    else if (techId === 'droneRouting') { costG = 200; costW = 50; req = 'deepExcavation'; reqEng = 10; }
    else if (techId === 'atmoSynthesizer') { costG = 500; costW = 150; req = 'advO2'; reqEng = 15; }
    else if (techId === 'planetaryCracker') { costG = 800; costW = 200; req = 'deepExcavation'; reqEng = 20; }
    else if (techId === 'basicSchooling') { costG = 100; costW = 20; }
    else if (techId === 'tradeSkills') { costG = 200; costW = 50; reqEng = 5; }
    else if (techId === 'massMedia') { costG = 300; costW = 60; req = 'basicSchooling'; reqEng = 12; }
    else if (techId === 'surveillance') { costG = 400; costW = 80; req = 'massMedia'; reqEng = 15; }
    else if (techId === 'planetStabilizer') { costG = 1000; costW = 300; req = 'droneRouting'; reqEng = 20; }
    else if (techId === 'arkBlueprint') { costG = 2000; costW = 500; req = 'surveillance'; reqEng = 25; }
    else if (techId === 'royalGenome') { costG = 5000; costW = 1000; req = 'arkBlueprint'; reqEng = 30; }

    if (this.state.techs[techId]) return this.events.emit('toast-event', { msg: 'Already researched.', type: 'error' });
    if (req && !this.state.techs[req]) return this.events.emit('toast-event', { msg: 'Missing prerequisite technology.', type: 'error' });
    if (this.state.popEngineers < reqEng) return this.events.emit('toast-event', { msg: `Requires ${reqEng} Engineers.`, type: 'error' });
    if (this.state.geld < costG || this.state.wissen < costW) return this.events.emit('toast-event', { msg: 'Insufficient Credits or Knowledge.', type: 'error' });

    this.state.geld -= costG;
    this.state.wissen -= costW;
    this.state.techs[techId] = true;
    this.events.emit('toast-event', { msg: `Research Complete.`, type: 'system' });
    this.events.emit('state-updated', this.state);
  }

  handleTrade(faction, product, payment, qtyNum, bluffActive) {
    const qty = parseInt(qtyNum, 10) || 1;
    
    if (!this.state.techs) this.state.techs = {};

    // Product Definitions
    const products = {
      minerals: { basePrice: 200, yield: 1000, grant: (q) => { this.state.minerals += q * 1000; } },
      technology: { basePrice: 1500, yield: 1, grant: (q) => {
        const allTechIds = ['hydroponics', 'advO2', 'deepExcavation', 'droneRouting', 'atmoSynthesizer', 'planetaryCracker', 'basicSchooling', 'tradeSkills', 'massMedia', 'surveillance', 'planetStabilizer', 'arkBlueprint', 'royalGenome'];
        const locked = allTechIds.filter(id => !this.state.techs[id]);
        if (locked.length > 0) {
          // Shuffle and pick
          const randTech = locked[Math.floor(Math.random() * locked.length)];
          this.state.techs[randTech] = true;
          this.events.emit('cosmic-event', `Unlocked Technology: ${randTech.toUpperCase()}!`);
        } else {
          this.state.wissen += 500;
          this.events.emit('cosmic-event', `No new tech available. Granted 500 Knowledge.`);
        }
      }},
      sauerstoff: { basePrice: 150, yield: 1000, grant: (q) => { this.state.sauerstoff += q * 1000; } },
      nahrung: { basePrice: 100, yield: 1000, grant: (q) => { this.state.nahrung += q * 1000; } },
      medicine: { basePrice: 400, yield: 1, grant: (q) => { this.state.gesundheit = Math.min(100, this.state.gesundheit + (20 * q)); } },
      artifacts: { basePrice: 800, yield: 1, grant: (q) => { this.state.wissen += 40 * q; } },
      geld: { basePrice: 500, yield: 1000, grant: (q) => { this.state.geld += q * 1000; } }
    };

    if (!products[product]) return "Unknown product requested.";
    const pDef = products[product];
    let basePrice = pDef.basePrice;

    // Bluff Logic
    let loyalty = this.state.factionLoyalty[faction] || 0;
    if (bluffActive) {
      if (Math.random() < 0.5) {
        loyalty += 20;
        this.events.emit('cosmic-event', `Bluff successful! Loyalty +20.`);
      } else {
        loyalty -= 40;
        this.events.emit('cosmic-event', `Bluff failed! Loyalty -40.`);
        this.state.factionLoyalty[faction] = Math.max(-100, loyalty);
        this.events.emit('state-updated', this.state);
        return "The bluff was called! They walked away insulted.";
      }
    }
    
    // Discount Calculation
    let discount = Math.floor((Math.max(0, loyalty) / 100) * 40);
    let pricePerUnit = Math.floor(basePrice * (1 - discount / 100));
    let totalCost = pricePerUnit * qty;

    // Process Payment
    if (payment === 'geld') {
      if (this.state.geld < totalCost) {
        this.events.emit('toast-event', { msg: 'Insufficient Credits.', type: 'error' });
        return "Insufficient Credits for this transaction.";
      }
      this.state.geld -= totalCost;
    } else if (payment === 'mineralien') {
      if (this.state.minerals < totalCost) {
        this.events.emit('toast-event', { msg: 'Insufficient Minerals.', type: 'error' });
        return "Insufficient Minerals for this transaction.";
      }
      this.state.minerals -= totalCost;
    } else if (payment === 'nahrung') {
      if (this.state.nahrung < totalCost) {
        this.events.emit('toast-event', { msg: 'Insufficient Food.', type: 'error' });
        return "Insufficient Food for this transaction.";
      }
      this.state.nahrung -= totalCost;
    } else if (payment === 'child') {
      let costInUnits = Math.ceil(totalCost / 100);
      if (this.state.popChildren < costInUnits) return "Insufficient Children for this slave contract.";
      this.state.popChildren -= costInUnits;
      
      let removed = costInUnits;
      for (let i = this.state.citizenRoster.length - 1; i >= 0; i--) {
        if (this.state.citizenRoster[i].type === 'child' && removed > 0) { this.state.citizenRoster.splice(i, 1); removed--; }
      }
    } else if (payment === 'worker') {
      let costInUnits = Math.ceil(totalCost / 500);
      if (this.state.popWorkers < costInUnits) return "Insufficient Workers for this slave contract.";
      this.state.popWorkers -= costInUnits;

      let removed = costInUnits;
      for (let i = this.state.citizenRoster.length - 1; i >= 0; i--) {
        if (this.state.citizenRoster[i].type === 'worker' && removed > 0) { this.state.citizenRoster.splice(i, 1); removed--; }
      }
    } else if (payment === 'engineer') {
      let costInUnits = Math.ceil(totalCost / 3500);
      const unassignedEng = Math.max(0, this.state.popEngineers - (this.state.dronesEngineersLocked || 0) - (this.state.constructionEngineersLocked || 0));
      if (unassignedEng < costInUnits) return "Insufficient unassigned Engineers for this slave contract.";
      this.state.popEngineers -= costInUnits;

      let removed = costInUnits;
      for (let i = this.state.citizenRoster.length - 1; i >= 0; i--) {
        if (this.state.citizenRoster[i].type === 'engineer' && removed > 0) { this.state.citizenRoster.splice(i, 1); removed--; }
      }
    } else {
      return "Invalid payment method.";
    }

    // Grant Product
    pDef.grant(qty);

    // Increase Loyalty
    this.state.factionLoyalty[faction] = Math.min(100, (this.state.factionLoyalty[faction] || 0) + (5 * qty));
    this.events.emit('state-updated', this.state);

    const responses = {
      rust: [
        "The Obsidian eye sees your payment. The contract is fulfilled.",
        "Shadows deliver. No refunds.",
        "Your transaction has been erased from the ledger."
      ],
      order: [
        "The sacred breath flows to you.",
        "May the waters of the deep cleanse your colony.",
        "We trade the holy substance. Do not squander it."
      ],
      guild: [
        "A pleasure doing business. Scrap's loaded.",
        "Don't ask where it came from. Just take it.",
        "My crew will deliver it to the airlock. Watch your back."
      ]
    };

    const flavorArray = responses[faction] || ["Trade complete."];
    return flavorArray[Math.floor(Math.random() * flavorArray.length)];
  }
}