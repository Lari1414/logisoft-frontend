import { Material } from "@/models/material.ts"; 
import { baseApi } from "@/api/baseApi.ts";


export interface CreateMaterialRequest {
  lager_ID: number;
  category: string;
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

export const materialApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Alle Materialen abrufen
    getMaterial: builder.query<Material[], void>({
      query: () => "/materials"
    }),

    // Materialen erstellen
    createMaterial: builder.mutation<Material, CreateMaterialRequest>({
      query: (data) => ({
        url: "/materials",
        method: "POST",
        body: data,
      }),
    
    }),

    // Materialen aktualisieren
    updateMaterial: builder.mutation<Material, { id: number; data: Partial<Material> }>({
      query: ({ id, data }) => ({
        url: `/materials/${id}`,
        method: "PUT",
        body: data,
      }),
    
    }),

    // Material löschen
    deleteMaterial: builder.mutation<void, number>({
      query: (id) => ({
        url: `/materials/${id}`,
        method: "DELETE",
      }),
   
    }),
  }),
});