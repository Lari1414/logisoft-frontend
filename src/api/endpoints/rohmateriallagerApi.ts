import { Rohmateriallager } from "@/models/Rohmateriallager"; 
import { baseApi } from "@/api/baseApi.ts";


export interface CreateMaterialRequest {
  lager_ID: number;     
  category: string;        
  farbe: string;           
  typ: string;             
  groesse: string;         
  url: string;          
}

export const rohmateriallagerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Alle Materialen abrufen
    getRohmaterial: builder.query<Rohmateriallager[], void>({
      query: () => "/materials/rohm"
    }),

    // Materialen erstellen
    createRohmaterial: builder.mutation<Rohmateriallager, CreateMaterialRequest>({
      query: (data) => ({
        url: "/materials/rohm",
        method: "POST",
        body: data,
      }),
    
    }),

    // Materialen aktualisieren
    updateRohmaterial: builder.mutation<Rohmateriallager, { id: number; data: Partial<Rohmateriallager> }>({
      query: ({ id, data }) => ({
        url: `/materials/rohm/${id}`,
        method: "PATCH",
        body: data,
      }),
    
    }),

    // Material löschen
    deleteRohmaterial: builder.mutation<void, number>({
      query: (id) => ({
        url: `/materials/rohm/${id}`,
        method: "DELETE",
      }),
   
    }),
  }),
});