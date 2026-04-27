import { ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';

interface FiltersSectionProps {
  isOpen: boolean;
  type: 'products' | 'stockHistory';
}

export function FiltersSection({ isOpen, type }: FiltersSectionProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  if (type === 'products') {
    return (
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="grid grid-cols-6 gap-3 mb-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">{t('categoryFilter')}</label>
            <div className="relative">
              <select className="w-full border border-gray-300 rounded-full px-4 py-2.5 pe-10 text-sm text-gray-600 bg-white appearance-none cursor-pointer hover:border-gray-400 focus:border-teal-500 focus:outline-none">
                <option>{t('selectCategory')}</option>
              </select>
              <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">{t('stockRange')}</label>
            <div className="relative">
              <select className="w-full border border-gray-300 rounded-full px-4 py-2.5 pe-10 text-sm text-gray-600 bg-white appearance-none cursor-pointer hover:border-gray-400 focus:border-teal-500 focus:outline-none">
                <option>{t('selectStockRange')}</option>
              </select>
              <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">{t('expiryStatus')}</label>
            <div className="relative">
              <select className="w-full border border-gray-300 rounded-full px-4 py-2.5 pe-10 text-sm text-gray-600 bg-white appearance-none cursor-pointer hover:border-gray-400 focus:border-teal-500 focus:outline-none">
                <option>{t('selectExpiryStatus')}</option>
              </select>
              <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">{t('warehouse')}</label>
            <div className="relative">
              <select className="w-full border border-gray-300 rounded-full px-4 py-2.5 pe-10 text-sm text-gray-600 bg-white appearance-none cursor-pointer hover:border-gray-400 focus:border-teal-500 focus:outline-none">
                <option>{t('selectStatus')}</option>
              </select>
              <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">{t('agingLastSale')}</label>
            <div className="relative">
              <select className="w-full border border-gray-300 rounded-full px-4 py-2.5 pe-10 text-sm text-gray-600 bg-white appearance-none cursor-pointer hover:border-gray-400 focus:border-teal-500 focus:outline-none">
                <option>{t('selectAgingLastSale')}</option>
              </select>
              <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">{t('status')}</label>
            <div className="relative">
              <select className="w-full border border-gray-300 rounded-full px-4 py-2.5 pe-10 text-sm text-gray-600 bg-white appearance-none cursor-pointer hover:border-gray-400 focus:border-teal-500 focus:outline-none">
                <option>{t('selectStatus')}</option>
              </select>
              <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" className="h-9 px-5 text-sm rounded-full border-gray-300 hover:bg-gray-50">
            {t('reset')}
          </Button>
          <Button className="bg-teal-500 hover:bg-teal-600 h-9 px-5 text-sm rounded-full">
            {t('apply')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-2 block">{t('createdDateRange')}</label>
          <div className="relative">
            <select className="w-full border border-gray-300 rounded-full px-4 py-2.5 pe-10 text-sm text-gray-600 bg-white appearance-none cursor-pointer hover:border-gray-400 focus:border-teal-500 focus:outline-none">
              <option>{t('selectDateRange')}</option>
            </select>
            <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-2 block">{t('createdUserFilter')}</label>
          <div className="relative">
            <select className="w-full border border-gray-300 rounded-full px-4 py-2.5 pe-10 text-sm text-gray-600 bg-white appearance-none cursor-pointer hover:border-gray-400 focus:border-teal-500 focus:outline-none">
              <option>{t('allUsers')}</option>
            </select>
            <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-2 block">{t('status')}</label>
          <div className="relative">
            <select className="w-full border border-gray-300 rounded-full px-4 py-2.5 pe-10 text-sm text-gray-600 bg-white appearance-none cursor-pointer hover:border-gray-400 focus:border-teal-500 focus:outline-none">
              <option>{t('allStatus')}</option>
            </select>
            <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" className="h-9 px-5 text-sm rounded-full border-gray-300 hover:bg-gray-50">
          {t('reset')}
        </Button>
        <Button className="bg-teal-500 hover:bg-teal-600 h-9 px-5 text-sm rounded-full">
          {t('apply')}
        </Button>
      </div>
    </div>
  );
}
