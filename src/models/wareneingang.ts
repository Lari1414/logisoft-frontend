export interface Wareneingang {
  material_ID: number;
  materialbestellung_ID: number;
  menge: number;
  status?: string;
  lieferdatum: string;
 }