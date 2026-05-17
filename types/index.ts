export interface StoriaPoltica {
  partito: string;
  ruolo: string;
  dalAnno: number;
  alAnno: number | null; // null = ancora in carica
}

export interface Esponente {
  id: string;
  nome: string;
  partito: string; // riferimento a Partito.id
  ruolo: string;
  foto: string;
  bio: string;
  storiaPolit: StoriaPoltica[];
  posizioniChiave: { tema: string; posizione: string }[];
  wikipedia?: string;
}

export interface ProgrammaTema {
  tema: string;
  sintesi: string;
  puntiChiave: string[];
}

export interface Partito {
  id: string;
  nome: string;
  nomeBreve: string;
  colore: string;
  logo: string;
  fondazione: number;
  segretario: string;
  parlamentari: number;
  // Assi ideologici: -1 (estrema sinistra / molto liberale) a +1 (estrema destra / molto conservatore)
  asseOrizzontale: number; // sinistra (-1) ↔ destra (+1)
  asseVerticale: number;   // liberale (-1) ↔ conservatore (+1)
  descrizione: string;
  storia: string;
  programma: ProgrammaTema[];
  esponenti: string[]; // array di Esponente.id
}

export interface DailyContent {
  data: string; // YYYY-MM-DD
  top3: {
    titolo: string;
    spiegazione: string;
    perchéRilevante: string;
  }[];
  recap: string;
}
