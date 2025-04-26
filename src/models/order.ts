export type Order = OrderTemplate & {
    id: string
    createdAt: string
    updatedAt: string
    deletedAt: string | null
    customerId: string
}


export type OrderTemplate = {
    status: 'PENDING' | 'QUARANTINE' | 'COMPLETED' | 'CANCELLED'
    orderNumber: string
}