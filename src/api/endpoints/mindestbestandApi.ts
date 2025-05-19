import { baseApi } from "@/api/baseApi";
import { Mindestbestand } from "@/models/mindestbestand";

export const mindestbestandApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMindestbestaende: builder.query<Mindestbestand[], void>({
      query: () => "/mindestbestand", // ← Passe den Pfad an deinen Backend-Router an
    }),
    updateMindestbestand: builder.mutation<void, { id: number; mindestbestand: number }>({
      query: ({ id, mindestbestand }) => ({
        url: `/mindestbestand/${id}`,
        method: "PUT",
        body: { mindestbestand },
      }),
    }),

  }),
});
