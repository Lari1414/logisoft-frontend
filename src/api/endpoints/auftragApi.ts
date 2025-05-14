import { Auftrag } from "@/models/auftrag";  
import { baseApi } from "@/api/baseApi.ts";


export interface CreateAuftragRequest {
    material_ID: number;
  anzahl: number;
  bestellposition?: string;
}

export const auftragApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    
    getAuftrag: builder.query<Auftrag[], void>({
      query: () => "/auftraege",
      providesTags: ["Auftrag"],
    }),

    
    createAuftrag: builder.mutation<Auftrag, CreateAuftragRequest>({
      query: (data) => ({
        url: "/auftraege",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auftrag"],
    }),

    
    updateAuftrag: builder.mutation<Auftrag, { id: number; data: Partial<Auftrag> }>({
      query: ({ id, data }) => ({
        url: `/auftraege/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Auftrag"],
    }),

   
    deleteAuftrag: builder.mutation<void, number>({
      query: (id) => ({
        url: `/auftraege/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Auftrag"],
    }),
  }),
});