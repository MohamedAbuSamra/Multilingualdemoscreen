import { useState } from 'react';
import { Plus, History, Search, Filter, Download, MoreVertical, ShoppingBag, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useLanguage } from '../contexts/LanguageContext';
import { FiltersSection } from './FiltersSection';
import { CreateProductDialog } from './CreateProductDialog';

interface InventoryPageProps {
  onNavigate: (page: 'products' | 'updateStock') => void;
}

export function InventoryPage({ onNavigate }: InventoryPageProps) {
  const { t } = useLanguage();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [createProductOpen, setCreateProductOpen] = useState(false);

  const products = [
    {
      code: 'Lorem Ipsum',
      name: 'Lorem Ipsum',
      subtitle: 'Lorem ipsum',
      barcode: 'Lorem ipsum',
      category: 'Lorem ipsum',
      lotBatch: 'Lorem',
      expiry: 'Lorem',
      lastSale: 'JOD',
      stockQty: '00.0',
      avgCost: '00.00',
      sellPrice: '00.00',
      tax: '0.00',
      warehouse: '0.00',
      status: 'Delivered',
      statusColor: 'red',
    },
    {
      code: 'Lorem Ipsum',
      name: 'Descriptive filling',
      subtitle: 'Lorem ipsum',
      barcode: 'Lorem ipsum',
      category: 'Lorem ipsum',
      lotBatch: 'Lorem',
      expiry: 'Lorem',
      lastSale: 'Lorem ipsum',
      stockQty: '00.0',
      avgCost: '00.00',
      sellPrice: '00.00',
      tax: '0.00',
      warehouse: '',
      status: 'Delivered',
      statusColor: 'red',
    },
    {
      code: 'Descriptive filling',
      name: 'Descriptive filling',
      subtitle: 'Lorem ipsum',
      barcode: 'Lorem ipsum',
      category: 'Lorem ipsum',
      lotBatch: 'Descriptive filling',
      expiry: 'Descriptive filling',
      lastSale: 'JOD',
      stockQty: '00.0',
      avgCost: '00.00',
      sellPrice: '00.00',
      tax: '0.00',
      warehouse: '0.00',
      status: 'Active',
      statusColor: 'yellow',
    },
    {
      code: 'Lorem Ipsum',
      name: 'Lorem Ipsum',
      subtitle: 'Lorem ipsum',
      barcode: 'Lorem ipsum',
      category: 'Lorem ipsum',
      lotBatch: 'Lorem',
      expiry: 'Lorem',
      lastSale: 'JOD',
      stockQty: '00.0',
      avgCost: '00.00',
      sellPrice: '00.00',
      tax: '0.00',
      warehouse: '0.00',
      status: 'Active',
      statusColor: 'yellow',
    },
    {
      code: 'Lorem Ipsum',
      name: 'Lorem Ipsum',
      subtitle: 'Lorem ipsum',
      barcode: 'Lorem ipsum',
      category: 'Lorem ipsum',
      lotBatch: 'Lorem',
      expiry: 'Lorem',
      lastSale: 'Lorem ipsum',
      stockQty: '00.0',
      avgCost: '00.00',
      sellPrice: '00.00',
      tax: '0.00',
      warehouse: '',
      status: '',
      statusColor: '',
    },
    {
      code: 'Descriptive filling',
      name: 'Descriptive filling',
      subtitle: 'Lorem ipsum',
      barcode: 'Lorem ipsum',
      category: 'Lorem ipsum',
      lotBatch: 'Descriptive filling',
      expiry: 'Descriptive filling',
      lastSale: 'JOD',
      stockQty: '00.0',
      avgCost: '00.00',
      sellPrice: '00.00',
      tax: '0.00',
      warehouse: '0.00',
      status: '',
      statusColor: '',
    },
    {
      code: 'Lorem Ipsum',
      name: 'Lorem Ipsum',
      subtitle: 'Lorem ipsum',
      barcode: 'Lorem ipsum',
      category: 'Lorem ipsum',
      lotBatch: 'Lorem',
      expiry: 'Lorem',
      lastSale: 'JOD',
      stockQty: '00.0',
      avgCost: '00.00',
      sellPrice: '00.00',
      tax: '0.00',
      warehouse: '0.00',
      status: 'Active',
      statusColor: 'yellow',
    },
    {
      code: 'Lorem Ipsum',
      name: 'Lorem Ipsum',
      subtitle: 'Lorem ipsum',
      barcode: 'Lorem ipsum',
      category: 'Lorem ipsum',
      lotBatch: 'Lorem',
      expiry: 'Lorem',
      lastSale: 'Lorem ipsum',
      stockQty: '00.0',
      avgCost: '00.00',
      sellPrice: '00.00',
      tax: '0.00',
      warehouse: '',
      status: '',
      statusColor: '',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto">
      <CreateProductDialog
        open={createProductOpen}
        onOpenChange={setCreateProductOpen}
      />
      <div className="p-6 space-y-5 flex-1">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setCreateProductOpen(true)}
            className="bg-teal-500 hover:bg-teal-600 h-9 gap-2 px-4 text-sm rounded-full"
          >
            <Plus className="size-4" />
            {t('createNew')}
          </Button>
          <Button
            onClick={() => onNavigate('updateStock')}
            variant="outline"
            className="h-9 gap-2 px-4 text-sm rounded-full border-gray-300"
          >
            <History className="size-4" />
            {t('stockHistory')}
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 mb-1">{t('totalProducts')}</div>
                <div className="text-xs text-gray-500">
                  {t('activeProductsInInventory')}
                </div>
              </div>
              <div className="text-end">
                <div className="text-4xl font-semibold text-gray-900">2</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 mb-1">{t('stagnantProducts')}</div>
                <div className="text-xs text-gray-500">
                  {t('productsNoSales90Days')}
                </div>
              </div>
              <div className="text-end flex flex-col items-end gap-2">
                <div className="text-4xl font-semibold text-gray-900">0</div>
                <Button variant="outline" size="sm" className="text-teal-600 border-teal-600 hover:bg-teal-50 h-7 px-3 text-xs rounded-full">
                  {t('review')}
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 mb-1">{t('expiringsSoon')}</div>
                <div className="text-xs text-gray-500">
                  {t('productsExpiringsNext90Days')}
                </div>
              </div>
              <div className="text-end flex flex-col items-end gap-2">
                <div className="text-4xl font-semibold text-gray-900">0</div>
                <Button variant="outline" size="sm" className="text-teal-600 border-teal-600 hover:bg-teal-50 h-7 px-3 text-xs rounded-full">
                  {t('review')}
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 mb-1">{t('lowStock')}</div>
                <div className="text-xs text-gray-500">
                  {t('productsBelowMinimumLevel')}
                </div>
              </div>
              <div className="text-end flex flex-col items-end gap-2">
                <div className="text-4xl font-semibold text-gray-900">0</div>
                <Button variant="outline" size="sm" className="text-teal-600 border-teal-600 hover:bg-teal-50 h-7 px-3 text-xs rounded-full">
                  {t('review')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="size-5 text-gray-600" strokeWidth={2} />
                </div>
                <div className="text-sm font-medium text-gray-900">{t('receiveMarketplacePurchaseOrders')}</div>
              </div>
              <Badge className="bg-teal-500 hover:bg-teal-500 h-6 px-2.5 text-xs rounded-full">0 {t('new')}</Badge>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <FileText className="size-5 text-gray-600" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{t('createNewPurchaseOrder')}</div>
                  <div className="text-xs text-gray-500">
                    {t('lastAdded')} 6 {t('daysAgo')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" strokeWidth={2} />
                <Input
                  placeholder={t('searchByNameIdBarcodeHatch')}
                  className="ps-9 h-9 text-sm border-gray-300 rounded-full w-full"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className={`h-9 gap-2 px-3 text-sm rounded-full border-gray-300 whitespace-nowrap ${
                  filtersOpen ? 'bg-teal-50 border-teal-600 text-teal-600' : ''
                }`}
              >
                <Filter className="size-4" strokeWidth={2} />
                {t('filters')}
              </Button>
              <Button variant="outline" size="sm" className="h-9 gap-2 px-3 text-sm rounded-full border-gray-300 whitespace-nowrap">
                <Download className="size-4" strokeWidth={2} />
                {t('export')}
              </Button>
            </div>
          </div>

          <FiltersSection isOpen={filtersOpen} type="products" />

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 bg-gray-50">
                  <TableHead className="w-12 h-11"></TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">{t('code')}</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">{t('productName')}</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">{t('barcode')}</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">{t('category')}</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">{t('lotBatch')}</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">{t('expiry')}</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">{t('lastSale')}</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">{t('stockQty')}</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">{t('avgCostPrice')}</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">{t('sellPrice')}</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">{t('tax')}</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">{t('warehouseLocation')}</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">{t('status')}</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product, index) => (
                  <TableRow key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <TableCell className="py-3">
                      <div className="size-9 bg-gray-200 rounded-lg"></div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-700 py-3 text-start">{product.code}</TableCell>
                    <TableCell className="py-3 text-start">
                      <div className="text-xs text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.subtitle}</div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-700 py-3 text-start">{product.barcode}</TableCell>
                    <TableCell className="text-xs text-gray-700 py-3 text-start">{product.category}</TableCell>
                    <TableCell className="py-3 text-start">
                      {product.lotBatch && (
                        <div className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full inline-block">
                          {product.lotBatch}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-3 text-start">
                      {product.expiry && (
                        <div className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full inline-block">
                          {product.expiry}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-gray-700 py-3 text-start">{product.lastSale}</TableCell>
                    <TableCell className="text-xs text-gray-700 py-3 text-start">{product.stockQty}</TableCell>
                    <TableCell className="text-xs text-gray-700 py-3 text-start">{product.avgCost}</TableCell>
                    <TableCell className="text-xs text-gray-700 py-3 text-start">{product.sellPrice}</TableCell>
                    <TableCell className="text-xs text-gray-700 py-3 text-start">{product.tax}</TableCell>
                    <TableCell className="text-xs text-gray-700 py-3 text-start">{product.warehouse}</TableCell>
                    <TableCell className="py-3 text-start">
                      {product.status && (
                        <Badge
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            product.statusColor === 'red'
                              ? 'bg-red-100 text-red-700 hover:bg-red-100'
                              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                          }`}
                        >
                          {product.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <Button variant="ghost" size="sm" className="size-8 p-0 hover:bg-gray-100 rounded-full">
                        <MoreVertical className="size-4 text-gray-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="px-4 py-3 border-t border-gray-200 bg-white">
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-600">
                {t('showing')} 1 {t('to')} 2 {t('of')} 2 {t('results')}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">{t('show')}</span>
                <select className="border border-gray-300 rounded-full px-3 py-1 text-sm">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <span className="text-gray-600">{t('perPage')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          {t('allResultsOnThisPage')}
        </div>
      </div>

      <footer className="sticky bottom-0 z-40 border-t border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">{t('poweredByPulse')}</div>
          <div className="flex items-center gap-4">
            <Button variant="link" className="text-teal-600 hover:text-teal-700 p-0 h-auto text-sm">
              {t('startTour')}
            </Button>
            <Button className="bg-slate-900 hover:bg-slate-800 h-9 px-4 text-sm rounded-full">
              {t('help')}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
