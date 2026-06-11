import { getEnrollmentCount, getTotalPopulation } from '../game/educationHelpers.js';

export default class UIManager {
  constructor() {
    this.typingTimers = {};
    this.tradeState = {};
    this.tradeMode = 'buy';
    this.paymentCurrency = 'geld';
    this.typewriterTimer = null;
    this.tradeCatalog = {
      minerals: { label: 'Minerals', icon: '/assets/icon_min.png', buyGeld: 10, sellGeld: 5, canSell: true },
      food: { label: 'Food', icon: '/assets/icon_food.png', buyGeld: 15, sellGeld: 8, canSell: true },
      o2: { label: 'O2', icon: '/assets/icon_o2.png', buyGeld: 20, sellGeld: 10, canSell: true },
      technology: { label: 'Tech Blueprints', icon: '/assets/icon_tech.png', buyGeld: 2500, sellGeld: null, canSell: false },
      knowledge: { label: 'Knowledge', icon: '/assets/icon_knowledge.png', buyGeld: 500, sellGeld: null, canSell: false },
      health: { label: 'Medical Supplies', icon: '/assets/icon_health.png', buyGeld: 40, sellGeld: 20, canSell: true },
      medicine: { label: 'Medical Supplies', icon: '/assets/icon_medicine.png', buyGeld: 40, sellGeld: 20, canSell: true },
      credits: { label: 'Credits', icon: '/assets/icon_money.png', buyGeld: 1, sellGeld: 1, canSell: true },
      artifacts: { label: 'Artifacts', icon: '/assets/icon_artifact.png', buyGeld: 500, sellGeld: null, canSell: false, knowledgeGrant: 100 }
    };
    this.currencyCatalog = {
      geld: { label: 'Money', icon: '/assets/icon_money.png', rate: 1 },
      minerals: { label: 'Minerals', icon: '/assets/icon_min.png', rate: 10 },
      food: { label: 'Food', icon: '/assets/icon_food.png', rate: 15 },
      o2: { label: 'O2', icon: '/assets/icon_o2.png', rate: 20 },
      citizens: { label: 'Citizens', icon: '/assets/child.png', rate: 25 }
    };
    this.tooltipData = {
      decrees: {
        propaganda: {
          title: 'Ministry of Truth',
          lore: 'Control information flows to reshape public opinion. Increases Happiness at the cost of Knowledge.',
          effect: '-50 Knowledge, +20 Happiness, -10 Fear'
        },
        inquisition: {
          title: 'The Inquisition',
          lore: 'A brutal intelligence apparatus to root out dissent. Greatly increases Fear and control.',
          effect: '+40 Fear, +100% Efficiency, -20 Health'
        },
        social: {
          title: 'Social Package',
          lore: 'Distribute synthetic rations and medical supplies to placate the masses.',
          effect: '+30 Happiness, +10 Health'
        },
        manipulation: {
          title: 'Resource Manipulation',
          lore: 'Seize unauthorized shipments from the Cartels. High risk of angering factions.',
          effect: 'Random resources, -15 Loyalty'
        },
        publicHealth: {
          title: 'Public Health Initiative',
          lore: 'Release airborne stimulants into the ventilation system.',
          effect: '+25 Health, +5 Happiness'
        },
        suppressRiots: {
          title: 'Suppress Riots',
          lore: 'Deploy armored enforcers with stun-batons to brutally crush lower-sector dissent.',
          effect: '+60 Fear, -10 Happiness'
        },
        childLabor: {
          title: 'Child Labor Decree',
          lore: 'Small hands are perfect for cleaning hazardous exhaust vents. Forces children into the workforce.',
          effect: '-30 Happiness, +20 Fear'
        },
        tax: {
          title: 'Imperial Tax Level',
          lore: 'Adjust tax rates. Higher taxes yield more Geld, but devastate Happiness.',
          effect: 'Higher revenue, greater unrest'
        }
      },
      tech: {
        hydroponics: 'Synthesize nutrient-paste from subterranean moss. Unlocks Farm.',
        advO2: 'Purify the toxic atmosphere into breathable air. Unlocks O2 Generator.',
        deepExcavation: 'Drill deep into the crust for raw materials. Unlocks Mine.',
        droneRouting: 'Automate the workforce. Unlocks Drone Hub.',
        basicSchooling: 'Educate the youth to become productive cogs. Unlocks Academy.',
        atmoSynthesizer: 'Produces colossal amounts of breathable air. Unlocks Atmo-Synthesizer.',
        planetaryCracker: 'Shatters the planetary crust for infinite minerals. Unlocks Planetary Cracker.',
        tradeSkills: 'Optimize negotiations. Unlocks Advanced Barter System.',
        massMedia: 'Control the narrative. Unlocks Propaganda Decrees.',
        surveillance: 'Watch their every move. Unlocks Purge Decrees.',
        planetStabilizer: 'Heal the world. Unlocks Planet Stabilizer.',
        arkBlueprint: 'Build the escape vessel. Unlocks Royal Ark.',
        royalGenome: 'Pure blood. Unlocks Apotheosis Ending.'
      }
    };

    this.techDictionary = {
      hydroponics: { title: "Hydroponics", lore: this.tooltipData.tech.hydroponics, costG: 100, costW: 20, effect: "Unlocks Farm", req: null, reqEng: 0 },
      advO2: { title: "Advanced O2", lore: this.tooltipData.tech.advO2, costG: 150, costW: 30, effect: "Unlocks O2 Generator", req: "hydroponics", reqEng: 0 },
      atmoSynthesizer: { title: "Atmo-Synthesizer", lore: this.tooltipData.tech.atmoSynthesizer, costG: 500, costW: 150, effect: "Unlocks Atmo-Synthesizer", req: "advO2", reqEng: 15 },
      deepExcavation: { title: "Excavation", lore: this.tooltipData.tech.deepExcavation, costG: 200, costW: 40, effect: "Unlocks Mineral Mine", req: null, reqEng: 0 },
      planetaryCracker: { title: "Planetary Cracker", lore: this.tooltipData.tech.planetaryCracker, costG: 800, costW: 200, effect: "Unlocks Planetary Cracker", req: "deepExcavation", reqEng: 20 },
      droneRouting: { title: "Drone Logic", lore: this.tooltipData.tech.droneRouting, costG: 200, costW: 50, effect: "Unlocks Drone Hub", req: "deepExcavation", reqEng: 10 },
      basicSchooling: { title: "Academy", lore: this.tooltipData.tech.basicSchooling, costG: 100, costW: 20, effect: "Unlocks Academy", req: null, reqEng: 0 },
      tradeSkills: { title: "Trade Skills", lore: this.tooltipData.tech.tradeSkills, costG: 200, costW: 50, effect: "Unlocks Advanced Barter", req: null, reqEng: 5 },
      massMedia: { title: "Mass Media", lore: this.tooltipData.tech.massMedia, costG: 300, costW: 60, effect: "Unlocks Propaganda Decrees", req: "basicSchooling", reqEng: 12 },
      surveillance: { title: "Surveillance", lore: this.tooltipData.tech.surveillance, costG: 400, costW: 80, effect: "Unlocks Purge Decrees", req: "massMedia", reqEng: 15 },
      planetStabilizer: { title: "Planet Stabilizer", lore: this.tooltipData.tech.planetStabilizer, costG: 1000, costW: 300, effect: "Unlocks Planet Stabilizer", req: "droneRouting", reqEng: 20 },
      arkBlueprint: { title: "Ark Blueprint", lore: this.tooltipData.tech.arkBlueprint, costG: 2000, costW: 500, effect: "Unlocks Royal Ark", req: "surveillance", reqEng: 25 },
      royalGenome: { title: "Royal Genome", lore: this.tooltipData.tech.royalGenome, costG: 5000, costW: 1000, effect: "Unlocks Apotheosis Ending", req: "arkBlueprint", reqEng: 30 }
    };

    this.factionDialogues = {
      rust: {
        success: ["Good business, Your Majesty. My crew eats tonight.", "Fair price. Loading the crates now.", "You pay, we deliver. That's the Syndicate way."],
        rejected: ["You think my boys will choke on dust for these scraps? Try again.", "That's an insult. My scavengers wouldn't lift a wrench for that.", "Keep your pennies, 'King'. We ain't a charity."],
        bluffCaught: ["Did you really think my slicers wouldn't verify your ledgers? Pathetic.", "Fake numbers, fake king. Don't try to hustle the hustlers."],
        bluffSuccess: ["Alright, alright! No need to flash your hidden vaults. We'll give you a discount.", "With pockets that deep... yeah, we can make a deal."]
      },
      order: {
        success: ["The Great Filter smiles upon us. Your tribute is accepted.", "May pure air fill your lungs. The pact is blessed.", "You value the Breath. We shall provide it."],
        rejected: ["You will suffocate on your own greed. We offer life, not a market haggle.", "Sacrilege. The sacred filters demand a far greater tithe.", "Inhale the toxic ash of the Wasteland, then reconsider your offering."],
        bluffCaught: ["The Breath reveals all lies. Your vaults are as empty as your soul, heretic.", "You project false idols. We see right through your phantom wealth."],
        bluffSuccess: ["Such magnificent hidden reserves... It seems the Filter has chosen you. We yield.", "Your unseen power is a sign from above. The Order accepts your terms."]
      },
      guild: {
        success: ["Funds verified. The Guild values your cooperation.", "Precise and correct. A pleasure doing business.", "Transaction logged. The dark market serves those who can pay."],
        rejected: ["Our algorithms find your offer... humorous. Denied.", "We do not haggle at a bazaar. We dictate terms. Adjust your bid.", "Time is money, and you are wasting both. Terminating link."],
        bluffCaught: ["Our auditors flagged your accounts as fraudulent. Do not insult our intelligence.", "Phantom credits? The Guild operates in reality, not illusions. Trust rating downgraded."],
        bluffSuccess: ["Hidden capital verified. We can offer you... priority client status.", "Impressive liquidity. The Guild is authorized to apply a strategic discount."]
      }
    };

    this.bindDOM();

    // Ensure build cost tooltip element exists and is referenced before event listeners run
    let bc = document.querySelector('#ui-build-cost-tooltip');
    if (!bc) {
      bc = document.createElement('div');
      bc.id = 'ui-build-cost-tooltip';
      bc.className = 'ui-build-cost-tooltip hidden';
      document.body.appendChild(bc);
    }
    this.buildCostTooltipEl = bc;

    this.attachEvents();
    
    window.addEventListener('load', () => {
      const game = window.__DER_LETZTE_KOENIG_GAME__;
      if (!game) return;
      const t = setInterval(() => {
        this.scene = game.scene.getScene('GameScene');
        if (this.scene) { clearInterval(t); this.hookScene(); }
      }, 200);
    });
  }

