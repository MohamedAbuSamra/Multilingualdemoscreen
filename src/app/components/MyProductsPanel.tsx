import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Filter,
  Loader2,
  Package,
  Search,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useLanguage } from "../contexts/LanguageContext";
import {
  PHARMACY_INVENTORY_PRODUCTS,
  type ProductStatusKey,
  type ProductCategoryKey,
  type PharmacyInventoryRow,
} from "../data/pharmacyInventorySample";
import { PHARMACY_INVENTORY_PRODUCTS_V2 } from "../data/pharmacyInventoryProducts";

export interface SelectedInventoryProductWithBatches {
  product: PharmacyInventoryRow;
  selectedBatchIds: string[];
}

interface MyProductsPanelProps {
  selectedCodes: string[];
  selectedProducts?: SelectedInventoryProductWithBatches[];
  onSelectionChange?: (products: SelectedInventoryProductWithBatches[]) => void;
  onAddProducts:
    | (() => void)
    | ((products: SelectedInventoryProductWithBatches[]) => void);
  onCancel: () => void;
  isVisible?: boolean;
}

export function MyProductsPanel({
  selectedCodes,
  selectedProducts,
  onSelectionChange,
  onAddProducts,
  onCancel,
  isVisible = true,
}: MyProductsPanelProps) {
  const ALL_CATEGORIES = "all";
  const ALL_WAREHOUSES = "all";
  const ALL_STATUS = "all";
  const { t, language } = useLanguage();
  const isRTL = language === "ar";
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<
    ProductCategoryKey | typeof ALL_CATEGORIES
  >(ALL_CATEGORIES);
  const [warehouseFilter, setWarehouseFilter] = useState<
    string | typeof ALL_WAREHOUSES
  >(ALL_WAREHOUSES);
  const [statusFilter, setStatusFilter] = useState<
    ProductStatusKey | typeof ALL_STATUS
  >(ALL_STATUS);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [selectedCodesState, setSelectedCodesState] = useState<string[]>([]);
  const [expandedCodes, setExpandedCodes] = useState<string[]>([]);
  const [selectedBatchIdsByCode, setSelectedBatchIdsByCode] = useState<
    Record<string, string[]>
  >({});

  const isControlledSelection =
    Array.isArray(selectedProducts) && typeof onSelectionChange === "function";

  const categoryOptions = useMemo(
    () => [
      ALL_CATEGORIES,
      ...Array.from(
        new Set(
          PHARMACY_INVENTORY_PRODUCTS.map((product) => product.categoryKey),
        ),
      ),
    ],
    [ALL_CATEGORIES],
  );

  const warehouseOptions = useMemo(
    () => [
      ALL_WAREHOUSES,
      ...Array.from(
        new Set(
          PHARMACY_INVENTORY_PRODUCTS.map((product) => product.warehouseZone),
        ),
      ),
    ],
    [ALL_WAREHOUSES],
  );

  const statusOptions = useMemo(
    () => [
      ALL_STATUS,
      ...Array.from(
        new Set(
          PHARMACY_INVENTORY_PRODUCTS.map(
            (product) => product.statusKey,
          ).filter(Boolean),
        ),
      ),
    ],
    [ALL_STATUS],
  );

  useEffect(() => {
    setIsSearchLoading(true);

    const timer = window.setTimeout(() => {
      setIsSearchLoading(false);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!isControlledSelection) return;

    setSelectedCodesState(selectedProducts.map(({ product }) => product.code));
    setSelectedBatchIdsByCode(
      selectedProducts.reduce<Record<string, string[]>>((accumulator, item) => {
        accumulator[item.product.code] = item.selectedBatchIds;
        return accumulator;
      }, {}),
    );
  }, [isControlledSelection, selectedProducts]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return PHARMACY_INVENTORY_PRODUCTS.filter((product) => {
      const matchesCategory =
        categoryFilter === ALL_CATEGORIES ||
        product.categoryKey === categoryFilter;
      const matchesWarehouse =
        warehouseFilter === ALL_WAREHOUSES ||
        product.warehouseZone === warehouseFilter;
      const matchesStatus =
        statusFilter === ALL_STATUS || product.statusKey === statusFilter;

      if (!matchesCategory || !matchesWarehouse || !matchesStatus) return false;

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
  }, [
    ALL_CATEGORIES,
    ALL_STATUS,
    ALL_WAREHOUSES,
    categoryFilter,
    query,
    statusFilter,
    warehouseFilter,
  ]);

  const resetFilters = () => {
    setCategoryFilter(ALL_CATEGORIES);
    setWarehouseFilter(ALL_WAREHOUSES);
    setStatusFilter(ALL_STATUS);
  };

  const toggleSelection = (productCode: string) => {
    if (isControlledSelection) {
      const product = PHARMACY_INVENTORY_PRODUCTS.find(
        (item) => item.code === productCode,
      );

      if (!product || !selectedProducts || !onSelectionChange) return;

      if (selectedCodesState.includes(productCode)) {
        onSelectionChange(
          selectedProducts.filter((item) => item.product.code !== productCode),
        );
        return;
      }

      onSelectionChange([
        ...selectedProducts,
        {
          product,
          selectedBatchIds: [],
        },
      ]);
      return;
    }

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
    if (isControlledSelection) {
      if (!selectedProducts || !onSelectionChange) return;

      onSelectionChange(
        selectedProducts.map((item) => {
          if (item.product.code !== productCode) return item;

          const next = item.selectedBatchIds.includes(batchId)
            ? item.selectedBatchIds.filter((id) => id !== batchId)
            : [...item.selectedBatchIds, batchId];

          return {
            ...item,
            selectedBatchIds: next,
          };
        }),
      );
      return;
    }

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
    if (isControlledSelection) {
      (onAddProducts as () => void)();
      return;
    }

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
    <div className={isVisible ? "block" : "hidden"}>
      <div className="border-b border-gray-100 bg-white px-6 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1">
            {isSearchLoading ? (
              <Loader2 className="absolute start-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-sky-500" />
            ) : (
              <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            )}
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchMyProducts")}
              dir={isRTL ? "rtl" : "ltr"}
              className={`h-10 rounded-full border-gray-300 ps-10 ${isRTL ? "text-right" : "text-left"}`}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltersOpen((current) => !current)}
            className={`h-10 gap-2 rounded-full border-gray-300 px-4 text-sm whitespace-nowrap ${
              filtersOpen ? "border-teal-600 bg-teal-50 text-teal-600" : ""
            }`}
          >
            <Filter className="size-4" strokeWidth={2} />
            {t("filters")}
          </Button>
        </div>

        {filtersOpen && (
          <div className="mt-2 border-t border-gray-200 pt-2.5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  {t("categoryFilter")}
                </label>
                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(e) =>
                      setCategoryFilter(
                        e.target.value as
                          | ProductCategoryKey
                          | typeof ALL_CATEGORIES,
                      )
                    }
                    className="w-full appearance-none rounded-full border border-gray-300 bg-white px-4 py-2 pe-10 text-sm text-gray-600 cursor-pointer hover:border-gray-400 focus:border-teal-500 focus:outline-none"
                  >
                    {categoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option === ALL_CATEGORIES ? t("all") : t(option)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  {t("warehouse")}
                </label>
                <div className="relative">
                  <select
                    value={warehouseFilter}
                    onChange={(e) => setWarehouseFilter(e.target.value)}
                    className="w-full appearance-none rounded-full border border-gray-300 bg-white px-4 py-2 pe-10 text-sm text-gray-600 cursor-pointer hover:border-gray-400 focus:border-teal-500 focus:outline-none"
                  >
                    {warehouseOptions.map((option) => (
                      <option key={option} value={option}>
                        {option === ALL_WAREHOUSES ? t("all") : option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  {t("status")}
                </label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value as ProductStatusKey | typeof ALL_STATUS,
                      )
                    }
                    className="w-full appearance-none rounded-full border border-gray-300 bg-white px-4 py-2 pe-10 text-sm text-gray-600 cursor-pointer hover:border-gray-400 focus:border-teal-500 focus:outline-none"
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option === ALL_STATUS ? t("all") : t(option)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
                </div>
              </div>
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="h-8 rounded-full border-gray-300 px-4 text-sm hover:bg-gray-50"
              >
                {t("reset")}
              </Button>
              <Button
                size="sm"
                onClick={() => setFiltersOpen(false)}
                className="h-8 rounded-full bg-teal-500 px-4 text-sm hover:bg-teal-600"
              >
                {t("apply")}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="max-h-[60vh] overflow-y-auto bg-gray-50 px-6 py-4">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="grid grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,1.2fr)_auto] gap-3 border-b border-gray-200 bg-gray-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
            <div>{t("product")}</div>
            <div>{t("category")}</div>
            <div>{t("currentStock")}</div>
            <div>{t("sellingPrice")}</div>
            <div>{t("warehouseLocation")}</div>
            <div className="text-end">{t("status")}</div>
          </div>
          {isSearchLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="grid grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,1.2fr)_auto] gap-3 border-b border-gray-100 px-4 py-3 animate-pulse"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-3 w-20 rounded bg-gray-200" />
                      <div className="h-4 w-3/4 rounded bg-gray-200" />
                      <div className="h-3 w-1/2 rounded bg-gray-100" />
                    </div>
                  </div>
                  <div className="h-4 w-20 self-center rounded bg-gray-100" />
                  <div className="h-4 w-14 self-center rounded bg-gray-100" />
                  <div className="h-4 w-14 self-center rounded bg-gray-100" />
                  <div className="h-6 w-24 self-center rounded-full bg-gray-100" />
                  <div className="h-6 w-16 self-center justify-self-end rounded-full bg-gray-100" />
                </div>
              ))
            : filteredProducts.map((product) => {
                const isSelected = selectedCodesState.includes(product.code);
                const isAlreadyAdded = selectedCodes.includes(product.code);
                const isExpanded = expandedCodes.includes(product.code);
                const productWithBatches = PHARMACY_INVENTORY_PRODUCTS_V2.find(
                  (item) => item.code === product.code,
                );
                const selectedBatchIds =
                  selectedBatchIdsByCode[product.code] ?? [];

                return (
                  <div
                    key={product.code}
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        !isAlreadyAdded && toggleSelection(product.code)
                      }
                      className={`relative grid w-full grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,1.2fr)_auto] gap-3 px-4 py-3 text-start transition-all ${
                        isAlreadyAdded
                          ? "bg-amber-50/70"
                          : isSelected
                            ? "bg-sky-50"
                            : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="size-11 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={
                                language === "ar"
                                  ? product.nameAr
                                  : product.nameEn
                              }
                              className="size-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center bg-gray-50 text-gray-400">
                              <Package className="size-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-gray-900">
                            {language === "ar"
                              ? product.nameAr
                              : product.nameEn}
                          </div>
                          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-500">
                            <span className="font-semibold text-sky-600">
                              {product.code}
                            </span>
                            <span className="truncate">{product.barcode}</span>
                          </div>
                        </div>
                      </div>
                      <div className="self-center truncate text-xs text-gray-700">
                        {t(product.categoryKey)}
                      </div>
                      <div className="self-center text-xs font-medium text-gray-800">
                        {Number(product.stockQty).toLocaleString("en-GB")}
                      </div>
                      <div className="self-center text-xs font-medium text-gray-800">
                        {t("jod")} {product.sellPrice}
                      </div>
                      <div className="flex min-w-0 flex-wrap items-center gap-1.5 self-center">
                        <Badge className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700 hover:bg-gray-100">
                          {product.warehouseZone}
                        </Badge>
                        <Badge className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700 hover:bg-gray-100">
                          {product.lotBatch}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-end gap-2 self-center">
                        {productWithBatches &&
                          !isAlreadyAdded &&
                          isSelected && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpanded(product.code);
                              }}
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors ${
                                isExpanded
                                  ? "border-sky-200 bg-sky-100 text-sky-700"
                                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                              }`}
                              aria-expanded={isExpanded}
                            >
                              {isExpanded ? t("collapse") : t("viewBatches")}
                              {isExpanded ? (
                                <ChevronUp className="size-3.5" />
                              ) : (
                                <ChevronDown className="size-3.5" />
                              )}
                            </button>
                          )}
                        {isAlreadyAdded ? (
                          <div className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                            {t("alreadyAdded")}
                          </div>
                        ) : isSelected ? (
                          <div className="inline-flex rounded-full border border-sky-200 bg-white px-2 py-0.5 text-[10px] font-medium text-sky-700">
                            {t("selectedItems")}
                          </div>
                        ) : null}
                        {!isAlreadyAdded && (
                          <div
                            className={`flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full border px-1 ${
                              isSelected
                                ? "border-sky-500 bg-sky-500 text-white"
                                : "border-gray-300 bg-white text-transparent"
                            }`}
                          >
                            <Check className="size-3" />
                          </div>
                        )}
                      </div>
                    </button>

                    {isExpanded && productWithBatches && (
                      <div
                        className="border-t border-sky-100 bg-sky-50/40 px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-sky-100 bg-white/80 px-3 py-2 text-xs">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {t("selectBatchesOptional")}
                            </div>
                            <div className="mt-0.5 text-gray-500">
                              {t("leaveWithoutBatchesToCreateNew")}
                            </div>
                          </div>
                          <div className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-700">
                            {productWithBatches.batches.length} {t("batches")}
                          </div>
                        </div>
                        <div className="space-y-2">
                          {productWithBatches.batches.map((batch) => {
                            const isBatchSelected = selectedBatchIds.includes(
                              batch.id,
                            );

                            return (
                              <button
                                key={batch.id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleBatchSelection(product.code, batch.id);
                                }}
                                className={`grid w-full grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_auto] gap-3 rounded-xl border px-3 py-2 text-start transition-all ${
                                  isBatchSelected
                                    ? "border-sky-400 bg-sky-50"
                                    : "border-gray-200 bg-white hover:border-sky-300"
                                }`}
                              >
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold text-gray-900">
                                    {batch.batchNumber}
                                  </div>
                                  <div className="mt-0.5 truncate text-[11px] text-gray-500">
                                    {t("expiry")}: {batch.expiry}
                                  </div>
                                </div>
                                <div className="self-center text-[11px] text-gray-700">
                                  {batch.warehouseZone}
                                </div>
                                <div className="self-center text-[11px] text-gray-700">
                                  {Number(batch.stockQty).toLocaleString(
                                    "en-GB",
                                  )}
                                </div>
                                <div className="self-center text-[11px] text-gray-700">
                                  {t("jod")} {batch.sellPrice}
                                </div>
                                <div
                                  className={`flex h-5 min-w-5 shrink-0 items-center justify-center justify-self-end rounded-full border px-1 ${
                                    isBatchSelected
                                      ? "border-sky-500 bg-sky-500 text-white"
                                      : "border-gray-300 bg-white text-transparent"
                                  }`}
                                >
                                  <Check className="size-3" />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
        </div>

        {!isSearchLoading && filteredProducts.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
            {t("noMyProductsFound")}
          </div>
        )}
      </div>
    </div>
  );
}
