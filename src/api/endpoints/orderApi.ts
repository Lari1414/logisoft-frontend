import { Order } from "@/models/order.ts";
import { baseApi } from "@/api/baseApi.ts";
import { Filter, FilterResult } from "@/api/types.ts";

export interface CreateOrderRequest {
  material_ID: number;
  lieferant_ID: number;
  menge: number;
}


export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<Order[], void>({
      query: () => "/materialbestellungen",
      providesTags: ["Order"],
    }),

     getbestelltOrders: builder.query<Order[], void>({
      query: () => "/materialbestellungen/bestellt",
      providesTags: ["Order"],
    }),

    getOpenOrders: builder.query<Order[], void>({
      query: () => "/materialbestellungen/offen",
      providesTags: ["Order"],
    }),
    
     createOrder: builder.mutation<Order, CreateOrderRequest>({
       query: (data) => ({
         url: "/materialbestellungen",
         method: "POST",
         body: data,
       }),
       invalidatesTags: ["Lieferant"],
     }),
    
    filterOrders: builder.query<FilterResult<Order>, Filter<Order>>({
      query: (filter) => ({
        url: "/materialbestellungen",
        method: "GET",
        params: filter,
      }),
      providesTags: ["Order"],
    }),
    // Betstellung Aktualisieren
    updateOrder: builder.mutation<Order, { id: number; data: Partial<CreateOrderRequest> }>({
        query: ({ id, data }) => ({
       url: `/materialbestellungen/${id}`,
       method: "PUT",
       body: data,  
      }),
      invalidatesTags: ["Order"],
    }),
    //
    deleteOrder: builder.mutation<void, string>({
      query: (id) => ({
        url: `/materialbestellungen/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Order"],
    }),

    updateMultipleOrdersStatus: builder.mutation<
  { updatedCount: number },
  { ids: number[] }
        >({
      query: (data) => ({
        url: "/materialbestellungen/absenden",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Order"],
    }),
  }),
});