  bindDOM() {
    this.el = {
      topbarContent: document.getElementById('topbar-content'),
      btnNextDay: document.getElementById('btn-next-day'),
      toastContainer: document.getElementById('toast-container'),
      buildBtns: Array.from(document.querySelectorAll('.build-option')),
      modals: Array.from(document.querySelectorAll('.fullscreen-modal')),
      modalTriggers: Array.from(document.querySelectorAll('.trigger-modal')),
      closeBtns: Array.from(document.querySelectorAll('.modal-close-btn')),
      techNodes: Array.from(document.querySelectorAll('.tech-node')),
      decreeCards: Array.from(document.querySelectorAll('.decree-card')),

      startMenu: document.getElementById('start-menu'),
      startTabBtns: Array.from(document.querySelectorAll('.start-tab-btn')),
      presetBtns: Array.from(document.querySelectorAll('.preset-btn')),
      restartBtn: document.getElementById('restart-btn'),

      // Tax System
      taxSlider: document.getElementById('tax-slider'),
      taxDisplay: document.getElementById('tax-display'),
      taxControls: document.querySelector('.tax-controls'),

      // Tooltip
      tt: document.getElementById('tech-tooltip'),
      ttTitle: document.getElementById('tt-title'),
      ttLore: document.getElementById('tt-lore'),
      ttCosts: document.getElementById('tt-costs'),
      ttEffects: document.getElementById('tt-effects'),

      // Resource Cell Tooltip
      resourceTooltip: document.getElementById('resource-tooltip'),

      // Education Modal
      educationModal: document.getElementById('education-modal'),
      educationTitle: document.getElementById('education-header-title'),
      educationCopy: document.getElementById('education-header-copy'),
      schoolSection: document.getElementById('education-school-section'),
      academySection: document.getElementById('education-academy-section'),
      educationClose: document.getElementById('education-close'),
      childrenIdleInput: document.getElementById('children-idle-input'),
      workersIdleInput: document.getElementById('workers-idle-input'),
      submitChildrenBtn: document.getElementById('submit-children-btn'),
      submitWorkersBtn: document.getElementById('submit-workers-btn'),

      // Drone Modal
      droneModal: document.getElementById('drone-modal'),
      droneClose: document.getElementById('drone-close'),
      droneInput: document.getElementById('drone-qty-input'),
      droneSubmit: document.getElementById('submit-drone-btn'),
      droneCapDisplay: document.getElementById('drone-cap-display'),
      droneEngDisplay: document.getElementById('drone-eng-display'),
      droneLockedDisplay: document.getElementById('drone-eng-locked'),
      droneGeldDisplay: document.getElementById('drone-geld-display'),
      droneMineralsDisplay: document.getElementById('drone-minerals-display'),
      droneQtyHelp: document.getElementById('drone-qty-help'),

      // Geopolitics
      geoMasterBtns: Array.from(document.querySelectorAll('.geo-faction-btn')),
      geoDetailCards: Array.from(document.querySelectorAll('.detail-card')),
      bluffToggle: document.getElementById('bluff-switch'),
      itemCards: Array.from(document.querySelectorAll('.item-card')),
      buildButtons: Array.from(document.querySelectorAll('.build-option')),
      tradeWindows: {}
    };

    // Initialize trade windows dictionary
    ['rust', 'order', 'guild'].forEach(faction => {
      this.el.tradeWindows[faction] = {
        window: document.getElementById(`trade-${faction}`),
        qtyInput: document.getElementById(`trade-qty-${faction}`),
        offerInput: document.getElementById(`trade-offer-${faction}`),
        cancelBtn: document.getElementById(`trade-cancel-${faction}`),
        submitBtn: document.getElementById(`trade-submit-${faction}`),
        summaryQty: document.getElementById(`summary-qty-${faction}`),
        summaryBase: document.getElementById(`summary-base-${faction}`),
        summaryDiscount: document.getElementById(`summary-discount-${faction}`),
        summaryTotal: document.getElementById(`summary-total-${faction}`),
        dialogue: document.getElementById(`dialogue-${faction}`),
        selectedResource: null
      };
    });

    // Track previous state for floating text
    this.prevState = {};
  }

