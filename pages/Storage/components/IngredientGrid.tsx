import React, { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Ingredient, IngredientType } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface IngredientGridProps {
  ingredients: Ingredient[];
  loading: boolean;
  onEdit: (ingredient: Ingredient) => void;
  onCreate: () => void;
}

const typeOrder: IngredientType[] = [
  IngredientType.BASE,
  IngredientType.FLAVOR,
  IngredientType.TOPPING,
  IngredientType.DECORATION,
  IngredientType.MATERIAL,
];

const IngredientGrid: React.FC<IngredientGridProps> = ({ ingredients, loading, onEdit, onCreate }) => {
  const { t } = useLanguage();

  const grouped = useMemo(
    () =>
      typeOrder
        .map((type) => ({
          type,
          items: ingredients.filter((ing) => ing.type === type),
        }))
        .filter((group) => group.items.length > 0),
    [ingredients]
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-6">
      {grouped.map((group) => (
        <div key={group.type} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
              {t(`ingredients.form.types.${group.type.toString().toLowerCase()}`)}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">{group.items.length}</span>
          </div>
          {group.items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-4 text-sm text-slate-500 dark:text-slate-400">
              {t('ingredients.noData')}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {group.items.map((ing) => (
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
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {t(`ingredients.form.types.${ing.type}`)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                    <p>
                      <span className="font-medium">{t('ingredients.form.quantity')}:</span>{' '}
                      {ing.quantity ?? 0} {ing.unit === 'piece' ? t('ingredients.form.unitPiece') : 'g'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default IngredientGrid;

