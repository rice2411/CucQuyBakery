import React from 'react';
import { Package, DollarSign } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { ProductType } from '../../../types';

interface OrderItemsSectionProps {
  productType: ProductType;
  customProduct: string;
  setCustomProduct: (val: string) => void;
  quantity: number;
  setQuantity: (val: number) => void;
  unitPrice: number;
  setUnitPrice: (val: number) => void;
  shippingCost: number;
  setShippingCost: (val: number) => void;
  total: number;
  productTypes: ProductType[];
  handleProductTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const OrderFormItemsSection: React.FC<OrderItemsSectionProps> = ({
  productType, customProduct, setCustomProduct,
  quantity, setQuantity,
  unitPrice, setUnitPrice,
  shippingCost, setShippingCost,
  total, productTypes, handleProductTypeChange
}) => {
  const { t } = useLanguage();

  const getProductImage = (type: ProductType, customName: string) => {
    const t = (type === ProductType.CUSTOM ? customName : type).toLowerCase();
    
    if (t.includes('family')) return 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80&w=200';
    if (t.includes('friend')) return 'https://images.unsplash.com/photo-1621236378699-8597f840b45a?auto=format&fit=crop&q=80&w=200';
    if (t.includes('cookie')) return 'https://images.unsplash.com/photo-1499636138143-bd649025ebeb?auto=format&fit=crop&q=80&w=200';
    if (t.includes('cake')) return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=200';
    
    // Default/Fallback
    const displayText = (type === ProductType.CUSTOM && customName) ? customName : type;
    return `https://placehold.co/200x200?text=${encodeURIComponent(displayText || 'Product')}`;
  };

  const currentImage = getProductImage(productType, customProduct);

  return (
    <div className="space-y-4">
       <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
        <Package className="w-4 h-4 text-orange-500" /> {t('form.orderInfo')}
      </h3>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Product Image Preview */}
        <div className="shrink-0 flex justify-center sm:justify-start">
          <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 shadow-sm relative group">
             <img 
               src={currentImage} 
               alt="Product Preview" 
               className="w-full h-full object-cover bg-slate-100 dark:bg-slate-700 transition-transform duration-500 group-hover:scale-110"
             />
             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('form.productType')}</label>
              <select 
                value={productType}
                onChange={handleProductTypeChange}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
              >
                {productTypes.map(type => <option key={type} value={type}>{type}</option>)}
                <option value={ProductType.CUSTOM}>✨ Custom Product...</option>
              </select>
            </div>
            
            {productType === ProductType.CUSTOM && (
              <div className="animate-fade-in">
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('form.customName')}</label>
                 <input 
                  type="text" 
                  value={customProduct}
                  onChange={e => setCustomProduct(e.target.value)}
                  className="w-full px-3 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg text-sm text-orange-700 dark:text-orange-300 focus:ring-2 focus:ring-orange-500 outline-none placeholder-orange-300"
                  placeholder={t('form.customPlaceholder')}
                  autoFocus
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
             <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('form.quantity')}</label>
                <input 
                  type="number" 
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                />
             </div>
             <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('form.unitPrice')}</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="number" 
                    min="0"
                    step="1000"
                    value={unitPrice}
                    onChange={e => setUnitPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
             </div>
          </div>

          <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('form.shippingCost')}</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">SHIP</span>
                <input 
                  type="number" 
                  min="0"
                  step="1000"
                  value={shippingCost}
                  onChange={e => setShippingCost(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-12 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
          </div>

           <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <span className="font-medium text-slate-600 dark:text-slate-400">{t('form.totalEstimate')}</span>
              <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
              </span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OrderFormItemsSection;