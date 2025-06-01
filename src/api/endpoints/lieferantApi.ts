import { Lieferant } from "@/models/lieferant";  
import { baseApi } from "@/api/baseApi.ts";


export interface CreateLieferantRequest {
  firmenname: string;
  kontaktperson: string;
  adresse_ID: number;
}

export const lieferantApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Alle Lieferanten abrufen
    getLieferant: builder.query<Lieferant[], void>({
      query: () => "/lieferanten",
      providesTags: ["Lieferant"],
    }),

    // Lieferant erstellen
    createLieferant: builder.mutation<Lieferant, CreateLieferantRequest>({
      query: (data) => ({
        url: "/lieferanten",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Lieferant"],
    }),

    // Lieferant aktualisieren
updateLieferant: builder.mutation<
  Lieferant,
  { id: number; data: Partial<Omit<Lieferant, "adresse">> & { adresse_ID: number } }
>({
  query: ({ id, data }) => ({
    url: `/lieferanten/${id}`,
    method: "PUT",
    body: data,
  }),
  invalidatesTags: ["Lieferant"],
}),

    // Lieferant löschen
    deleteLieferant: builder.mutation<void, number>({
      query: (id) => ({
        url: `/lieferanten/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Lieferant"],
    }),
  }),
});