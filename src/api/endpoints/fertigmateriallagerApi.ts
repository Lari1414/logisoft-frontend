import { Fertigmateriallager } from "@/models/fertigmateriallager.ts"; 
import { baseApi } from "@/api/baseApi.ts";

//Auslagern ändern

export interface outsourceMaterialRequest {
  lagerbestand_ID: number;     
  menge: number;         
}

export interface storeMaterialRequest {
  lager_ID: 2;     
  menge: number;  
  farbe_json: {
    cyan: number;
    magenta: number;
    yellow: number;
    black: number;
  };
  standardmaterial: boolean;
  typ : String;
  groesse: String;
  url: String;
  category: String;
}



export const fertigmateriallagerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Alle Materialen abrufen
    getFertigmaterial: builder.query<Fertigmateriallager[], void>({
      query: () => "/lagerbestand/fertig"
    }),

    // Materialen Auslagern
    outsourceFertigmaterial: builder.mutation<Fertigmateriallager, outsourceMaterialRequest>({
      query: (data) => ({
        url: "/lagerbestand/auslagern",
        method: "POST",
        body: data,
      }), 
    }),
  // Materialen Einlagern
   storeFertigmaterial: builder.mutation<Fertigmateriallager, storeMaterialRequest>({
      query: (data) => ({
        url: "/lagerbestand/einlagernFertig",
        method: "POST",
        body: data,
      }), 
    }),

/*
    // Materialen aktualisieren
    updateFertigmaterial: builder.mutation<Fertigmateriallager, { id: number; data: Partial<Fertigmateriallager> }>({
      query: ({ id, data }) => ({
        url: `/lagerbestand/fertig/${id}`,
        method: "PATCH",
        body: data,
      }),
    
    }),

    // Material löschen
    deleteFertigmaterial: builder.mutation<void, number>({
      query: (id) => ({
        url: `/lagerbestand/fertig/${id}`,
        method: "DELETE",
      }),
   
    }),
    */
  }),
});