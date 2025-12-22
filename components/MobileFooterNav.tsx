import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, PlusCircle, ShoppingCart, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getAccessibleRoutes } from '@/config/routes';
import { getUserFromLocalStorage } from '@/utils/userUtil';

const MobileFooterNav: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const storedUser = React.useMemo(() => getUserFromLocalStorage(), []);
  const userRole = userData?.role || storedUser?.role;
  const accessibleRoutes = getAccessibleRoutes(userRole);

  const mainTabs = ['/', '/orders', '/customers', '/storage'];
  const otherRoutes = accessibleRoutes.filter(
    (route) => !mainTabs.includes(route.path) && route.path !== '/' && !route.disabled
  );

  const tabs = [
    {
      id: '/orders',
      label: t('nav.orders'),
      icon: ShoppingCart,
    },
    {
      id: '/customers',
      label: t('nav.customers'),
      icon: Users,
    },
    {
      id: '/',
      label: t('nav.dashboard'),
      icon: LayoutDashboard,
    },
    {
      id: '/storage',
      label: t('nav.inventory'),
      icon: Package,
    },
    {
      id: 'more',
      label: t('nav.add'),
      icon: PlusCircle,
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };

    if (isMoreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMoreMenuOpen]);

  const handleMoreClick = () => {
    setIsMoreMenuOpen(!isMoreMenuOpen);
  };

  const handleRouteClick = (path: string) => {
    navigate(path);
    setIsMoreMenuOpen(false);
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-700 z-30 backdrop-blur">
        <div className="relative flex justify-between px-3 pb-3 pt-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = location.pathname === tab.id;
            const isMore = tab.id === 'more';
            const isDashboard = tab.id === '/';

            if (isDashboard) {
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate('/')}
                  className="relative flex flex-1 flex-col items-center gap-0.5 text-[11px] pt-3"
                >
                  <div className="w-full h-full opacity-0 pointer-events-none" />
                  <span
                    className={` ${
                      active
                        ? 'text-orange-600 dark:text-orange-300 font-semibold'
                        : 'text-slate-500 dark:text-slate-300'
                    }`}
                  >
                    {tab.label}
                  </span>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-orange-300 dark:shadow-none border-2 border-white dark:border-slate-900">
                    <LayoutDashboard className="w-6 h-6" />
                  </div>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={isMore ? handleMoreClick : () => navigate(tab.id)}
                className="flex flex-1 flex-col items-center gap-0.5 text-[11px]"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isMore && isMoreMenuOpen
                      ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300'
                      : active
                        ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300'
                        : 'text-slate-500 dark:text-slate-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`mt-0.5 ${
                    isMore && isMoreMenuOpen
                      ? 'text-orange-600 dark:text-orange-300 font-semibold'
                      : active
                        ? 'text-orange-600 dark:text-orange-300 font-semibold'
                        : 'text-slate-500 dark:text-slate-300'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {isMoreMenuOpen && otherRoutes.length > 0 && (
        <div
          ref={menuRef}
          className="md:hidden fixed bottom-20 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 z-40 shadow-2xl animate-in slide-in-from-bottom-4"
        >
          <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
            {otherRoutes.map((route) => {
              const Icon = route.icon;
              const active = location.pathname === route.path;
              return (
                <button
                  key={route.path}
                  onClick={() => handleRouteClick(route.path)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 mr-3 ${
                      active ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  {t(route.labelKey)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default MobileFooterNav;


