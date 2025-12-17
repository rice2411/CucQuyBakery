import React, { useState, useEffect, useMemo } from 'react';
import { Package } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Product, Ingredient } from '@/types';
import { fetchProducts, addProduct, updateProduct } from '@/services/productService';
import { fetchIngredients, addIngredient, updateIngredient } from '@/services/ingredientService';
import ProductForm from '@/pages/Storage/components/ProductForm';
import ConfirmModal from '@/components/ConfirmModal';
import TabsHeader from '@/pages/Storage/components/TabsHeader';
import ProductToolbar from '@/pages/Storage/components/ProductToolbar';
import ProductGrid from '@/pages/Storage/components/ProductGrid';
import PlaceholderTab from '@/pages/Storage/components/PlaceholderTab';
import IngredientToolbar from '@/pages/Storage/components/IngredientToolbar';
import IngredientGrid from '@/pages/Storage/components/IngredientGrid';
import IngredientForm from '@/pages/Storage/components/IngredientForm';

type InventoryTab = 'products' | 'ingredients' | 'recipes';

const InventoryPage: React.FC = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingIngredients, setLoadingIngredients] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [activeTab, setActiveTab] = useState<InventoryTab>('products');
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [isIngredientFormOpen, setIsIngredientFormOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | undefined>(undefined);

  const loadProducts = async () => {
    setLoading(true);
    const data = await fetchProducts();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const loadIngredients = async () => {
    setLoadingIngredients(true);
    const data = await fetchIngredients();
    setIngredients(data);
    setLoadingIngredients(false);
  };

  useEffect(() => {
    loadIngredients();
  }, []);

  const handleCreate = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleSave = async (data: any) => {
    if (data.id) {
      await updateProduct(data.id, data);
    } else {
      // Destructure to remove 'id' which is undefined for new products
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...productData } = data;
      await addProduct(productData);
    }
    await loadProducts();
    setIsFormOpen(false);
  };

  // Ingredient handlers
  const handleCreateIngredient = () => {
    setEditingIngredient(undefined);
    setIsIngredientFormOpen(true);
  };

  const handleEditIngredient = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setIsIngredientFormOpen(true);
  };

  const handleSaveIngredient = async (data: any) => {
    if (data.id) {
      await updateIngredient(data.id, data);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...payload } = data;
      await addIngredient(payload);
    }
    await loadIngredients();
    setIsIngredientFormOpen(false);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const filteredIngredients = useMemo(() => {
    return ingredients.filter((ing) =>
      ing.name.toLowerCase().includes(ingredientSearch.toLowerCase()) ||
      (ing.supplier || '').toLowerCase().includes(ingredientSearch.toLowerCase())
    );
  }, [ingredients, ingredientSearch]);


  const renderTabContent = () => {
    if (activeTab === 'products') {
      return (
        <>
          <ProductToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onCreate={handleCreate}
          />

          <ProductGrid
            products={filteredProducts}
            loading={loading}
            onEdit={handleEdit}
            onCreate={handleCreate}
          />
        </>
      );
    }

    if (activeTab === 'ingredients') {
      return (
        <>
          <IngredientToolbar
            searchTerm={ingredientSearch}
            onSearchChange={setIngredientSearch}
            onCreate={handleCreateIngredient}
          />
          <IngredientGrid
            ingredients={filteredIngredients}
            loading={loadingIngredients}
            onEdit={handleEditIngredient}
            onCreate={handleCreateIngredient}
          />
        </>
      );
    }

    return <PlaceholderTab tab={activeTab} />;
  };

  return (
    <div className="h-full relative flex flex-col space-y-6">
      <TabsHeader activeTab={activeTab} onChange={setActiveTab} />

      {renderTabContent()}

      {isFormOpen && (
        <ProductForm 
           initialData={editingProduct}
           onSave={handleSave}
           onCancel={() => setIsFormOpen(false)}
        />
      )}

      {isIngredientFormOpen && (
        <IngredientForm
          isOpen={isIngredientFormOpen}
          initialData={editingIngredient}
          onSave={handleSaveIngredient}
          onClose={() => setIsIngredientFormOpen(false)}
        />
      )}
    </div>
  );
};

export default InventoryPage;