import { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronUp, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useLanguage } from "../contexts/LanguageContext";
import {
  PHARMACY_INVENTORY_PRODUCTS,
  type PharmacyInventoryRow,
} from "../data/pharmacyInventorySample";
import { PHARMACY_INVENTORY_PRODUCTS_V2 } from "../data/pharmacyInventoryProducts";

export interface SelectedInventoryProductWithBatches {
  product: PharmacyInventoryRow;
  selectedBatchIds: string[];
}

interface MyProductsPanelProps {
  selectedCodes: string[];
  onAddProducts: (products: SelectedInventoryProductWithBatches[]) => void;
  onCancel: () => void;
}

export function MyProductsPanel({
  selectedCodes,
  onAddProducts,
  onCancel,
}: MyProductsPanelProps) {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";
  const [query, setQuery] = useState("");
  const [selectedCodesState, setSelectedCodesState] = useState<string[]>([]);
  const [expandedCodes, setExpandedCodes] = useState<string[]>([]);
  const [selectedBatchIdsByCode, setSelectedBatchIdsByCode] = useState<
    Record<string, string[]>
  >({});

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
    setSelectedCodesState((current) => {
      if (current.includes(productCode)) {
        const next = current.filter((code) => code !== productCode);
        setSelectedBatchIdsByCode((batchState) => {
          const updated = { ...batchState };
          delete updated[productCode];
          return updated;
        });
        return next;
      }

      return [...current, productCode];
    });
  };

  const toggleExpanded = (productCode: string) => {
    setExpandedCodes((current) =>
      current.includes(productCode)
        ? current.filter((code) => code !== productCode)
        : [...current, productCode],
    );
  };

  const toggleBatchSelection = (productCode: string, batchId: string) => {
    setSelectedBatchIdsByCode((current) => {
      const existing = current[productCode] ?? [];
      const next = existing.includes(batchId)
        ? existing.filter((id) => id !== batchId)
        : [...existing, batchId];

      return {
        ...current,
        [productCode]: next,
      };
    });
  };

  const handleAdd = () => {
    const selectedProducts = PHARMACY_INVENTORY_PRODUCTS.filter((product) =>
      selectedCodesState.includes(product.code),
    ).map((product) => ({
      product,
      selectedBatchIds: selectedBatchIdsByCode[product.code] ?? [],
    }));

    onAddProducts(selectedProducts);
    setSelectedCodesState([]);
    setExpandedCodes([]);
    setSelectedBatchIdsByCode({});
    setQuery("");
  };

  return (
    <>
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
            const isExpanded = expandedCodes.includes(product.code);
            const productWithBatches = PHARMACY_INVENTORY_PRODUCTS_V2.find(
              (item) => item.code === product.code,
            );
            const selectedBatchIds =
              selectedBatchIdsByCode[product.code] ?? [];

            return (
              <button
                key={product.code}
                type="button"
                onClick={() => !isAlreadyAdded && toggleSelection(product.code)}
                className={`w-full text-start rounded-2xl border p-4 transition-all relative block ${
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
                    {productWithBatches && (
                      <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100 rounded-full px-2 py-0.5 text-xs">
                        {productWithBatches.batches.length} {t("batches")}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {productWithBatches && !isAlreadyAdded && isSelected && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(product.code);
                        }}
                        className="inline-flex items-center gap-1 rounded-full bg-white border border-gray-200 px-2.5 py-1 font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {t("batches")}
                        {isExpanded ? (
                          <ChevronUp className="size-3.5" />
                        ) : (
                          <ChevronDown className="size-3.5" />
                        )}
                      </button>
                    )}

                    {isAlreadyAdded ? (
                      <div className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 font-medium text-amber-700">
                        {t("alreadyAdded")}
                      </div>
                    ) : isSelected ? (
                      <div className="inline-flex rounded-full bg-sky-100 px-2.5 py-1 font-medium text-sky-700">
                        {selectedBatchIds.length > 0
                          ? `${selectedBatchIds.length} ${t("batches")}`
                          : t("selectedItems")}
                      </div>
                    ) : null}
                  </div>
                </div>

                {isExpanded && productWithBatches && (
                  <div
                    className="mt-3 rounded-xl border border-sky-100 bg-white p-3 space-y-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <div className="font-semibold text-gray-900">
                        {t("selectBatchesOptional")}
                      </div>
                      <div className="text-gray-500">
                        {t("leaveWithoutBatchesToCreateNew")}
                      </div>
                    </div>

                    {productWithBatches.batches.map((batch) => {
                      const isBatchSelected = selectedBatchIds.includes(batch.id);

                      return (
                        <button
                          key={batch.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBatchSelection(product.code, batch.id);
                          }}
                          className={`w-full rounded-xl border px-3 py-2 text-start transition-all ${
                            isBatchSelected
                              ? "border-sky-400 bg-sky-50"
                              : "border-gray-200 bg-white hover:border-sky-300"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-gray-900">
                                {batch.batchNumber}
                              </div>
                              <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
                                <span>
                                  {t("expiry")}: {batch.expiry}
                                </span>
                                <span>
                                  {t("warehouseLocation")}: {batch.warehouseZone}
                                </span>
                              </div>
                            </div>
                            <div
                              className={`min-w-5 h-5 rounded-full border flex items-center justify-center shrink-0 px-1 ${
                                isBatchSelected
                                  ? "border-sky-500 bg-sky-500 text-white"
                                  : "border-gray-300 bg-white text-transparent"
                              }`}
                            >
                              <Check className="size-3" />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-[11px] mt-2 text-gray-700">
                            <div>
                              <span className="text-gray-500">{t("stockQty")}: </span>
                              {Number(batch.stockQty).toLocaleString("en-GB")}
                            </div>
                            <div>
                              <span className="text-gray-500">{t("cost")}: </span>
                              {batch.avgCost}
                            </div>
                            <div>
                              <span className="text-gray-500">{t("sellingPrice")}: </span>
                              {batch.sellPrice}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
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
            onClick={onCancel}
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
    </>
  );
}
