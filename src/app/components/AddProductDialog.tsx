import { Boxes, Package, Sparkles } from "lucide-react";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useLanguage } from "../contexts/LanguageContext";
import {
  AumetCoreProductsPanel,
} from "./AumetCoreProductsPanel";
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
  selectedCodes,
  onAddCoreProducts,
  onAddInventoryProducts,
  onAddCustomProduct,
}: AddProductDialogProps) {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";

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
      label: t("myProducts"),
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1100px] w-[92vw] p-0 gap-0 rounded-3xl overflow-hidden">
        <DialogHeader className="px-6 py-5 border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white">
          <div className="flex items-start justify-between gap-4 flex-wrap">
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
            <Badge className="rounded-full bg-teal-50 text-teal-700 hover:bg-teal-50 px-2.5 py-1 text-[10px] font-medium">
              {selectedCodes.length} {language === "ar" ? "منتج محدد" : "products selected"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-4">
            {sourceOptions.map((option) => {
              const Icon = option.icon;
              const isActive = activeSource === option.key;

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => onActiveSourceChange(option.key)}
                  className={`rounded-2xl border p-3 text-start transition-all ${
                    isActive
                      ? "border-teal-500 bg-teal-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50/40"
                  }`}
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

        {activeSource === "core" ? (
          <AumetCoreProductsPanel
            selectedCodes={selectedCodes}
            onAddProducts={(products) => {
              onAddCoreProducts(products);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        ) : activeSource === "inventory" ? (
          <MyProductsPanel
            selectedCodes={selectedCodes}
            onAddProducts={(products) => {
              onAddInventoryProducts(products);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        ) : (
          <ManualStockCustomProductPanel
            existingCodes={selectedCodes}
            onAddProduct={(product) => {
              onAddCustomProduct(product);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
