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
    //
     createOrder: builder.mutation<Order, CreateOrderRequest>({
       query: (data) => ({
         url: "/materialbestellungen",
         method: "POST",
         body: data,
       }),
       invalidatesTags: ["Lieferant"],
     }),
    //
    filterOrders: builder.query<FilterResult<Order>, Filter<Order>>({
      query: (filter) => ({
        url: "/materialbestellungen",
        method: "GET",
        params: filter,
      }),
      providesTags: ["Order"],
    }),
    //
    updateOrder: builder.mutation<
      Order,
      { id: string; status: Order["status"] }
    >({
      query: ({ id, status }) => ({
        url: `/materialbestellungen/${id}`,
        method: "PATCH",
        body: { status },
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
