import { useState } from 'react';
import { Search, Plus, Trash2, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

interface StockItem {
  id: string;
  productCode: string;
  productName: string;
  barcode: string;
  currentStock: number;
  adjustmentType: 'add' | 'subtract' | 'set';
  quantity: number;
  newStock: number;
  reason: string;
}

export function ManualUpdateStockPage() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [stockItems, setStockItems] = useState<StockItem[]>([]);

  // Mock product data for search
  const mockProducts = [
    { code: 'P001', name: 'Paracetamol 500mg', barcode: '123456789', stock: 150 },
    { code: 'P002', name: 'Ibuprofen 200mg', barcode: '987654321', stock: 80 },
    { code: 'P003', name: 'Amoxicillin 250mg', barcode: '456789123', stock: 200 },
  ];

  const addStockItem = () => {
    if (!searchQuery) return;

    const product = mockProducts.find(
      (p) =>
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery)
    );

    if (product && !stockItems.find((item) => item.productCode === product.code)) {
      const newItem: StockItem = {
        id: Math.random().toString(36).substr(2, 9),
        productCode: product.code,
        productName: product.name,
        barcode: product.barcode,
        currentStock: product.stock,
        adjustmentType: 'add',
        quantity: 0,
        newStock: product.stock,
        reason: '',
      };
      setStockItems([...stockItems, newItem]);
      setSearchQuery('');
    }
  };

  const removeStockItem = (id: string) => {
    setStockItems(stockItems.filter((item) => item.id !== id));
  };

  const updateStockItem = (
    id: string,
    field: keyof StockItem,
    value: string | number
  ) => {
    setStockItems(
      stockItems.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };

        // Recalculate new stock based on adjustment type and quantity
        if (field === 'adjustmentType' || field === 'quantity') {
          const qty = field === 'quantity' ? Number(value) : updated.quantity;
          const type = field === 'adjustmentType' ? (value as 'add' | 'subtract' | 'set') : updated.adjustmentType;

          if (type === 'add') {
            updated.newStock = updated.currentStock + qty;
          } else if (type === 'subtract') {
            updated.newStock = Math.max(0, updated.currentStock - qty);
          } else if (type === 'set') {
            updated.newStock = qty;
          }
        }

        return updated;
      })
    );
  };

  const handleSave = () => {
    // Here you would save the stock adjustments to your backend
    console.log('Saving stock adjustments:', stockItems);
    alert('Stock adjustments saved successfully!');
    setStockItems([]);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('manualUpdateStock')}
          </h1>
          <p className="text-sm text-gray-600">
            {language === 'en'
              ? 'Manually adjust stock quantities for individual products'
              : 'تعديل كميات المخزون يدوياً للمنتجات الفردية'}
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search
                className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-gray-400"
              />
              <Input
                placeholder={language === 'en' ? 'Search by product code, name, or barcode...' : 'البحث بالرمز، الاسم، أو الباركود...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addStockItem()}
                className="ps-10 rounded-lg"
              />
            </div>
            <Button
              onClick={addStockItem}
              className="bg-teal-500 hover:bg-teal-600 text-white rounded-lg gap-2"
            >
              <Plus className="size-4" />
              {language === 'en' ? 'Add Product' : 'إضافة منتج'}
            </Button>
          </div>
        </div>

        {/* Stock Items Table */}
        {stockItems.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">
                      {t('code')}
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      {t('productName')}
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      {t('barcode')}
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">
                      {language === 'en' ? 'Current Stock' : 'المخزون الحالي'}
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      {language === 'en' ? 'Adjustment Type' : 'نوع التعديل'}
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      {language === 'en' ? 'Quantity' : 'الكمية'}
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">
                      {language === 'en' ? 'New Stock' : 'المخزون الجديد'}
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      {language === 'en' ? 'Reason' : 'السبب'}
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">
                      {t('actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productCode}</TableCell>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell className="text-gray-600">{item.barcode}</TableCell>
                      <TableCell className="text-center font-medium">
                        {item.currentStock}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={item.adjustmentType}
                          onValueChange={(value) =>
                            updateStockItem(item.id, 'adjustmentType', value)
                          }
                        >
                          <SelectTrigger className="w-32 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg">
                            <SelectItem value="add" className="rounded-lg">
                              {language === 'en' ? 'Add' : 'إضافة'}
                            </SelectItem>
                            <SelectItem value="subtract" className="rounded-lg">
                              {language === 'en' ? 'Subtract' : 'طرح'}
                            </SelectItem>
                            <SelectItem value="set" className="rounded-lg">
                              {language === 'en' ? 'Set To' : 'تعيين إلى'}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) =>
                            updateStockItem(item.id, 'quantity', Number(e.target.value))
                          }
                          className="w-24 rounded-lg"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`font-semibold ${
                            item.newStock > item.currentStock
                              ? 'text-green-600'
                              : item.newStock < item.currentStock
                              ? 'text-red-600'
                              : 'text-gray-900'
                          }`}
                        >
                          {item.newStock}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder={language === 'en' ? 'Optional reason...' : 'سبب اختياري...'}
                          value={item.reason}
                          onChange={(e) =>
                            updateStockItem(item.id, 'reason', e.target.value)
                          }
                          className="w-40 rounded-lg"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStockItem(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="size-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="size-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {language === 'en' ? 'No products added yet' : 'لم تتم إضافة منتجات بعد'}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'en'
                  ? 'Search and add products above to start adjusting stock quantities'
                  : 'ابحث وأضف المنتجات أعلاه لبدء تعديل كميات المخزون'}
              </p>
            </div>
          </div>
        )}

        {/* Save Button */}
        {stockItems.length > 0 && (
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setStockItems([])}
              className="rounded-lg"
            >
              {language === 'en' ? 'Cancel' : 'إلغاء'}
            </Button>
            <Button
              onClick={handleSave}
              className="bg-teal-500 hover:bg-teal-600 text-white rounded-lg gap-2"
            >
              <Save className="size-4" />
              {language === 'en' ? 'Save Adjustments' : 'حفظ التعديلات'}
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="sticky bottom-0 border-t bg-white px-6 py-3">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{t('poweredByPulse')}</span>
          <div className="flex items-center gap-4">
            <button className="text-teal-600 hover:text-teal-700 font-medium">
              {t('startTour')}
            </button>
            <button className="text-teal-600 hover:text-teal-700 font-medium">
              {t('help')}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
