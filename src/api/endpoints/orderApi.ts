import { Order } from "@/models/order.ts";
import { baseApi } from "@/api/baseApi.ts";
import { Filter, FilterResult } from "@/api/types.ts";

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<Order[], void>({
      query: () => "/materialbestellungen",
      providesTags: ["Order"],
    }),
    //
    createOrder: builder.mutation<
      Order,
      {  lieferant_ID: number;
  material_ID: number;
  status: string; }
    >({
      query: (body) => ({
        url: "/materialbestellungen/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Order"],
    }),
    //
    filterOrders: builder.query<FilterResult<Order>, Filter<Order>>({
      query: (filter) => ({
        url: "/materialbestellungen/filter",
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
  }),
});
