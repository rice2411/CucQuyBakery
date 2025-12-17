import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Ingredient } from '@/types';

export const fetchIngredients = async (): Promise<Ingredient[]> => {
  try {
    const ref = collection(db, 'ingredients');
    const q = query(ref, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || '',
        supplier: data.supplier || '',
        quantity: Number(data.quantity || 0),
        unit: data.unit || 'kg',
        note: data.note || '',
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
      supplier: ingredientData.supplier?.trim() || '',
      quantity: ingredientData.quantity || 0,
      unit: ingredientData.unit || 'kg',
      note: ingredientData.note?.trim() || '',
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

