import { Stammdaten } from "@/models/stammdaten.ts";  // Dein Stammdaten-Modell
import { baseApi } from "@/api/baseApi.ts";
import { Filter, FilterResult } from "@/api/types.ts";

export const stammdatenApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Hole alle Stammdaten
    getStammdaten: builder.query<Stammdaten[], void>({
      query: () => "/stammdaten",  // Endpunkt für alle Stammdaten
      providesTags: ["Stammdaten"],
    }),
    //
    // Erstelle ein neues Stammdatenobjekt
    createStammdaten: builder.mutation<Stammdaten, { customerId: string; data: Stammdaten }>({
      query: ({ customerId, data }) => ({
        url: "/stammdaten/create",
        method: "POST",
        body: { customerId, ...data },
      }),
      invalidatesTags: ["Stammdaten"],
    }),
    //
    // Filtere Stammdaten basierend auf bestimmten Kriterien
    filterStammdaten: builder.query<FilterResult<Stammdaten>, Filter<Stammdaten>>({
      query: (filter) => ({
        url: "/stammdaten/filter",
        method: "GET",
        params: filter,
      }),
      providesTags: ["Stammdaten"],
    }),
    //
    // Aktualisiere Stammdaten
    updateStammdaten: builder.mutation<Stammdaten, { id: string; data: Partial<Stammdaten> }>({
      query: ({ id, data }) => ({
        url: `/stammdaten/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Stammdaten"],
    }),
    //
    // Lösche ein Stammdatenobjekt
    deleteStammdaten: builder.mutation<void, string>({
      query: (id) => ({
        url: `/stammdaten/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Stammdaten"],
    }),
  }),
});