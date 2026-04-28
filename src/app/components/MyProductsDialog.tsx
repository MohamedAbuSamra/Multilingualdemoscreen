import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Package2, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { useLanguage } from "../contexts/LanguageContext";
import {
  PHARMACY_INVENTORY_PRODUCTS,
  type PharmacyInventoryRow,
} from "../data/pharmacyInventorySample";

interface MyProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCodes: string[];
  onAddProducts: (products: PharmacyInventoryRow[]) => void;
  onBackToSource?: () => void;
}

export function MyProductsDialog({
  open,
  onOpenChange,
  selectedCodes,
  onAddProducts,
  onBackToSource,
}: MyProductsDialogProps) {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";
  const [query, setQuery] = useState("");
  const [selectedCodesState, setSelectedCodesState] = useState<string[]>([]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return PHARMACY_INVENTORY_PRODUCTS.filter((product) => {
      if (!normalizedQuery) return true;

      return [
        product.code,
        product.barcode,
        product.nameEn,
        product.nameAr,
        product.subtitleEn,
        product.subtitleAr,
        product.lotBatch,
        product.warehouseZone,
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [query]);

  const toggleSelection = (productCode: string) => {
    setSelectedCodesState((current) =>
      current.includes(productCode)
        ? current.filter((code) => code !== productCode)
        : [...current, productCode],
    );
  };

  const handleAdd = () => {
    const selectedProducts = PHARMACY_INVENTORY_PRODUCTS.filter((product) =>
      selectedCodesState.includes(product.code),
    );

    onAddProducts(selectedProducts);
    setSelectedCodesState([]);
    setQuery("");
    onOpenChange(false);
  };

  const resetDialogState = () => {
    setSelectedCodesState([]);
    setQuery("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetDialogState();
      onBackToSource?.();
      return;
    }

    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[1100px] w-[82vw] p-0 gap-0 rounded-3xl overflow-hidden">
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
              <div className="size-10 bg-sky-100 rounded-xl flex items-center justify-center">
                <Package2 className="size-5 text-sky-600" strokeWidth={2} />
              </div>
              <div className={isRTL ? "text-right" : "text-left"}>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  {t("myProducts")}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-1">
                  {t("myProductsDescription")}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("searchMyProducts")}
                dir={isRTL ? "rtl" : "ltr"}
                className={`ps-10 h-10 rounded-full border-gray-300 ${isRTL ? "text-right" : "text-left"}`}
              />
            </div>
            <div className="text-sm text-gray-500 whitespace-nowrap">
              {selectedCodesState.length} {t("selectedItems")}
            </div>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto bg-gray-50 px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((product) => {
              const isSelected = selectedCodesState.includes(product.code);
              const isAlreadyAdded = selectedCodes.includes(product.code);

              return (
                <button
                  key={product.code}
                  type="button"
                  onClick={() =>
                    !isAlreadyAdded && toggleSelection(product.code)
                  }
                  className={`w-full text-start rounded-2xl border p-4 transition-all relative ${
                    isAlreadyAdded
                      ? "border-amber-200 bg-amber-50/70"
                      : isSelected
                        ? "border-sky-500 bg-sky-50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-sky-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-sky-600 mb-1">
                        {product.code}
                      </div>
                      <div className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {language === "ar" ? product.nameAr : product.nameEn}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {language === "ar"
                          ? product.subtitleAr
                          : product.subtitleEn}
                      </div>
                    </div>

                    {!isAlreadyAdded && (
                      <div
                        className={`min-w-6 h-6 rounded-full border flex items-center justify-center shrink-0 px-1 ${
                          isSelected
                            ? "border-sky-500 bg-sky-500 text-white"
                            : "border-gray-300 bg-white text-transparent"
                        }`}
                      >
                        <Check className="size-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-gray-500">{t("barcode")}</div>
                      <div className="font-medium text-gray-800">
                        {product.barcode}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">{t("category")}</div>
                      <div className="font-medium text-gray-800">
                        {t(product.categoryKey)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">{t("currentStock")}</div>
                      <div className="font-medium text-gray-800">
                        {Number(product.stockQty).toLocaleString("en-GB")}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">{t("sellingPrice")}</div>
                      <div className="font-medium text-gray-800">
                        {t("jod")} {product.sellPrice}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 rounded-full px-2 py-0.5 text-xs">
                        {product.warehouseZone}
                      </Badge>
                      <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 rounded-full px-2 py-0.5 text-xs">
                        {product.lotBatch}
                      </Badge>
                    </div>

                    {isAlreadyAdded ? (
                      <div className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 font-medium text-amber-700">
                        {t("alreadyAdded")}
                      </div>
                    ) : isSelected ? (
                      <div className="inline-flex rounded-full bg-sky-100 px-2.5 py-1 font-medium text-sky-700">
                        {t("selectedItems")}
                      </div>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-sm text-gray-500">
              {t("noMyProductsFound")}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-between gap-3">
          <div className="text-sm text-gray-500">
            {t("selectProductsFromInventory")}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => {
                resetDialogState();
                onBackToSource?.();
              }}
              className="h-10 px-5 rounded-full border-gray-300"
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleAdd}
              disabled={selectedCodesState.length === 0}
              className="h-10 px-5 rounded-full bg-sky-500 hover:bg-sky-600"
            >
              {t("addSelectedProducts")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
