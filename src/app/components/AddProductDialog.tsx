import { useEffect, useState } from "react";
import { Boxes, Loader2, Package, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useLanguage } from "../contexts/LanguageContext";
import { AumetCoreProductsPanel } from "./AumetCoreProductsPanel";
import {
  MyProductsPanel,
  type SelectedInventoryProductWithBatches,
} from "./MyProductsPanel";
import {
  ManualStockCustomProductPanel,
  type ManualCustomProductInput,
} from "./ManualStockCustomProductPanel";
import type { AumetCoreProduct } from "../data/aumetCoreProductsSample";

export type AddProductSource = "core" | "inventory" | "custom";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeSource: AddProductSource;
  onActiveSourceChange: (source: AddProductSource) => void;
  availableSources?: AddProductSource[];
  selectedCodes: string[];
  onAddCoreProducts: (products: AumetCoreProduct[]) => void;
  onAddInventoryProducts: (
    products: SelectedInventoryProductWithBatches[],
  ) => void;
  onAddCustomProduct: (product: ManualCustomProductInput) => void;
}

export function AddProductDialog({
  open,
  onOpenChange,
  activeSource,
  onActiveSourceChange,
  availableSources = ["core", "inventory", "custom"],
  selectedCodes,
  onAddCoreProducts,
  onAddInventoryProducts,
  onAddCustomProduct,
}: AddProductDialogProps) {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";
  const [isOpeningLoading, setIsOpeningLoading] = useState(false);
  const [selectedCoreProducts, setSelectedCoreProducts] = useState<
    AumetCoreProduct[]
  >([]);
  const [selectedInventoryProducts, setSelectedInventoryProducts] = useState<
    SelectedInventoryProductWithBatches[]
  >([]);

  const totalSelectedCount =
    selectedCoreProducts.length + selectedInventoryProducts.length;

  const sourceOptions: {
    key: AddProductSource;
    label: string;
    description: string;
    icon: typeof Sparkles;
    iconClassName: string;
  }[] = [
    {
      key: "core",
      label: t("browseAumetCore"),
      description:
        language === "ar"
          ? "ابحث وأضف من كتالوج Aumet Core"
          : "Search and add from the Aumet Core catalog",
      icon: Sparkles,
      iconClassName: "bg-emerald-100 text-emerald-700",
    },
    {
      key: "inventory",
      label: language === "ar" ? "مخزوني" : "My Inventory",
      description:
        language === "ar"
          ? "اختر من منتجات مخزونك الحالية"
          : "Choose from your current inventory products",
      icon: Boxes,
      iconClassName: "bg-blue-100 text-blue-700",
    },
    {
      key: "custom",
      label: t("createProduct"),
      description:
        language === "ar"
          ? "أنشئ منتجًا جديدًا وأضفه مباشرة إلى الجدول"
          : "Create a new product and add it directly to the table",
      icon: Package,
      iconClassName: "bg-violet-100 text-violet-700",
    },
  ];
  const visibleSourceOptions = sourceOptions.filter((option) =>
    availableSources.includes(option.key),
  );
  const defaultSource = visibleSourceOptions[0]?.key ?? "core";

  useEffect(() => {
    if (!open) {
      setIsOpeningLoading(false);
      return;
    }

    setIsOpeningLoading(true);
    onActiveSourceChange(defaultSource);

    const timer = window.setTimeout(() => {
      setIsOpeningLoading(false);
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [defaultSource, onActiveSourceChange, open]);

  const handleAddSelected = () => {
    if (selectedCoreProducts.length > 0) {
      onAddCoreProducts(selectedCoreProducts);
    }

    if (selectedInventoryProducts.length > 0) {
      onAddInventoryProducts(selectedInventoryProducts);
    }

    if (
      selectedCoreProducts.length > 0 ||
      selectedInventoryProducts.length > 0
    ) {
      setSelectedCoreProducts([]);
      setSelectedInventoryProducts([]);
      onOpenChange(false);
    }
  };

  const showLoading = isOpeningLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1100px] w-[92vw] p-0 gap-0 rounded-3xl overflow-hidden">
        <DialogHeader className="px-6 py-5 border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white">
          <div className={isRTL ? "text-right" : "text-left"}>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {t("addProduct")}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              {language === "ar"
                ? "اختر المصدر المناسب لإضافة المنتجات إلى الجدول"
                : "Choose the right source to add products to the table"}
            </DialogDescription>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-4">
            {visibleSourceOptions.map((option) => {
              const Icon = option.icon;
              const isActive = activeSource === option.key;

              return (
                <button
                  key={option.key}
                  type="button"
                  disabled={isOpeningLoading}
                  onClick={() => onActiveSourceChange(option.key)}
                  className={`rounded-2xl border p-3 text-start transition-all ${
                    isActive
                      ? "border-teal-500 bg-teal-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50/40"
                  } ${isOpeningLoading ? "cursor-wait opacity-70" : "cursor-pointer"}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${option.iconClassName}`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900">
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 leading-5">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </DialogHeader>

        {showLoading ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 bg-white px-6 py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-teal-50 text-teal-600">
              <Loader2 className="size-5 animate-spin" />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold text-gray-900">
                {language === "ar" ? "جاري التحميل" : "Loading"}
              </div>
              <div className="text-xs text-gray-500">
                {language === "ar"
                  ? "يتم تجهيز قائمة المنتجات"
                  : "Preparing the product list"}
              </div>
            </div>
          </div>
        ) : (
          <>
            <AumetCoreProductsPanel
              selectedCodes={selectedCodes}
              selectedProducts={selectedCoreProducts}
              onSelectionChange={setSelectedCoreProducts}
              onAddProducts={handleAddSelected}
              onCancel={() => onOpenChange(false)}
              isVisible={activeSource === "core"}
            />
            <MyProductsPanel
              selectedCodes={selectedCodes}
              selectedProducts={selectedInventoryProducts}
              onSelectionChange={setSelectedInventoryProducts}
              onAddProducts={handleAddSelected}
              onCancel={() => onOpenChange(false)}
              isVisible={activeSource === "inventory"}
            />
            {activeSource === "custom" && (
              <ManualStockCustomProductPanel
                existingCodes={selectedCodes}
                onAddProduct={(product) => {
                  onAddCustomProduct(product);
                  onOpenChange(false);
                }}
                onCancel={() => onOpenChange(false)}
              />
            )}
          </>
        )}

        {activeSource !== "custom" && !showLoading && (
          <div className="border-t border-gray-200 bg-white px-6 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-gray-500">
                {language === "ar"
                  ? `تم تحديد ${totalSelectedCount} منتج`
                  : `${totalSelectedCount} products selected`}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="h-10 rounded-full border-gray-300 px-5"
                >
                  {t("cancel")}
                </Button>
                <Button
                  onClick={handleAddSelected}
                  disabled={totalSelectedCount === 0}
                  className="h-10 rounded-full bg-teal-500 px-5 hover:bg-teal-600"
                >
                  {t("addSelectedProducts")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
