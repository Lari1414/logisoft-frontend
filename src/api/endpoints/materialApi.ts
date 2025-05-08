import { Material } from "@/models/Material";  // Dein Material-Modell
import { baseApi } from "@/api/baseApi.ts";


export interface CreateMaterialRequest {
  firmenname: string;
  kontaktperson: string;
  adresse: {
    strasse: string;
    ort: string;
    plz: number;
  };
}

export const materialApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Alle Materialen abrufen
    getMaterial: builder.query<Material[], void>({
      query: () => "/materials",
      providesTags: ["Material"],
    }),

    // Materialen erstellen
    createMaterial: builder.mutation<Material, CreateMaterialRequest>({
      query: (data) => ({
        url: "/materials",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Material"],
    }),

    // Materialen aktualisieren
    updateMaterial: builder.mutation<Material, { id: number; data: Partial<Material> }>({
      query: ({ id, data }) => ({
        url: `/materials/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Material"],
    }),

    // Material löschen
    deleteMaterial: builder.mutation<void, number>({
      query: (id) => ({
        url: `/materials/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Material"],
    }),
  }),
});