import { Order, OrderStatus, PaymentStatus, ProductType } from './types';

export const DEFAULT_PRICES = {
  [ProductType.FAMILY]: 35000,
  [ProductType.FRIENDSHIP]: 22000,
};

export const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-7829",
    customer: {
      id: "CUST-001",
      name: "Alice Freeman",
      email: "alice.f@example.com",
      phone: "+1 (555) 123-4567",
      address: "123 Maple Avenue",
      city: "Portland, OR",
      country: "USA"
    },
    items: [
      { id: "PROD-101", productName: "Wireless Noise-Canceling Headphones", quantity: 1, price: 299.99, image: "https://picsum.photos/200/200?random=1" },
      { id: "PROD-102", productName: "Headphone Stand", quantity: 1, price: 49.99, image: "https://picsum.photos/200/200?random=2" }
    ],
    total: 349.98,
    status: OrderStatus.DELIVERED,
    paymentStatus: PaymentStatus.PAID,
    date: "2023-10-25T14:30:00Z",
    trackingNumber: "1Z999AA10123456784"
  },
  {
    id: "ORD-7830",
    customer: {
      id: "CUST-002",
      name: "Bob Smith",
      email: "bob.smith@test.com",
      phone: "+1 (555) 987-6543",
      address: "456 Oak Lane",
      city: "Austin, TX",
      country: "USA"
    },
    items: [
      { id: "PROD-205", productName: "Ergonomic Office Chair", quantity: 1, price: 549.00, image: "https://picsum.photos/200/200?random=3" }
    ],
    total: 549.00,
    status: OrderStatus.SHIPPED,
    paymentStatus: PaymentStatus.PAID,
    date: "2023-10-26T09:15:00Z",
    trackingNumber: "TRK888222111"
  },
  {
    id: "ORD-7831",
    customer: {
      id: "CUST-003",
      name: "Charlie Davis",
      email: "charlie.d@example.net",
      phone: "+44 20 7946 0958",
      address: "789 Pine Road",
      city: "London",
      country: "UK"
    },
    items: [
      { id: "PROD-301", productName: "Mechanical Keyboard", quantity: 2, price: 129.50, image: "https://picsum.photos/200/200?random=4" },
      { id: "PROD-302", productName: "Desk Mat", quantity: 1, price: 29.99, image: "https://picsum.photos/200/200?random=5" }
    ],
    total: 288.99,
    status: OrderStatus.PROCESSING,
    paymentStatus: PaymentStatus.PAID,
    date: "2023-10-27T11:20:00Z"
  },
  {
    id: "ORD-7832",
    customer: {
      id: "CUST-004",
      name: "Diana Prince",
      email: "diana.p@themyscira.com",
      phone: "+1 (555) 333-2222",
      address: "101 Island Drive",
      city: "Miami, FL",
      country: "USA"
    },
    items: [
      { id: "PROD-401", productName: "Smart Watch Series 5", quantity: 1, price: 399.00, image: "https://picsum.photos/200/200?random=6" }
    ],
    total: 399.00,
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.UNPAID,
    date: "2023-10-27T16:45:00Z"
  },
  {
    id: "ORD-7833",
    customer: {
      id: "CUST-005",
      name: "Evan Wright",
      email: "evan.wright@example.org",
      phone: "+1 (555) 777-8888",
      address: "202 Birch Blvd",
      city: "Seattle, WA",
      country: "USA"
    },
    items: [
      { id: "PROD-501", productName: "4K Monitor 27\"", quantity: 2, price: 449.99, image: "https://picsum.photos/200/200?random=7" },
      { id: "PROD-502", productName: "HDMI Cable 6ft", quantity: 2, price: 15.00, image: "https://picsum.photos/200/200?random=8" }
    ],
    total: 929.98,
    status: OrderStatus.CANCELLED,
    paymentStatus: PaymentStatus.REFUNDED,
    date: "2023-10-24T08:00:00Z"
  }
];

export const STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [OrderStatus.PROCESSING]: "bg-blue-100 text-blue-800",
  [OrderStatus.SHIPPED]: "bg-purple-100 text-purple-800",
  [OrderStatus.DELIVERED]: "bg-green-100 text-green-800",
  [OrderStatus.CANCELLED]: "bg-red-100 text-red-800",
  [OrderStatus.RETURNED]: "bg-orange-100 text-orange-800",
};