import { Rohmateriallager } from "@/models/Rohmateriallager"; 
import { baseApi } from "@/api/baseApi.ts";


export interface outsourceMaterialRequest {
  lagerbestand_ID: number;     
  menge: number;         
}

export const rohmateriallagerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Alle Materialen abrufen
    getRohmaterial: builder.query<Rohmateriallager[], void>({
      query: () => "/lagerbestand/roh"
    }),

   
    outsourceRohmaterial: builder.mutation<Rohmateriallager, outsourceMaterialRequest>({
      query: (data) => ({
        url: "/lagerbestand/auslagern",
        method: "POST",
        body: data,
      }),
    
    }),

    /*
    updateRohmaterial: builder.mutation<Rohmateriallager, { id: number; data: Partial<Rohmateriallager> }>({
      query: ({ id, data }) => ({
        url: `/lagerbestand/roh/${id}`,
        method: "PATCH",
        body: data,
      }),
    
    }),

  
    deleteRohmaterial: builder.mutation<void, number>({
      query: (id) => ({
        url: `/lagerbestand/roh/${id}`,
        method: "DELETE",
      }),
 
    }), */
  }),
});