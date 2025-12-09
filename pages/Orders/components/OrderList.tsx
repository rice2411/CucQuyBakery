import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, Eye, Calendar, User, ArrowRight, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Order, OrderStatus } from '../../../types';
import { STATUS_COLORS } from '../../../constants';
import { useLanguage } from '../../../contexts/LanguageContext';

interface OrderListProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onDeleteOrder: (id: string) => void;
}

const OrderList: React.FC<OrderListProps> = ({ orders, onSelectOrder, onDeleteOrder }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<keyof Order>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      if (a[sortField]! < b[sortField]!) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField]! > b[sortField]!) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [orders, searchTerm, statusFilter, sortField, sortDirection]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  
  // Adjust currentPage if it exceeds totalPages due to deletion
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

  const SortIcon = ({ field }: { field: keyof Order }) => {
    if (sortField !== field) return <div className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-30" />;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />;
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full animate-fade-in transition-colors">
      <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">{t('orders.recent')}</h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder={t('orders.searchPlaceholder')}
              className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-64 placeholder-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
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

      <div className="lg:hidden p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
        {currentOrders.length > 0 ? (
          currentOrders.map(order => (
             <div 
               key={order.id} 
               className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm active:scale-[0.98] transition-all cursor-pointer relative group" 
               onClick={() => onSelectOrder(order)}
             >
                <div className="flex justify-between items-start mb-3">
                   <div>
                      <span className="text-orange-600 dark:text-orange-400 font-bold text-sm">{order.id}</span>
                      <div className="flex items-center text-slate-400 dark:text-slate-500 text-xs mt-1">
                         <Calendar className="w-3 h-3 mr-1" />
                         {new Date(order.date).toLocaleDateString()}
                      </div>
                   </div>
                   <span className={`px-2.5 py-1 rounded-full text-xs font-medium border border-transparent ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                </div>
                
                <div className="flex items-center gap-3 mb-4 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                   <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-sm">
                      <User className="w-4 h-4" />
                   </div>
                   <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{order.customer.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                   </div>
                   <div className="text-right">
                       <p className="text-xs text-slate-500 dark:text-slate-400">{t('orders.tableTotal')}</p>
                       <p className="font-bold text-slate-900 dark:text-white">{formatVND(order.total)}</p>
                   </div>
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                     <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDeleteOrder(order.id);
                      }}
                      className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all z-10"
                    >
                       <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center text-xs font-medium text-orange-600 dark:text-orange-400">
                        {t('orders.viewDetails')} <ArrowRight className="w-3 h-3 ml-1" />
                    </div>
                </div>
             </div>
          ))
        ) : (
             <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-sm bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 border-dashed">{t('orders.noOrdersCriteria')}</div>
        )}
      </div>

      <div className="hidden lg:block overflow-x-auto min-h-[500px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
              <th className="px-6 py-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 group" onClick={() => handleSort('id')}>
                <div className="flex items-center">{t('orders.tableId')} <SortIcon field="id" /></div>
              </th>
              <th className="px-6 py-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 group" onClick={() => handleSort('date')}>
                <div className="flex items-center">{t('orders.tableDate')} <SortIcon field="date" /></div>
              </th>
              <th className="px-6 py-4">{t('orders.tableCustomer')}</th>
              <th className="px-6 py-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 group" onClick={() => handleSort('status')}>
                 <div className="flex items-center">{t('orders.tableStatus')} <SortIcon field="status" /></div>
              </th>
              <th className="px-6 py-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 group text-right" onClick={() => handleSort('total')}>
                 <div className="flex items-center justify-end">{t('orders.tableTotal')} <SortIcon field="total" /></div>
              </th>
              <th className="px-6 py-4 text-center">{t('orders.tableActions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {currentOrders.length > 0 ? (
              currentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-medium text-orange-600 dark:text-orange-400">{order.id}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-slate-900 dark:text-white font-medium text-sm">{order.customer.name}</span>
                      <span className="text-slate-400 dark:text-slate-500 text-xs">{order.customer.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border border-transparent ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-white">
                    {formatVND(order.total)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <button 
                          type="button"
                          onClick={() => onSelectOrder(order)}
                          className="p-2 text-slate-400 dark:text-slate-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all"
                          title={t('orders.viewDetails')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onDeleteOrder(order.id);
                          }}
                          className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          title={t('orders.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                  {t('orders.noOrdersCriteria')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-500 flex justify-between items-center bg-white dark:bg-slate-800 rounded-b-xl">
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