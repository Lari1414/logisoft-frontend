import { baseApi } from "@/api/baseApi.ts";

export const adresseApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
      createAdresse: builder.mutation<
        { adresse_ID: number },
        { strasse: string; ort: string; plz: number }
      >({
        query: (data) => ({
          url: "/adressen",
          method: "POST",
          body: data,
        }),
      }),

      deleteAdresse: builder.mutation<void, number>({
        query: (id) => ({
          url: `/adressen/${id}`,
          method: "DELETE",
        }),
      }),

    }),
    
  });