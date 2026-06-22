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
  
  // Endings
  endingText = '';
  typewriterText = '';

  techs = [
    { id: 'hydroponics', title: 'Hydroponics', costG: 100, costW: 20, reqEng: 0, req: null, icon: '/assets/hydropon.png' },
    { id: 'advO2', title: 'Advanced O2', costG: 150, costW: 30, reqEng: 0, req: 'hydroponics', icon: '/assets/o2 syntes.png' },
    { id: 'deepExcavation', title: 'Excavation', costG: 200, costW: 40, reqEng: 0, req: null, icon: '⛏️' },
    { id: 'droneRouting', title: 'Drone Logic', costG: 200, costW: 50, reqEng: 10, req: 'deepExcavation', icon: '🛰️' },
    { id: 'atmoSynthesizer', title: 'Atmo-Synthesizer', costG: 500, costW: 150, reqEng: 15, req: 'advO2', icon: '🌬️' },
    { id: 'planetaryCracker', title: 'Planetary Cracker', costG: 800, costW: 200, reqEng: 20, req: 'deepExcavation', icon: '🪨' },
    { id: 'basicSchooling', title: 'Academy', costG: 100, costW: 20, reqEng: 0, req: null, icon: '🎓' },
    { id: 'tradeSkills', title: 'Trade Skills', costG: 200, costW: 50, reqEng: 5, req: null, icon: '/assets/trade.png' },
    { id: 'massMedia', title: 'Mass Media', costG: 300, costW: 60, reqEng: 12, req: 'basicSchooling', icon: '📺' },
    { id: 'surveillance', title: 'Surveillance', costG: 400, costW: 80, reqEng: 15, req: 'massMedia', icon: '/assets/nabludenie.png' },
    { id: 'planetStabilizer', title: 'Stabilizer', costG: 1000, costW: 300, reqEng: 20, req: 'droneRouting', icon: '🌍' },
    { id: 'arkBlueprint', title: 'Ark Blueprint', costG: 2000, costW: 500, reqEng: 25, req: 'surveillance', icon: '🚀' },
    { id: 'royalGenome', title: 'Royal Genome', costG: 5000, costW: 1000, reqEng: 30, req: 'arkBlueprint', icon: '🧬' }
  ];

  factions: { [key: string]: any } = {
    rust: { name: 'Rust Syndicate', desc: 'Scrappers, smugglers, survivors.', img: '/assets/faction_rust.png', color: '#ff4d4d', price: 200 },
    order: { name: 'Pure Breath Order', desc: 'Water Zealots.', img: '/assets/faction_order.png', color: '#8a2be2', price: 250 },
    guild: { name: 'The Obsidian Guild', desc: 'Everything has a price in the dark.', img: '/assets/faction_guild.png', color: '#ffd700', price: 300 }
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
      if (s) this.taxLevel = s.steuerStufe;
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

  // --- Geopolitics ---
  setFaction(f: 'rust'|'order'|'guild') {
    this.activeFaction = f;
  }
  
  getFactionLoyalty(): number {
    return this.state?.factions?.[this.activeFaction]?.loyalty || 0;
  }

  getTradeDiscount(): number {
    return Math.floor((this.getFactionLoyalty() / 100) * 40);
  }

  getTradePrice(): number {
    const base = this.factions[this.activeFaction].price;
    const discount = this.getTradeDiscount();
    return Math.floor(base * (1 - discount / 100));
  }

  getTradeTotal(): number {
    return this.getTradePrice() * this.tradeQty;
  }

  submitTrade() {
    this.bridge.submitTrade(this.activeFaction, this.tradeQty, this.bluffActive);
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
    if (this.modalData === 'victory_ascension') return 'ASCENSION ACHIEVED';
    if (this.modalData === 'victory_ark') return 'ROYAL ARK LAUNCHED';
    if (this.modalData === 'defeat_uprising') return 'UPRISING';
    if (this.modalData === 'defeat_extinction') return 'EXTINCTION';
    if (this.modalData === 'defeat_collapse') return 'PLANETARY COLLAPSE';
    return 'SYSTEM FAILURE';
  }

  getEndgameDesc(): string {
    if (this.modalData === 'victory_ascension') return 'The world heals. But it bows only to you.\\nThe eternal tyrant reigns.';
    if (this.modalData === 'victory_ark') return 'You abandon the dying world.\\nThe Royal Ark slips into the void.';
    if (this.modalData === 'defeat_uprising') return 'The palace burns.\\nThe people have taken back the planet.';
    if (this.modalData === 'defeat_extinction') return 'The last of your people have perished. The colony is a tomb.';
    if (this.modalData === 'defeat_collapse') return 'Silence falls over the colony.\\nWe dug too deep, and starved in the dark.';
    return 'The colony has fallen.';
  }

  getEndgameBg(): string {
    if (this.modalData === 'victory_ascension') return 'url(/assets/ending_apotheose.png)';
    if (this.modalData === 'victory_ark') return 'url(/assets/ending_flucht.png)';
    if (this.modalData === 'defeat_uprising') return 'url(/assets/ending_aufstand.png)';
    if (this.modalData === 'defeat_extinction' || this.modalData === 'defeat_collapse') return 'url(/assets/ending_zusammenbruch.png)';
    return 'none';
  }

  reloadGame() {
    window.location.reload();
  }
}
