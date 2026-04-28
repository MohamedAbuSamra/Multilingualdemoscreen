import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Barcode, Package } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useLanguage } from "../contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import type { ProductCategoryKey } from "../data/pharmacyInventorySample";

export interface ManualCustomProductInput {
  productCode: string;
  productNameEn: string;
  productNameAr: string;
  barcode: string;
  categoryKey: ProductCategoryKey;
  currentStock: string;
  avgCost: string;
  sellPrice: string;
}

interface ManualStockCustomProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingCodes: string[];
  onAddProduct: (product: ManualCustomProductInput) => void;
  onBackToSource?: () => void;
}

const CATEGORY_OPTIONS: ProductCategoryKey[] = [
  "categoryGastrointestinal",
  "categoryAntibiotic",
  "categoryCardiovascular",
  "categoryVitamins",
  "categoryOtc",
  "categoryDiabetes",
  "categoryDermatology",
  "categoryAnalgesic",
];

const INITIAL_FORM: ManualCustomProductInput = {
  productCode: "",
  productNameEn: "",
  productNameAr: "",
  barcode: "",
  categoryKey: "categoryOtc",
  currentStock: "",
  avgCost: "",
  sellPrice: "",
};

export function ManualStockCustomProductDialog({
  open,
  onOpenChange,
  existingCodes,
  onAddProduct,
  onBackToSource,
}: ManualStockCustomProductDialogProps) {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";
  const [form, setForm] = useState<ManualCustomProductInput>(INITIAL_FORM);

  const normalizedExistingCodes = useMemo(
    () => new Set(existingCodes.map((code) => code.trim().toLowerCase())),
    [existingCodes],
  );

  const isDuplicateCode = normalizedExistingCodes.has(
    form.productCode.trim().toLowerCase(),
  );

  const isValid =
    form.productCode.trim() &&
    form.productNameEn.trim() &&
    form.productNameAr.trim() &&
    form.barcode.trim() &&
    form.avgCost.trim() &&
    form.sellPrice.trim() &&
    !isDuplicateCode;

  const updateField = <K extends keyof ManualCustomProductInput>(
    field: K,
    value: ManualCustomProductInput[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => setForm(INITIAL_FORM);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
      onBackToSource?.();
      return;
    }

    onOpenChange(nextOpen);
  };

  const handleAdd = () => {
    if (!isValid) return;

    onAddProduct({
      ...form,
      productCode: form.productCode.trim(),
      productNameEn: form.productNameEn.trim(),
      productNameAr: form.productNameAr.trim(),
      barcode: form.barcode.trim(),
      avgCost: form.avgCost.trim(),
      sellPrice: form.sellPrice.trim(),
      currentStock: form.currentStock,
    });

    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[760px] w-[92vw] p-0 gap-0 rounded-3xl overflow-hidden">
        <DialogHeader className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {onBackToSource && (
                <button
                  type="button"
                  onClick={onBackToSource}
                  className="size-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center shrink-0"
                  aria-label={t("backToChooseProductSource")}
                >
                  {language === "ar" ? (
                    <ArrowRight className="size-4 text-gray-700" />
                  ) : (
                    <ArrowLeft className="size-4 text-gray-700" />
                  )}
                </button>
              )}
              <div className="size-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <Package className="size-5 text-violet-600" strokeWidth={2} />
              </div>
              <div className={isRTL ? "text-right" : "text-left"}>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  {t("newProduct")}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-1">
                  {t("newProductDescription")}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 bg-gray-50 space-y-5" dir={isRTL ? "rtl" : "ltr"}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={isRTL ? "justify-start" : "justify-start"}>
                {t("code")}
              </Label>
              <Input
                value={form.productCode}
                onChange={(e) => updateField("productCode", e.target.value)}
                placeholder={t("enterProductCode")}
                dir="ltr"
                className="h-11 rounded-full"
              />
              {isDuplicateCode && (
                <p className="text-xs text-red-600">
                  {t("productCodeAlreadyExists")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t("barcode")}</Label>
              <div className="relative">
                <Barcode className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  value={form.barcode}
                  onChange={(e) => updateField("barcode", e.target.value)}
                  placeholder={t("enterBarcode")}
                  dir="ltr"
                  className="h-11 rounded-full ps-10"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("productNameEn")}</Label>
              <Input
                value={form.productNameEn}
                onChange={(e) => updateField("productNameEn", e.target.value)}
                placeholder={t("enterProductNameEn")}
                dir="ltr"
                className="h-11 rounded-full"
              />
            </div>

            <div className="space-y-2">
              <Label>{t("productNameAr")}</Label>
              <Input
                value={form.productNameAr}
                onChange={(e) => updateField("productNameAr", e.target.value)}
                placeholder={t("enterProductNameAr")}
                dir="rtl"
                className="h-11 rounded-full text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("category")}</Label>
              <Select
                value={form.categoryKey}
                onValueChange={(value) =>
                  updateField("categoryKey", value as ProductCategoryKey)
                }
              >
                <SelectTrigger
                  className={`h-11 rounded-full border-gray-300 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {CATEGORY_OPTIONS.map((categoryKey) => (
                    <SelectItem key={categoryKey} value={categoryKey}>
                      {t(categoryKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("currentStock")}</Label>
              <Input
                type="number"
                min="0"
                value={form.currentStock}
                onChange={(e) => updateField("currentStock", e.target.value)}
                dir="ltr"
                className="h-11 rounded-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("cost")}</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.avgCost}
                onChange={(e) => updateField("avgCost", e.target.value)}
                placeholder="0.00"
                dir="ltr"
                className="h-11 rounded-full"
              />
            </div>

            <div className="space-y-2">
              <Label>{t("sellingPrice")}</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.sellPrice}
                onChange={(e) => updateField("sellPrice", e.target.value)}
                placeholder="0.00"
                dir="ltr"
                className="h-11 rounded-full"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-between gap-3">
          <div className="text-sm text-gray-500">
            {t("customProductWillBeAddedToTable")}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                onBackToSource?.();
              }}
              className="h-10 px-5 rounded-full border-gray-300"
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!isValid}
              className="h-10 px-5 rounded-full bg-violet-600 hover:bg-violet-700"
            >
              {t("addProduct")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
