import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:8080/api", // localhost can only be used for local dev
  }),
  tagTypes: ["User", "Order", "Stammdaten", "Lieferant", "Auftrag"],
  refetchOnReconnect: true,
  refetchOnFocus: true,
  endpoints: () => ({}),
});
