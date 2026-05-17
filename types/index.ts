export interface StoriaPoltica {
  partito: string;
  ruolo: string;
  dalAnno: number;
  alAnno: number | null;
}

export interface Governo {
  nome: string;
  ruolo: string;
  anni: string;
}

export interface Dichiarazione {
  testo: string;
  contesto: string;
  anno: number;
}

export interface CambioRotta {
  descrizione: string;
  prima: string;
  dopo: string;
  anno: number;
}

export interface Falsita {
  affermazione: string;
  debunk: string;
  fonte: string;
}

export interface Esponente {
  id: string;
  nome: string;
  partito: string;
  ruolo: string;
  foto: string;
  bio: string;
  asseOrizzontale: number;
  asseVerticale: number;
  storiaPolit: StoriaPoltica[];
  governi: Governo[];
  posizioniChiave: { tema: string; posizione: string }[];
  dichiarazioni: Dichiarazione[];
  cambiRotta: CambioRotta[];
  falsita: Falsita[];
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
  logoUrl: string;
  coalizione: "governo" | "opposizione";
  fondazione: number;
  segretario: string;
  parlamentari: number;
  seggiCamera: number;
  seggiSenato: number;
  asseOrizzontale: number;
  asseVerticale: number;
  descrizione: string;
  storia: string;
  programma: ProgrammaTema[];
  esponenti: string[];
}

export interface DailyContent {
  data: string;
  top3: {
    titolo: string;
    spiegazione: string;
    perchéRilevante: string;
  }[];
  recap: string;
}
