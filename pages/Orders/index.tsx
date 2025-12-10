import React, { useState } from 'react';
import { Plus, Package, RefreshCw } from 'lucide-react';
import { useOrders } from '../../contexts/OrderContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Order } from '../../types';
import OrderList from './components/OrderList';
import OrderDetail from './components/OrderDetail';
import OrderForm from './components/OrderForm';
import ConfirmModal from '../../components/ConfirmModal';

const OrdersPage: React.FC = () => {
  const { orders, createNewOrder, modifyOrder, removeOrder, syncOrders } = useOrders();
  const { t } = useLanguage();
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | undefined>(undefined);

  // Delete Confirmation State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Sync State
  const [isSyncing, setIsSyncing] = useState(false);

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleCreateNewOrder = () => {
    setEditingOrder(undefined);
    setIsOrderFormOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setSelectedOrder(null);
    setIsOrderFormOpen(true);
  };

  const handleDeleteClick = (orderId: string) => {
    setDeleteId(orderId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    
    setIsDeleting(true);
    try {
      await removeOrder(deleteId);
      setIsDeleteModalOpen(false);
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete order:", error);
      // Keep modal open or show error feedback here
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveOrder = async (data: any) => {
    if (data.id) {
      await modifyOrder(data.id, data);
    } else {
      await createNewOrder(data);
    }
    setIsOrderFormOpen(false);
  };
  
  const handleSync = async () => {
    setIsSyncing(true);
    try {
        await syncOrders();
    } catch (error) {
        console.error("Sync failed", error);
    } finally {
        setIsSyncing(false);
    }
  };

  return (
    <div className="h-full relative">
      <div className="mb-4 flex flex-col sm:flex-row justify-end items-center gap-3">
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
             onClick={handleSync}
             disabled={isSyncing}
             className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
           >
             <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
             <span>{isSyncing ? t('orders.syncing') : t('orders.sync')}</span>
           </button>
          <button 
             onClick={handleCreateNewOrder}
             className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-orange-200 dark:shadow-none"
           >
             <Plus className="w-4 h-4" />
             <span>{t('nav.newOrder')}</span>
           </button>
        </div>
      </div>

      {orders.length === 0 ? (
         <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-slate-500">
           <Package className="w-16 h-16 mb-4 opacity-20" />
           <p className="mb-4">{t('orders.noOrders')}</p>
           <button 
             onClick={handleCreateNewOrder}
             className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700"
           >
             {t('orders.createFirst')}
           </button>
         </div>
      ) : (
        <OrderList 
          orders={orders} 
          onSelectOrder={handleOrderSelect} 
          onDeleteOrder={handleDeleteClick}
        />
      )}

      {selectedOrder && (
        <OrderDetail 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)}
          onEdit={() => handleEditOrder(selectedOrder)}
        />
      )}

      {isOrderFormOpen && (
        <OrderForm 
          initialData={editingOrder} 
          onSave={handleSaveOrder} 
          onCancel={() => setIsOrderFormOpen(false)} 
        />
      )}

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        title={t('orders.delete')}
        message={t('orders.confirmDelete')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default OrdersPage;