import partitiData from '@/data/partiti.json';
import esponentiData from '@/data/esponenti.json';
import type { Partito, Esponente } from '@/types';

export const partiti: Partito[] = partitiData as Partito[];
export const esponenti: Esponente[] = esponentiData as Esponente[];

export function getPartito(id: string): Partito | undefined {
  return partiti.find((p) => p.id === id);
}

export function getEsponente(id: string): Esponente | undefined {
  return esponenti.find((e) => e.id === id);
}

export function getEsponentiByPartito(partitoId: string): Esponente[] {
  return esponenti.filter((e) => e.partito === partitoId);
}
