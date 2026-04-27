import { useState } from 'react';
import { Bell, ChevronDown, Activity } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { useLanguage } from '../contexts/LanguageContext';
import { CreateProductDialog } from './CreateProductDialog';

interface NavbarProps {
  onNavigate: (page: 'products' | 'updateStock' | 'manualUpdateStock') => void;
  currentPage: 'products' | 'updateStock' | 'manualUpdateStock';
}

export function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const { language, toggleLanguage, t } = useLanguage();
  const [createProductOpen, setCreateProductOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Activity className="size-5 text-teal-500" strokeWidth={2.5} />
            <span className="font-semibold text-base">Pulse</span>
          </div>

          <div className="flex items-center">
            <Button variant="ghost" className="h-11 px-4 text-sm text-gray-700 hover:text-gray-900 hover:bg-transparent">
              {t('dashboard')}
            </Button>
            <Button variant="ghost" className="h-11 px-4 text-sm text-gray-700 hover:text-gray-900 hover:bg-transparent gap-1">
              {t('pointOfSale')} <ChevronDown className="size-3.5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-11 px-4 text-sm text-teal-600 hover:text-teal-700 gap-1 font-medium transition-colors focus-visible:outline-none border-b-2 border-teal-600 relative rounded-none hover:bg-transparent inline-flex items-center justify-center bg-transparent outline-none">
                  {t('stocks')} <ChevronDown className="size-3.5 ms-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={language === 'ar' ? 'end' : 'start'}
                className="w-64 rounded-xl bg-white shadow-xl border border-gray-100 p-2 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
              >
                <DropdownMenuItem
                  onClick={() => onNavigate('products')}
                  className={`text-sm cursor-pointer rounded-lg px-4 py-3.5 transition-all duration-150 text-start ${
                    currentPage === 'products'
                      ? 'bg-teal-50 text-teal-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {t('yourProducts')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setCreateProductOpen(true)}
                  className="text-sm text-gray-700 cursor-pointer hover:bg-gray-50 hover:text-gray-900 rounded-lg px-4 py-3.5 transition-all duration-150 text-start"
                >
                  {t('createProduct')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onNavigate('updateStock')}
                  className={`text-sm cursor-pointer rounded-lg px-4 py-3.5 transition-all duration-150 text-start ${
                    currentPage === 'updateStock'
                      ? 'bg-teal-50 text-teal-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {t('updateStock')}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm text-gray-700 cursor-pointer hover:bg-gray-50 hover:text-gray-900 rounded-lg px-4 py-3.5 transition-all duration-150 text-start">
                  {t('printBarcode')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" className="h-11 px-4 text-sm text-gray-700 hover:text-gray-900 hover:bg-transparent gap-1">
              {t('marketplace')} <ChevronDown className="size-3.5" />
            </Button>
            <Button variant="ghost" className="h-11 px-4 text-sm text-gray-700 hover:text-gray-900 hover:bg-transparent gap-1">
              {t('purchase')} <ChevronDown className="size-3.5" />
            </Button>
            <Button variant="ghost" className="h-11 px-4 text-sm text-gray-700 hover:text-gray-900 hover:bg-transparent gap-1">
              {t('sellerPXP')} <ChevronDown className="size-3.5" />
            </Button>
            <Button variant="ghost" className="h-11 px-4 text-sm text-gray-700 hover:text-gray-900 hover:bg-transparent gap-1">
              {t('customers')} <ChevronDown className="size-3.5" />
            </Button>
            <Button variant="ghost" className="h-11 px-4 text-sm text-gray-700 hover:text-gray-900 hover:bg-transparent gap-1">
              {t('reports')} <ChevronDown className="size-3.5" />
            </Button>
            <Button variant="ghost" className="h-11 px-4 text-sm text-gray-700 hover:text-gray-900 hover:bg-transparent gap-1">
              {t('settings')} <ChevronDown className="size-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="text-xs h-8 rounded-full"
          >
            {language === 'en' ? 'العربية' : 'English'}
          </Button>

          <div className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-medium">
            JOD 7.00
          </div>

          <div className="relative">
            <Bell className="size-5 text-gray-600 cursor-pointer" strokeWidth={2} />
            <Badge className="absolute -top-1 -end-1 size-4 p-0 flex items-center justify-center bg-red-500 text-[10px] rounded-full border-2 border-white">
              3
            </Badge>
          </div>

          <Avatar className="size-8 cursor-pointer rounded-full">
            <AvatarFallback className="bg-teal-100 text-teal-700 text-xs font-medium rounded-full">T</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <CreateProductDialog
        open={createProductOpen}
        onOpenChange={setCreateProductOpen}
      />
    </nav>
  );
}