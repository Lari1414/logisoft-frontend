export interface Wareneingang {
  eingang_ID: number; 
  material_ID: number;
  lager_ID: number;
  materialbestellung_ID: number;
  menge: number;
  qualitaet_ID: number;
  category: string;
  farbe: string;
  typ: string;
  groesse: string;
  url: string;
  status?: string;
  lieferdatum?: string;
}
 