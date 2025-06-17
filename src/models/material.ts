export interface Material {
  material_ID: number;          
  lager_ID: number;
  category: string;
  farbe:string;
  farbe_json: {
    cyan: number;
    magenta: number;
    yellow: number;
    black: number;
  };       
  standardmaterial: boolean;
  typ: string;
  groesse: string;
  url: string;
  materialbezeichnung: string;
}