  attachEvents() {
    this.el.btnNextDay.addEventListener('click', () => {
      this.scene?.events.emit('end-day');
      this.forceHideTooltip();
    });

    this.el.startTabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.el.startTabBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        document.querySelectorAll('.start-tab-pane').forEach(pane => pane.classList.remove('active'));
        const targetPane = document.getElementById(`${tab}-tab`);
        if (targetPane) targetPane.classList.add('active');
      });
    });

    this.el.presetBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const preset = e.currentTarget.dataset.preset;
        if (this.scene) {
          this.scene.startWithPreset(preset);
          this.el.startMenu.classList.add('hidden');
        }
      });
    });

    if (this.el.restartBtn) {
      this.el.restartBtn.addEventListener('click', () => {
        location.reload();
      });
    }

    // Tax Slider
    if(this.el.taxSlider) {
      this.el.taxSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        this.el.taxDisplay.textContent = val;
        if(this.scene) {
          this.scene.state.taxLevel = val;
          this.updateUI(this.scene.state);
        }
      });
    }

    // Tax Controls Hover Tooltip (Imperial Tax Level)
    if (this.el.taxControls) {
      this.el.taxControls.addEventListener('mouseenter', (e) => this.showDecreeTooltip('tax', e));
      this.el.taxControls.addEventListener('mousemove', (e) => this.showDecreeTooltip('tax', e));
      this.el.taxControls.addEventListener('mouseleave', () => this.hideAnyTooltip());
    }

    // Modal Triggers
    this.el.modalTriggers.forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.getElementById(e.currentTarget.dataset.target).classList.remove('hidden');
        this.forceHideTooltip();
        if (this.buildCostTooltipEl) this.buildCostTooltipEl.classList.add('hidden');
      });
    });

    this.el.closeBtns.forEach(btn => btn.addEventListener('click', (e) => {
      e.currentTarget.closest('.fullscreen-modal').classList.add('hidden');
      this.forceHideTooltip();
      if (this.buildCostTooltipEl) this.buildCostTooltipEl.classList.add('hidden');
      this.closeAllTradeWindows();
    }));

    // Drone Modal Close
    if (this.el.droneClose) {
      this.el.droneClose.addEventListener('click', () => {
        if (this.el.droneModal) this.el.droneModal.classList.add('hidden');
        if (this.scene) this.scene.events.emit('hide-map-tooltip');
      });
    }

    // Drone Modal Submit
    if (this.el.droneSubmit) {
      this.el.droneSubmit.addEventListener('click', () => {
        const qty = Math.max(1, parseInt(this.el.droneInput?.value) || 1);
        if (this.scene) {
          this.scene.events.emit('produce-drones', qty);
          this.el.droneInput.value = 1; // Reset input
          this.updateDroneUI(this.scene.state);
        }
        if (this.el.droneModal) this.el.droneModal.classList.add('hidden');
      });
    }

    // Drone Quantity Input - Update validation on change
    if (this.el.droneInput) {
      this.el.droneInput.addEventListener('input', () => {
        if (this.scene) {
          this.updateDroneUI(this.scene.state);
        }
      });
    }

    // Education Modal Close
    if(this.el.educationClose) {
      this.el.educationClose.addEventListener('click', () => {
        this.el.educationModal.classList.add('hidden');
      });
    }

    // Education Submit Handlers
    if(this.el.submitChildrenBtn) {
      this.el.submitChildrenBtn.addEventListener('click', () => {
        const qty = parseInt(this.el.childrenIdleInput.value) || 0;
        const enrolled = this.scene?.enqueueEducation('school', qty) || 0;
        if (enrolled > 0) {
          this.updateEducationUI(this.scene?.state);
        }
      });
    }

    if(this.el.submitWorkersBtn) {
      this.el.submitWorkersBtn.addEventListener('click', () => {
        const maxAllowed = parseInt(this.el.workersIdleInput.max || '0') || 0;
        const qty = Math.min(Math.max(0, parseInt(this.el.workersIdleInput.value) || 0), maxAllowed);
        if (this.el.workersIdleInput) this.el.workersIdleInput.value = String(qty);
        const enrolled = this.scene?.enqueueEducation('academy', qty) || 0;
        if (enrolled > 0) {
          this.updateEducationUI(this.scene?.state);
        }
      });
    }

    // Build Buttons
    this.el.buildBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const isAct = e.currentTarget.classList.contains('active-build');
        this.el.buildBtns.forEach(b => b.classList.remove('active-build'));
        if (isAct) { this.scene?.events.emit('cancel-build-mode'); return; }
        e.currentTarget.classList.add('active-build');
        this.scene?.events.emit('enter-build-mode', e.currentTarget.dataset.build);
      });
      btn.addEventListener('mouseenter', (e) => this.showBuildTooltip(e.currentTarget.dataset.build, e));
      btn.addEventListener('mousemove', (e) => this.showBuildTooltip(e.currentTarget.dataset.build, e));
      btn.addEventListener('mouseleave', () => this.hideAnyTooltip());
    });

    // Tech Nodes
    this.el.techNodes.forEach(node => {
      node.addEventListener('mousemove', (e) => this.showTooltip(e, node));
      node.addEventListener('mouseleave', () => this.forceHideTooltip());
      node.addEventListener('click', (e) => this.tryResearch(e.currentTarget.dataset.tech));
    });

    // Decree Cards
    this.el.decreeCards.forEach(card => {
      card.addEventListener('click', (e) => {
        if(!card.classList.contains('tech-locked')) {
          this.scene?.events.emit('action-decree', card.dataset.decree);
        }
      });
      card.addEventListener('mouseenter', (e) => this.showDecreeTooltip(e.currentTarget.dataset.decree, e));
      card.addEventListener('mousemove', (e) => this.showDecreeTooltip(e.currentTarget.dataset.decree, e));
      card.addEventListener('mouseleave', () => this.hideAnyTooltip());
    });

    // Resource Cell Tooltips are bound after each topbar render.

    // Geopolitics Faction Buttons
    this.el.geoMasterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.el.geoMasterBtns.forEach(b => b.classList.remove('active'));
        this.el.geoDetailCards.forEach(c => c.classList.add('hidden'));
        e.currentTarget.classList.add('active');
        document.getElementById(e.currentTarget.dataset.target).classList.remove('hidden');
        this.forceHideTooltip();
        this.closeAllTradeWindows();
      });
    });

    // Item Cards
    this.el.itemCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const factionId = card.dataset.faction;
        const resourceType = card.dataset.resource;
        this.showTradeWindow(factionId, resourceType);
      });

      // Add hover tooltips for geopolitics items
      card.addEventListener('mouseenter', (e) => this.showGeopoliticsItemTooltip(card, e));
      card.addEventListener('mousemove', (e) => this.showGeopoliticsItemTooltip(card, e));
      card.addEventListener('mouseleave', () => this.hideAnyTooltip());
    });

    // Trade Window Controls
    ['rust', 'order', 'guild'].forEach(faction => {
      const tw = this.el.tradeWindows[faction];

      tw.qtyInput.addEventListener('input', () => this.updateTradeCalculation(faction));

      tw.cancelBtn.addEventListener('click', () => {
        tw.window.classList.add('hidden');
        tw.qtyInput.value = '1';
        tw.offerInput.value = '';
      });

      tw.submitBtn.addEventListener('click', () => {
        const qty = parseInt(tw.qtyInput.value) || 0;
        if(qty > 0) {
          this.executeTrade(faction, tw.selectedResource);
          tw.window.classList.add('hidden');
          tw.qtyInput.value = '1';
          tw.offerInput.value = '';
        }
      });
    });
  }

  showTradeWindow(factionId, resourceType) {
    this.closeAllTradeWindows();
    const tw = this.el.tradeWindows[factionId];
    tw.selectedResource = resourceType;
    tw.tradeState = {
      mode: 'buy',
      currency: 'geld',
      citizenType: 'children',
      quantity: 1,
      offer: ''
    };

    const resource = this.tradeCatalog[resourceType] || this.tradeCatalog.minerals;
    const buyOnly = !resource.canSell;

    tw.window.innerHTML = `
      <div class="trade-negotiation">
        <div class="trade-title">Trade Negotiation</div>
        <div class="trade-header">
          <div class="trade-item-pill">
            <img src="${resource.icon}" class="inline-icon" alt="${resource.label}">
            <span>${resource.label}</span>
          </div>
          <div class="trade-mode-toggle">
            <button class="btn ${tw.tradeState.mode === 'buy' ? 'primary' : ''} trade-mode-btn" data-trade-mode="buy">BUY</button>
            <button class="btn ${buyOnly ? 'tech-locked' : ''} ${tw.tradeState.mode === 'sell' ? 'primary' : ''} trade-mode-btn" data-trade-mode="sell" ${buyOnly ? 'disabled' : ''}>SELL</button>
          </div>
        </div>

        <div class="trade-info" id="trade-info-${factionId}"></div>

        <div class="trade-input-group">
          <label>Quantity:</label>
          <input type="number" id="trade-qty-${factionId}" min="1" value="1" class="trade-number-input">
        </div>

        <div class="trade-input-group">
          <label>Pay With:</label>
          <div class="trade-currency-row">
            <button class="btn trade-currency-btn active" data-currency="geld"><img src="/assets/icon_money.png" class="inline-icon" alt="Money">Money</button>
            <button class="btn trade-currency-btn" data-currency="o2"><img src="/assets/icon_o2.png" class="inline-icon" alt="O2">O2</button>
            <button class="btn trade-currency-btn" data-currency="minerals"><img src="/assets/icon_min.png" class="inline-icon" alt="Minerals">Minerals</button>
            <button class="btn trade-currency-btn" data-currency="citizens"><img src="/assets/child.png" class="inline-icon" alt="Citizens">Citizens</button>
          </div>
        </div>

        <div class="trade-input-group trade-citizen-row hidden" id="trade-citizen-row-${factionId}">
          <label>Citizens:</label>
          <div class="trade-citizen-buttons">
            <button class="btn trade-citizen-btn active" data-citizen="engineers">Engineers</button>
            <button class="btn trade-citizen-btn" data-citizen="workers">Workers</button>
            <button class="btn trade-citizen-btn" data-citizen="children">Children</button>
          </div>
        </div>

        <div class="trade-input-group">
          <label>My Offer:</label>
          <input type="number" id="trade-offer-${factionId}" min="1" value="0" class="trade-number-input">
        </div>

        <div class="trade-summary">
          <div class="trade-summary-line"><span>Quantity:</span><span id="summary-qty-${factionId}">1</span></div>
          <div class="trade-summary-line"><span>Calculated Base Price:</span><span id="summary-base-${factionId}">0</span></div>
          <div class="trade-summary-line"><span>Offer / Base Ratio:</span><span id="summary-discount-${factionId}">1.00</span></div>
          <div class="trade-summary-line"><span style="color: var(--accent-gold); font-weight: bold;">Total:</span><span id="summary-total-${factionId}" style="color: var(--accent-gold); font-weight: bold;">0</span></div>
        </div>

        <div class="trade-buttons">
          <button class="btn" id="trade-cancel-${factionId}">Cancel</button>
          <button class="btn primary" id="trade-submit-${factionId}">Submit Offer</button>
        </div>

        <div class="faction-dialogue hidden" id="dialogue-${factionId}"><div class="dialogue-text"></div></div>
      </div>
    `;

    this.el.tradeWindows[factionId] = {
      window: tw.window,
      qtyInput: document.getElementById(`trade-qty-${factionId}`),
      offerInput: document.getElementById(`trade-offer-${factionId}`),
      cancelBtn: document.getElementById(`trade-cancel-${factionId}`),
      submitBtn: document.getElementById(`trade-submit-${factionId}`),
      summaryQty: document.getElementById(`summary-qty-${factionId}`),
      summaryBase: document.getElementById(`summary-base-${factionId}`),
      summaryDiscount: document.getElementById(`summary-discount-${factionId}`),
      summaryTotal: document.getElementById(`summary-total-${factionId}`),
      dialogue: document.getElementById(`dialogue-${factionId}`),
      selectedResource: resourceType,
      tradeState: tw.tradeState,
      modeButtons: Array.from(tw.window.querySelectorAll('[data-trade-mode]')),
      currencyButtons: Array.from(tw.window.querySelectorAll('.trade-currency-btn')),
      citizenButtons: Array.from(tw.window.querySelectorAll('.trade-citizen-btn')),
      citizenRow: document.getElementById(`trade-citizen-row-${factionId}`),
      infoEl: document.getElementById(`trade-info-${factionId}`),
      sellDisabled: buyOnly
    };

    const current = this.el.tradeWindows[factionId];
    current.window.classList.remove('hidden');
    current.qtyInput.value = '1';
    current.offerInput.value = '0';

    current.modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.tradeMode === 'sell' && buyOnly) return;
        current.tradeState.mode = btn.dataset.tradeMode;
        this.tradeMode = current.tradeState.mode;
        current.modeButtons.forEach(b => b.classList.toggle('primary', b.dataset.tradeMode === current.tradeState.mode));
        if (current.citizenRow) current.citizenRow.style.display = (current.tradeState.currency === 'citizens' && current.tradeState.mode === 'buy') ? 'flex' : 'none';
        this.updateTradeCalculation(factionId);
      });
    });

    current.currencyButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        current.tradeState.currency = btn.dataset.currency;
        this.paymentCurrency = btn.dataset.currency;
        current.currencyButtons.forEach(b => b.classList.toggle('active', b.dataset.currency === btn.dataset.currency));
        if (current.citizenRow) current.citizenRow.style.display = (btn.dataset.currency === 'citizens' && current.tradeState.mode === 'buy') ? 'flex' : 'none';
        this.updateTradeCalculation(factionId);
      });
    });

    current.citizenButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        current.tradeState.citizenType = btn.dataset.citizen;
        current.citizenButtons.forEach(b => b.classList.toggle('active', b.dataset.citizen === btn.dataset.citizen));
        this.updateTradeCalculation(factionId);
      });
    });

    current.qtyInput.addEventListener('input', () => this.updateTradeCalculation(factionId));
    current.offerInput.addEventListener('input', () => this.updateTradeCalculation(factionId));
    current.cancelBtn.addEventListener('click', () => this.closeAllTradeWindows());
    current.submitBtn.addEventListener('click', () => {
      if (this.typewriterTimer) clearInterval(this.typewriterTimer);
      const textEl = current.dialogue?.querySelector('.dialogue-text');
      if (textEl) textEl.innerHTML = '';
      this.executeTrade(factionId, resourceType);
    });

    if (this.el.tradeWindows[factionId].citizenRow) this.el.tradeWindows[factionId].citizenRow.style.display = 'none';
    this.updateTradeCalculation(factionId);
  }

  updateTradeCalculation(factionId) {
    const tw = this.el.tradeWindows[factionId];
    if (!tw || !tw.tradeState || !this.scene) return;

    const qty = Math.max(1, parseInt(tw.qtyInput?.value) || 1);
    tw.tradeState.quantity = qty;

    const resource = this.tradeCatalog[tw.selectedResource] || this.tradeCatalog.minerals;
    const mode = tw.tradeState.mode || 'buy';
    const baseMoneyPerUnit = mode === 'buy' ? (resource.buyGeld ?? 0) : (resource.sellGeld ?? 0);
    const totalBaseMoney = baseMoneyPerUnit * qty;
    const currency = tw.tradeState.currency || 'geld';
    const citizenType = tw.tradeState.citizenType || 'children';
    const currencyValue = this.getCurrencyRate(currency, citizenType);
    const calculatedBasePrice = currencyValue > 0 ? Math.max(1, Math.ceil(totalBaseMoney / currencyValue)) : totalBaseMoney;

    tw.summaryQty.textContent = String(qty);
    tw.summaryBase.innerHTML = `${calculatedBasePrice} <img src="${this.currencyCatalog[currency]?.icon || '/assets/icon_money.png'}" class="inline-icon" alt="${currency}">`;
    if (!tw.offerInput.value || Number.isNaN(parseInt(tw.offerInput.value, 10))) {
      tw.offerInput.value = String(calculatedBasePrice);
    }

    const offer = Math.max(0, parseInt(tw.offerInput.value) || calculatedBasePrice);
    const ratio = calculatedBasePrice > 0 ? offer / calculatedBasePrice : 1;
    tw.summaryDiscount.textContent = ratio.toFixed(2);
    tw.summaryTotal.innerHTML = `${offer} <img src="${this.currencyCatalog[currency]?.icon || '/assets/icon_money.png'}" class="inline-icon" alt="${currency}">`;

    const infoEl = tw.infoEl || tw.window.querySelector('.trade-info');
    if (infoEl) {
      const resourceType = tw.selectedResource;
      const resource = this.tradeCatalog[resourceType] || this.tradeCatalog.minerals;
      const itemHtml = `<img src="${resource.icon}" class="inline-icon" alt="${resource.label}">`;
      let priceInfo = '';
      if (mode === 'buy') {
        priceInfo = `Base Price: ${baseMoneyPerUnit * qty} <img src="/assets/icon_money.png" class="inline-icon" alt="Money"> for ${qty} ${itemHtml}`;
        if (resourceType === 'artifacts' && resource.knowledgeGrant) {
          priceInfo += `<div style="color: var(--accent-cyan); margin-top: 4px;">Grants +${resource.knowledgeGrant * qty} Knowledge</div>`;
        }
      } else {
        priceInfo = `Sell Price: ${baseMoneyPerUnit * qty} <img src="/assets/icon_money.png" class="inline-icon" alt="Money"> for ${qty} ${itemHtml}`;
      }
      infoEl.innerHTML = priceInfo;
    }

    if (tw.citizenRow) tw.citizenRow.classList.toggle('hidden', currency !== 'citizens' || mode !== 'buy');
  }

  closeAllTradeWindows() {
    Object.values(this.el.tradeWindows).forEach(tw => {
      tw.window.classList.add('hidden');
    });
    this.hideAnyTooltip();
  }

  executeTrade(factionId, resourceType) {
    const tw = this.el.tradeWindows[factionId];
    if (!tw || !this.scene) return;
    const state = this.scene.state;
    const resource = this.tradeCatalog[resourceType] || this.tradeCatalog.minerals;
    const mode = tw.tradeState?.mode || 'buy';
    const currency = tw.tradeState?.currency || 'geld';
    const citizenType = tw.tradeState?.citizenType || 'children';
    const quantity = Math.max(1, parseInt(tw.qtyInput?.value, 10) || 1);
    const baseMoneyPerUnit = mode === 'buy' ? (resource.buyGeld ?? 0) : (resource.sellGeld ?? 0);

    if (mode === 'sell' && resource.sellGeld == null) {
      this.displayFactionDialogue(factionId, this.factionDialogues[factionId].rejected);
      this.log(`❌ ${resource.label} cannot be sold.`);
      return;
    }

    if (mode === 'buy' && resourceType === 'technology') {
      const lockedTechsCount = Object.keys(this.techDictionary).filter(key => !state.techs[key]).length;
      if (quantity > lockedTechsCount) {
        this.displayFactionDialogue(factionId, this.factionDialogues[factionId].rejected);
        this.log('❌ No more technologies to learn or quantity too high.');
        return;
      }
    }

    const rawOffer = String(tw.offerInput?.value || '').trim();
    const parsedOffer = parseInt(rawOffer, 10);
    if (!rawOffer || Number.isNaN(parsedOffer) || parsedOffer <= 0) {
      this.displayFactionDialogue(factionId, this.factionDialogues[factionId].rejected);
      this.log('❌ Offer must be greater than zero.');
      return;
    }
    const offer = parsedOffer;

    if (currency === 'geld' && state.geld < offer) {
      this.log('❌ Not enough resources to make this offer');
      return;
    }
    if (currency === 'minerals' && state.minerals < offer) {
      this.log('❌ Not enough resources to make this offer');
      return;
    }
    if (currency === 'food' && state.nahrung < offer) {
      this.log('❌ Not enough resources to make this offer');
      return;
    }
    if (currency === 'o2' && state.sauerstoff < offer) {
      this.log('❌ Not enough resources to make this offer');
      return;
    }
    if (currency === 'citizens') {
      const citizenPrice = citizenType === 'engineers' ? 100 : citizenType === 'workers' ? 50 : 25;
      const requiredPeople = Math.ceil(offer / citizenPrice);
      if ((citizenType === 'engineers' && state.popEngineers < requiredPeople)
          || (citizenType === 'workers' && state.popWorkers < requiredPeople)
          || (citizenType === 'children' && state.popChildren < requiredPeople)) {
        this.log('❌ Not enough resources to make this offer');
        return;
      }
    }

    const currencyRate = this.getCurrencyRate(currency, citizenType);
    const calculatedBasePrice = Math.max(1, Math.ceil((baseMoneyPerUnit * quantity) / currencyRate));
    const factionLoyalty = state.factionLoyalty ? (state.factionLoyalty[factionId] || 0) : 50;
    const maxDiscount = Math.max(0, Math.min(0.4, factionLoyalty / 250));
    const requiredOffer = Math.max(1, Math.floor(calculatedBasePrice * (1 - maxDiscount)));

    if (offer < requiredOffer || offer <= 0) {
      if(state.factionLoyalty) state.factionLoyalty[factionId] = Math.max(-100, factionLoyalty - 10);
      this.displayFactionDialogue(factionId, this.factionDialogues[factionId].rejected);
      this.log(`❌ Faction rejects the offer. Required: at least ${requiredOffer}.`);
      this.scene.events.emit('state-updated', state);
      return;
    }

    const takeCurrency = (amount) => {
      if (currency === 'geld') state.geld -= amount;
      else if (currency === 'minerals') state.minerals -= amount;
      else if (currency === 'food') state.nahrung -= amount;
      else if (currency === 'o2') state.sauerstoff -= amount;
      else if (currency === 'citizens') {
        let requiredPeople = citizenType === 'engineers'
          ? Math.ceil(amount / 100)
          : citizenType === 'workers'
            ? Math.ceil(amount / 50)
            : Math.ceil(amount / 25);
        if (citizenType === 'engineers') {
          state.popEngineers -= requiredPeople;
        } else if (citizenType === 'workers') {
          state.popWorkers -= requiredPeople;
        } else {
          state.popChildren -= requiredPeople;
        }
        for (let i = state.citizenRoster.length - 1; i >= 0 && requiredPeople > 0; i--) {
          const person = state.citizenRoster[i];
          if ((citizenType === 'engineers' && person.type === 'engineer')
              || (citizenType === 'workers' && person.type === 'worker')
              || (citizenType === 'children' && person.type === 'child')) {
            state.citizenRoster.splice(i, 1);
            requiredPeople--;
          }
        }
      }
    };

    const giveCurrency = (amount) => {
      if (currency === 'geld') state.geld += amount;
      else if (currency === 'minerals') state.minerals += amount;
      else if (currency === 'food') state.nahrung += amount;
      else if (currency === 'o2') state.sauerstoff += amount;
      else if (currency === 'citizens') {
        const childrenToGive = Math.min(5, Math.floor(amount / 25));
        state.popChildren += childrenToGive;
      }
    };

    if (mode === 'buy') {
      takeCurrency(offer);
      this.grantTradeItem(state, resourceType, quantity);
      this.displayFactionDialogue(factionId, this.factionDialogues[factionId].success);
      this.log(`🤝 Bought ${quantity} ${resource.label} for ${offer} ${currency}.`);
    } else {
      if (!this.consumeTradeItem(state, resourceType, quantity)) {
        this.displayFactionDialogue(factionId, this.factionDialogues[factionId].rejected);
        this.log(`❌ Not enough ${resource.label} to sell.`);
        this.scene.events.emit('state-updated', state);
        return;
      }
      giveCurrency(offer);
      this.displayFactionDialogue(factionId, this.factionDialogues[factionId].success);
      this.log(`🤝 Sold ${quantity} ${resource.label} for ${offer} ${currency}.`);
    }

    if(state.factionLoyalty) state.factionLoyalty[factionId] = Math.min(100, factionLoyalty + 5);
    this.scene.events.emit('state-updated', state);
  }

  displayFactionDialogue(factionId, reactionArray) {
    const tw = this.el.tradeWindows[factionId];
    const dialogue = reactionArray[Math.floor(Math.random() * reactionArray.length)];
    const dialogueEl = tw.dialogue;
    
    dialogueEl.classList.remove('hidden');
    const textEl = dialogueEl.querySelector('.dialogue-text');
    if (this.typewriterTimer) clearInterval(this.typewriterTimer);
    if (this.typingTimers[factionId]) clearInterval(this.typingTimers[factionId]);
    textEl.innerHTML = '';

    let index = 0;
    this.typewriterTimer = setInterval(() => {
      if (index < dialogue.length) {
        textEl.innerHTML += dialogue.charAt(index);
        index++;
        return;
      }

      clearInterval(this.typewriterTimer);
      this.typingTimers[factionId] = null;
      this.typewriterTimer = null;
      setTimeout(() => {
        dialogueEl.classList.add('hidden');
        textEl.innerHTML = '';
      }, 2000);
    }, 40);
    this.typingTimers[factionId] = this.typewriterTimer;
  }

  showGeopoliticsItemTooltip(card, e) {
    if (!this.el.tt) return;

    const resourceType = card.dataset.resource;
    const resource = this.tradeCatalog[resourceType];
    if (!resource) return;

    let effectText = '';

    if (resourceType === 'artifacts') {
      effectText = `Effect: Grants +${resource.knowledgeGrant || 100} Knowledge per unit`;
    } else if (resourceType === 'technology') {
      effectText = 'Effect: Unlocks 1 random locked technology';
    } else if (resourceType === 'health' || resourceType === 'medicine') {
      effectText = 'Effect: +1 Health per unit (max 100)';
    } else if (resourceType === 'knowledge') {
      effectText = 'Effect: +1 Knowledge per unit for research';
    } else if (resourceType === 'minerals') {
      effectText = 'Effect: +1 Minerals per unit for construction';
    } else if (resourceType === 'food') {
      effectText = 'Effect: +1 Food per unit (population sustenance)';
    } else if (resourceType === 'o2') {
      effectText = 'Effect: +1 O2 per unit (population breathing)';
    } else {
      effectText = 'Trade resource';
    }

    this.el.ttTitle.textContent = resource.label;
    this.el.ttLore.textContent = '';
    this.el.ttCosts.innerHTML = `Buy Price: ${resource.buyGeld || 'N/A'} <img src="/assets/icon_money.png" class="inline-icon" alt="Money">`;
    this.el.ttEffects.textContent = effectText;
    this.el.tt.style.display = 'block';
    this.el.tt.style.left = `${e.pageX + 15}px`;
    this.el.tt.style.top = `${e.pageY + 15}px`;
    this.el.tt.classList.remove('hidden');
  }

  hideAnyTooltip() {
    this.forceHideTooltip();
    if (this.buildCostTooltipEl) this.buildCostTooltipEl.classList.add('hidden');
  }

  showBuildTooltip(buildKey, e) {
    if (!this.buildCostTooltipEl || !this.scene) return;
    const config = this.scene.getBuildConfig(buildKey);
    const data = this.getBuildTooltipData(buildKey);
    if (!config || !data) return;
    
    const reqClass = config.size === 2 ? 'Engineers' : 'Workers/Engineers';
    const costHtml = `${config.cost} <img src="/assets/icon_money.png" class="inline-icon" alt="Money"> + ${config.mineralCost} <img src="/assets/icon_min.png" class="inline-icon" alt="Min">`;
    this.buildCostTooltipEl.innerHTML = `<strong>${data.title}</strong><div>${costHtml}</div><div style="margin-top:4px; color:var(--accent-cyan);">Requires: ${config.workers} ${reqClass}</div><div style="margin-top:4px; color:var(--muted); font-style:italic;">${data.effect}</div>`;
    this.buildCostTooltipEl.style.left = `${e.pageX + 14}px`;
    this.buildCostTooltipEl.style.top = `${e.pageY + 14}px`;
    this.buildCostTooltipEl.classList.remove('hidden');
  }

  showDecreeTooltip(decreeKey, e) {
    if (!this.el.tt || !this.tooltipData.decrees[decreeKey]) return;
    const data = this.tooltipData.decrees[decreeKey];
    this.el.ttTitle.textContent = data.title;
    this.el.ttLore.textContent = data.lore;
    this.el.ttCosts.innerHTML = `Cost: <img src="/assets/icon_money.png" class="inline-icon" alt="Money">`;
    this.el.ttEffects.textContent = data.effect;
    this.el.tt.style.display = 'block';
    this.el.tt.style.left = `${e.pageX + 15}px`;
    this.el.tt.style.top = `${e.pageY + 15}px`;
    this.el.tt.classList.remove('hidden');
  }

  getBuildTooltipData(buildKey) {
    const buildMap = {
      tile_palace: { title: 'Palace', costG: 0, costM: 0, effect: 'The seat of your power. Generates baseline Geld.' },
      tile_housing: { title: 'Housing Block', costG: 50, costM: 30, effect: 'Increases Max Population capacity by +10.' },
      tile_farm: { title: 'Farm', costG: 80, costM: 50, effect: 'Produces Food. Requires Workers.' },
      tile_o2: { title: 'O2 Generator', costG: 100, costM: 60, effect: 'Produces O2. Requires Workers.' },
      tile_mine: { title: 'Excavation Mine', costG: 150, costM: 80, effect: 'Produces Minerals. Requires Workers.' },
      tile_school: { title: 'School', costG: 150, costM: 75, effect: 'Capacity: 5 Students. Educates Children into Workers (5 days).' },
      tile_uni: { title: 'Academy', costG: 200, costM: 120, effect: 'Capacity: 5 Students. Educates Workers into Engineers (7 days).' },
      tile_dronehub: { title: 'Drone Hub', costG: 200, costM: 100, effect: 'Maintains drones for passive resource gathering.' },
      atmo_synthesizer: { title: 'Atmo-Synthesizer', costG: 1200, costM: 650, effect: 'Megastructure. Massively boosts O2 production. Requires Engineers.' },
      planetary_cracker: { title: 'Planetary Cracker', costG: 1400, costM: 700, effect: 'Megastructure. Obliterates crust for infinite minerals. Requires Engineers.' },
      planet_stabilizer: { title: 'Planet Stabilizer', costG: 800, costM: 400, effect: 'Megastructure. Heals the dying world.' },
      ark_ship: { title: 'Royal Ark', costG: 1000, costM: 500, effect: 'Megastructure. Your escape vessel. Requires Engineers.' }
    };
    if (!buildKey) return undefined;
    if (buildMap[buildKey]) return buildMap[buildKey];

    // Try normalized key matches (underscores, hyphens, spaces)
    const normalize = s => String(s || '').toLowerCase().replace(/[-\s]+/g, '_');
    const nk = normalize(buildKey);
    for (const k in buildMap) {
      if (normalize(k) === nk) return buildMap[k];
      if (buildMap[k].title && normalize(buildMap[k].title) === nk) return buildMap[k];
      if (buildMap[k].title && normalize(buildMap[k].title).includes(nk)) return buildMap[k];
    }

    return undefined;
  }

  updateEducationUI(state) {
    if (!state) return;
    const schoolCapacity = this.scene?.getEducationCapacity('school') || 0;
    const academyCapacity = this.scene?.getEducationCapacity('academy') || 0;
    const studentsInSchool = state.schoolEnrollments.reduce((sum, entry) => sum + (entry.qty || 1), 0);
    const workersInAcademy = state.academyEnrollments.reduce((sum, entry) => sum + (entry.qty || 1), 0);
    const idleChildren = Math.max(0, state.popChildren - studentsInSchool);
    const idleWorkers = Math.max(0, state.popWorkers - (state.workersLocked || 0) - workersInAcademy);

    if (this.el.childrenIdleInput) this.el.childrenIdleInput.max = String(Math.max(0, Math.min(idleChildren, schoolCapacity - studentsInSchool)));
    if (this.el.workersIdleInput) this.el.workersIdleInput.max = String(Math.max(0, Math.min(idleWorkers, academyCapacity - workersInAcademy)));
    if (this.el.childrenIdleInput && parseInt(this.el.childrenIdleInput.value) > parseInt(this.el.childrenIdleInput.max || '0')) this.el.childrenIdleInput.value = this.el.childrenIdleInput.max;
    if (this.el.workersIdleInput && parseInt(this.el.workersIdleInput.value) > parseInt(this.el.workersIdleInput.max || '0')) this.el.workersIdleInput.value = this.el.workersIdleInput.max;

    const schoolStatus = document.getElementById('school-status');
    const academyStatus = document.getElementById('academy-status');
    if (schoolStatus) {
      schoolStatus.textContent = `School Capacity: ${studentsInSchool} / ${schoolCapacity}` + (studentsInSchool ? ` | ${studentsInSchool} children in training` : ' | No children in training');
    }
    if (academyStatus) {
      academyStatus.textContent = `Academy Capacity: ${workersInAcademy} / ${academyCapacity}` + (workersInAcademy ? ` | ${workersInAcademy} workers in training` : ' | No workers in training');
    }
    const schoolProgress = document.getElementById('school-progress');
    const academyProgress = document.getElementById('academy-progress');
    if (schoolProgress) schoolProgress.style.width = `${schoolCapacity ? Math.round((studentsInSchool / schoolCapacity) * 100) : 0}%`;
    if (academyProgress) academyProgress.style.width = `${academyCapacity ? Math.round((workersInAcademy / academyCapacity) * 100) : 0}%`;
    const schoolCount = document.getElementById('idle-children-count');
    const academyCount = document.getElementById('idle-workers-count');
    if (schoolCount) schoolCount.textContent = `${idleChildren}`;
    if (academyCount) academyCount.textContent = `${idleWorkers}`;
  }

  updateDroneUI(state) {
    if (!state) return;
    
    const qty = Math.max(1, parseInt(this.el.droneInput?.value) || 1);
    const freeEngineers = Math.max(0, state.popEngineers - (state.dronesEngineersLocked || 0));
    const geldCost = 50 * qty;
    const mineralCost = 50 * qty;
    const requiredEngineers = qty * 2;
    const canProduce = state.drones.owned + qty <= state.drones.capacity &&
               freeEngineers >= requiredEngineers &&
               state.geld >= geldCost &&
               state.minerals >= mineralCost;
    
    // Update display values
    if (this.el.droneCapDisplay) this.el.droneCapDisplay.textContent = `${state.drones.owned}/${state.drones.capacity}`;
    if (this.el.droneEngDisplay) this.el.droneEngDisplay.textContent = `${freeEngineers}/${state.popEngineers}`;
    if (this.el.droneLockedDisplay) {
      const locked = state.dronesEngineersLocked || 0;
      this.el.droneLockedDisplay.style.display = locked > 0 ? 'inline' : 'none';
      this.el.droneLockedDisplay.textContent = `Locked: ${locked}`;
    }
    if (this.el.droneGeldDisplay) this.el.droneGeldDisplay.textContent = `${state.geld}`;
    if (this.el.droneMineralsDisplay) this.el.droneMineralsDisplay.textContent = `${state.minerals}`;
    
    // Update max quantity based on capacity
    const maxPossible = Math.max(0, state.drones.capacity - state.drones.owned);
    if (this.el.droneInput) {
      this.el.droneInput.max = String(maxPossible);
      if (parseInt(this.el.droneInput.value || '1') > maxPossible) {
        this.el.droneInput.value = maxPossible;
      }
    }
    
    // Update qty help text
    if (this.el.droneQtyHelp) {
      this.el.droneQtyHelp.textContent = `Max: ${maxPossible} (capacity limited to ${state.drones.capacity})`;
    }
    
    // Update validation messages
    const validationEl = document.getElementById('drone-validation');
    let messages = '';
    
    if (state.drones.owned + qty > state.drones.capacity) {
      messages += `❌ Exceeds capacity (would be ${state.drones.owned + qty}/${state.drones.capacity})\n`;
    }
    if (freeEngineers < requiredEngineers) {
      messages += `❌ Only ${freeEngineers}/${requiredEngineers} engineers available\n`;
    }
    if (state.geld < geldCost) {
      messages += `❌ Need ${geldCost} Geld (have ${state.geld})\n`;
    }
    if (state.minerals < mineralCost) {
      messages += `❌ Need ${mineralCost} Minerals (have ${state.minerals})\n`;
    }
    
    if (validationEl) {
      if (messages) {
        validationEl.textContent = messages.trim();
        validationEl.parentElement.classList.add('error');
      } else {
        validationEl.textContent = `✅ Ready to produce ${qty} drone${qty > 1 ? 's' : ''}`;
        validationEl.parentElement.classList.remove('error');
      }
    }
    
    // Enable/disable submit button
    if (this.el.droneSubmit) {
      this.el.droneSubmit.disabled = !canProduce;
    }
  }

  showResourceTooltip(e, cell) {
    if(!this.el.resourceTooltip) return;
    
    const s = this.scene?.state;
    if(!s) return;

    const classList = cell.className;
    let tooltipHTML = '';

    if (classList.includes('money')) {
      tooltipHTML = `<strong>Money</strong><div>Currency for trades</div>`;
    } else if (classList.includes('population')) {
      const totalPop = getTotalPopulation(s);
      const lockedEngineers = (s.dronesEngineersLocked || 0) + (s.constructionEngineersLocked || 0);
      const freeEngineers = Math.max(0, s.popEngineers - lockedEngineers);
      const idleWorkers = Math.max(0, s.popWorkers - (s.workersLocked || 0) - getEnrollmentCount(s.academyEnrollments));
      tooltipHTML = `
        <strong>Population Workforce</strong>
        <div class="tooltip-row">👶 Children: ${s.popChildren} | Idle: ${Math.max(0, s.popChildren - getEnrollmentCount(s.schoolEnrollments))}</div>
        <div class="tooltip-row">👷 Workers: ${s.popWorkers} | Idle: ${idleWorkers}</div>
        <div class="tooltip-row">👨‍🔬 Engineers: ${s.popEngineers} | Idle: ${freeEngineers}</div>
        <div style="margin-top: 5px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 5px; font-size: 10px;">
          Total: ${totalPop}/${s.popCap}
        </div>
      `;
    } else if (classList.includes('food')) {
      const children = Math.max(0, s.popChildren);
      const workers = Math.max(0, s.popWorkers);
      const engineers = Math.max(0, s.popEngineers);
      const total = children + (workers * 2) + (engineers * 3);
      tooltipHTML = `<strong>Food</strong><div>Children (-1/day), Workers (-2/day), Engineers (-3/day).</div><div>Total Consumption: ${total}</div>`;
    } else if (classList.includes('o2')) {
      const children = Math.max(0, s.popChildren);
      const workers = Math.max(0, s.popWorkers);
      const engineers = Math.max(0, s.popEngineers);
      const total = children + (workers * 2) + (engineers * 3);
      tooltipHTML = `<strong>O2</strong><div>Children (-1/day), Workers (-2/day), Engineers (-3/day).</div><div>Total Consumption: ${total}</div>`;
    } else if (classList.includes('minerals')) {
      tooltipHTML = `<strong>Minerals</strong><div>Required for construction</div>`;
    } else if (classList.includes('health')) {
      tooltipHTML = `<strong>Health</strong><div>${s.gesundheit < 50 ? '⚠️ Low health!' : 'Population health'}</div>`;
    } else if (classList.includes('knowledge')) {
      tooltipHTML = `<strong>Knowledge</strong><div>Used for tech research</div>`;
    } else if (classList.includes('happiness')) {
      tooltipHTML = `<strong>Happiness</strong><div>Directly boosts colony stability and productivity</div>`;
    } else if (classList.includes('fear')) {
      tooltipHTML = `<strong>Fear</strong><div>Raises control but can trigger unrest at extremes</div>`;
    } else if (classList.includes('planet')) {
      tooltipHTML = `<strong>Planet Health</strong><div>Environmental collapse begins below 50%</div>`;
    } else if (classList.includes('day')) {
      tooltipHTML = `<strong>Day</strong><div>Simulation tick and decree cooldown progression</div>`;
    } else if (classList.includes('drones')) {
      tooltipHTML = `
        <strong>Drone Fleet</strong>
        <div class="tooltip-row">Owned: ${s.drones.owned}</div>
        <div class="tooltip-row">Capacity: ${s.drones.capacity}</div>
        <div class="tooltip-row">Active: ${s.drones.active}/${s.drones.owned}</div>
        <div style="margin-top: 5px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 5px; font-size: 12px;">
          Click Drone Hub to produce drones
        </div>
      `;
    }

    if(tooltipHTML) {
      this.el.resourceTooltip.innerHTML = tooltipHTML;
      this.el.resourceTooltip.style.display = 'block';
      this.el.resourceTooltip.style.left = (e.pageX + 15) + 'px';
      this.el.resourceTooltip.style.top = (e.pageY + 15) + 'px';
      this.el.resourceTooltip.classList.remove('hidden');
    }
  }

  hideResourceTooltip() {
    if(this.el.resourceTooltip) {
      this.el.resourceTooltip.classList.add('hidden');
      this.el.resourceTooltip.style.display = 'none';
    }
  }

  forceHideTooltip() {
    if (this.el.tt) {
      this.el.tt.classList.add('hidden');
      this.el.tt.style.display = 'none';
    }
    this.hideResourceTooltip();
  }

  showTooltip(e, node) {
    const data = this.techDictionary[node.dataset.tech];
    if(!data) return;
    this.el.ttTitle.textContent = data.title;
    this.el.ttLore.textContent = data.lore;
    this.el.ttEffects.textContent = data.effect;
    if (this.scene.state.techs[node.dataset.tech]) {
      this.el.ttCosts.innerHTML = `Status: Unlocked<br>Requires: ${data.reqEng || 0} Engineers`;
    } else {
      this.el.ttCosts.innerHTML = `Cost: ${data.costG} <img src="/assets/icon_money.png" class="inline-icon" alt="Money"> + ${data.costW} Wissen<br>Requires: ${data.reqEng || 0} Engineers`;
    }
    this.el.ttCosts.style.color = this.scene.state.techs[node.dataset.tech] ? "var(--accent-gold)" : "var(--accent-red)";
    
    this.el.tt.style.display = 'block';
    this.el.tt.style.left = (e.pageX + 15) + 'px';
    this.el.tt.style.top = (e.pageY + 15) + 'px';
    this.el.tt.classList.remove('hidden');
  }

  getCurrencyRate(currency, citizenType) {
    if (currency === 'citizens') {
      if (citizenType === 'engineers') return 100;
      if (citizenType === 'workers') return 50;
      return 25;
    }
    return this.currencyCatalog[currency]?.rate || 1;
  }

  grantTradeItem(state, resourceType, quantity) {
    if (resourceType === 'minerals') state.minerals += quantity;
    else if (resourceType === 'food') state.nahrung += quantity;
    else if (resourceType === 'o2') state.sauerstoff += quantity;
    else if (resourceType === 'health' || resourceType === 'medicine') state.gesundheit += quantity;
    else if (resourceType === 'knowledge') state.wissen += quantity;
    else if (resourceType === 'artifacts') {
      const resource = this.tradeCatalog[resourceType];
      const knowledgePerUnit = resource?.knowledgeGrant || 100;
      state.wissen += quantity * knowledgePerUnit;
      this.log(`📚 Artifacts grant +${quantity * knowledgePerUnit} Knowledge`);
    } else if (resourceType === 'technology') {
      const lockedTechs = Object.keys(this.techDictionary).filter(key => !state.techs[key]);
      for (let i = 0; i < quantity; i++) {
        if (lockedTechs.length === 0) break;
        const idx = Math.floor(Math.random() * lockedTechs.length);
        const techKey = lockedTechs.splice(idx, 1)[0];
        state.techs[techKey] = true;
        this.log(`🔓 Researched: ${this.techDictionary[techKey].title}`);
      }
    } else if (resourceType === 'credits') state.geld += quantity;
  }

  consumeTradeItem(state, resourceType, quantity) {
    if (resourceType === 'minerals' && state.minerals >= quantity) { state.minerals -= quantity; return true; }
    if (resourceType === 'food' && state.nahrung >= quantity) { state.nahrung -= quantity; return true; }
    if (resourceType === 'o2' && state.sauerstoff >= quantity) { state.sauerstoff -= quantity; return true; }
    if ((resourceType === 'technology' || resourceType === 'knowledge' || resourceType === 'artifacts') && state.wissen >= quantity) { state.wissen -= quantity; return true; }
    if ((resourceType === 'health' || resourceType === 'medicine') && state.gesundheit >= quantity) { state.gesundheit -= quantity; return true; }
    if (resourceType === 'credits' && state.geld >= quantity) { state.geld -= quantity; return true; }
    return false;
  }

  tryResearch(key) {
    const s = this.scene.state;
    const data = this.techDictionary[key];
    if (s.techs[key]) return;
    if (data.req && !s.techs[data.req]) { this.log(`❌ Requires ${this.techDictionary[data.req].title}`); return; }
    // Require minimum engineers for certain techs
    if (this.scene && data.reqEng && this.scene.state.popEngineers < data.reqEng) {
      this.log(`❌ Requires ${data.reqEng} Engineers.`); return;
    }
    
    const freeWorkers = (s.popWorkers + s.popEngineers) - s.workersLocked;
    if (freeWorkers < 5) { this.log(`❌ Research requires 5 free workers.`); return; }

    if (s.geld >= data.costG && s.wissen >= data.costW) {
      s.geld -= data.costG; s.wissen -= data.costW;
      s.techs[key] = true;
      this.log(`🔬 Researched: ${data.title}`);
      this.scene.events.emit('state-updated', s);
    } else {
      this.log(`❌ Insufficient Resources.`);
    }
  }

  hookScene() {
    this.scene.events.on('state-updated', (s) => this.updateUI(s));
    this.scene.events.on('cosmic-event', (m) => this.log(m));
    this.scene.events.on('cancel-build-mode', () => this.el.buildBtns.forEach(b => b.classList.remove('active-build')));
    this.scene.events.on('trigger-ending', (type) => this.showEnding(type));
    this.scene.events.on('open-education-modal', (sectionType) => {
      this.el.educationModal.classList.remove('hidden');
      this.forceHideTooltip();
      if (sectionType === 'school') {
        if (this.el.schoolSection) this.el.schoolSection.style.display = 'block';
        if (this.el.academySection) this.el.academySection.style.display = 'none';
        if (this.el.educationTitle) this.el.educationTitle.textContent = 'School - Children to Workers';
        if (this.el.educationCopy) this.el.educationCopy.textContent = 'Send idle children into School. They will become Workers after 5 days of training.';
      } else if (sectionType === 'academy') {
        if (this.el.schoolSection) this.el.schoolSection.style.display = 'none';
        if (this.el.academySection) this.el.academySection.style.display = 'block';
        if (this.el.educationTitle) this.el.educationTitle.textContent = 'Academy - Workers to Engineers';
        if (this.el.educationCopy) this.el.educationCopy.textContent = 'Send idle workers to the Academy. After 7 days, they graduate into Engineers.';
      } else {
        if (this.el.schoolSection) this.el.schoolSection.style.display = 'block';
        if (this.el.academySection) this.el.academySection.style.display = 'block';
        if (this.el.educationTitle) this.el.educationTitle.textContent = 'Education Management';
        if (this.el.educationCopy) this.el.educationCopy.textContent = 'Invest in the next generation. Children require 5 days to mature into Workers. Workers require 7 days to become Engineers.';
      }
      this.updateEducationUI(this.scene.state);
    });
    this.scene.events.on('open-drone-modal', () => {
      if (this.el.droneModal) {
        this.el.droneModal.classList.remove('hidden');
        this.updateDroneUI(this.scene.state);
      }
      this.forceHideTooltip();
    });
    this.scene.events.on('show-map-tooltip', (x, y, text) => {
      if (!this.buildCostTooltipEl) return;
      this.buildCostTooltipEl.innerHTML = text;
      this.buildCostTooltipEl.style.left = `${x + 15}px`;
      this.buildCostTooltipEl.style.top = `${y + 15}px`;
      this.buildCostTooltipEl.classList.remove('hidden');
    });
    this.scene.events.on('hide-map-tooltip', () => {
      if (this.buildCostTooltipEl) this.buildCostTooltipEl.classList.add('hidden');
    });
    
    if (this.scene && this.scene.state) {
      if (this.scene.state.taxLevel === undefined) this.scene.state.taxLevel = 1;
      if(this.el.taxDisplay) this.el.taxDisplay.textContent = this.scene.state.taxLevel;
      if(this.el.taxSlider) this.el.taxSlider.value = this.scene.state.taxLevel;
    }

    this.updateUI(this.scene?.state);
    this.updateEducationUI(this.scene?.state);
  }

  updateUI(s) {
    if (!s) return;

    // Initialize prevState on first run
    if (!this.prevState.geld) {
      this.prevState = {
        geld: s.geld,
        nahrung: s.nahrung,
        sauerstoff: s.sauerstoff,
        minerals: s.minerals,
        popChildren: s.popChildren,
        popWorkers: s.popWorkers,
        popEngineers: s.popEngineers
      };
    }

    // TOP BAR: Resource Cells Design (Clean, single border)
    const totalPop = getTotalPopulation(s);
    const resourceCells = `
      <div class="resource-cell money">
        <img src="/assets/icon_money.png" alt="Money" class="res-icon" onerror="this.style.display='none'">
        <span class="resource-value">${s.geld}</span>
      </div>
      <div class="resource-cell population">
        <img src="/assets/icon_pop.png" alt="Pop" class="res-icon" onerror="this.style.display='none'">
        <span class="resource-value">${totalPop}/${s.popCap}</span>
      </div>
      <div class="resource-cell drones">
        <span style="font-size: 12px;"><img src="/assets/icon_drone.png" alt="Drones" class="res-icon" style="display:inline; height:16px;"></span>
        <span class="resource-value">${s.drones.owned}/${s.drones.capacity}</span>
        ${s.dronesEngineersLocked ? `<span class="resource-locked">🔒${s.dronesEngineersLocked}</span>` : ''}
      </div>
      <div class="resource-cell food">
        <img src="/assets/icon_food.png" alt="Food" class="res-icon" onerror="this.style.display='none'">
        <span class="resource-value">${s.nahrung}</span>
        ${this.renderNetIncome(s.netIncome?.food || 0)}
      </div>
      <div class="resource-cell o2">
        <img src="/assets/icon_o2.png" alt="O2" class="res-icon" onerror="this.style.display='none'">
        <span class="resource-value">${s.sauerstoff}</span>
        ${this.renderNetIncome(s.netIncome?.o2 || 0)}
      </div>
      <div class="resource-cell minerals">
        <img src="/assets/icon_min.png" alt="Minerals" class="res-icon" onerror="this.style.display='none'">
        <span class="resource-value">${s.minerals}</span>
      </div>
      <div class="resource-cell health">
        <img src="/assets/icon_health.png" alt="Health" class="res-icon">
        <span class="resource-value">${Math.floor(s.gesundheit)}</span>
      </div>
      <div class="resource-cell knowledge">
        <img src="/assets/icon_knowledge.png" alt="Knowledge" class="res-icon">
        <span class="resource-value">${s.wissen}</span>
      </div>
      <div class="resource-cell happiness">
        <img src="/assets/icon_happiness.png" alt="Happiness" class="res-icon" onerror="this.style.display='none'">
        <span class="resource-value">${Math.floor(s.zufriedenheit)}</span>
      </div>
      <div class="resource-cell fear">
        <img src="/assets/fear.png" alt="Fear" class="res-icon">
        <span class="resource-value">${s.angst}</span>
      </div>
      <div class="resource-cell planet">
        <img src="/assets/icon_planet.png" alt="Planet" class="res-icon" onerror="this.style.display='none'">
        <span class="resource-value">${Math.floor(s.planet)}%</span>
      </div>
      <div class="resource-cell day">
        <span style="font-size: 12px;"><img src="/assets/icon_clock.png" alt="Day" class="res-icon" style="display:inline; height:16px;"></span>
        <span class="resource-value">Day ${s.day}</span>
      </div>
    `;
    
    if (this.el.topbarContent) {
      this.el.topbarContent.innerHTML = resourceCells;
      this.bindResourceCellTooltips();
    }

    // Detect resource/population changes for floating text
    const changes = {
      geld: s.geld - this.prevState.geld,
      nahrung: s.nahrung - this.prevState.nahrung,
      sauerstoff: s.sauerstoff - this.prevState.sauerstoff,
      minerals: s.minerals - this.prevState.minerals,
      popChildren: s.popChildren - this.prevState.popChildren,
      popWorkers: s.popWorkers - this.prevState.popWorkers,
      popEngineers: s.popEngineers - this.prevState.popEngineers
    };

    // Spawn floating text for significant changes
    if (this.el.topbarContent) {
      Object.keys(changes).forEach(key => {
        const change = changes[key];
        if (change !== 0 && (Math.abs(change) >= 5 || key.startsWith('pop'))) {
          const cellClass = key === 'geld' ? 'money' :
                           key === 'nahrung' ? 'food' :
                           key === 'sauerstoff' ? 'o2' :
                           key === 'minerals' ? 'minerals' :
                           key === 'popChildren' || key === 'popWorkers' || key === 'popEngineers' ? 'population' : null;
          if (cellClass) {
            const cell = this.el.topbarContent.querySelector(`.resource-cell.${cellClass}`);
            if (cell) this.spawnFloatingText(change, cell, key);
          }
        }
      });
    }

    // Store current state for next comparison
    this.prevState = {
      geld: s.geld,
      nahrung: s.nahrung,
      sauerstoff: s.sauerstoff,
      minerals: s.minerals,
      popChildren: s.popChildren,
      popWorkers: s.popWorkers,
      popEngineers: s.popEngineers
    };

    // Apply critical resource highlighting
    this.updateCriticalResourceHighlight(s);

    // Build Buttons: Tech Lock
    document.querySelectorAll('.build-option, .decree-card').forEach(btn => {
      const req = btn.dataset.req;
      if (req === 'none' || s.techs[req]) btn.classList.remove('tech-locked');
      else btn.classList.add('tech-locked');
    });

    // Tech Nodes
    this.el.techNodes.forEach(node => {
      const key = node.dataset.tech;
      const data = this.techDictionary[key];
      node.classList.remove('locked', 'available', 'unlocked');
      if (s.techs[key]) node.classList.add('unlocked');
      else if (!data.req || s.techs[data.req]) node.classList.add('available');
      else node.classList.add('locked');
    });

    // Loyalty Bars
    ['rust', 'order', 'guild'].forEach(faction => {
      const currentLoyalty = s.factionLoyalty ? (s.factionLoyalty[faction] || 0) : 50;
      const loyaltyPercent = Math.max(0, Math.min(100, (currentLoyalty + 100) / 2));
      const valDisplay = document.getElementById(`loyalty-val-${faction}`);
      const barFill = document.getElementById(`loyalty-bar-${faction}`);
      if (valDisplay) valDisplay.textContent = currentLoyalty;
      if (barFill) barFill.style.width = `${loyaltyPercent}%`;
    });

    this.updateEducationUI(s);
  }

  renderNetIncome(netIncome) {
    const val = Math.floor(netIncome);
    if (val > 0) {
      return `<span style="color:#44ff44; font-size:10px; margin-left:4px;">(+${val})</span>`;
    } else if (val < 0) {
      return `<span style="color:#ff4444; font-size:10px; margin-left:4px;">(${val})</span>`;
    } else {
      return `<span style="color:#888888; font-size:10px; margin-left:4px;">(0)</span>`;
    }
  }

  bindResourceCellTooltips() {
    if (!this.el.topbarContent) return;
    const cells = this.el.topbarContent.querySelectorAll('.resource-cell');
    cells.forEach((cell) => {
      if (cell.dataset.tooltipBound === '1') return;
      cell.dataset.tooltipBound = '1';
      cell.addEventListener('mouseenter', (e) => this.showResourceTooltip(e, cell));
      cell.addEventListener('mousemove', (e) => this.showResourceTooltip(e, cell));
      cell.addEventListener('mouseleave', () => this.hideResourceTooltip());
    });
  }

  spawnFloatingText(value, cellElement, resourceKey) {
    if (!cellElement || value === 0) return;

    const rect = cellElement.getBoundingClientRect();
    const floatingText = document.createElement('div');
    floatingText.className = `floating-text ${value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral'}`;

    // Add emoji based on resource type
    const emojiMap = {
      geld: value > 0 ? '💰' : '💸',
      nahrung: value > 0 ? '🍎' : '🍂',
      sauerstoff: value > 0 ? '💨' : '⛔',
      minerals: value > 0 ? '⛏️' : '📦',
      popChildren: value > 0 ? '👶' : '💀',
      popWorkers: value > 0 ? '👷' : '💀',
      popEngineers: value > 0 ? '👨‍🔬' : '💀'
    };

    const emoji = emojiMap[resourceKey] || '';
    floatingText.textContent = `${value > 0 ? '+' : ''}${value} ${emoji}`;
    floatingText.style.left = `${rect.left + rect.width / 2}px`;
    floatingText.style.top = `${rect.top + rect.height / 2}px`;

    document.body.appendChild(floatingText);
    setTimeout(() => floatingText.remove(), 1500);
  }

  updateCriticalResourceHighlight(s) {
    if (!this.el.topbarContent) return;

    const dailyConsumption = (s.popChildren * 1) + (s.popWorkers * 2) + (s.popEngineers * 3);
    const foodDaysLeft = dailyConsumption > 0 ? s.nahrung / dailyConsumption : 999;
    const o2DaysLeft = dailyConsumption > 0 ? s.sauerstoff / dailyConsumption : 999;

    const cells = this.el.topbarContent.querySelectorAll('.resource-cell');
    cells.forEach(cell => {
      cell.classList.remove('resource-critical');

      if (cell.classList.contains('food') && foodDaysLeft < 2) {
        cell.classList.add('resource-critical');
      }
      if (cell.classList.contains('o2') && o2DaysLeft < 2) {
        cell.classList.add('resource-critical');
      }
      if (cell.classList.contains('happiness') && s.zufriedenheit < 30) {
        cell.classList.add('resource-critical');
      }
      if (cell.classList.contains('planet') && s.planet < 30) {
        cell.classList.add('resource-critical');
      }
    });
  }

  renderNetIncome(netIncome) {
    const val = Math.floor(netIncome);
    if (val > 0) {
      return `<span style="color:#44ff44; font-size:10px; margin-left:2px;">+${val}</span>`;
    } else if (val < 0) {
      return `<span style="color:#ff4444; font-size:10px; margin-left:2px;">${val}</span>`;
    } else {
      return `<span style="color:#888888; font-size:10px; margin-left:2px;">0</span>`;
    }
  }

  log(text) {
    // Determine severity from message content
    let severity = 'info';
    if (text.includes('💀') || text.includes('Starvation') || text.includes('RIOT') || text.includes('CRITICAL')) {
      severity = 'critical';
    } else if (text.includes('⚠️') || text.includes('Warning') || text.includes('Failure')) {
      severity = 'warning';
    } else if (text.includes('✅') || text.includes('complete') || text.includes('graduated') || text.includes('👶')) {
      severity = 'success';
    }

    this.showToast(text, severity);
  }

  showToast(message, severity = 'info') {
    if (!this.el.toastContainer) return;

    // Limit to 3 toasts max
    const existingToasts = this.el.toastContainer.querySelectorAll('.toast:not(.fade-out)');
    if (existingToasts.length >= 3) {
      existingToasts[0].remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${severity}`;
    toast.textContent = message;

    this.el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 500);
    }, 3500);
  }

  showEnding(type) {
    const screen = document.getElementById('ending-screen');
    const textEl = document.getElementById('ending-text');
    
    const bgs = {
      'Ascension': 'url(/assets/ending_apotheose.png)',
      'Escape': 'url(/assets/ending_flucht.png)',
      'Collapse': 'url(/assets/ending_zusammenbruch.png)',
      'Uprising': 'url(/assets/ending_aufstand.png)'
    };

    const texts = {
      'Ascension': "The world heals. But it bows only to you.\nThe eternal tyrant reigns.",
      'Escape': "You abandon the dying world.\nThe Royal Ark slips into the void.",
      'Collapse': "Silence falls over the colony.\nWe dug too deep, and starved in the dark.",
      'Uprising': "The palace burns.\nThe people have taken back the planet."
    };

    screen.style.backgroundImage = bgs[type] || 'none';
    screen.style.display = 'flex';
    
    setTimeout(() => { screen.style.opacity = '1'; }, 100);

    const txt = texts[type] || "Game Over.";
    textEl.textContent = '';
    let i = 0;
    const t = setInterval(() => {
      textEl.textContent += txt.charAt(i);
      i++;
      if(i >= txt.length) clearInterval(t);
    }, 50);
  }
}

document.addEventListener('DOMContentLoaded', () => { window.gameUI = new UIManager(); });
