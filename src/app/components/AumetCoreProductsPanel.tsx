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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isSearchLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="rounded-2xl border border-gray-200 bg-white p-4 animate-pulse"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="size-16 rounded-2xl bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-20 rounded bg-gray-200" />
                      <div className="h-4 w-3/4 rounded bg-gray-200" />
                      <div className="h-3 w-full rounded bg-gray-100" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <div className="h-3 w-14 rounded bg-gray-100" />
                      <div className="h-3 w-full rounded bg-gray-200" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-14 rounded bg-gray-100" />
                      <div className="h-3 w-2/3 rounded bg-gray-200" />
                    </div>
                  </div>
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
                    className={`w-full text-start rounded-2xl border p-4 transition-all relative ${
                      isAlreadyAdded
                        ? "border-amber-200 bg-amber-50/70"
                        : isSelected
                          ? "border-teal-500 bg-teal-50 shadow-sm"
                          : "border-gray-200 bg-white hover:border-teal-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="size-16 rounded-2xl border border-gray-200 bg-white overflow-hidden shrink-0">
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
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-teal-600 mb-1">
                            {product.code}
                          </div>
                          <div className="text-sm font-semibold text-gray-900 line-clamp-2">
                            {language === "ar"
                              ? product.nameAr
                              : product.nameEn}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {language === "ar"
                              ? product.subtitleAr
                              : product.subtitleEn}
                          </div>
                        </div>
                      </div>
                      {!isAlreadyAdded && (
                        <div
                          className={`min-w-6 h-6 rounded-full border flex items-center justify-center shrink-0 px-1 ${
                            isSelected
                              ? "border-teal-500 bg-teal-500 text-white"
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
                        <div className="text-gray-500">{t("avgCostPrice")}</div>
                        <div className="font-medium text-gray-800">
                          {t("jod")} {product.avgCost}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">{t("sellPrice")}</div>
                        <div className="font-medium text-gray-800">
                          {t("jod")} {product.sellPrice}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-3 text-xs">
                      <div className="text-gray-500">
                        {t("manufacturer")}:{" "}
                        {language === "ar"
                          ? product.manufacturerAr
                          : product.manufacturerEn}
                      </div>
                      {isAlreadyAdded ? (
                        <div className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 font-medium text-amber-700">
                          {t("alreadyAdded")}
                        </div>
                      ) : isSelected ? (
                        <div className="inline-flex rounded-full bg-teal-100 px-2.5 py-1 font-medium text-teal-700">
                          {t("selectedItems")}
                        </div>
                      ) : null}
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
