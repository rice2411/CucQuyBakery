import { collection, getDocs, query, orderBy, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Order, OrderStatus, PaymentStatus, ProductType, OrderItem } from '../types';
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
        if (t.includes('family') || t.includes('gia đình')) return 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80&w=200';
        if (t.includes('friend') || t.includes('tình bạn')) return 'https://images.unsplash.com/photo-1621236378699-8597f840b45a?auto=format&fit=crop&q=80&w=200';
        if (t.includes('set') || t.includes('quà') || t.includes('gif')) return 'https://images.unsplash.com/photo-1549488352-22668e9e6c1c?auto=format&fit=crop&q=80&w=200';
        if (t.includes('cookie') || t.includes('bánh')) return 'https://images.unsplash.com/photo-1499636138143-bd649025ebeb?auto=format&fit=crop&q=80&w=200';
        if (t.includes('cake') || t.includes('kem')) return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=200';
        return `https://placehold.co/200x200?text=${encodeURIComponent(type || 'Product')}`;
      };

      const typeLower = (data.type || '').toLowerCase();

      // Synthetic Item creation from flat fields
      const quantity = typeof data.quantity === 'number' ? data.quantity : 1;
      const shippingCost = typeof data.shippingCost === 'number' ? data.shippingCost : 0;
      
      // Attempt to deduce unit price if not present
      let price = data.price;
      
      // Fix/Default price logic for Sets
      if (!price || Number(price) === 0) {
          if (typeLower.includes('family')) price = DEFAULT_PRICES[ProductType.FAMILY];
          else if (typeLower.includes('friend')) price = DEFAULT_PRICES[ProductType.FRIENDSHIP];
          else {
             // Fallback for custom/other: try to deduce from total if available
             const tempTotal = typeof data.total === 'number' ? data.total : 0;
             price = quantity > 0 ? (tempTotal - shippingCost) / quantity : 0;
          }
      }

      // Use stored items if available, otherwise construct from legacy flat fields
      let items: OrderItem[] = [];
      if (data.items && Array.isArray(data.items)) {
         // Map existing items ensuring ID and Image exist
         items = data.items.map((item: any, idx: number) => ({
             id: item.id || `ITEM-${doc.id}-${idx}`,
             productName: item.productName || 'Unknown Product',
             quantity: Number(item.quantity) || 1,
             price: Number(item.price) || 0,
             image: item.image || getProductImage(item.productName)
         }));
      } else {
         items = [{
            id: `ITEM-${doc.id}`,
            productName: data.type ? (data.type.charAt(0).toUpperCase() + data.type.slice(1)) : 'Assorted Items',
            quantity: quantity,
            price: Number(price), 
            image: getProductImage(data.type)
          }];
      }

      // CONSISTENCY CHECK: Recalculate total from items to match Detail View logic
      // This ensures that what is shown in the list matches exactly what is calculated in the detail view.
      const calculatedSubtotal = items.reduce((sum: number, item: OrderItem) => {
          const name = (item.productName || '').toLowerCase();
          // Logic: Set products have fixed price regardless of quantity (which usually describes contents)
          if (name.includes('family') || name.includes('gia đình') || 
              name.includes('friend') || name.includes('tình bạn') ||
              name.includes('set') || name.includes('gif') || name.includes('quà')) {
              return Number(item.price);
          }
          // Standard logic: Price * Quantity
          return Number(item.price) * Number(item.quantity);
      }, 0);

      const finalTotal = calculatedSubtotal + Number(shippingCost);

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
        total: finalTotal, // Use calculated total
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
      items: orderData.items, // New Array structure
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
      items: orderData.items,
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

/**
 * Syncs orders:
 * 1. Converts legacy "type" fields to normalized "items" array structure.
 * 2. Checks for items with ID 'Uvgrm3eBPU1h5GGjVVHj' and forces price to 98000.
 */
export const syncOrderData = async (): Promise<void> => {
    try {
        const fetchedOrders = await fetchOrders();
        
        // Target ID to update
        const TARGET_ITEM_ID = 'Uvgrm3eBPU1h5GGjVVHj';
        const TARGET_PRICE = 98000;

        const updatePromises = fetchedOrders.map(async (order) => {
            let hasChanges = false;
            let updatedItems = [...order.items];

            // Check if items contain the target ID
            const containsTargetItem = updatedItems.some(item => item.id === TARGET_ITEM_ID);

            if (containsTargetItem) {
                updatedItems = updatedItems.map(item => {
                    if (item.id === TARGET_ITEM_ID && item.price !== TARGET_PRICE) {
                        hasChanges = true;
                        return { ...item, price: TARGET_PRICE };
                    }
                    return item;
                });
                
                // If it contains the item, we enforce the update to save the structure even if price was correct,
                // effectively migrating "type" notes to "items" array in DB for these specific orders.
                hasChanges = true; 
            }

            if (hasChanges) {
                // Recalculate Total
                const subtotal = updatedItems.reduce((sum, item) => {
                    const name = (item.productName || '').toLowerCase();
                     if (name.includes('family') || name.includes('gia đình') || 
                        name.includes('friend') || name.includes('tình bạn') ||
                        name.includes('set') || name.includes('gif') || name.includes('quà')) {
                        return Number(item.price);
                    }
                    return Number(item.price) * Number(item.quantity);
                }, 0);
                
                const newTotal = subtotal + (order.shippingCost || 0);

                const orderRef = doc(db, 'orders', order.id);
                // Write back the standardized items array and corrected total
                await updateDoc(orderRef, {
                    items: updatedItems,
                    total: newTotal
                });
            }
        });

        await Promise.all(updatePromises);
    } catch (error) {
        console.error("Error syncing orders:", error);
        throw error;
    }
};