import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, Calendar, ChevronLeft, ChevronRight, Filter, Package } from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import OrderListMobile from './mobile/OrderListMobile';
import OrderListDesktop from './desktop/OrderListDesktop';

interface OrderListProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onDeleteOrder: (id: string) => void;
  onUpdateOrder: (id: string, data: any) => Promise<void>;
}

const OrderList: React.FC<OrderListProps> = ({ orders, onSelectOrder, onDeleteOrder, onUpdateOrder }) => {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // New Filters
  const [productFilter, setProductFilter] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(''); // Format: YYYY-MM
  
  // Mobile Filter Toggle State
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const [sortField, setSortField] = useState<keyof Order>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Generate Month Options from Jan 2025 to Now
  const monthOptions = useMemo(() => {
    const options = [];
    const start = new Date(2025, 0, 1); // Jan 2025
    const now = new Date();
    
    // Safety check in case system time is wrong and before 2025
    if (now < start) {
       return [{ 
         value: '2025-01', 
         label: start.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', year: 'numeric' }) 
       }];
    }

    const current = new Date(start);
    while (current <= now || (current.getMonth() === now.getMonth() && current.getFullYear() === now.getFullYear())) {
       const label = current.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', year: 'numeric' });
       // Format YYYY-MM
       const value = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
       options.push({ value, label });
       
       // Increment month
       current.setMonth(current.getMonth() + 1);
       
       // Break if we somehow go way past now to prevent infinite loops
       if (current.getFullYear() > now.getFullYear() + 1) break;
    }
    return options.reverse(); // Newest first
  }, [language]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Basic Search (ID or Customer Name or Order Number)
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.orderNumber && order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status Filter
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      
      // Product Filter
      const matchesProduct = !productFilter || order.items.some(item => 
        item.name.toLowerCase().includes(productFilter.toLowerCase())
      );

      // Month Filter
      let matchesDate = true;
      if (selectedMonth) {
        const [filterYear, filterMonth] = selectedMonth.split('-').map(Number);
        const orderDate = new Date(order.date);
        if (orderDate.getFullYear() !== filterYear || (orderDate.getMonth() + 1) !== filterMonth) {
          matchesDate = false;
        }
      }

      return matchesSearch && matchesStatus && matchesProduct && matchesDate;
    }).sort((a, b) => {
      // Sorting logic
      if (a[sortField]! < b[sortField]!) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField]! > b[sortField]!) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [orders, searchTerm, statusFilter, sortField, sortDirection, productFilter, selectedMonth]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, productFilter, selectedMonth]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  
  // Adjust currentPage if it exceeds totalPages due to deletion or filtering
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredOrders.length);
  const currentOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handleSort = (field: keyof Order) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleTogglePayment = async (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    const newStatus = order.paymentStatus === PaymentStatus.PAID 
      ? PaymentStatus.UNPAID 
      : PaymentStatus.PAID;
    
    await onUpdateOrder(order.id, { 
      ...order,
      paymentStatus: newStatus
    });
  };

  const renderProductSummary = (order: Order) => {
    if (!order.items || order.items.length === 0) return 'No items';
    const firstItem = order.items[0];
    const remainingCount = order.items.length - 1;
    return (
      <div className="flex flex-col">
        <span className="font-medium text-slate-700 dark:text-slate-300 line-clamp-1" title={firstItem.name}>{firstItem.name}</span>
        {remainingCount > 0 && (
          <span className="text-xs text-slate-500 italic">+{remainingCount} more</span>
        )}
      </div>
    );
  };


  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full animate-fade-in transition-colors overflow-hidden">
      
      {/* Filters Toolbar */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex flex-col gap-4 shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center justify-between w-full sm:w-auto">
             <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
               <Filter className="w-5 h-5 text-orange-500" />
               {t('orders.recent')}
             </h2>
             <button 
               onClick={() => setIsFiltersOpen(!isFiltersOpen)}
               className="sm:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
               aria-label="Toggle filters"
             >
               {isFiltersOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
             </button>
          </div>
          
          <div className="relative w-full sm:w-auto">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
             <input 
               type="text" 
               placeholder={t('orders.searchPlaceholder')}
               className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-64 placeholder-slate-400 transition-all"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
        </div>

        {/* Collapsible Grid: Hidden on mobile unless open, always Grid on desktop */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ${isFiltersOpen ? 'grid' : 'hidden sm:grid'}`}>
           {/* Product Filter */}
           <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder={t('orders.filterProductPlaceholder')}
                className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 w-full placeholder-slate-400 transition-all"
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
              />
           </div>

           {/* Month Filter Dropdown */}
           <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none cursor-pointer"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="">{t('orders.allMonths')}</option>
                {monthOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
           </div>

           {/* Status */}
           <select 
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer transition-all"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">{t('orders.allStatus')}</option>
              {Object.values(OrderStatus).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
        </div>
      </div>

      <OrderListMobile
        orders={currentOrders}
        onSelectOrder={onSelectOrder}
        onDeleteOrder={onDeleteOrder}
        onTogglePayment={handleTogglePayment}
        renderProductSummary={renderProductSummary}
      />

      <OrderListDesktop
        orders={currentOrders}
        onSelectOrder={onSelectOrder}
        renderProductSummary={renderProductSummary}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
      
      <div className="p-4 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-500 flex justify-between items-center bg-white dark:bg-slate-800 rounded-b-xl shrink-0">
        <span>
          {filteredOrders.length > 0 
            ? `${t('orders.showing')} ${startIndex + 1}-${endIndex} ${t('orders.of')} ${filteredOrders.length}` 
            : t('orders.noOrdersCriteria')
          }
        </span>
        <div className="flex gap-2">
          <button 
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            <ChevronLeft className="w-3 h-3 mr-1" /> Prev
          </button>
          <div className="px-2 py-1 flex items-center justify-center font-medium text-slate-600 dark:text-slate-300">
            {currentPage} / {Math.max(1, totalPages)}
          </div>
          <button 
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            Next <ChevronRight className="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderList;