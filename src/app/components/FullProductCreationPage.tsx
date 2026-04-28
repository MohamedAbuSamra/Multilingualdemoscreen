import React, { useState } from "react";
import {
  CheckCircle2,
  FileText,
  FlaskConical,
  ImagePlus,
  Layers,
  Package,
  Plus,
  ReceiptText,
  Sparkles,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useLanguage } from "../contexts/LanguageContext";

interface FullProductCreationPageProps {
  onNavigate?: (
    page:
      | "products"
      | "updateStock"
      | "manualUpdateStock"
      | "stockHistoryDetails"
      | "fullProductCreation",
  ) => void;
}

interface InitialBatch {
  id: string;
  warehouse: string;
  expiryDate: string;
  batchNumber: string;
  qty: string;
  cost: string;
  price: string;
  reason: string;
}

export function FullProductCreationPage({
  onNavigate,
}: FullProductCreationPageProps) {
  const { t, language } = useLanguage();
  const [productType, setProductType] = useState<
    "" | "storable" | "service" | "consumable"
  >("");
  const [barcodeSku, setBarcodeSku] = useState("");
  const [productNameEnValue, setProductNameEnValue] = useState("");
  const [productNameArValue, setProductNameArValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [createSuccessOpen, setCreateSuccessOpen] = useState(false);
  const [formInstanceKey, setFormInstanceKey] = useState(0);
  const [initialBatches, setInitialBatches] = useState<InitialBatch[]>([
    {
      id: "1",
      warehouse: "main",
      expiryDate: "",
      batchNumber: "",
      qty: "",
      cost: "",
      price: "",
      reason: "",
    },
  ]);
  const [stopPurchase, setStopPurchase] = useState(false);
  const [hideInPos, setHideInPos] = useState(false);
  const [requiresExpiry, setRequiresExpiry] = useState(true);
  const [nonRefundable, setNonRefundable] = useState(false);

  const missingMandatoryFields = [
    {
      key: "fullCreateMandatoryProductType",
      isMissing: productType === "",
    },
    {
      key: "fullCreateMandatoryBarcodeSku",
      isMissing: barcodeSku.trim() === "",
    },
    {
      key: "fullCreateMandatoryProductName",
      isMissing:
        productNameEnValue.trim() === "" || productNameArValue.trim() === "",
    },
    {
      key: "fullCreateMandatoryCategory",
      isMissing: selectedCategory === "",
    },
  ].filter((field) => field.isMissing);

  const isCreateDisabled = missingMandatoryFields.length > 0;

  const addInitialBatch = () => {
    setInitialBatches((current) => [
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

  const updateInitialBatch = (
    id: string,
    field: keyof InitialBatch,
    value: string,
  ) => {
    setInitialBatches((current) =>
      current.map((batch) =>
        batch.id === id ? { ...batch, [field]: value } : batch,
      ),
    );
  };

  const removeInitialBatch = (id: string) => {
    setInitialBatches((current) =>
      current.length > 1 ? current.filter((batch) => batch.id !== id) : current,
    );
  };

  const resetFormForNewCreate = () => {
    setProductType("");
    setBarcodeSku("");
    setProductNameEnValue("");
    setProductNameArValue("");
    setSelectedCategory("");
    setInitialBatches([
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
    setStopPurchase(false);
    setHideInPos(false);
    setRequiresExpiry(true);
    setNonRefundable(false);
    setFormInstanceKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-6 space-y-6 flex-1 max-w-[1440px] w-full mx-auto">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">{t("fullCreateBreadcrumbCatalog")}</span>
          <span className="text-gray-400">{t("breadcrumbSeparator")}</span>
          <span className="text-gray-500">{t("fullCreateBreadcrumbProducts")}</span>
          <span className="text-gray-400">{t("breadcrumbSeparator")}</span>
          <span className="text-gray-700">{t("fullCreateBreadcrumbCreateNew")}</span>
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">{t("fullCreatePageTitle")}</h1>
          <p className="text-sm text-gray-600">{t("fullCreatePageSubtitle")}</p>
        </div>

        <div
          key={formInstanceKey}
          className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start"
        >
          <div className="space-y-6">
            <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 pb-4 mb-5 border-b border-gray-100">
                <FileText className="size-5 text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {t("fullCreateBasicInformation")}
                </h2>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-700">
                    {t("fullCreateProductType")} *
                  </label>
                  <div className="flex flex-wrap gap-5">
                    {[
                      "fullCreateTypeStorable",
                      "fullCreateTypeService",
                      "fullCreateTypeConsumable",
                    ].map((typeKey, index) => (
                      <label key={typeKey} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="productType"
                          className="size-4"
                          value={
                            index === 0
                              ? "storable"
                              : index === 1
                                ? "service"
                                : "consumable"
                          }
                          checked={
                            productType ===
                            (index === 0
                              ? "storable"
                              : index === 1
                                ? "service"
                                : "consumable")
                          }
                          onChange={(event) =>
                            setProductType(
                              event.target.value as
                                | "storable"
                                | "service"
                                | "consumable",
                            )
                          }
                        />
                        <span className="text-sm text-gray-700">{t(typeKey)}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700">
                      {t("barcode")} *
                    </label>
                    <Input
                      className="h-10 rounded-full border-gray-300"
                      placeholder={t("fullCreateBarcodePlaceholder")}
                      value={barcodeSku}
                      onChange={(event) => setBarcodeSku(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700">
                      {t("fullCreateDefaultLanguage")}
                    </label>
                    <select className="w-full h-10 rounded-[999px] appearance-none bg-white border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                      <option value="en">{t("fullCreateDefaultLanguageEnglish")}</option>
                      <option value="ar">{t("fullCreateDefaultLanguageArabic")}</option>
                      <option value="fr">{t("fullCreateDefaultLanguageFrench")}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700">
                      {t("productNameEn")} *
                    </label>
                    <Input
                      className="h-10 rounded-full border-gray-300"
                      placeholder={t("enterProductNameEn")}
                      value={productNameEnValue}
                      onChange={(event) => setProductNameEnValue(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700 text-end block">
                      {t("productNameAr")} *
                    </label>
                    <Input
                      dir="rtl"
                      className="h-10 rounded-full border-gray-300"
                      placeholder={t("enterProductNameAr")}
                      value={productNameArValue}
                      onChange={(event) => setProductNameArValue(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-semibold text-gray-700">
                      {t("fullCreateDescription")}
                    </label>
                    <textarea
                      className="w-full min-h-24 rounded-2xl border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder={t("fullCreateDescriptionPlaceholder")}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 pb-4 mb-5 border-b border-gray-100">
                <Layers className="size-5 text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {t("fullCreateClassification")}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">
                    {t("category")} *
                  </label>
                  <select
                    className="w-full h-10 rounded-[999px] appearance-none bg-white border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={selectedCategory}
                    onChange={(event) => setSelectedCategory(event.target.value)}
                  >
                    <option value="">{t("selectCategory")}</option>
                    <option value="medicine">{t("medicine")}</option>
                    <option value="supplement">{t("supplement")}</option>
                    <option value="equipment">{t("equipment")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">
                    {t("fullCreateBrandName")}
                  </label>
                  <Input
                    className="h-10 rounded-full border-gray-300"
                    placeholder={t("fullCreateBrandNamePlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">
                    {t("fullCreateVendor")}
                  </label>
                  <select className="w-full h-10 rounded-[999px] appearance-none bg-white border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option>{t("fullCreateVendorDirectSource")}</option>
                    <option>{t("fullCreateVendorGlobalLogistics")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">
                    {t("fullCreateManufacturer")}
                  </label>
                  <Input className="h-10 rounded-full border-gray-300" placeholder={t("manufacturer")} />
                </div>
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 pb-4 mb-5 border-b border-gray-100">
                <FlaskConical className="size-5 text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {t("fullCreateUnitsAndComposition")}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2 md:col-span-3">
                  <label className="text-xs font-semibold text-gray-700">
                    {t("fullCreateActiveIngredientsPlural")}
                  </label>
                  <Input
                    className="h-10 rounded-full border-gray-300"
                    placeholder={t("fullCreateActiveIngredient")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">
                    {t("fullCreateDosageForm")}
                  </label>
                  <select className="w-full h-10 rounded-[999px] appearance-none bg-white border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="tablet">{t("tablet")}</option>
                    <option value="capsule">{t("capsule")}</option>
                    <option value="bottle">{t("bottle")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">
                    {t("fullCreateUomUnitMeasure")}
                  </label>
                  <select className="w-full h-10 rounded-[999px] appearance-none bg-white border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option>{t("box")}</option>
                    <option>{t("fullCreateUomPack")}</option>
                    <option>{t("fullCreateUomUnit")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">
                    {t("fullCreatePackSize")}
                  </label>
                  <Input type="number" className="h-10 rounded-full border-gray-300" placeholder="30" />
                </div>
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 pb-4 mb-5 border-b border-gray-100">
                <ReceiptText className="size-5 text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {t("fullCreatePricingAndTax")}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">
                    {t("fullCreateRetailPrice")} ({t("jod")})
                  </label>
                  <div className="relative">
                    <span className="absolute start-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-semibold">
                      {language === "ar" ? "د.أ" : "JOD"}
                    </span>
                    <Input
                      className="h-10 rounded-full border-gray-300 ps-12 text-end"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">{t("taxRate")}</label>
                  <div className="relative">
                    <Input className="h-10 rounded-full border-gray-300 pe-8" defaultValue="5.00" />
                    <span className="absolute end-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      %
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700">
                    {t("fullCreateDiscount")}
                  </label>
                  <div className="relative">
                    <Input className="h-10 rounded-full border-gray-300 pe-8" placeholder="0.00" />
                    <span className="absolute end-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      %
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 pb-4 mb-5 border-b border-gray-100">
                <ImagePlus className="size-5 text-teal-600" />
                <h2 className="text-lg font-semibold text-gray-900">{t("fullCreateNavMedia")}</h2>
              </div>
              <button
                type="button"
                className="w-full min-h-48 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-teal-500 hover:bg-teal-50/40 transition-colors flex flex-col items-center justify-center text-center px-6"
              >
                <div className="size-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
                  <ImagePlus className="size-5" />
                </div>
                <p className="text-sm font-semibold text-gray-800">{t("fullCreateUploadHintMain")}</p>
                <p className="text-xs text-gray-500 mt-1">{t("fullCreateUploadHintSub")}</p>
              </button>
            </section>

            <section className="bg-white border border-teal-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 pb-4 mb-5 border-b border-teal-100">
                <Package className="size-5 text-teal-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{t("firstBatchOptional")}</h2>
                  <p className="text-xs text-gray-600">{t("addInitialStock")}</p>
                </div>
              </div>

              <div className="space-y-5">
                {initialBatches.map((batch, index) => (
                  <div
                    key={batch.id}
                    className="rounded-xl border border-teal-100 p-4 space-y-4 bg-white"
                  >
                    {index > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700">
                          {t("batchNumber")} {index + 1}
                        </span>
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-700 p-1 cursor-pointer"
                          onClick={() => removeInitialBatch(batch.id)}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-700">{t("warehouse")}</label>
                        <select
                          className="w-full h-10 rounded-[999px] appearance-none bg-white border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                          value={batch.warehouse}
                          onChange={(event) =>
                            updateInitialBatch(batch.id, "warehouse", event.target.value)
                          }
                        >
                          <option value="main">{t("main")}</option>
                          <option value="warehouse2">Warehouse 2</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-700">{t("expiryDate")}</label>
                        <Input
                          className="h-10 rounded-full border-gray-300"
                          placeholder={t("selectDate")}
                          value={batch.expiryDate}
                          onChange={(event) =>
                            updateInitialBatch(batch.id, "expiryDate", event.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-700">{t("batchNumber")}</label>
                        <Input
                          className="h-10 rounded-full border-gray-300"
                          placeholder={t("batchNumber")}
                          value={batch.batchNumber}
                          onChange={(event) =>
                            updateInitialBatch(batch.id, "batchNumber", event.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-700">{t("qty")}</label>
                        <Input
                          className="h-10 rounded-full border-gray-300"
                          placeholder="0"
                          value={batch.qty}
                          onChange={(event) =>
                            updateInitialBatch(batch.id, "qty", event.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-700">{t("cost")}</label>
                        <Input
                          className="h-10 rounded-full border-gray-300"
                          placeholder="0.00"
                          value={batch.cost}
                          onChange={(event) =>
                            updateInitialBatch(batch.id, "cost", event.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-700">{t("price")}</label>
                        <Input
                          className="h-10 rounded-full border-gray-300"
                          placeholder="0.00"
                          value={batch.price}
                          onChange={(event) =>
                            updateInitialBatch(batch.id, "price", event.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-semibold text-gray-700">{t("reason")}</label>
                        <select
                          className="w-full h-10 rounded-[999px] appearance-none bg-white border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                          value={batch.reason}
                          onChange={(event) =>
                            updateInitialBatch(batch.id, "reason", event.target.value)
                          }
                        >
                          <option value="">{t("selectReason")}</option>
                          <option value="new">{t("newStock")}</option>
                          <option value="restock">{t("restock")}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addInitialBatch}
                  className="w-full h-10 rounded-full border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="size-4" />
                  {t("addAnotherBatch")}
                </button>
              </div>
            </section>
          </div>

          <aside className="w-full lg:w-[340px] self-start">
            <div className="hidden lg:block lg:w-[340px]" aria-hidden />
            <div className="lg:fixed lg:top-1/2 lg:-translate-y-1/2 lg:w-[340px] lg:end-[max(1.5rem,calc((100vw-1440px)/2+1.5rem))]">
              <div className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="text-base font-semibold text-gray-900">
                  {t("fullCreateStatusActions")}
                </h3>
              </div>

              <div className="p-5 space-y-6">
                {missingMandatoryFields.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-red-700 mb-3">
                      <TriangleAlert className="size-4" />
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        {t("fullCreateMandatoryFields")}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {missingMandatoryFields.map((field) => (
                        <li
                          key={field.key}
                          className="flex items-center gap-2 text-xs text-gray-700"
                        >
                          <span className="size-1.5 rounded-full bg-red-600" />
                          {t(field.key)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

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
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <Button
                    className="w-full h-10 rounded-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:text-gray-500"
                    disabled={isCreateDisabled}
                    onClick={() => setCreateSuccessOpen(true)}
                  >
                    {t("fullCreateCreateProduct")}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full h-9 rounded-full text-gray-500 hover:text-red-600"
                    onClick={() => onNavigate?.("products")}
                  >
                    {t("cancel")}
                  </Button>
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

        <AlertDialog open={createSuccessOpen} onOpenChange={setCreateSuccessOpen}>
          <AlertDialogContent className="rounded-3xl border-gray-200 p-0 overflow-hidden">
            <div className="px-6 pt-6 pb-5 text-center bg-gradient-to-b from-teal-50 to-white border-b border-gray-100">
              <div className="mx-auto mb-3 size-14 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
                <CheckCircle2 className="size-7" />
              </div>
              <AlertDialogHeader className="space-y-1">
                <AlertDialogTitle className="text-xl text-gray-900 text-center">
                  {t("fullCreateSuccessTitle")}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-gray-600 text-center">
                  {t("fullCreateSuccessDescription")}
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>

            <AlertDialogFooter className="p-4 sm:p-4 sm:grid sm:grid-cols-2 sm:gap-2">
              <AlertDialogCancel
                className="w-full rounded-full h-11 border-gray-300 text-gray-700 hover:bg-gray-50 mt-0"
                onClick={() => onNavigate?.("products")}
              >
                {t("fullCreateSkipToProducts")}
              </AlertDialogCancel>
              <AlertDialogAction
                className="w-full rounded-full h-11 bg-teal-600 hover:bg-teal-700"
                onClick={() => {
                  resetFormForNewCreate();
                  setCreateSuccessOpen(false);
                }}
              >
                {t("fullCreateCreateNow")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
