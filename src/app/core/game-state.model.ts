export interface GameState {
  geld: number;
  nahrung: number;
  sauerstoff: number;
  mineralien: number;
  gesundheit: number;
  wissen: number;
  zufriedenheit: number;
  angst: number;
  planetZustand: number;
  tag: number;
  fct: number;
  population: number;
  workers: number;
  engineers: number;
  children: number;
  drones: number;
  efficiency: number;
  netIncome: number;
  steuerStufe: number;
  factions: { [key: string]: { loyalty: number } };
  techs?: Record<string, boolean>;
}
