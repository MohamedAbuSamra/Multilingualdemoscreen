import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Filter,
  Loader2,
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
  onAddProducts: (products: SelectedInventoryProductWithBatches[]) => void;
  onCancel: () => void;
}

export function MyProductsPanel({
  selectedCodes,
  onAddProducts,
  onCancel,
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {isSearchLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="animate-pulse rounded-2xl border border-gray-200 bg-white p-4"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-3 w-20 rounded bg-gray-200" />
                      <div className="h-4 w-3/4 rounded bg-gray-200" />
                      <div className="h-3 w-full rounded bg-gray-100" />
                    </div>
                    <div className="size-6 shrink-0 rounded-full bg-gray-200" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-2">
                      <div className="h-3 w-14 rounded bg-gray-100" />
                      <div className="h-3 w-full rounded bg-gray-200" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-14 rounded bg-gray-100" />
                      <div className="h-3 w-2/3 rounded bg-gray-200" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-16 rounded bg-gray-100" />
                      <div className="h-3 w-1/2 rounded bg-gray-200" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-16 rounded bg-gray-100" />
                      <div className="h-3 w-2/3 rounded bg-gray-200" />
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                    <div className="h-6 w-20 rounded-full bg-gray-100" />
                    <div className="h-6 w-16 rounded-full bg-gray-100" />
                  </div>
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
                  <button
                    key={product.code}
                    type="button"
                    onClick={() =>
                      !isAlreadyAdded && toggleSelection(product.code)
                    }
                    className={`relative block w-full rounded-2xl border p-4 text-start transition-all ${
                      isAlreadyAdded
                        ? "border-amber-200 bg-amber-50/70"
                        : isSelected
                          ? "border-sky-500 bg-sky-50 shadow-sm"
                          : "border-gray-200 bg-white hover:border-sky-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="mb-1 text-xs font-semibold text-sky-600">
                          {product.code}
                        </div>
                        <div className="line-clamp-2 text-sm font-semibold text-gray-900">
                          {language === "ar" ? product.nameAr : product.nameEn}
                        </div>
                        <div className="mt-1 line-clamp-2 text-xs text-gray-500">
                          {language === "ar"
                            ? product.subtitleAr
                            : product.subtitleEn}
                        </div>
                      </div>

                      {!isAlreadyAdded && (
                        <div
                          className={`flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full border px-1 ${
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

                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-100 pt-3 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 hover:bg-gray-100">
                          {product.warehouseZone}
                        </Badge>
                        <Badge className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 hover:bg-gray-100">
                          {product.lotBatch}
                        </Badge>
                        {productWithBatches && (
                          <Badge className="rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-700 hover:bg-sky-100">
                            {productWithBatches.batches.length} {t("batches")}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {productWithBatches &&
                          !isAlreadyAdded &&
                          isSelected && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpanded(product.code);
                              }}
                              className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 font-medium text-gray-700 hover:bg-gray-50"
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
                        className="mt-3 space-y-2 rounded-xl border border-sky-100 bg-white p-3"
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
                                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                                    <span>
                                      {t("expiry")}: {batch.expiry}
                                    </span>
                                    <span>
                                      {t("warehouseLocation")}:{" "}
                                      {batch.warehouseZone}
                                    </span>
                                  </div>
                                </div>
                                <div
                                  className={`flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full border px-1 ${
                                    isBatchSelected
                                      ? "border-sky-500 bg-sky-500 text-white"
                                      : "border-gray-300 bg-white text-transparent"
                                  }`}
                                >
                                  <Check className="size-3" />
                                </div>
                              </div>
                              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-gray-700">
                                <div>
                                  <span className="text-gray-500">
                                    {t("stockQty")}:{" "}
                                  </span>
                                  {Number(batch.stockQty).toLocaleString(
                                    "en-GB",
                                  )}
                                </div>
                                <div>
                                  <span className="text-gray-500">
                                    {t("cost")}:{" "}
                                  </span>
                                  {batch.avgCost}
                                </div>
                                <div>
                                  <span className="text-gray-500">
                                    {t("sellingPrice")}:{" "}
                                  </span>
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

        {!isSearchLoading && filteredProducts.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
            {t("noMyProductsFound")}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-gray-200 bg-white px-6 py-4">
        <div className="text-sm text-gray-500">
          {t("selectProductsFromInventory")}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="h-10 rounded-full border-gray-300 px-5"
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleAdd}
            disabled={selectedCodesState.length === 0}
            className="h-10 rounded-full bg-sky-500 px-5 hover:bg-sky-600"
          >
            {t("addSelectedProducts")}
          </Button>
        </div>
      </div>
    </>
  );
}
