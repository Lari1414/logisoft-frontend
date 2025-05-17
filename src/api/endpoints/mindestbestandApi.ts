import { baseApi } from "@/api/baseApi";
import { Mindestbestand } from "@/models/mindestbestand";

export const mindestbestandApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMindestbestaende: builder.query<Mindestbestand[], void>({
      query: () => "/mindestbestand", // ← Passe den Pfad an deinen Backend-Router an
    }),
  }),
});
