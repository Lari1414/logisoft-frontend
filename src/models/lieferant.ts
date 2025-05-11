export type Lieferant = {
  lieferant_ID: number;
  firmenname: string;
  kontaktperson: string;
  adresse: {
    strasse: string;
    ort: string;
    plz: number;
  };
}


