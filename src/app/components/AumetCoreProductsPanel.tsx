import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Filter, Loader2, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useLanguage } from "../contexts/LanguageContext";
import {
  AUMET_CORE_PRODUCTS,
  type AumetCoreProduct,
} from "../data/aumetCoreProductsSample";
import type { ProductCategoryKey } from "../data/pharmacyInventorySample";

interface AumetCoreProductsPanelProps {
  selectedCodes: string[];
  selectedProducts?: AumetCoreProduct[];
  onSelectionChange?: (products: AumetCoreProduct[]) => void;
  onAddProducts: (() => void) | ((products: AumetCoreProduct[]) => void);
  onCancel: () => void;
  isVisible?: boolean;
}

export function AumetCoreProductsPanel({
  selectedCodes,
  selectedProducts,
  onSelectionChange,
  onAddProducts,
  onCancel,
  isVisible = true,
}: AumetCoreProductsPanelProps) {
  const ALL_CATEGORIES = "all";
  const ALL_MANUFACTURERS = "all";
  const ALL_STOCK_STATUS = "all";
  const { t, language } = useLanguage();
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<
    ProductCategoryKey | typeof ALL_CATEGORIES
  >(ALL_CATEGORIES);
  const [manufacturerFilter, setManufacturerFilter] = useState<
    string | typeof ALL_MANUFACTURERS
  >(ALL_MANUFACTURERS);
  const [stockStatusFilter, setStockStatusFilter] = useState<
    "inStock" | "outOfStock" | typeof ALL_STOCK_STATUS
  >(ALL_STOCK_STATUS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const isControlledSelection =
    Array.isArray(selectedProducts) && typeof onSelectionChange === "function";

  const allProducts = useMemo(
    () =>
      Array.from({ length: 10 }, (_, index) =>
        AUMET_CORE_PRODUCTS.map((product) => ({
          ...product,
          id: `${product.id}-${index + 1}`,
          code: `${product.code}-${index + 1}`,
        })),
      ).flat(),
    [],
  );

  const categoryOptions = useMemo(
    () => [
      ALL_CATEGORIES,
      ...Array.from(new Set(allProducts.map((product) => product.categoryKey))),
    ],
    [ALL_CATEGORIES, allProducts],
  );

  const manufacturerOptions = useMemo(
    () => [
      ALL_MANUFACTURERS,
      ...Array.from(
        new Set(
          allProducts.map((product) =>
            language === "ar" ? product.manufacturerAr : product.manufacturerEn,
          ),
        ),
      ),
    ],
    [ALL_MANUFACTURERS, allProducts, language],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return allProducts.filter((product) => {
      const manufacturerLabel =
        language === "ar" ? product.manufacturerAr : product.manufacturerEn;
      const matchesCategory =
        categoryFilter === ALL_CATEGORIES ||
        product.categoryKey === categoryFilter;
      const matchesManufacturer =
        manufacturerFilter === ALL_MANUFACTURERS ||
        manufacturerLabel === manufacturerFilter;
      const matchesStockStatus =
        stockStatusFilter === ALL_STOCK_STATUS ||
        (stockStatusFilter === "inStock"
          ? product.currentStock > 0
          : product.currentStock === 0);

      if (!matchesCategory || !matchesManufacturer || !matchesStockStatus) {
        return false;
      }

      if (!normalizedQuery) return true;

      return [
        product.code,
        product.barcode,
        product.nameEn,
        product.nameAr,
        product.subtitleEn,
        product.subtitleAr,
        product.manufacturerEn,
        product.manufacturerAr,
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [
    ALL_CATEGORIES,
    ALL_MANUFACTURERS,
    ALL_STOCK_STATUS,
    allProducts,
    categoryFilter,
    language,
    manufacturerFilter,
    query,
    stockStatusFilter,
  ]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount],
  );

  useEffect(() => {
    setIsSearchLoading(true);
    setVisibleCount(12);

    const timer = window.setTimeout(() => {
      setIsSearchLoading(false);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [categoryFilter, manufacturerFilter, query, stockStatusFilter]);

  useEffect(() => {
    if (!isControlledSelection || !selectedProducts) return;

    setSelectedIds(selectedProducts.map((product) => product.id));
  }, [isControlledSelection, selectedProducts]);

  useEffect(() => {
    if (isSearchLoading) return;

    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        if (
          firstEntry?.isIntersecting &&
          !isLoadingMore &&
          visibleCount < filteredProducts.length
        ) {
          setIsLoadingMore(true);
          window.setTimeout(() => {
            setVisibleCount((current) =>
              Math.min(current + 12, filteredProducts.length),
            );
            setIsLoadingMore(false);
          }, 700);
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [filteredProducts.length, isLoadingMore, isSearchLoading, visibleCount]);

  const toggleSelection = (productId: string) => {
    if (isControlledSelection) {
      const product = allProducts.find((item) => item.id === productId);

      if (!product || !selectedProducts || !onSelectionChange) return;

      if (selectedIds.includes(productId)) {
        onSelectionChange(
          selectedProducts.filter((item) => item.id !== productId),
        );
        return;
      }

      onSelectionChange([...selectedProducts, product]);
      return;
    }

    setSelectedIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  };

  const handleAdd = () => {
    if (isControlledSelection) {
      (onAddProducts as () => void)();
      return;
    }

    const selectedProducts = allProducts.filter((product) =>
      selectedIds.includes(product.id),
    );

    onAddProducts(selectedProducts);
    setSelectedIds([]);
    setQuery("");
  };

  const resetFilters = () => {
    setCategoryFilter(ALL_CATEGORIES);
    setManufacturerFilter(ALL_MANUFACTURERS);
    setStockStatusFilter(ALL_STOCK_STATUS);
  };

  return (
    <div className={isVisible ? "block" : "hidden"}>
      <div className="px-6 py-4 border-b border-gray-100 bg-white">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchAumetCoreProducts")}
              className="ps-10 pe-10 h-10 rounded-full border-gray-300"
            />
            {isSearchLoading && (
              <Loader2 className="absolute end-3 top-1/2 -translate-y-1/2 size-4 text-teal-600 animate-spin" />
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltersOpen((current) => !current)}
            className={`h-10 gap-2 rounded-full border-gray-300 px-4 text-sm whitespace-nowrap ${
              filtersOpen ? "bg-teal-50 border-teal-600 text-teal-600" : ""
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
                  <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  {t("manufacturer")}
                </label>
                <div className="relative">
                  <select
                    value={manufacturerFilter}
                    onChange={(e) => setManufacturerFilter(e.target.value)}
                    className="w-full appearance-none rounded-full border border-gray-300 bg-white px-4 py-2 pe-10 text-sm text-gray-600 cursor-pointer hover:border-gray-400 focus:border-teal-500 focus:outline-none"
                  >
                    {manufacturerOptions.map((option) => (
                      <option key={option} value={option}>
                        {option === ALL_MANUFACTURERS ? t("all") : option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  {t("stockRange")}
                </label>
                <div className="relative">
                  <select
                    value={stockStatusFilter}
                    onChange={(e) =>
                      setStockStatusFilter(
                        e.target.value as
                          | "inStock"
                          | "outOfStock"
                          | typeof ALL_STOCK_STATUS,
                      )
                    }
                    className="w-full appearance-none rounded-full border border-gray-300 bg-white px-4 py-2 pe-10 text-sm text-gray-600 cursor-pointer hover:border-gray-400 focus:border-teal-500 focus:outline-none"
                  >
                    <option value={ALL_STOCK_STATUS}>{t("all")}</option>
                    <option value="inStock">
                      {language === "ar" ? "متوفر" : "In Stock"}
                    </option>
                    <option value="outOfStock">
                      {language === "ar" ? "غير متوفر" : "Out of Stock"}
                    </option>
                  </select>
                  <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="h-8 px-4 text-sm rounded-full border-gray-300 hover:bg-gray-50"
              >
                {t("reset")}
              </Button>
              <Button
                size="sm"
                onClick={() => setFiltersOpen(false)}
                className="bg-teal-500 hover:bg-teal-600 h-8 px-4 text-sm rounded-full"
              >
                {t("apply")}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="max-h-[60vh] overflow-y-auto bg-gray-50 px-6 py-4">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="grid grid-cols-[minmax(0,2.4fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_auto] gap-3 border-b border-gray-200 bg-gray-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
            <div>{t("product")}</div>
            <div>{t("category")}</div>
            <div>{t("manufacturer")}</div>
            <div>{t("avgCostPrice")}</div>
            <div>{t("sellPrice")}</div>
            <div className="text-end">{t("status")}</div>
          </div>
          {isSearchLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="grid grid-cols-[minmax(0,2.4fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_auto] gap-3 border-b border-gray-100 px-4 py-3 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-xl bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-20 rounded bg-gray-200" />
                      <div className="h-4 w-3/4 rounded bg-gray-200" />
                      <div className="h-3 w-1/2 rounded bg-gray-100" />
                    </div>
                  </div>
                  <div className="h-4 w-20 self-center rounded bg-gray-100" />
                  <div className="h-4 w-24 self-center rounded bg-gray-100" />
                  <div className="h-4 w-14 self-center rounded bg-gray-100" />
                  <div className="h-4 w-14 self-center rounded bg-gray-100" />
                  <div className="h-6 w-16 self-center justify-self-end rounded-full bg-gray-100" />
                </div>
              ))
            : visibleProducts.map((product) => {
                const isSelected = selectedIds.includes(product.id);
                const isAlreadyAdded = selectedCodes.includes(product.code);

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() =>
                      !isAlreadyAdded && toggleSelection(product.id)
                    }
                    className={`grid w-full grid-cols-[minmax(0,2.4fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_auto] gap-3 border-b px-4 py-3 text-start transition-all relative ${
                      isAlreadyAdded
                        ? "border-amber-100 bg-amber-50/70"
                        : isSelected
                          ? "border-teal-100 bg-teal-50"
                          : "border-gray-100 bg-white hover:bg-teal-50/40"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="size-11 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <img
                          src={product.imageUrl}
                          alt={
                            language === "ar" ? product.nameAr : product.nameEn
                          }
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-gray-900">
                          {language === "ar" ? product.nameAr : product.nameEn}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-500">
                          <span className="font-semibold text-teal-600">
                            {product.code}
                          </span>
                          <span className="truncate">{product.barcode}</span>
                        </div>
                      </div>
                    </div>
                    <div className="self-center truncate text-xs text-gray-700">
                      {t(product.categoryKey)}
                    </div>
                    <div className="self-center truncate text-xs text-gray-700">
                      {language === "ar"
                        ? product.manufacturerAr
                        : product.manufacturerEn}
                    </div>
                    <div className="self-center text-xs font-medium text-gray-800">
                      {t("jod")} {product.avgCost}
                    </div>
                    <div className="self-center text-xs font-medium text-gray-800">
                      {t("jod")} {product.sellPrice}
                    </div>
                    <div className="flex items-center justify-end gap-2 self-center">
                      {isAlreadyAdded ? (
                        <div className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                          {t("alreadyAdded")}
                        </div>
                      ) : isSelected ? (
                        <div className="inline-flex rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-medium text-teal-700">
                          {t("selectedItems")}
                        </div>
                      ) : null}
                      {!isAlreadyAdded && (
                        <div
                          className={`flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full border px-1 ${
                            isSelected
                              ? "border-teal-500 bg-teal-500 text-white"
                              : "border-gray-300 bg-white text-transparent"
                          }`}
                        >
                          <Check className="size-3" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
        </div>

        {!isSearchLoading && filteredProducts.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-sm text-gray-500">
            {t("noAumetCoreProductsFound")}
          </div>
        )}

        {!isSearchLoading && filteredProducts.length > 0 && (
          <>
            <div ref={loadMoreRef} className="h-4" />
            {isLoadingMore && (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-500">
                <Loader2 className="size-4 animate-spin text-teal-600" />
                {t("loadingMoreProducts")}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
