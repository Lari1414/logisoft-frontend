import { baseApi } from "@/api/baseApi.ts";

export interface Qualitaet {
  qualitaet_ID: number;
  viskositaet: number; 
  ppml: number; 
  saugfaehigkeit: number; 
  weissgrad: number; 
  deltaE: number;
}

export const qualitaetApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getQualitaet: builder.query<Qualitaet[], void>({
      query: () => "/qualitaet",
    }),
  }),
});

export const { useGetQualitaetQuery } = qualitaetApi;
