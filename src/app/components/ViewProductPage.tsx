import React, { useState } from "react";
import {
  Barcode,
  FileText,
  Package,
  Pencil,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { useLanguage } from "../contexts/LanguageContext";

interface ViewProductPageProps {
  onNavigate?: (
    page:
      | "products"
      | "updateStock"
      | "manualUpdateStock"
      | "stockHistoryDetails"
      | "fullProductCreation"
      | "viewProduct",
  ) => void;
}

interface ManagedBatch {
  id: string;
  warehouse: string;
  expiryDate: string;
  batchNumber: string;
  qty: string;
  cost: string;
  price: string;
  reason: string;
}

interface ManagedBarcode {
  id: string;
  value: string;
  label: string;
}

const INITIAL_PRODUCT_VALUES = {
  productType: "storable" as const,
  defaultLanguage: "en",
  productNameEn: "Panadol Advance 500mg",
  productNameAr: "بنادول أدفانس 500 ملغ",
  barcodeSku: "629110000000",
  category: "medicine",
  brandName: "GSK",
  vendor: "direct",
  manufacturer: "Haleon",
  activeIngredients: "Paracetamol 500mg",
  dosageForm: "tablet",
  uom: "box",
  packSize: "20",
  retailPrice: "1.75",
  taxRate: "5.00",
  discountPercent: "0.00",
  description:
    "Fast-acting analgesic and antipyretic for mild to moderate pain relief.",
  stopPurchase: false,
  hideInPos: false,
  requiresExpiry: true,
  nonRefundable: false,
};

const INITIAL_BATCHES: ManagedBatch[] = [
  {
    id: "1",
    warehouse: "main",
    expiryDate: "2027-08-15",
    batchNumber: "PAN-2408-A",
    qty: "120",
    cost: "1.15",
    price: "1.75",
    reason: "restock",
  },
];

export function ViewProductPage({ onNavigate }: ViewProductPageProps) {
  const { t } = useLanguage();
  const [isEditMode, setIsEditMode] = useState(false);
  const [productType, setProductType] = useState<"storable" | "service" | "consumable">(
    INITIAL_PRODUCT_VALUES.productType,
  );
  const [defaultLanguage, setDefaultLanguage] = useState(
    INITIAL_PRODUCT_VALUES.defaultLanguage,
  );
  const [productNameEn, setProductNameEn] = useState(
    INITIAL_PRODUCT_VALUES.productNameEn,
  );
  const [productNameAr, setProductNameAr] = useState(
    INITIAL_PRODUCT_VALUES.productNameAr,
  );
  const [barcodeSku, setBarcodeSku] = useState(INITIAL_PRODUCT_VALUES.barcodeSku);
  const [category, setCategory] = useState(INITIAL_PRODUCT_VALUES.category);
  const [brandName, setBrandName] = useState(INITIAL_PRODUCT_VALUES.brandName);
  const [vendor, setVendor] = useState(INITIAL_PRODUCT_VALUES.vendor);
  const [manufacturer, setManufacturer] = useState(
    INITIAL_PRODUCT_VALUES.manufacturer,
  );
  const [activeIngredients, setActiveIngredients] = useState(
    INITIAL_PRODUCT_VALUES.activeIngredients,
  );
  const [dosageForm, setDosageForm] = useState(INITIAL_PRODUCT_VALUES.dosageForm);
  const [uom, setUom] = useState(INITIAL_PRODUCT_VALUES.uom);
  const [packSize, setPackSize] = useState(INITIAL_PRODUCT_VALUES.packSize);
  const [retailPrice, setRetailPrice] = useState(INITIAL_PRODUCT_VALUES.retailPrice);
  const [taxRate, setTaxRate] = useState(INITIAL_PRODUCT_VALUES.taxRate);
  const [discountPercent, setDiscountPercent] = useState(
    INITIAL_PRODUCT_VALUES.discountPercent,
  );
  const [description, setDescription] = useState(INITIAL_PRODUCT_VALUES.description);
  const [stopPurchase, setStopPurchase] = useState(
    INITIAL_PRODUCT_VALUES.stopPurchase,
  );
  const [hideInPos, setHideInPos] = useState(INITIAL_PRODUCT_VALUES.hideInPos);
  const [requiresExpiry, setRequiresExpiry] = useState(
    INITIAL_PRODUCT_VALUES.requiresExpiry,
  );
  const [nonRefundable, setNonRefundable] = useState(
    INITIAL_PRODUCT_VALUES.nonRefundable,
  );

  const [batches, setBatches] = useState<ManagedBatch[]>(INITIAL_BATCHES);

  const [barcodes, setBarcodes] = useState<ManagedBarcode[]>([
    { id: "1", value: "629110000000", label: t("fullViewPrimaryBarcode") },
    { id: "2", value: "629110000001", label: t("fullViewBoxBarcode") },
  ]);

  const addBatch = () => {
    setBatches((current) => [
      ...current,
      {
        id: Date.now().toString(),
        warehouse: "main",
        expiryDate: "",
        batchNumber: "",
        qty: "",
        cost: "",
        price: "",
        reason: "",
      },
    ]);
  };

  const updateBatch = (id: string, field: keyof ManagedBatch, value: string) => {
    setBatches((current) =>
      current.map((batch) => (batch.id === id ? { ...batch, [field]: value } : batch)),
    );
  };

  const removeBatch = (id: string) => {
    setBatches((current) =>
      current.length > 1 ? current.filter((batch) => batch.id !== id) : current,
    );
  };

  const addBarcode = () => {
    setBarcodes((current) => [
      ...current,
      { id: Date.now().toString(), value: "", label: t("barcode") },
    ]);
  };

  const updateBarcode = (id: string, field: keyof ManagedBarcode, value: string) => {
    setBarcodes((current) =>
      current.map((barcode) =>
        barcode.id === id ? { ...barcode, [field]: value } : barcode,
      ),
    );
  };

  const removeBarcode = (id: string) => {
    setBarcodes((current) =>
      current.length > 1 ? current.filter((barcode) => barcode.id !== id) : current,
    );
  };

  const cancelEditAndReset = () => {
    setProductType(INITIAL_PRODUCT_VALUES.productType);
    setDefaultLanguage(INITIAL_PRODUCT_VALUES.defaultLanguage);
    setProductNameEn(INITIAL_PRODUCT_VALUES.productNameEn);
    setProductNameAr(INITIAL_PRODUCT_VALUES.productNameAr);
    setBarcodeSku(INITIAL_PRODUCT_VALUES.barcodeSku);
    setCategory(INITIAL_PRODUCT_VALUES.category);
    setBrandName(INITIAL_PRODUCT_VALUES.brandName);
    setVendor(INITIAL_PRODUCT_VALUES.vendor);
    setManufacturer(INITIAL_PRODUCT_VALUES.manufacturer);
    setActiveIngredients(INITIAL_PRODUCT_VALUES.activeIngredients);
    setDosageForm(INITIAL_PRODUCT_VALUES.dosageForm);
    setUom(INITIAL_PRODUCT_VALUES.uom);
    setPackSize(INITIAL_PRODUCT_VALUES.packSize);
    setRetailPrice(INITIAL_PRODUCT_VALUES.retailPrice);
    setTaxRate(INITIAL_PRODUCT_VALUES.taxRate);
    setDiscountPercent(INITIAL_PRODUCT_VALUES.discountPercent);
    setDescription(INITIAL_PRODUCT_VALUES.description);
    setStopPurchase(INITIAL_PRODUCT_VALUES.stopPurchase);
    setHideInPos(INITIAL_PRODUCT_VALUES.hideInPos);
    setRequiresExpiry(INITIAL_PRODUCT_VALUES.requiresExpiry);
    setNonRefundable(INITIAL_PRODUCT_VALUES.nonRefundable);
    setBatches(INITIAL_BATCHES.map((batch) => ({ ...batch })));
    setBarcodes([
      { id: "1", value: "629110000000", label: t("fullViewPrimaryBarcode") },
      { id: "2", value: "629110000001", label: t("fullViewBoxBarcode") },
    ]);
    setIsEditMode(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto">
      <div className="p-6 space-y-6 flex-1 max-w-[1440px] w-full mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("fullViewPageTitle")}</h1>
          <p className="text-sm text-gray-600">{t("fullViewPageSubtitle")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
          <div className="space-y-6">
            <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 pb-4 mb-5 border-b border-gray-100">
                <FileText className="size-5 text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-900">{t("fullCreateBasicInformation")}</h2>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-700">{t("fullCreateProductType")} *</label>
                  <div className="flex flex-wrap gap-5">
                    {([
                      ["fullCreateTypeStorable", "storable"],
                      ["fullCreateTypeService", "service"],
                      ["fullCreateTypeConsumable", "consumable"],
                    ] as const).map(([labelKey, value]) => (
                      <label key={value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          className="size-4"
                          checked={productType === value}
                          onChange={() => setProductType(value)}
                          disabled={!isEditMode}
                        />
                        <span className="text-sm text-gray-700">{t(labelKey)}</span>
                      </label>
                    ))}
                  </div>
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">{t("barcode")} *</label>
                  <Input
                    className="h-10 rounded-full border-gray-300"
                    value={barcodeSku}
                    onChange={(e) => setBarcodeSku(e.target.value)}
                    disabled={!isEditMode}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">{t("fullCreateDefaultLanguage")}</label>
                  <select
                    className="w-full h-10 rounded-[999px] appearance-none bg-white border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                    value={defaultLanguage}
                    onChange={(e) => setDefaultLanguage(e.target.value)}
                    disabled={!isEditMode}
                  >
                    <option value="en">{t("fullCreateDefaultLanguageEnglish")}</option>
                    <option value="ar">{t("fullCreateDefaultLanguageArabic")}</option>
                    <option value="fr">{t("fullCreateDefaultLanguageFrench")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">{t("productNameEn")} *</label>
                  <Input
                    className="h-10 rounded-full border-gray-300"
                    value={productNameEn}
                    onChange={(e) => setProductNameEn(e.target.value)}
                    disabled={!isEditMode}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700 text-end block">{t("productNameAr")} *</label>
                  <Input
                    dir="rtl"
                    className="h-10 rounded-full border-gray-300"
                    value={productNameAr}
                    onChange={(e) => setProductNameAr(e.target.value)}
                    disabled={!isEditMode}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold text-gray-700">{t("fullCreateDescription")}</label>
                  <textarea
                    className="w-full min-h-24 rounded-2xl border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={!isEditMode}
                  />
                </div>
              </div>
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 pb-4 mb-5 border-b border-gray-100">
                <FileText className="size-5 text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-900">{t("fullCreateClassification")}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">{t("category")} *</label>
                  <select
                    className="w-full h-10 rounded-[999px] appearance-none bg-white border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={!isEditMode}
                  >
                    <option value="medicine">{t("medicine")}</option>
                    <option value="supplement">{t("supplement")}</option>
                    <option value="equipment">{t("equipment")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">{t("fullCreateBrandName")}</label>
                  <Input
                    className="h-10 rounded-full border-gray-300"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    disabled={!isEditMode}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">{t("fullCreateVendor")}</label>
                  <select
                    className="w-full h-10 rounded-[999px] appearance-none bg-white border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    disabled={!isEditMode}
                  >
                    <option value="direct">{t("fullCreateVendorDirectSource")}</option>
                    <option value="global">{t("fullCreateVendorGlobalLogistics")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">{t("fullCreateManufacturer")}</label>
                  <Input
                    className="h-10 rounded-full border-gray-300"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    disabled={!isEditMode}
                  />
                </div>
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 pb-4 mb-5 border-b border-gray-100">
                <Package className="size-5 text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-900">{t("fullCreateUnitsAndComposition")}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2 md:col-span-3">
                  <label className="text-xs font-semibold text-gray-700">{t("fullCreateActiveIngredientsPlural")}</label>
                  <Input
                    className="h-10 rounded-full border-gray-300"
                    value={activeIngredients}
                    onChange={(e) => setActiveIngredients(e.target.value)}
                    disabled={!isEditMode}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">{t("fullCreateDosageForm")}</label>
                  <select
                    className="w-full h-10 rounded-[999px] appearance-none bg-white border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                    value={dosageForm}
                    onChange={(e) => setDosageForm(e.target.value)}
                    disabled={!isEditMode}
                  >
                    <option value="tablet">{t("tablet")}</option>
                    <option value="capsule">{t("capsule")}</option>
                    <option value="bottle">{t("bottle")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">{t("fullCreateUomUnitMeasure")}</label>
                  <select
                    className="w-full h-10 rounded-[999px] appearance-none bg-white border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                    value={uom}
                    onChange={(e) => setUom(e.target.value)}
                    disabled={!isEditMode}
                  >
                    <option value="box">{t("box")}</option>
                    <option value="pack">{t("fullCreateUomPack")}</option>
                    <option value="unit">{t("fullCreateUomUnit")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">{t("fullCreatePackSize")}</label>
                  <Input
                    className="h-10 rounded-full border-gray-300"
                    value={packSize}
                    onChange={(e) => setPackSize(e.target.value)}
                    disabled={!isEditMode}
                  />
                </div>
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 pb-4 mb-5 border-b border-gray-100">
                <Package className="size-5 text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-900">{t("fullCreatePricingAndTax")}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">{t("fullCreateRetailPrice")} ({t("jod")})</label>
                  <Input
                    className="h-10 rounded-full border-gray-300"
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(e.target.value)}
                    disabled={!isEditMode}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">{t("taxRate")}</label>
                  <Input
                    className="h-10 rounded-full border-gray-300"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    disabled={!isEditMode}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">{t("fullCreateDiscount")}</label>
                  <Input
                    className="h-10 rounded-full border-gray-300"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    disabled={!isEditMode}
                  />
                </div>
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 pb-4 mb-5 border-b border-gray-100">
                <Barcode className="size-5 text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-900">{t("fullCreateNavMedia")}</h2>
              </div>
              <button
                type="button"
                disabled={!isEditMode}
                className="w-full min-h-40 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 disabled:opacity-70"
              >
                {t("fullCreateUploadHintMain")}
              </button>
            </section>

            <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 pb-4 mb-5 border-b border-gray-100">
                <Package className="size-5 text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-900">{t("fullViewBatchesManagement")}</h2>
              </div>
              <div className="space-y-4">
                {batches.map((batch, index) => (
                  <div key={batch.id} className="rounded-xl border border-gray-200 p-4 space-y-3">
                    {index > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700">{t("batchNumber")} {index + 1}</span>
                        {isEditMode && (
                          <button
                            type="button"
                            className="p-1 text-red-600 hover:text-red-700 cursor-pointer"
                            onClick={() => removeBatch(batch.id)}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <select
                        className="h-10 rounded-[999px] appearance-none bg-white border border-gray-300 px-3 text-sm disabled:bg-gray-100"
                        value={batch.warehouse}
                        onChange={(e) => updateBatch(batch.id, "warehouse", e.target.value)}
                        disabled={!isEditMode}
                      >
                        <option value="main">{t("main")}</option>
                        <option value="warehouse2">Warehouse 2</option>
                      </select>
                      <Input
                        className="h-10 rounded-full border-gray-300"
                        placeholder={t("selectDate")}
                        value={batch.expiryDate}
                        onChange={(e) => updateBatch(batch.id, "expiryDate", e.target.value)}
                        disabled={!isEditMode}
                      />
                      <Input
                        className="h-10 rounded-full border-gray-300"
                        placeholder={t("batchNumber")}
                        value={batch.batchNumber}
                        onChange={(e) => updateBatch(batch.id, "batchNumber", e.target.value)}
                        disabled={!isEditMode}
                      />
                      <Input
                        className="h-10 rounded-full border-gray-300"
                        placeholder={t("qty")}
                        value={batch.qty}
                        onChange={(e) => updateBatch(batch.id, "qty", e.target.value)}
                        disabled={!isEditMode}
                      />
                      <Input
                        className="h-10 rounded-full border-gray-300"
                        placeholder={t("cost")}
                        value={batch.cost}
                        onChange={(e) => updateBatch(batch.id, "cost", e.target.value)}
                        disabled={!isEditMode}
                      />
                      <Input
                        className="h-10 rounded-full border-gray-300"
                        placeholder={t("price")}
                        value={batch.price}
                        onChange={(e) => updateBatch(batch.id, "price", e.target.value)}
                        disabled={!isEditMode}
                      />
                      <select
                        className="h-10 rounded-[999px] appearance-none bg-white border border-gray-300 px-3 text-sm md:col-span-2 disabled:bg-gray-100"
                        value={batch.reason}
                        onChange={(e) => updateBatch(batch.id, "reason", e.target.value)}
                        disabled={!isEditMode}
                      >
                        <option value="">{t("selectReason")}</option>
                        <option value="new">{t("newStock")}</option>
                        <option value="restock">{t("restock")}</option>
                      </select>
                    </div>
                  </div>
                ))}

                {isEditMode && (
                  <button
                    type="button"
                    onClick={addBatch}
                    className="w-full h-10 rounded-full border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="size-4" />
                    {t("addAnotherBatch")}
                  </button>
                )}
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 pb-4 mb-5 border-b border-gray-100">
                <Barcode className="size-5 text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-900">{t("fullViewBarcodeManagement")}</h2>
              </div>
              <div className="space-y-3">
                {barcodes.map((barcodeItem, index) => (
                  <div key={barcodeItem.id} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-3 items-center">
                    <Input
                      className="h-10 rounded-full border-gray-300"
                      value={barcodeItem.label}
                      onChange={(e) => updateBarcode(barcodeItem.id, "label", e.target.value)}
                      disabled={!isEditMode}
                      placeholder={t("barcode")}
                    />
                    <Input
                      className="h-10 rounded-full border-gray-300"
                      value={barcodeItem.value}
                      onChange={(e) => updateBarcode(barcodeItem.id, "value", e.target.value)}
                      disabled={!isEditMode}
                      placeholder={t("enterBarcode")}
                    />
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => removeBarcode(barcodeItem.id)}
                        className="size-9 rounded-full border border-gray-300 text-red-600 hover:text-red-700 hover:bg-red-50 inline-flex items-center justify-center cursor-pointer"
                        aria-label={`${t("deleteProduct")} ${index + 1}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                ))}

                {isEditMode && (
                  <button
                    type="button"
                    onClick={addBarcode}
                    className="w-full h-10 rounded-full border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="size-4" />
                    {t("fullViewAddBarcode")}
                  </button>
                )}
              </div>
            </section>
          </div>

          <aside className="w-full lg:w-[340px] self-start">
            <div className="hidden lg:block lg:w-[340px]" aria-hidden />
            <div className="lg:fixed lg:top-1/2 lg:-translate-y-1/2 lg:w-[340px] lg:end-[max(1.5rem,calc((100vw-1440px)/2+1.5rem))]">
              <div className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-base font-semibold text-gray-900">{t("fullCreateStatusActions")}</h3>
                </div>
                <div className="p-5 space-y-6">
                  <div className="space-y-2 pb-4 border-b border-gray-100">
                    <Button
                      variant="outline"
                      className="w-full rounded-full h-10"
                      onClick={() => onNavigate?.("products")}
                    >
                      {t("back")}
                    </Button>
                    {isEditMode ? (
                      <>
                        <Button className="w-full rounded-full h-10 bg-teal-600 hover:bg-teal-700">
                          <Save className="size-4 me-1" />
                          {t("fullViewSaveChanges")}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full rounded-full h-10 border-gray-300 text-gray-700"
                          onClick={cancelEditAndReset}
                        >
                          {t("cancel")}
                        </Button>
                      </>
                    ) : (
                      <Button
                        className="w-full rounded-full h-10 bg-teal-600 hover:bg-teal-700"
                        onClick={() => setIsEditMode(true)}
                      >
                        <Pencil className="size-4 me-1" />
                        {t("fullViewEnableEdit")}
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        key: "fullCreateStopPurchase",
                        value: stopPurchase,
                        onChange: setStopPurchase,
                      },
                      {
                        key: "fullCreateHideInPos",
                        value: hideInPos,
                        onChange: setHideInPos,
                      },
                      {
                        key: "fullCreateRequiresExpiry",
                        value: requiresExpiry,
                        onChange: setRequiresExpiry,
                      },
                      {
                        key: "fullCreateNonRefundable",
                        value: nonRefundable,
                        onChange: setNonRefundable,
                      },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{t(item.key)}</span>
                        <Switch
                          checked={item.value}
                          onCheckedChange={(checked) => item.onChange(Boolean(checked))}
                          disabled={!isEditMode}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-100 text-xs text-gray-600 flex items-center gap-2">
                    <ShieldCheck className="size-4 text-teal-600" />
                    {isEditMode ? t("fullViewEditModeEnabled") : t("fullViewReadModeEnabled")}
                  </div>
                </div>

                <div className="mx-5 mb-5 p-3 rounded-xl bg-gray-100 border border-gray-200 flex items-start gap-2">
                  <Sparkles className="size-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{t("fullCreateProTipTitle")}</p>
                    <p className="text-xs text-gray-600 mt-1">{t("fullCreateProTipDescription")}</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
