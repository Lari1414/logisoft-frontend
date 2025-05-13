import { baseApi } from "@/api/baseApi.ts";

export interface Lager {
  lager_ID: number;
  bezeichnung: string; // oder was auch immer dein Lager hat
}

export const lagerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLager: builder.query<Lager[], void>({
      query: () => "/lager",
    }),
  }),
});

export const { useGetLagerQuery } = lagerApi;
