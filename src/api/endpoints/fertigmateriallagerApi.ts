import { Fertigmateriallager } from "@/models/fertigmateriallager.ts"; 
import { baseApi } from "@/api/baseApi.ts";


export interface CreateMaterialRequest {
  lager_ID: number;     
  category: string;        
  farbe: string;           
  typ: string;             
  groesse: string;         
  url: string;          
}

export const fertigmateriallagerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Alle Materialen abrufen
    getFertigmaterial: builder.query<Fertigmateriallager[], void>({
      query: () => "/materials/fertig"
    }),

    // Materialen erstellen
    createFertigmaterial: builder.mutation<Fertigmateriallager, CreateMaterialRequest>({
      query: (data) => ({
        url: "/materials/fertig",
        method: "POST",
        body: data,
      }),
    
    }),

    // Materialen aktualisieren
    updateFertigmaterial: builder.mutation<Fertigmateriallager, { id: number; data: Partial<Fertigmateriallager> }>({
      query: ({ id, data }) => ({
        url: `/materials/fertig/${id}`,
        method: "PATCH",
        body: data,
      }),
    
    }),

    // Material löschen
    deleteFertigmaterial: builder.mutation<void, number>({
      query: (id) => ({
        url: `/materials/fertig/${id}`,
        method: "DELETE",
      }),
   
    }),
  }),
});