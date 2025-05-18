
import { baseApi } from "@/api/baseApi.ts";
import { Wareneingang } from "@/models/wareneingang";


export interface CreateWareneingangRequest {
  material_ID: number;
  materialbestellung_ID: number;
  menge: number;
  status?: string;
  lieferdatum: string;     
}

export interface storeMaterialRequest {
 ids: number[];        
}

export const wareneingangApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    
    getWareneingang: builder.query<Wareneingang[], void>({
      query: () => "/wareneingaenge"
    }),

     // Materialen Einlagern
    storeRohmaterial: builder.mutation<Wareneingang, storeMaterialRequest>({
          query: (data) => ({
            url: "/wareneingaenge/einlagern",
            method: "POST",
            body: data,
          }), 
        }),
    
    createWareneingang: builder.mutation<Wareneingang, CreateWareneingangRequest>({
      query: (data) => ({
        url: "/wareneingaenge",
        method: "POST",
        body: data,
      }),
    
    }),

    
    updateWareneingang: builder.mutation<Wareneingang, { id: number; data: Partial<Wareneingang> }>({
      query: ({ id, data }) => ({
        url: `/wareneingaenge/${id}`,
        method: "PATCH",
        body: data,
      }),
    
    }),

    // Material löschen
    deleteWareneingang: builder.mutation<void, number>({
      query: (id) => ({
        url: `/wareneingaenge/${id}`,
        method: "DELETE",
      }),
   
    }),

    sperreWareneingaenge: builder.mutation<{ updatedCount: number }, { ids: number[] }>({
        query: (data) => ({
          url: "/wareneingaenge/sperren",
          method: "PUT",
          body: data,
      }),
    }),
  }),
});