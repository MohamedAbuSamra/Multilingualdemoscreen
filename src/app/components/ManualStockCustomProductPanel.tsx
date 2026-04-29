import { useMemo, useState } from "react";
import { Barcode } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
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

interface ManualStockCustomProductPanelProps {
  existingCodes: string[];
  onAddProduct: (product: ManualCustomProductInput) => void;
  onCancel: () => void;
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

export function ManualStockCustomProductPanel({
  existingCodes,
  onAddProduct,
  onCancel,
}: ManualStockCustomProductPanelProps) {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";
  const [form, setForm] = useState<ManualCustomProductInput>(INITIAL_FORM);

  const normalizedExistingCodes = useMemo(
    () =>
      new Set(
        existingCodes
          .filter((code): code is string => typeof code === "string")
          .map((code) => code.trim())
          .filter(Boolean)
          .map((code) => code.toLowerCase()),
      ),
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
  };

  return (
    <>
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
            onClick={onCancel}
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
    </>
  );
}
