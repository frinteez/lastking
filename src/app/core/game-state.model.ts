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
  engineers: number;
  children: number;
  drones: number;
  efficiency: number;
  netIncome: number;
  techs?: Record<string, boolean>;
}
