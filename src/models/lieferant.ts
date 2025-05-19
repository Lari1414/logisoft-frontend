// models/lieferant.ts
export interface Adresse {
  adresse_ID: number;
  strasse: string;
  ort: string;
  plz: number;
}

export type Lieferant = {
  lieferant_ID: number;
  firmenname: string;
  kontaktperson: string;
  adresse: Adresse;
};
