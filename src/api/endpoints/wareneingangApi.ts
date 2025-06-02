import { baseApi } from "@/api/baseApi.ts";
import { Wareneingang } from "@/models/wareneingang";


export interface CreateWareneingangRequest {
  materialbestellung_ID: number;
  lieferdatum: string;
  menge: number;
  guterTeil?: {
    menge: number;
    qualitaet: {
      viskositaet: number;
      ppml: number;
      saugfaehigkeit: number;
      weissgrad: number;
    };
  };
  gesperrterTeil?: {
    menge: number;
    qualitaet: {
      viskositaet: number;
      ppml: number;
      saugfaehigkeit: number;
      weissgrad: number;
    };
  };
  reklamierterTeil?: {
    menge: number;
  };
}


export interface storeMaterialRequest {
 ids: number[];        
}

export const wareneingangApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    
    getWareneingang: builder.query<Wareneingang[], void>({
      query: () => "/wareneingaenge"
    }),
    getWareneingangHeute: builder.query<Wareneingang[], void>({
      query: () => "/wareneingaenge/heute"
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
        url: "/materialbestellungen/wareneingaenge",
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
    entsperreWareneingang: builder.mutation<{ updatedCount: number }, { ids: number[] }>({
        query: (data) => ({
          url: "/wareneingaenge/entsperren",
          method: "PUT",
          body: data,
      }),
    }),

  }),
});