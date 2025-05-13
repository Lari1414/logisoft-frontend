import { Fertigmateriallager } from "@/models/fertigmateriallager.ts"; 
import { baseApi } from "@/api/baseApi.ts";

//Auslagern ändern

export interface outsourceMaterialRequest {
  lagerbestand_ID: number;     
  menge: number;         
}

export const fertigmateriallagerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Alle Materialen abrufen
    getFertigmaterial: builder.query<Fertigmateriallager[], void>({
      query: () => "/lagerbestand/fertig"
    }),

    // Materialen erstellen
    outsourceFertigmaterial: builder.mutation<Fertigmateriallager, outsourceMaterialRequest>({
      query: (data) => ({
        url: "/lagerbestand/fertig",
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