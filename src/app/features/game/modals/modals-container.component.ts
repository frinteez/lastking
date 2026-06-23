import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameBridgeService } from '../../../core/game-bridge.service';
import { GameState } from '../../../core/game-state.model';
import { ModalService, ModalType } from '../../../core/modal.service';

@Component({
  selector: 'app-modals-container',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modals-container.component.html',
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #0A1128; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #00F0FF; }

    @keyframes avatarHover {
      0%, 100% { transform: translateY(0); box-shadow: 0 0 10px var(--tw-shadow-color); }
      50% { transform: translateY(-5px); box-shadow: 0 0 25px var(--tw-shadow-color); }
    }
    .avatar-anim {
      animation: avatarHover 4s ease-in-out infinite;
    }
    
    .scanlines-overlay {
      background: linear-gradient(rgba(0, 240, 255, 0) 50%, rgba(0, 240, 255, 0.05) 50%);
      background-size: 100% 4px;
      pointer-events: none;
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      z-index: 1;
    }
  `]
})
export class ModalsContainerComponent implements OnInit {
  activeModal: ModalType = null;
  modalData: any = null;
  state: GameState | null = null;
  
  schoolQty = 0;
  academyQty = 0;
  droneQty = 0;

  // Ministries
  taxLevel = 1;

  // Geopolitics
  bluffActive = false;
  activeFaction: 'rust' | 'order' | 'guild' = 'rust';
  tradeQty = 1;
  selectedProduct: string = 'minerals';
  selectedPayment: string = 'geld';
  tradeResponse: string = '';
  typedTradeResponse: string = '';
  tradeTypingInterval: any = null;
  
  // Endings
  endingText = '';
  typewriterText = '';

  techs = [
    { id: 'hydroponics', title: 'Hydroponics', costG: 100, costW: 20, reqEng: 0, req: null, icon: '/assets/hydropon.png', desc: 'Unlocks the Farm blueprint. Allows your colony to grow food. Without this, your people will quickly starve once initial rations run out.' },
    { id: 'advO2', title: 'Advanced O2', costG: 150, costW: 30, reqEng: 0, req: 'hydroponics', icon: '/assets/o2 syntes.png', desc: 'Unlocks the O2 Generator blueprint. Essential life support infrastructure to sustain oxygen levels for a growing population.' },
    { id: 'deepExcavation', title: 'Excavation', costG: 200, costW: 40, reqEng: 0, req: null, icon: '⛏️', desc: 'Unlocks the Mine blueprint. Allows extraction of underground minerals—the fundamental resource for heavy industry and drones.' },
    { id: 'droneRouting', title: 'Drone Logic', costG: 200, costW: 50, reqEng: 10, req: 'deepExcavation', icon: '🛰️', desc: 'Unlocks Drone production and Drone Hubs. Automates logistics and increases your maximum drone capacity. Crucial for late-game automation.' },
    { id: 'atmoSynthesizer', title: 'Atmo-Synthesizer', costG: 500, costW: 150, reqEng: 15, req: 'advO2', icon: '🌬️', desc: 'Unlocks the Atmo-Synthesizer blueprint. A massive industrial complex that solves oxygen shortages for large colonies (+50 O2/day).' },
    { id: 'planetaryCracker', title: 'Planetary Cracker', costG: 800, costW: 200, reqEng: 20, req: 'deepExcavation', icon: '🪨', desc: "Unlocks the Planetary Cracker blueprint. The ultimate mining machine (+40 Minerals/day). WARNING: Rapidly destabilizes the planet's core (-3 Planet Health/day)." },
    { id: 'basicSchooling', title: 'Academy', costG: 100, costW: 20, reqEng: 0, req: null, icon: '🎓', desc: 'Unlocks the University blueprint. Allows training ordinary Workers into valuable Engineers. Note: Active universities generate Knowledge.' },
    { id: 'tradeSkills', title: 'Trade Skills', costG: 200, costW: 50, reqEng: 5, req: null, icon: '/assets/trade.png', desc: 'Corporate diplomacy courses. Unlocks a dynamic market discount in Geopolitics based on faction Loyalty (up to 30% discount at 100 Loyalty).' },
    { id: 'massMedia', title: 'Mass Media', costG: 300, costW: 60, reqEng: 12, req: 'basicSchooling', icon: '📺', desc: 'Tools of mass control. Amplifies the effects of decrees and propaganda. Helps to efficiently brainwash colonists when Knowledge gets dangerously high.' },
    { id: 'surveillance', title: 'Surveillance', costG: 400, costW: 80, reqEng: 15, req: 'massMedia', icon: '/assets/nabludenie.png', desc: 'Total monitoring system. Significantly boosts Fear generation, preventing strikes even at zero Happiness. A mandatory step towards building the Ark.' },
    { id: 'planetStabilizer', title: 'Stabilizer', costG: 1000, costW: 300, reqEng: 20, req: 'droneRouting', icon: '🌍', desc: 'Unlocks the Planet Stabilizer blueprint. Heals the planetary core (+5 Planet Health/day). Counters the damage from Crackers. Required for the Ascension ending.' },
    { id: 'arkBlueprint', title: 'Ark Blueprint', costG: 2000, costW: 500, reqEng: 25, req: 'surveillance', icon: '🚀', desc: 'Classified blueprints of the Royal Ark. Your ultimate goal. Allows the construction of the escape ship for the Escape ending. Requires massive wealth to build.' },
    { id: 'royalGenome', title: 'Royal Genome', costG: 5000, costW: 1000, reqEng: 30, req: 'arkBlueprint', icon: '🧬', desc: "The pinnacle of genetic engineering. An exclusive privilege of the elite. Significantly increases base health and the colony's resistance to disasters." }
  ];

  getTechTitle(id: string): string {
    const t = this.techs.find(tech => tech.id === id);
    return t ? t.title : id;
  }

  factions: { [key: string]: any } = {
    rust: { 
      name: 'The Obsidian Guild', desc: 'Everything has a price in the dark.', img: '/assets/faction_guild.png', color: '#ffd700',
      sells: [
        { id: 'minerals', name: 'Minerals', icon: '/assets/icon_min.png', basePrice: 200, yield: 1000, tooltip: 'Raw construction materials.' },
        { id: 'technology', name: 'Random Tech', icon: '/assets/icon_tech.png', basePrice: 1500, yield: 1, tooltip: 'Instantly unlocks a random unresearched technology.' }
      ],
      accepts: [
        { id: 'geld', name: 'Geld' },
        { id: 'nahrung', name: 'Food' }
      ]
    },
    order: { 
      name: 'Pure Breath Order', desc: 'Water Zealots.', img: '/assets/faction_order.png', color: '#8a2be2',
      sells: [
        { id: 'sauerstoff', name: 'Oxygen', icon: '/assets/icon_o2.png', basePrice: 150, yield: 1000, tooltip: 'Essential life support gas.' },
        { id: 'nahrung', name: 'Food', icon: '/assets/icon_food.png', basePrice: 100, yield: 1000, tooltip: 'Nutritional sustenance for the colony.' },
        { id: 'medicine', name: 'Medicine', icon: '/assets/icon_medicine.png', basePrice: 400, yield: 1, tooltip: 'Instantly heals the colony by +20 Health.' }
      ],
      accepts: [
        { id: 'geld', name: 'Geld' },
        { id: 'mineralien', name: 'Minerals' }
      ]
    },
    guild: { 
      name: 'Rust Syndicate', desc: 'Scrappers, smugglers, survivors.', img: '/assets/faction_rust.png', color: '#ff4d4d',
      sells: [
        { id: 'artifacts', name: 'Artifact', icon: '/assets/icon_artifact.png', basePrice: 800, yield: 1, tooltip: 'A relic of the past. Grants +40 Knowledge.' },
        { id: 'geld', name: 'Laundered Cash', icon: '/assets/icon_money.png', basePrice: 500, yield: 1000, tooltip: 'Untraceable credits.' }
      ],
      accepts: [
        { id: 'mineralien', name: 'Minerals' },
        { id: 'child', name: 'Child' },
        { id: 'worker', name: 'Worker' },
        { id: 'engineer', name: 'Engineer' }
      ]
    }
  };

  constructor(private modalService: ModalService, private bridge: GameBridgeService) {}

  ngOnInit() {
    this.modalService.activeModal$.subscribe(m => {
      this.activeModal = m.type;
      this.modalData = m.data;
      if (m.type === 'school') this.schoolQty = 0;
      if (m.type === 'uni') this.academyQty = 0;
      if (m.type === 'drone') this.droneQty = 0;
      if (m.type === 'endgame') {
        this.endingText = this.getEndgameDesc();
        this.typewriterText = '';
        this.startTypewriter();
      }
    });
    this.bridge.gameState$.subscribe(s => {
      this.state = s;
      if (s && s.taxLevel !== undefined) this.taxLevel = s.taxLevel;
    });
  }

  close() {
    this.modalService.close();
  }

  // --- Education ---
  trainSchool() {
    if (this.schoolQty > 0) {
      this.bridge.enqueueEducation('school', this.schoolQty);
      this.close();
    }
  }

  trainEngineers() {
    if (this.academyQty > 0) {
      this.bridge.enqueueEducation('academy', this.academyQty);
      this.close();
    }
  }

  // --- Drones ---
  buildDrones() {
    if (this.droneQty > 0) {
      this.bridge.enqueueDroneProduction(this.droneQty);
      this.close();
    }
  }

  // --- Ministries ---
  executeDecree(decreeId: string) {
    this.bridge.executeDecree(decreeId);
  }

  updateTax(event: any) {
    this.taxLevel = parseInt(event.target.value, 10);
    this.bridge.setTaxLevel(this.taxLevel);
  }

  getCooldown(decreeId: string): number {
    return this.state?.cooldowns?.[decreeId] || 0;
  }

  getEstimatedTaxIncome(): number {
    if (!this.state) return 0;
    const totalPop = (this.state.popChildren || 0) + (this.state.popWorkers || 0) + (this.state.popEngineers || 0);
    return Math.floor(this.taxLevel * 2.5 * totalPop);
  }

  // --- Geopolitics ---
  setFaction(f: 'rust'|'order'|'guild') {
    this.activeFaction = f;
    this.selectedProduct = this.factions[f].sells[0].id;
    this.selectedPayment = this.factions[f].accepts[0].id;
    this.tradeResponse = '';
    this.typedTradeResponse = '';
    if (this.tradeTypingInterval) clearInterval(this.tradeTypingInterval);
  }
  
  getFactionLoyalty(): number {
    return this.state?.factions?.[this.activeFaction]?.loyalty || 0;
  }

  getTradeDiscount(): number {
    return Math.floor((this.getFactionLoyalty() / 100) * 40);
  }

  getSelectedProductData(): any {
    return this.factions[this.activeFaction].sells.find((p: any) => p.id === this.selectedProduct) || this.factions[this.activeFaction].sells[0];
  }

  getSelectedPaymentName(): string {
    const pm = this.factions[this.activeFaction].accepts.find((p: any) => p.id === this.selectedPayment);
    return pm ? pm.name : this.selectedPayment;
  }

  getTradePrice(): number {
    const p = this.getSelectedProductData();
    const base = p.basePrice;
    const discount = this.getTradeDiscount();
    return Math.floor(base * (1 - discount / 100));
  }

  getTradeTotal(): number {
    return this.getTradePrice() * this.tradeQty;
  }

  getPaymentExchangeRate(paymentId: string): number {
    if (paymentId === 'child') return 100;
    if (paymentId === 'worker') return 500;
    if (paymentId === 'engineer') return 3500;
    return 1; // Default 1:1 for Geld, Minerals, Food
  }

  getTradeTotalCostInCurrency(): number {
    const rawCost = this.getTradeTotal();
    const rate = this.getPaymentExchangeRate(this.selectedPayment);
    return Math.ceil(rawCost / rate);
  }

  submitTrade() {
    this.tradeResponse = this.bridge.submitTrade(this.activeFaction, this.selectedProduct, this.selectedPayment, this.tradeQty, this.bluffActive) || '';
    this.typedTradeResponse = '';
    
    if (this.tradeTypingInterval) clearInterval(this.tradeTypingInterval);
    
    if (this.tradeResponse) {
      let i = 0;
      this.tradeTypingInterval = setInterval(() => {
        this.typedTradeResponse += this.tradeResponse.charAt(i);
        i++;
        if (i >= this.tradeResponse.length) {
          clearInterval(this.tradeTypingInterval);
        }
      }, 30);
    }
  }

  // --- Tech Tree ---
  hasTech(techId: string): boolean {
    return !!(this.state?.techs && this.state.techs[techId]);
  }

  canAffordTech(t: any): boolean {
    if (!this.state) return false;
    if (t.req && !this.hasTech(t.req)) return false;
    return this.state.geld >= t.costG && this.state.wissen >= t.costW;
  }

  researchTech(techId: string) {
    this.bridge.researchTech(techId);
  }

  // --- Endings ---
  startTypewriter() {
    let i = 0;
    const interval = setInterval(() => {
      this.typewriterText += this.endingText.charAt(i);
      i++;
      if (i >= this.endingText.length) clearInterval(interval);
    }, 50);
  }

  getEndgameTitle(): string {
    if (this.modalData === 'Ascension') return 'ASCENSION ACHIEVED';
    if (this.modalData === 'Escape') return 'ROYAL ARK LAUNCHED';
    if (this.modalData === 'Uprising') return 'UPRISING';
    if (this.modalData === 'Collapse') return 'PLANETARY COLLAPSE';
    return 'SYSTEM FAILURE';
  }

  getEndgameDesc(): string {
    if (this.modalData === 'Ascension') return 'The world heals. But it bows only to you.\nThe eternal tyrant reigns.';
    if (this.modalData === 'Escape') return 'You abandon the dying world.\nThe Royal Ark slips into the void.';
    if (this.modalData === 'Uprising') return 'The palace burns.\nThe people have taken back the planet.';
    if (this.modalData === 'Collapse') return 'Silence falls over the colony.\nWe dug too deep, and starved in the dark.';
    return 'The colony has fallen.';
  }

  getEndgameBg(): string {
    if (!this.modalData) return 'none';
    return `url(/assets/ending_${this.modalData}.png)`;
  }

  reloadGame() {
    window.location.reload();
  }
}
