export interface Order {
  materialbestellung_ID: number;
  lieferant_ID: number;
  material_ID: number;
  status: string;
  menge: number;
  lieferant: {
    lieferant_ID: number;
    firmenname: string;
    kontaktperson: string;
    adresse_ID: number;
  };
  material: {
    material_ID: number;
    lager_ID: number;
    category: string;
    farbe: string; 
    farbe_json: {
    cyan: string;
    magenta: string;
    yellow: string;
    black: string;
    };
    typ: string;
    groesse: string;
    url: string;
    standardmaterial: boolean;
  };
 
}
