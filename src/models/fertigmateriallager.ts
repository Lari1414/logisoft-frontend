export interface Fertigmateriallager {
  lagerbestand_ID: number;
  eingang_ID: number;
  lager_ID: number;
  material_ID: number;
  menge: number;
  qualitaet_ID: number;
  material: {
    material_ID: number;
    lager_ID: number;
    category: string;
    farbe: string;
    typ: string;
    groesse: string;
    url: string;
  };
  qualitaet: {
    qualitaet_ID: number;
    viskositaet: number;
    ppml: number;
    deltaE: number;
    saugfaehigkeit: number;
    weissgrad: number;
  };
  } 