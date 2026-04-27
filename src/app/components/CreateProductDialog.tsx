import { useState } from 'react';
import { X, Search, Scan, Barcode, Sparkles, ChevronDown, Package, Plus, Trash2, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Batch {
  id: string;
  warehouse: string;
  expiryDate: string;
  batchNumber: string;
  physicalQty: string;
  costPrice: string;
  sellingPrice: string;
  reason: string;
}

export function CreateProductDialog({ open, onOpenChange }: CreateProductDialogProps) {
  const { t, language } = useLanguage();
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [productName, setProductName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('');
  const [unitType, setUnitType] = useState('');
  const [unitCount, setUnitCount] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [taxPercent, setTaxPercent] = useState('');

  const handleGenerateBarcode = () => {
    const randomBarcode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    setBarcode(randomBarcode);
  };

  const handleScanBarcode = () => {
    alert('Barcode scanner would open here');
  };

  // Multiple batches
  const [batches, setBatches] = useState<Batch[]>([
    {
      id: '1',
      warehouse: '',
      expiryDate: '',
      batchNumber: '',
      physicalQty: '',
      costPrice: '',
      sellingPrice: '',
      reason: '',
    },
  ]);

  const addBatch = () => {
    setBatches([
      ...batches,
      {
        id: Date.now().toString(),
        warehouse: '',
        expiryDate: '',
        batchNumber: '',
        physicalQty: '',
        costPrice: '',
        sellingPrice: '',
        reason: '',
      },
    ]);
  };

  const removeBatch = (id: string) => {
    if (batches.length > 1) {
      setBatches(batches.filter((batch) => batch.id !== id));
    }
  };

  const updateBatch = (id: string, field: keyof Batch, value: string) => {
    setBatches(
      batches.map((batch) =>
        batch.id === id ? { ...batch, [field]: value } : batch
      )
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1100px] w-[80vw] p-0 gap-0 rounded-3xl">
        <DialogHeader className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-teal-100 rounded-xl flex items-center justify-center">
              <Package className="size-5 text-teal-600" strokeWidth={2} />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {t('quickNewProductCreation')}
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            {t('quickAddYourProduct')}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4">
          {/* Info Banner */}
          <div className={`flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-xl p-3 mb-4 `}>
            <Sparkles className="size-4 text-teal-600 flex-shrink-0" />
            <p className="text-sm text-teal-700">
              <span className="font-bold">{t('quickAddYourProduct')}</span> - {t('fillInTheDetailsBelow')}
            </p>
          </div>

          {/* Main Content - 2 Columns */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Left Column - Product Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-900 mb-3">{t('productDetails')}</h3>

              {/* Product Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-900">{t('searchAumetProducts')} *</label>
                <div className="relative">
                  <Search className={`absolute start-3 top-1/2 -translate-y-1/2 size-4 text-gray-400`} />
                  <input
                    type="text"
                    placeholder={t('searchProductName')}
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className={`w-full h-11 ps-10 pe-9 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                  />
                  <ChevronDown className={`absolute end-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-400`} />
                </div>
              </div>

              {/* Barcode */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-900">{t('barcode')} *</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('enterOrScanBarcode')}
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className={`w-full h-11 ps-3 pe-28 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                  />
                  <div className={`absolute end-1 top-1/2 -translate-y-1/2 flex items-center gap-1`}>
                    <button
                      type="button"
                      onClick={handleGenerateBarcode}
                      className="h-9 px-3 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Barcode className="size-3.5" />
                      {t('generate')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-900">{t('category')} *</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full h-11 px-3 pe-9 border border-gray-300 rounded-full text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white`}
                  >
                    <option value="">{t('selectCategory')}</option>
                    <option value="medicine">{t('medicine')}</option>
                    <option value="supplement">{t('supplement')}</option>
                    <option value="equipment">{t('equipment')}</option>
                  </select>
                  <ChevronDown className={`absolute end-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 pointer-events-none`} />
                </div>
              </div>

              {/* Unit Type & Count */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-900">{t('unitType')} *</label>
                  <div className="relative">
                    <select
                      value={unitType}
                      onChange={(e) => setUnitType(e.target.value)}
                      className={`w-full h-11 px-3 pe-9 border border-gray-300 rounded-full text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white`}
                    >
                      <option value="">{t('selectUnit')}</option>
                      <option value="tablet">{t('tablet')}</option>
                      <option value="capsule">{t('capsule')}</option>
                      <option value="bottle">{t('bottle')}</option>
                      <option value="box">{t('box')}</option>
                    </select>
                    <ChevronDown className={`absolute end-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 pointer-events-none`} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-900">{t('count')} *</label>
                  <input
                    type="text"
                    placeholder={t('count')}
                    value={unitCount}
                    onChange={(e) => setUnitCount(e.target.value)}
                    className="w-full h-11 px-3 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Price & Tax */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-900">{t('sellingPrice')} *</label>
                  <div className="relative">
                    <span className={`absolute start-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium`}>JOD</span>
                    <input
                      type="text"
                      placeholder="0.00"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      className={`w-full h-11 ps-11 pe-3 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-900">{t('taxRate')} *</label>
                  <div className="relative">
                    <select
                      value={taxPercent}
                      onChange={(e) => setTaxPercent(e.target.value)}
                      className={`w-full h-11 px-3 pe-9 border border-gray-300 rounded-full text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white`}
                    >
                      <option value="">{t('taxRate')} %</option>
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="10">10%</option>
                      <option value="15">15%</option>
                    </select>
                    <ChevronDown className={`absolute end-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 pointer-events-none`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Stock Info */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-4 max-h-[500px] overflow-y-auto">
              <div className={`flex items-center gap-2 mb-3 `}>
                <div className="size-7 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="size-4 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{t('firstBatchOptional')}</h3>
                  <p className="text-xs text-gray-600">{t('addInitialStock')}</p>
                </div>
              </div>

              <div className="space-y-4">
                {batches.map((batch, index) => (
                  <div key={batch.id} className="space-y-3 pb-3 border-b border-teal-200 last:border-0">
                    {index > 0 && (
                      <div className={`flex items-center justify-between `}>
                        <span className="text-xs font-semibold text-gray-700">{t('batchNumber')} {index + 1}</span>
                        <button
                          onClick={() => removeBatch(batch.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    )}
                    {/* Warehouse & Expiry */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-900">{t('warehouse')}</label>
                        <div className="relative">
                          <select
                            value={batch.warehouse}
                            onChange={(e) => updateBatch(batch.id, 'warehouse', e.target.value)}
                            className={`w-full h-10 px-3 pe-8 border border-gray-300 rounded-full text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white`}
                          >
                            <option value="main">{t('main')}</option>
                            <option value="warehouse2">Warehouse 2</option>
                          </select>
                          <ChevronDown className={`absolute end-2.5 top-1/2 -translate-y-1/2 size-3 text-gray-400 pointer-events-none`} />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-900">{t('expiryDate')}</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder={t('selectDate')}
                            value={batch.expiryDate}
                            onChange={(e) => updateBatch(batch.id, 'expiryDate', e.target.value)}
                            className={`w-full h-10 px-3 pe-8 border border-gray-300 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white`}
                          />
                          <Calendar className={`absolute end-2.5 top-1/2 -translate-y-1/2 size-3 text-gray-400`} />
                        </div>
                      </div>
                    </div>

                    {/* Batch Number */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-900">{t('batchNumber')}</label>
                      <input
                        type="text"
                        placeholder={t('batchNumber')}
                        value={batch.batchNumber}
                        onChange={(e) => updateBatch(batch.id, 'batchNumber', e.target.value)}
                        className="w-full h-10 px-3 border border-gray-300 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                      />
                    </div>

                    {/* Qty & Cost & Selling */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-900">{t('qty')}</label>
                        <input
                          type="text"
                          placeholder="0"
                          value={batch.physicalQty}
                          onChange={(e) => updateBatch(batch.id, 'physicalQty', e.target.value)}
                          className="w-full h-10 px-3 border border-gray-300 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-900">{t('cost')}</label>
                        <input
                          type="text"
                          placeholder="0.00"
                          value={batch.costPrice}
                          onChange={(e) => updateBatch(batch.id, 'costPrice', e.target.value)}
                          className="w-full h-10 px-3 border border-gray-300 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-900">{t('price')}</label>
                        <input
                          type="text"
                          placeholder="2.00"
                          value={batch.sellingPrice}
                          onChange={(e) => updateBatch(batch.id, 'sellingPrice', e.target.value)}
                          className="w-full h-10 px-3 border border-gray-300 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                        />
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-900">{t('reason')}</label>
                      <div className="relative">
                        <select
                          value={batch.reason}
                          onChange={(e) => updateBatch(batch.id, 'reason', e.target.value)}
                          className={`w-full h-10 px-3 pe-8 border border-gray-300 rounded-full text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white`}
                        >
                          <option value="">{t('selectReason')}</option>
                          <option value="new">{t('newStock')}</option>
                          <option value="restock">{t('restock')}</option>
                        </select>
                        <ChevronDown className={`absolute end-2.5 top-1/2 -translate-y-1/2 size-3 text-gray-400 pointer-events-none`} />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addBatch}
                  className={`text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1.5 pt-2 border-t border-teal-200 w-full `}
                >
                  <Plus className="size-3.5" />
                  {t('addAnotherBatch')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t border-gray-200 bg-white rounded-b-3xl flex items-center justify-between `}>
          <button
            onClick={() => setShowMoreDetails(!showMoreDetails)}
            className={`flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors `}
          >
            {t('needMoreFields')}
          </button>

          <div className={`flex items-center gap-3 `}>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 px-5 rounded-full text-sm font-semibold border-gray-300"
            >
              {t('cancel')}
            </Button>
            <Button
              className="h-10 px-6 bg-gray-300 text-gray-500 rounded-full text-sm font-semibold cursor-not-allowed"
              disabled
            >
              {t('saveProduct')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
