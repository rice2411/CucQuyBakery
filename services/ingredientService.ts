import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Ingredient, IngredientHistoryType, IngredientType } from '@/types';

const normalizeIngredientType = (val: any): IngredientType => {
  const key = (val || '').toString().toUpperCase();
  return Object.values(IngredientType).includes(key as IngredientType) ? (key as IngredientType) : IngredientType.BASE;
};

const normalizeHistoryType = (val: any): IngredientHistoryType => {
  const key = (val || '').toString().toUpperCase();
  return Object.values(IngredientHistoryType).includes(key as IngredientHistoryType)
    ? (key as IngredientHistoryType)
    : IngredientHistoryType.IMPORT;
};

const computeHistoryQuantity = (history: any[]): number => {
  if (!Array.isArray(history)) return 0;
  return history.reduce((acc, item) => {
    const type = normalizeHistoryType(item.type);
    const qty = Number(item.quantity || 0);
    return acc + (type === IngredientHistoryType.IMPORT ? qty : -qty);
  }, 0);
};


//create a function to modifert one field of all order
export const modifyOrderField = async (): Promise<void> => {
  try {
    const ingredientsRef = collection(db, "ingredients");
    const q = query(ingredientsRef);
    const snapshot = await getDocs(q);
    for (const doc of snapshot.docs) {
     updateDoc(doc.ref, {
      quantity: 0
     });
    }
  } catch (error) {
    console.error("Error modifying order field:", error);
    throw error;
  }
};


export const fetchIngredients = async (): Promise<Ingredient[]> => {
  try {
    const ref = collection(db, 'ingredients');
    const q = query(ref, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const historyData = Array.isArray(data.history)
        ? data.history.map((item: any) => ({
            id: item.id || docSnap.id + (item.createdAt?.seconds || ''),
            type: normalizeHistoryType(item.type),
            quantity: Number(item.quantity || 0),
            unit: item.unit === 'piece' ? 'piece' : 'g',
            note: item.note || '',
            price: Number(item.price || 0),
            supplierId: item.supplierId || '',
            supplierName: item.supplierName || '',
            createdAt: item.createdAt?.toDate ? item.createdAt.toDate().toISOString() : item.createdAt || Timestamp.now().toDate().toISOString(),
          }))
        : [];
      return {
        id: docSnap.id,
        name: data.name || '',
        type: normalizeIngredientType(data.type),
        quantity: computeHistoryQuantity(historyData),
        unit: data.unit || 'g',
        history: historyData,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as Ingredient;
    });
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    try {
      const snapshot = await getDocs(collection(db, 'ingredients'));
      return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Ingredient));
    } catch (e) {
      return [];
    }
  }
};

export const addIngredient = async (ingredientData: Omit<Ingredient, 'id'>): Promise<void> => {
  try {
    const ref = collection(db, 'ingredients');
    await addDoc(ref, {
      name: ingredientData.name.trim(),
      type: ingredientData.type,
      quantity: ingredientData.quantity || 0,
      unit: ingredientData.unit || 'g',
      history: ingredientData.history || [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error adding ingredient:', error);
    throw error;
  }
};

export const updateIngredient = async (id: string, ingredientData: Partial<Ingredient>): Promise<void> => {
  try {
    const ref = doc(db, 'ingredients', id);
    const payload = {
      ...ingredientData,
      updatedAt: Timestamp.now(),
    };
    await updateDoc(ref, payload as any);
  } catch (error) {
    console.error('Error updating ingredient:', error);
    throw error;
  }
};

export const deleteIngredient = async (id: string): Promise<void> => {
  try {
    const ref = doc(db, 'ingredients', id);
    await deleteDoc(ref);
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    throw error;
  }
};

