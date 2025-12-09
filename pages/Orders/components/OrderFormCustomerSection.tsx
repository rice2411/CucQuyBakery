import React from 'react';
import { User, MapPin, Phone } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface CustomerSectionProps {
  customerName: string;
  setCustomerName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
}

const OrderFormCustomerSection: React.FC<CustomerSectionProps> = ({
  customerName, setCustomerName,
  phone, setPhone,
  address, setAddress
}) => {
  const { t } = useLanguage();
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
        <User className="w-4 h-4 text-orange-500" /> {t('form.customerDetails')}
      </h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('form.customerName')} *</label>
          <input 
            type="text" 
            required
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
            placeholder="e.g., Nguyen Van A"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('form.phone')}</label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="tel" 
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="090 123 4567"
            />
          </div>
        </div>

        <div>
           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('form.address')}</label>
           <div className="relative">
              <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <textarea 
                value={address}
                onChange={e => setAddress(e.target.value)}
                rows={2}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                placeholder="House number, street name..."
              />
           </div>
        </div>
      </div>
    </div>
  );
};

export default OrderFormCustomerSection;