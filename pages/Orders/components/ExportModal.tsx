import React, { useState } from 'react';
import { Download, X, Calendar } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (range: 'month' | 'all' | 'custom', startDate?: string, endDate?: string) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport }) => {
  const { t } = useLanguage();
  const [range, setRange] = useState<'month' | 'all' | 'custom'>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!isOpen) return null;

  const handleExport = () => {
    onExport(range, startDate, endDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md pointer-events-none">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 pointer-events-auto animate-fade-in mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-orange-600" />
              {t('orders.exportTitle')}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 mb-6">
            <label className="flex items-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <input 
                type="radio" 
                name="exportRange" 
                value="month" 
                checked={range === 'month'} 
                onChange={() => setRange('month')}
                className="w-4 h-4 text-orange-600 focus:ring-orange-500"
              />
              <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">{t('orders.exportCurrentMonth')}</span>
            </label>

            <label className="flex items-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <input 
                type="radio" 
                name="exportRange" 
                value="all" 
                checked={range === 'all'} 
                onChange={() => setRange('all')}
                className="w-4 h-4 text-orange-600 focus:ring-orange-500"
              />
              <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">{t('orders.exportAllTime')}</span>
            </label>

            <label className="flex items-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <input 
                type="radio" 
                name="exportRange" 
                value="custom" 
                checked={range === 'custom'} 
                onChange={() => setRange('custom')}
                className="w-4 h-4 text-orange-600 focus:ring-orange-500"
              />
              <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">{t('orders.exportCustom')}</span>
            </label>

            {range === 'custom' && (
              <div className="grid grid-cols-2 gap-3 pl-7 animate-fade-in">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">{t('orders.exportStart')}</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                   <label className="block text-xs text-slate-500 mb-1">{t('orders.exportEnd')}</label>
                   <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              {t('orders.exportCancel')}
            </button>
            <button 
              onClick={handleExport}
              disabled={range === 'custom' && (!startDate || !endDate)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('orders.exportConfirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;