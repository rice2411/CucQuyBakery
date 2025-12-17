import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Ingredient } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface IngredientGridProps {
  ingredients: Ingredient[];
  loading: boolean;
  onEdit: (ingredient: Ingredient) => void;
  onCreate: () => void;
}

const IngredientGrid: React.FC<IngredientGridProps> = ({ ingredients, loading, onEdit, onCreate }) => {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (ingredients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-slate-400 dark:text-slate-500">
        <AlertTriangle className="w-16 h-16 mb-4 opacity-20" />
        <p className="mb-4">{t('ingredients.noData')}</p>
        <button
          onClick={onCreate}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          {t('ingredients.createFirst')}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
      {ingredients.map((ing) => (
        <div
          key={ing.id}
          onClick={() => onEdit(ing)}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md hover:border-orange-200 dark:hover:border-orange-500 transition-all cursor-pointer"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-lg">
                {ing.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">{ing.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{ing.supplier || t('ingredients.noSupplier')}</p>
              </div>
            </div>
          </div>

          <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
            <p>
              <span className="font-medium">{t('ingredients.quantity')}:</span>{' '}
              {ing.quantity ?? 0} {ing.unit || 'kg'}
            </p>
            {ing.note && (
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                {ing.note}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default IngredientGrid;

