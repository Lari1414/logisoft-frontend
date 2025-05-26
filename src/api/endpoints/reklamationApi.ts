
import { baseApi } from "@/api/baseApi";
import {Reklamation } from "@/models/reklamation";

export const reklamationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReklamation: builder.query<Reklamation[], void>({
      query: () => "/reklamationen"
    }),


  }),
});
