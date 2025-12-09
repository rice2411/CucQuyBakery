import { collection, getDocs, query, orderBy, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Order, OrderStatus, PaymentStatus, ProductType } from '../types';
import { DEFAULT_PRICES } from '../constants';

export const fetchOrders = async (): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, 'orders');
    // Try to order by orderDate if index exists, otherwise basic query
    const q = query(ordersRef); 
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Helper to safely convert Firestore timestamps or strings to ISO string
      const getDate = (val: any) => {
        if (!val) return new Date().toISOString();
        if (val.toDate && typeof val.toDate === 'function') {
          return val.toDate().toISOString();
        }
        return new Date(val).toISOString();
      };

      // Helper to map Firestore status string to Enum
      const mapStatus = (status: string): OrderStatus => {
        const s = (status || '').toLowerCase();
        if (s === 'completed' || s === 'success') return OrderStatus.DELIVERED;
        if (s === 'shipping' || s === 'shipped') return OrderStatus.SHIPPED;
        if (s === 'pending') return OrderStatus.PENDING;
        if (s === 'cancelled' || s === 'fail') return OrderStatus.CANCELLED;
        return OrderStatus.PROCESSING;
      };

      // Helper to generate a consistent image based on product type
      const getProductImage = (type: string) => {
        const t = (type || '').toLowerCase();
        if (t.includes('family')) return 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80&w=200';
        if (t.includes('friend')) return 'https://images.unsplash.com/photo-1621236378699-8597f840b45a?auto=format&fit=crop&q=80&w=200';
        if (t.includes('cookie')) return 'https://images.unsplash.com/photo-1499636138143-bd649025ebeb?auto=format&fit=crop&q=80&w=200';
        if (t.includes('cake')) return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=200';
        return `https://placehold.co/200x200?text=${encodeURIComponent(type || 'Product')}`;
      };

      const typeLower = (data.type || '').toLowerCase();

      // Synthetic Item creation from flat fields
      const quantity = typeof data.quantity === 'number' ? data.quantity : 1;
      const shippingCost = typeof data.shippingCost === 'number' ? data.shippingCost : 0;
      let total = typeof data.total === 'number' ? data.total : 0;
      
      // Attempt to deduce unit price if not present
      let price = data.price;
      
      // Fix/Default price logic for Sets
      if (!price || Number(price) === 0) {
          if (typeLower.includes('family')) price = DEFAULT_PRICES[ProductType.FAMILY];
          else if (typeLower.includes('friend')) price = DEFAULT_PRICES[ProductType.FRIENDSHIP];
          else {
             // For custom/other, try to deduce from total
             price = quantity > 0 ? (total - shippingCost) / quantity : 0;
          }
      }

      // Auto-correct Total for legacy data:
      // If Total equals Shipping Cost (meaning product price was ignored), add the Set Price.
      if ((total === shippingCost || total === 0) && (typeLower.includes('family') || typeLower.includes('friend'))) {
          total = shippingCost + Number(price);
      }

      const items = data.items || [{
        id: `ITEM-${doc.id}`,
        productName: data.type ? (data.type.charAt(0).toUpperCase() + data.type.slice(1)) : 'Assorted Items',
        quantity: quantity,
        price: Number(price), 
        image: getProductImage(data.type)
      }];

      return {
        id: doc.id,
        customer: {
          id: `CUST-${doc.id.substring(0, 6)}`,
          name: data.customerName || 'Walk-in Customer',
          email: data.email || '', 
          phone: data.phone || '',
          address: data.address || '', 
          city: '',
          country: ''
        },
        items: items,
        total: total > 0 ? total : 0,
        shippingCost: shippingCost,
        status: mapStatus(data.status),
        paymentStatus: (data.paymentStatus as PaymentStatus) || PaymentStatus.UNPAID,
        date: getDate(data.orderDate || data.createdAt),
        trackingNumber: data.trackingNumber,
        notes: data.note || data.notes
      } as Order;
    });
  } catch (error) {
    console.error("Error fetching orders from Firebase:", error);
    return [];
  }
};

export const addOrder = async (orderData: any): Promise<void> => {
  try {
    const ordersRef = collection(db, 'orders');
    // Map internal form data to specific Firestore flat structure
    const payload = {
      customerName: orderData.customer.name,
      phone: orderData.customer.phone,
      address: orderData.customer.address,
      type: orderData.items[0].productName.toLowerCase(),
      quantity: orderData.items[0].quantity,
      price: orderData.items[0].price,
      shippingCost: orderData.shippingCost,
      total: orderData.total,
      note: orderData.notes,
      status: orderData.status.toLowerCase(),
      orderDate: Timestamp.now(),
      createdAt: Timestamp.now(),
      paymentStatus: 'Unpaid' // Default
    };
    await addDoc(ordersRef, payload);
  } catch (error) {
    console.error("Error adding order:", error);
    throw error;
  }
};

export const updateOrder = async (orderId: string, orderData: any): Promise<void> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    // Map internal form data to specific Firestore flat structure
    const payload = {
      customerName: orderData.customer.name,
      phone: orderData.customer.phone,
      address: orderData.customer.address,
      type: orderData.items[0].productName.toLowerCase(),
      quantity: orderData.items[0].quantity,
      price: orderData.items[0].price,
      shippingCost: orderData.shippingCost,
      total: orderData.total,
      note: orderData.notes,
      status: orderData.status.toLowerCase(),
      // Don't update orderDate/createdAt usually
    };
    await updateDoc(orderRef, payload);
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
};

export const deleteOrder = async (orderId: string): Promise<void> => {
  try {
    if (!orderId) throw new Error("Order ID is required");
    const orderRef = doc(db, 'orders', orderId);
    await deleteDoc(orderRef);
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
};