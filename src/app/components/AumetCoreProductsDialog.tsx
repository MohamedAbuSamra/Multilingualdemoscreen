import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Package2,
  Search,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useLanguage } from "../contexts/LanguageContext";
import {
  AUMET_CORE_PRODUCTS,
  type AumetCoreProduct,
} from "../data/aumetCoreProductsSample";

interface AumetCoreProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCodes: string[];
  onAddProducts: (products: AumetCoreProduct[]) => void;
  onBackToSource?: () => void;
}

export function AumetCoreProductsDialog({
  open,
  onOpenChange,
  selectedCodes,
  onAddProducts,
  onBackToSource,
}: AumetCoreProductsDialogProps) {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

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

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return allProducts.filter((product) => {
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
  }, [allProducts, query]);

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
  }, [query]);

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
    setSelectedIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  };

  const handleAdd = () => {
    const selectedProducts = allProducts.filter((product) =>
      selectedIds.includes(product.id),
    );

    onAddProducts(selectedProducts);
    setSelectedIds([]);
    setQuery("");
    onOpenChange(false);
  };

  const resetDialogState = () => {
    setSelectedIds([]);
    setQuery("");
    setVisibleCount(12);
    setIsLoadingMore(false);
    setIsSearchLoading(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetDialogState();
      onOpenChange(false);
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
              <div className="size-10 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
                <Package2 className="size-5 text-teal-600" strokeWidth={2} />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  {t("aumetCoreProducts")}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-1">
                  {t("aumetCoreProductsDescription")}
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
                placeholder={t("searchAumetCoreProducts")}
                className="ps-10 pe-10 h-10 rounded-full border-gray-300"
              />
              {isSearchLoading && (
                <Loader2 className="absolute end-3 top-1/2 -translate-y-1/2 size-4 text-teal-600 animate-spin" />
              )}
            </div>
            <div className="text-sm text-gray-500 whitespace-nowrap">
              {selectedIds.length} {t("selectedItems")}
            </div>
          </div>
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
                          <div className="text-gray-500">
                            {t("avgCostPrice")}
                          </div>
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

        <div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-between gap-3">
          <div className="text-sm text-gray-500">
            {t("selectProductsToAddToManualStock")}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => {
                resetDialogState();
                onOpenChange(false);
              }}
              className="h-10 px-5 rounded-full border-gray-300"
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleAdd}
              disabled={selectedIds.length === 0}
              className="h-10 px-5 rounded-full bg-teal-500 hover:bg-teal-600"
            >
              {t("addSelectedProducts")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
