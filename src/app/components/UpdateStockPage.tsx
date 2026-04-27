import { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Eye, Download, Upload, FileEdit, ChevronDown, Package, PackageCheck, AlertTriangle, PackageX } from 'lucide-react';
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
import { ImportInventoryDialog } from './ImportInventoryDialog';

export function UpdateStockPage({ onNavigate }: { onNavigate?: (page: 'products' | 'updateStock' | 'manualUpdateStock') => void }) {
  const { t, language } = useLanguage();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const stats = [
    {
      title: 'Total Adjustments',
      value: '124',
      icon: Package,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Confirmed',
      value: '98',
      icon: PackageCheck,
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'In Progress',
      value: '14',
      icon: AlertTriangle,
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      title: 'Failed/Cancelled',
      value: '12',
      icon: PackageX,
      color: 'bg-red-50 text-red-600',
    },
  ];

  const stockHistory = [
    {
      id: '#Adj-21316',
      createdAt: 'Jan 15, 2025\n2:51 PM',
      status: 'Confirmed',
      statusColor: 'green',
      createdUser: 'Dr. Sarah Wilson',
      updatedAt: 'Jan 15, 2025\n2:51 PM',
      totalProducts: '10,000',
      autoMigrated: '2600 - 96.7%',
      failedMigrated: '87 - 3.2%',
    },
    {
      id: '#Adj-21315',
      createdAt: 'Jan 15, 2025\n11:12 AM',
      status: 'AI-Processing',
      statusColor: 'blue',
      createdUser: 'Ahmed Al-Rashid',
      updatedAt: 'Jan 15, 2025\n2:55 PM',
      totalProducts: '2,687',
      autoMigrated: '---',
      failedMigrated: '---',
    },
    {
      id: '#Adj-21314',
      createdAt: 'Jan 14, 2025\n4:45 PM',
      status: 'Draft',
      statusColor: 'yellow',
      createdUser: 'Fatima Hassan',
      updatedAt: 'Jan 14, 2025\n4:45 PM',
      totalProducts: '3,212',
      autoMigrated: '2100 - 65.3%',
      failedMigrated: '1312 - 34.6%',
    },
    {
      id: '#Adj-21313',
      createdAt: 'Jan 14, 2025\n10:30 AM',
      status: 'Cancelled',
      statusColor: 'red',
      createdUser: 'Dr. Sarah Wilson',
      updatedAt: 'Jan 14, 2025\n11:15 AM',
      totalProducts: '1,203',
      autoMigrated: '1100 - 91.4%',
      failedMigrated: '103 - 8.6%',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto">
      <div className="p-6 space-y-5 flex-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-teal-600 cursor-pointer">{t('dashboard')}</span>
          <span className="text-gray-400">{'>'}</span>
          <span className="text-teal-600 cursor-pointer">{t('stocks')}</span>
          <span className="text-gray-400">{'>'}</span>
          <span className="text-gray-600">{t('bulkStocksHistory')}</span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('bulkStocksHistory')}</h1>
            <p className="text-gray-500 text-base">
              {t('trackStocksMovements')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="bg-teal-500 hover:bg-teal-600 h-10 gap-2 px-4 text-sm rounded-full inline-flex items-center justify-center text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/30 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">
                  <Plus className="size-4" />
                  {t('updateYourStock')}
                  <ChevronDown className="size-4 ms-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={language === 'ar' ? 'start' : 'end'} className="w-56 rounded-xl bg-white shadow-xl border border-gray-100 p-1.5 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
                <DropdownMenuItem
                  onClick={() => setImportDialogOpen(true)}
                  className="cursor-pointer gap-3 text-sm hover:bg-gray-50 hover:text-gray-900 rounded-lg px-3 py-2.5 transition-all duration-150 text-start"
                >
                  <Upload className="size-4 text-teal-600" />
                  <span>{t('uploadStockFile')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onNavigate?.('manualUpdateStock')}
                  className="cursor-pointer gap-3 text-sm hover:bg-gray-50 hover:text-gray-900 rounded-lg px-3 py-2.5 transition-all duration-150 text-start"
                >
                  <FileEdit className="size-4 text-teal-600" />
                  <span>{t('manualUpdateStock')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <ImportInventoryDialog
            open={importDialogOpen}
            onOpenChange={setImportDialogOpen}
            onNavigate={onNavigate}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`size-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <Icon className="size-6" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" strokeWidth={2} />
                <Input
                  placeholder={t('searchAdjustmentHistory')}
                  className="ps-9 h-10 text-sm border-gray-300 rounded-full w-full"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className={`h-10 gap-2 px-4 text-sm rounded-full border-gray-300 whitespace-nowrap ${
                  filtersOpen ? 'bg-teal-50 border-teal-600 text-teal-600' : ''
                }`}
              >
                <Filter className="size-4" strokeWidth={2} />
                {t('filters')}
              </Button>
            </div>
          </div>

          <FiltersSection isOpen={filtersOpen} type="stockHistory" />

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 bg-gray-50">
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">{t('stockId')}</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">{t('createdAt')}</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">{t('status')}</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">{t('createdUser')}</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">{t('updatedAt')}</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">{t('totalNumberOfProducts')}</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">{t('autoMigrated')}</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">{t('failedMigrated')}</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockHistory.map((item, index) => (
                  <TableRow key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <TableCell className="text-sm font-medium text-gray-900 py-4 text-start">{item.id}</TableCell>
                    <TableCell className="text-xs text-gray-600 py-4 whitespace-pre-line text-start">{item.createdAt}</TableCell>
                    <TableCell className="py-4 text-start">
                      <Badge
                        className={`text-xs px-2 py-1 rounded-full ${
                          item.statusColor === 'green'
                            ? 'bg-green-100 text-green-700 hover:bg-green-100'
                            : item.statusColor === 'blue'
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                            : item.statusColor === 'yellow'
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                            : 'bg-red-100 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-900 py-4 text-start">{item.createdUser}</TableCell>
                    <TableCell className="text-xs text-gray-600 py-4 whitespace-pre-line text-start">{item.updatedAt}</TableCell>
                    <TableCell className="text-sm text-gray-900 py-4 text-start">{item.totalProducts}</TableCell>
                    <TableCell className="py-4 text-start">
                      {item.autoMigrated !== '---' && (
                        <div className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded inline-block">
                          {item.autoMigrated}
                        </div>
                      )}
                      {item.autoMigrated === '---' && <span className="text-gray-400">---</span>}
                    </TableCell>
                    <TableCell className="py-4 text-start">
                      {item.failedMigrated !== '---' && (
                        <div className="text-xs text-red-700 bg-red-50 px-2 py-1 rounded inline-block">
                          {item.failedMigrated}
                        </div>
                      )}
                      {item.failedMigrated === '---' && <span className="text-gray-400">---</span>}
                    </TableCell>
                    <TableCell className="py-4 text-start">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="size-8 p-0 inline-flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
                            <MoreVertical className="size-4 text-gray-600" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={language === 'ar' ? 'start' : 'end'} className="rounded-xl">
                          <DropdownMenuItem className="cursor-pointer gap-2 text-start">
                            <Eye className="size-4" />
                            {t('viewEditDetails')}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer gap-2 text-start">
                            <Download className="size-4" />
                            {t('exportReport')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="px-4 py-3 border-t border-gray-200 bg-white">
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-600">Showing 1-5 of 25 products</div>
              <div className="flex items-center gap-2">
                <button className="size-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded">
                  {'<'}
                </button>
                <button className="size-8 flex items-center justify-center bg-teal-500 text-white rounded-full">
                  1
                </button>
                <button className="size-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded">
                  2
                </button>
                <button className="size-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded">
                  3
                </button>
                <button className="size-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded">
                  4
                </button>
                <button className="size-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded">
                  5
                </button>
                <button className="size-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded">
                  {'>'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500">Last stock adjustment: 15 April 2025</div>
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