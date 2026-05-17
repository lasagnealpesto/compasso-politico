import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'compasso.db');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: false });
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
  }
  return _db;
}

export type GovernoRow = {
  id: number;
  nome: string;
  premier: string;
  coalizione: string;
  partiti: string;
  dal: string;
  al: string | null;
  motivo_fine: string | null;
  note: string | null;
  durata_giorni: number | null;
};

export type ElezioneRow = {
  id: number;
  anno: number;
  data: string;
  tipo: string;
  affluenza: number | null;
  vincitore: string;
  risultati: string;
  note: string | null;
};

export type EventoRow = {
  id: number;
  anno: number;
  data: string;
  titolo: string;
  descrizione: string;
  categoria: string;
  partiti_coinvolti: string | null;
  impatto: string;
};

export type LeggeRow = {
  id: number;
  anno: number;
  nome: string;
  descrizione: string;
  governo: string;
  categoria: string;
  impatto: string;
};
