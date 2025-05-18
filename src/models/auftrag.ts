export type Auftrag = {
  auftrag_ID: number;
  lager_ID: number;
  material_ID: number;
  lagerbestand_ID: number;
  menge: number;
  status?: string;
  bestellposition?: string;
  angefordertVon?: string;
};

