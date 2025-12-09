import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Order, OrderStatus, ProductType } from '../../../types';
import { useLanguage } from '../../../contexts/LanguageContext';
import OrderFormCustomerSection from './OrderFormCustomerSection';
import OrderFormItemsSection from './OrderFormItemsSection';
import OrderFormStatusSection from './OrderFormStatusSection';
import { DEFAULT_PRICES } from '../../../constants';

interface OrderFormProps {
  initialData?: Order | null;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

const PRODUCT_TYPES = [ProductType.FAMILY, ProductType.FRIENDSHIP];

const OrderForm: React.FC<OrderFormProps> = ({ initialData, onSave, onCancel }) => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [productType, setProductType] = useState<ProductType>(ProductType.FAMILY);
  const [customProduct, setCustomProduct] = useState('');
  
  const [quantity, setQuantity] = useState(5);
  const [unitPrice, setUnitPrice] = useState(DEFAULT_PRICES[ProductType.FAMILY]);
  
  const [shippingCost, setShippingCost] = useState(0);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<OrderStatus>(OrderStatus.PENDING);

  useEffect(() => {
    if (initialData) {
      setCustomerName(initialData.customer.name);
      setPhone(initialData.customer.phone);
      setAddress(initialData.customer.address);
      setNote(initialData.notes || '');
      setStatus(initialData.status);
      setShippingCost(initialData.shippingCost || 0);
      
      const item = initialData.items[0];
      if (item) {
        setQuantity(item.quantity);
        
        let price = item.price;
        const currentType = item.productName;
        // Normalize Friendly to Friendship for legacy data compatibility
        const normalizedType = currentType.toLowerCase() === 'friendly' ? ProductType.FRIENDSHIP : currentType;
        const matchedPreset = PRODUCT_TYPES.find(t => t.toLowerCase() === normalizedType.toLowerCase());
        
        // If editing a legacy order with 0 price but known type, set defaults
        if (price === 0 && matchedPreset) {
            const defaultPrice = DEFAULT_PRICES[matchedPreset as ProductType];
            if (defaultPrice) price = defaultPrice;
        }

        setUnitPrice(price);
        
        if (matchedPreset) {
          setProductType(matchedPreset);
        } else {
          setProductType(ProductType.CUSTOM);
          setCustomProduct(currentType);
        }
      }
    } else {
      setProductType(ProductType.FAMILY);
      setQuantity(5);
      setUnitPrice(DEFAULT_PRICES[ProductType.FAMILY]);
      setCustomerName('');
      setPhone('');
      setAddress('');
      setNote('');
      setCustomProduct('');
      setShippingCost(0);
    }
  }, [initialData]);

  const handleProductTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as ProductType;
    setProductType(newType);

    if (newType === ProductType.FAMILY) {
      setQuantity(5);
      setUnitPrice(DEFAULT_PRICES[ProductType.FAMILY]);
    } else if (newType === ProductType.FRIENDSHIP) {
      setQuantity(3);
      setUnitPrice(DEFAULT_PRICES[ProductType.FRIENDSHIP]);
    } else if (newType === ProductType.CUSTOM) {
      setQuantity(1);
      setUnitPrice(0);
      setCustomProduct('');
    }
  };

  // Calculate total:
  // For 'Custom', we use standard Quantity * Unit Price logic.
  // For 'Family' and 'Friendship' presets, the 'unitPrice' acts as the fixed price for the entire set,
  // regardless of the item quantity (which describes the set contents).
  const productCost = productType === ProductType.CUSTOM ? (quantity * unitPrice) : unitPrice;
  const total = productCost + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const finalProductName = productType === ProductType.CUSTOM ? customProduct : productType;
      if (!finalProductName.trim()) {
        throw new Error("Product name is required");
      }
      if (!customerName.trim()) {
        throw new Error("Customer name is required");
      }

      const formData = {
        id: initialData?.id,
        customer: {
          name: customerName,
          phone: phone,
          address: address,
        },
        items: [{
          productName: finalProductName,
          quantity: Number(quantity),
          price: Number(unitPrice)
        }],
        shippingCost: Number(shippingCost),
        total: total,
        notes: note,
        status: status
      };

      await onSave(formData);
    } catch (err: any) {
      setError(err.message || "Failed to save order");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={onCancel}></div>
      <div className="absolute inset-y-0 right-0 max-w-xl w-full flex pointer-events-none">
        <div className="w-full h-full bg-white dark:bg-slate-800 shadow-2xl flex flex-col pointer-events-auto animate-slide-in-right">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {initialData ? t('form.editTitle') : t('form.createTitle')}
            </h2>
            <button onClick={onCancel} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            <OrderFormCustomerSection 
              customerName={customerName} setCustomerName={setCustomerName}
              phone={phone} setPhone={setPhone}
              address={address} setAddress={setAddress}
            />
            <hr className="border-slate-100 dark:border-slate-700" />
            <OrderFormItemsSection 
              productType={productType}
              customProduct={customProduct} setCustomProduct={setCustomProduct}
              quantity={quantity} setQuantity={setQuantity}
              unitPrice={unitPrice} setUnitPrice={setUnitPrice}
              shippingCost={shippingCost} setShippingCost={setShippingCost}
              total={total}
              productTypes={PRODUCT_TYPES}
              handleProductTypeChange={handleProductTypeChange}
            />
            <hr className="border-slate-100 dark:border-slate-700" />
            <OrderFormStatusSection 
              status={status} setStatus={setStatus}
              note={note} setNote={setNote}
            />
          </form>
          <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {t('form.cancel')}
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-orange-600 dark:bg-orange-500 rounded-lg text-sm font-medium text-white hover:bg-orange-700 dark:hover:bg-orange-600 shadow-sm flex items-center gap-2 disabled:opacity-70 transition-colors"
            >
              {isSubmitting ? t('form.saving') : (
                <>
                  <Save className="w-4 h-4" /> {t('form.save')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;