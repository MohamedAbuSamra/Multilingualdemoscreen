import { Boxes, CirclePlus, PackageSearch } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export type ProductSourceOption = "core" | "inventory" | "custom";

interface AddProductSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectSource: (source: ProductSourceOption) => void;
  selectedSource?: ProductSourceOption | null;
}

export function AddProductSourceDialog({
  open,
  onOpenChange,
  onSelectSource,
  selectedSource,
}: AddProductSourceDialogProps) {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";

  const options: {
    source: ProductSourceOption;
    icon: typeof PackageSearch;
    titleKey: string;
    descriptionKey: string;
    accentClassName: string;
  }[] = [
    {
      source: "core",
      icon: PackageSearch,
      titleKey: "sourceAumetCore",
      descriptionKey: "sourceAumetCoreDescription",
      accentClassName: "bg-teal-100 text-teal-600",
    },
    {
      source: "inventory",
      icon: Boxes,
      titleKey: "sourceMyProducts",
      descriptionKey: "sourceMyProductsDescription",
      accentClassName: "bg-sky-100 text-sky-600",
    },
    {
      source: "custom",
      icon: CirclePlus,
      titleKey: "sourceNewProduct",
      descriptionKey: "sourceNewProductDescription",
      accentClassName: "bg-violet-100 text-violet-600",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[760px] w-[92vw] p-0 gap-0 rounded-3xl overflow-hidden">
        <DialogHeader className="px-6 py-5 border-b border-gray-200">
          <div className={isRTL ? "text-right" : "text-left"}>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {t("addProduct")}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              {t("chooseProductSourceDescription")}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="bg-gray-50 p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {options.map((option) => {
            const Icon = option.icon;

            return (
              <button
                key={option.source}
                type="button"
                onClick={() => {
                  onSelectSource(option.source);
                  onOpenChange(false);
                }}
                className={`rounded-2xl border p-5 text-start transition-all hover:shadow-sm hover:-translate-y-0.5 ${
                  selectedSource === option.source
                    ? "border-teal-400 bg-teal-50/70"
                    : "border-gray-200 bg-white"
                } ${isRTL ? "text-right" : "text-left"}`}
              >
                <div
                  className={`size-11 rounded-2xl flex items-center justify-center mb-4 ${option.accentClassName}`}
                >
                  <Icon className="size-5" strokeWidth={2} />
                </div>
                <div className="text-base font-semibold text-gray-900 mb-1.5">
                  {t(option.titleKey)}
                </div>
                <div className="text-sm text-gray-500 leading-6">
                  {t(option.descriptionKey)}
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
