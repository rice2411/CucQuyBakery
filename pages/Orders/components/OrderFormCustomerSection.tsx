import React, { useMemo } from 'react';
import { User, MapPin, Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCustomers } from '@/contexts/CustomerContext';
import { Customer } from '@/types';
import AutocompleteInput, { AutocompleteOption } from '@/components/AutocompleteInput';

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
  const { customers } = useCustomers();

  const normalize = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

  // Convert customers to AutocompleteOption format
  const customerOptions = useMemo<AutocompleteOption[]>(() => 
    customers.map(c => ({
      id: c.id,
      label: c.name,
      subtitle: `${c.phone}${c.email ? ` • ${c.email}` : ''}`,
    })), [customers]
  );

  const handleSelectCustomer = (option: AutocompleteOption) => {
    const customer = customers.find(c => c.id === option.id);
    if (customer) {
      setCustomerName(customer.name);
      setPhone(customer.phone);
      
      // Construct full address
      const fullAddress = [customer.address, customer.city, customer.country]
        .filter(part => part && part.trim() !== '')
        .join(', ');
      
      setAddress(fullAddress);
    }
  };

  // Name Search: Matches Name OR Phone
  const nameFilterFn = (option: AutocompleteOption, searchValue: string) => {
    if (!searchValue.trim()) return false;
    const term = searchValue.toLowerCase();
    const phoneTerm = normalize(searchValue);
    const customer = customers.find(c => c.id === option.id);
    if (!customer) return false;
    
    return customer.name.toLowerCase().includes(term) || 
           (phoneTerm.length > 3 && normalize(customer.phone).includes(phoneTerm));
  };

  // Phone Search: Matches Phone only
  const phoneFilterFn = (option: AutocompleteOption, searchValue: string) => {
    if (!searchValue.trim()) return false;
    const term = normalize(searchValue);
    if (term.length < 3) return false; // Don't search for too short numbers
    const customer = customers.find(c => c.id === option.id);
    if (!customer) return false;
    return normalize(customer.phone).includes(term);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
        <User className="w-4 h-4 text-orange-500" /> {t('form.customerDetails')}
      </h3>
      
      <div className="space-y-3">
        {/* Customer Name with Autocomplete */}
        <AutocompleteInput
          value={customerName}
          onChange={setCustomerName}
          onSelect={handleSelectCustomer}
          options={customerOptions}
          placeholder="Search by name or phone..."
          label={t('form.customerName')}
          required
          filterFn={nameFilterFn}
        />
        
        {/* Phone with Autocomplete */}
        <AutocompleteInput
          value={phone}
          onChange={setPhone}
          onSelect={handleSelectCustomer}
          options={customerOptions}
          placeholder="090 123 4567"
          label={t('form.phone')}
          filterFn={phoneFilterFn}
        />

        {/* Address */}
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