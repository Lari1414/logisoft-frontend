import { Order, OrderTemplate } from "@/models/order.ts";
import { baseApi } from "@/api/baseApi.ts";
import { Filter, FilterResult } from "@/api/types.ts";

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<Order[], void>({
      query: () => "/orders",
      providesTags: ["Order"],
    }),
    //
    createOrder: builder.mutation<
      Order,
      { customerId: string; template?: OrderTemplate }
    >({
      query: ({ customerId, template }) => ({
        url: "/orders/create",
        method: "POST",
        body: { customerId, orderTemplate: template },
      }),
      invalidatesTags: ["Order"],
    }),
    //
    filterOrders: builder.query<FilterResult<Order>, Filter<Order>>({
      query: (filter) => ({
        url: "/orders/filter",
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
        url: `/orders/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Order"],
    }),
    //
    deleteOrder: builder.mutation<void, string>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Order"],
    }),
  }),
});
