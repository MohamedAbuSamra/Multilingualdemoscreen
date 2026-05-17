import React, { useEffect, useMemo, useState } from "react";
import {
  InventoryBatchActionDialog,
  type InventoryBatchActionDialogMode,
  type InventoryBatchActionTarget,
} from "./InventoryBatchActionDialog";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  History,
  Printer,
  Upload,
  FileEdit,
  PackagePlus,
  Search,
  Filter,
  Download,
  MoreVertical,
  ShoppingBag,
  FileText,
  ArrowDownToLine,
  ArrowUpFromLine,
  PencilLine,
  ArrowUpRight,
  Tags,
  Factory,
  Shapes,
  CheckCircle2,
  FileSpreadsheet,
  Sparkles,
  Gift,
  Store,
  ShoppingCart,
  Receipt,
  PackageCheck,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useLanguage } from "../contexts/LanguageContext";
import { FiltersSection } from "./FiltersSection";
import { CreateProductDialog } from "./CreateProductDialog";
import { ImportInventoryDialog } from "./ImportInventoryDialog";
import {
  INVENTORY_PRODUCT_COUNT_V2,
  PHARMACY_INVENTORY_PRODUCTS_V2,
} from "../data/pharmacyInventoryProducts";

interface InventoryPageProps {
  onNavigate: (
    page:
      | "products"
      | "updateStock"
      | "manualUpdateStock"
      | "stockHistoryDetails"
      | "fullProductCreation"
      | "viewProduct",
    options?: {
      manualUpdateEntryPoint?: "default" | "onboarding";
    },
  ) => void;
}

type InventoryQuickFilter = "all" | "stagnant" | "expiringSoon" | "lowStock";
type CreateEntityType = "brand" | "category" | "manufacturer";
type DerivedInventoryStatus = {
  statusKey:
    | "productStatusExpiringSoon"
    | "productStatusExpired"
    | "productStatusLowStock"
    | "productStatusOutOfStock"
    | "";
  statusColor: "red" | "yellow" | "orange" | "";
  nearestExpiry: string;
  totalStockQty: number;
};

const LOW_STOCK_THRESHOLD = 30;
const EXPIRING_SOON_MONTHS = 3;

const parseExpiryMonth = (expiry: string) => {
  const [year, month] = expiry.split("-").map(Number);

  if (!year || !month) {
    return null;
  }

  return new Date(year, month - 1, 1);
};

const getDerivedInventoryStatus = (
  product: (typeof PHARMACY_INVENTORY_PRODUCTS_V2)[number],
): DerivedInventoryStatus => {
  const totalStockQty = product.batches.reduce(
    (sum, batch) => sum + (Number(batch.stockQty) || 0),
    0,
  );
  const expiryDates = product.batches
    .map((batch) => ({
      raw: batch.expiry,
      date: parseExpiryMonth(batch.expiry),
    }))
    .filter(
      (batch): batch is { raw: string; date: Date } =>
        batch.date instanceof Date,
    )
    .sort((left, right) => left.date.getTime() - right.date.getTime());

  const nearestExpiry = expiryDates[0]?.raw ?? product.batches[0]?.expiry ?? "";
  const nearestExpiryDate = expiryDates[0]?.date ?? null;
  const currentMonth = new Date(2026, 4, 1);
  const expiringSoonCutoff = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + EXPIRING_SOON_MONTHS,
    1,
  );

  if (totalStockQty <= 0) {
    return {
      statusKey: "productStatusOutOfStock",
      statusColor: "red",
      nearestExpiry,
      totalStockQty,
    };
  }

  if (nearestExpiryDate && nearestExpiryDate < currentMonth) {
    return {
      statusKey: "productStatusExpired",
      statusColor: "red",
      nearestExpiry,
      totalStockQty,
    };
  }

  if (nearestExpiryDate && nearestExpiryDate <= expiringSoonCutoff) {
    return {
      statusKey: "productStatusExpiringSoon",
      statusColor: "yellow",
      nearestExpiry,
      totalStockQty,
    };
  }

  if (totalStockQty <= LOW_STOCK_THRESHOLD) {
    return {
      statusKey: "productStatusLowStock",
      statusColor: "orange",
      nearestExpiry,
      totalStockQty,
    };
  }

  return {
    statusKey: "",
    statusColor: "",
    nearestExpiry,
    totalStockQty,
  };
};

const CREATE_ENTITY_COPY: Record<
  CreateEntityType,
  {
    title: { en: string; ar: string };
    description: { en: string; ar: string };
    fieldLabel: { en: string; ar: string };
    fieldPlaceholder: { en: string; ar: string };
    submitLabel: { en: string; ar: string };
    icon: typeof Tags;
  }
> = {
  brand: {
    title: { en: "Create New Brand", ar: "إنشاء علامة تجارية جديدة" },
    description: {
      en: "Add a new brand so it can be used while creating products.",
      ar: "أضف علامة تجارية جديدة لاستخدامها أثناء إنشاء المنتجات.",
    },
    fieldLabel: { en: "Brand Name", ar: "اسم العلامة التجارية" },
    fieldPlaceholder: {
      en: "Enter brand name",
      ar: "أدخل اسم العلامة التجارية",
    },
    submitLabel: { en: "Create Brand", ar: "إنشاء علامة تجارية" },
    icon: Tags,
  },
  category: {
    title: { en: "Create New Category", ar: "إنشاء فئة جديدة" },
    description: {
      en: "Add a new category to organize products in inventory.",
      ar: "أضف فئة جديدة لتنظيم المنتجات في المخزون.",
    },
    fieldLabel: { en: "Category Name", ar: "اسم الفئة" },
    fieldPlaceholder: { en: "Enter category name", ar: "أدخل اسم الفئة" },
    submitLabel: { en: "Create Category", ar: "إنشاء فئة" },
    icon: Shapes,
  },
  manufacturer: {
    title: { en: "Create New Manufacturer", ar: "إنشاء مُصنّع جديد" },
    description: {
      en: "Add a manufacturer so it is available in product details.",
      ar: "أضف مُصنّعًا ليكون متاحًا في تفاصيل المنتج.",
    },
    fieldLabel: { en: "Manufacturer Name", ar: "اسم المُصنّع" },
    fieldPlaceholder: {
      en: "Enter manufacturer name",
      ar: "أدخل اسم المُصنّع",
    },
    submitLabel: { en: "Create Manufacturer", ar: "إنشاء مُصنّع" },
    icon: Factory,
  },
};

export function InventoryPage({ onNavigate }: InventoryPageProps) {
  const { t, language } = useLanguage();
  const [hasImportedInventory, setHasImportedInventory] = useState(false);
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [createEntityDialog, setCreateEntityDialog] =
    useState<CreateEntityType | null>(null);
  const [createEntityValue, setCreateEntityValue] = useState("");
  const [activeQuickFilter, setActiveQuickFilter] =
    useState<InventoryQuickFilter>("all");
  const [pendingQuickFilter, setPendingQuickFilter] =
    useState<InventoryQuickFilter | null>(null);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [expandedProductIds, setExpandedProductIds] = useState<string[]>([]);
  const [rowActionMenu, setRowActionMenu] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const [batchActionDialogOpen, setBatchActionDialogOpen] = useState(false);
  const [batchActionMode, setBatchActionMode] =
    useState<InventoryBatchActionDialogMode>("editBatch");
  const [batchActionTarget, setBatchActionTarget] =
    useState<InventoryBatchActionTarget | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest("[data-row-action-trigger]") &&
        !target.closest("[data-row-action-panel]")
      ) {
        setRowActionMenu(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const closeOnViewportChange = () => setRowActionMenu(null);
    window.addEventListener("resize", closeOnViewportChange);
    window.addEventListener("scroll", closeOnViewportChange, true);
    return () => {
      window.removeEventListener("resize", closeOnViewportChange);
      window.removeEventListener("scroll", closeOnViewportChange, true);
    };
  }, []);

  useEffect(() => {
    if (!pendingQuickFilter || pendingQuickFilter === activeQuickFilter) {
      return;
    }

    setIsTableLoading(true);

    const timeoutId = window.setTimeout(() => {
      setActiveQuickFilter(pendingQuickFilter);
      setExpandedProductIds([]);
      setIsTableLoading(false);
      setPendingQuickFilter(null);
    }, 1200);

    return () => window.clearTimeout(timeoutId);
  }, [activeQuickFilter, pendingQuickFilter]);

  const products = useMemo(
    () =>
      PHARMACY_INVENTORY_PRODUCTS_V2.map((product) => {
        const derivedStatus = getDerivedInventoryStatus(product);
        const firstBatch = product.batches[0];

        return {
          id: product.id,
          code: product.code,
          name: language === "ar" ? product.nameAr : product.nameEn,
          subtitle: language === "ar" ? product.subtitleAr : product.subtitleEn,
          nameEn: product.nameEn,
          nameAr: product.nameAr,
          barcode: product.barcode,
          category: t(product.categoryKey),
          lotBatch: firstBatch?.batchNumber ?? "",
          expiry: derivedStatus.nearestExpiry,
          lastSale: `${t("jod")} ${product.lastSaleAmount}`,
          stockQty: derivedStatus.totalStockQty.toLocaleString("en-GB"),
          avgCost: firstBatch?.avgCost ?? "",
          sellPrice: firstBatch?.sellPrice ?? "",
          tax: product.tax,
          warehouse: firstBatch
            ? `${t("main")} · ${firstBatch.warehouseZone}`
            : "",
          status: derivedStatus.statusKey ? t(derivedStatus.statusKey) : "",
          statusColor: derivedStatus.statusColor,
          statusKey: derivedStatus.statusKey,
          batchCount: product.batches.length,
          batches: product.batches,
        };
      }),
    [language, t],
  );

  const inventorySummary = useMemo(() => {
    const derivedProducts = PHARMACY_INVENTORY_PRODUCTS_V2.map((product) => ({
      product,
      derivedStatus: getDerivedInventoryStatus(product),
    }));
    const stagnantProducts = derivedProducts.filter(
      ({ product }) => Number(product.lastSaleAmount) <= 8,
    ).length;
    const expiringSoonProducts = derivedProducts.filter(
      ({ derivedStatus }) =>
        derivedStatus.statusKey === "productStatusExpiringSoon",
    ).length;
    const lowStockProducts = derivedProducts.filter(
      ({ derivedStatus }) =>
        derivedStatus.statusKey === "productStatusLowStock",
    ).length;

    return {
      totalProducts: INVENTORY_PRODUCT_COUNT_V2,
      stagnantProducts,
      expiringSoonProducts,
      lowStockProducts,
    };
  }, []);

  const filteredProducts = useMemo(() => {
    switch (activeQuickFilter) {
      case "stagnant":
        return products.filter((product) => Number(product.sellPrice) <= 8);
      case "expiringSoon":
        return products.filter(
          (product) => product.statusKey === "productStatusExpiringSoon",
        );
      case "lowStock":
        return products.filter(
          (product) => product.statusKey === "productStatusLowStock",
        );
      case "all":
      default:
        return products;
    }
  }, [activeQuickFilter, products]);

  const quickFilterCards = [
    {
      key: "all" as const,
      label: t("totalProducts"),
      value: inventorySummary.totalProducts,
      helper:
        language === "ar"
          ? "جميع المنتجات في المخزون عبر كل الحالات"
          : "All inventory products across every status",
      actionLabel: language === "ar" ? "عرض الكل" : "View all",
      showAction: false,
      activeClass: "border-teal-300 bg-teal-50 text-teal-900 shadow-sm",
      idleClass:
        "border-gray-200 bg-white text-gray-900 hover:border-teal-200 hover:shadow-sm",
      valueClass: "text-current",
      helperClass: "text-current/70",
      actionClass: "border-teal-200 bg-white text-teal-700 hover:bg-teal-100",
      accentClass: "bg-teal-50 text-teal-700",
    },
    {
      key: "stagnant" as const,
      label: t("stagnantProducts"),
      value: inventorySummary.stagnantProducts,
      helper:
        language === "ar"
          ? "منتجات بدون مبيعات خلال آخر 90+ يوم"
          : "Products with no sales in the last 90+ days",
      actionLabel: language === "ar" ? "مراجعة" : "Review",
      showAction: true,
      activeClass: "border-teal-300 bg-teal-50 text-teal-900 shadow-sm",
      idleClass:
        "border-gray-200 bg-white text-gray-900 hover:border-teal-200 hover:shadow-sm",
      valueClass: "text-current",
      helperClass: "text-current/70",
      actionClass: "border-teal-200 bg-white text-teal-700 hover:bg-teal-100",
      accentClass: "bg-teal-50 text-teal-700",
    },
    {
      key: "expiringSoon" as const,
      label: t("expiringsSoon"),
      value: inventorySummary.expiringSoonProducts,
      helper:
        language === "ar"
          ? "منتجات تنتهي صلاحيتها خلال 90 يوم"
          : "Products expiring in 90 days",
      actionLabel: language === "ar" ? "مراجعة" : "Review",
      showAction: true,
      activeClass: "border-teal-300 bg-teal-50 text-teal-900 shadow-sm",
      idleClass:
        "border-gray-200 bg-white text-gray-900 hover:border-teal-200 hover:shadow-sm",
      valueClass: "text-current",
      helperClass: "text-current/70",
      actionClass: "border-teal-200 bg-white text-teal-700 hover:bg-teal-100",
      accentClass: "bg-teal-50 text-teal-700",
    },
    {
      key: "lowStock" as const,
      label: t("lowStock"),
      value: inventorySummary.lowStockProducts,
      helper:
        language === "ar"
          ? "منتجات أقل من الحد الأدنى"
          : "Products below minimum level",
      actionLabel: language === "ar" ? "مراجعة" : "Review",
      showAction: true,
      activeClass: "border-teal-300 bg-teal-50 text-teal-900 shadow-sm",
      idleClass:
        "border-gray-200 bg-white text-gray-900 hover:border-teal-200 hover:shadow-sm",
      valueClass: "text-current",
      helperClass: "text-current/70",
      actionClass: "border-teal-200 bg-white text-teal-700 hover:bg-teal-100",
      accentClass: "bg-teal-50 text-teal-700",
    },
  ];

  const displayedProducts = filteredProducts;

  const toggleExpanded = (productId: string) => {
    setExpandedProductIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  };

  const handleQuickFilterChange = (nextFilter: InventoryQuickFilter) => {
    if (isTableLoading || nextFilter === activeQuickFilter) {
      return;
    }

    setPendingQuickFilter(nextFilter);
  };

  const openBatchActionDialog = (
    mode: InventoryBatchActionDialogMode,
    target: InventoryBatchActionTarget,
  ) => {
    setRowActionMenu(null);
    setBatchActionMode(mode);
    setBatchActionTarget(target);
    setBatchActionDialogOpen(true);
  };

  const createEntityConfig = createEntityDialog
    ? CREATE_ENTITY_COPY[createEntityDialog]
    : null;

  const handleCreateEntityOpenChange = (open: boolean) => {
    if (!open) {
      setCreateEntityDialog(null);
      setCreateEntityValue("");
    }
  };

  const handleCreateEntitySubmit = () => {
    handleCreateEntityOpenChange(false);
  };

  const handleImportSuccess = () => {
    setHasImportedInventory(true);
    setShowRewardDialog(true);
  };

  const rewardActions = [
    {
      icon: Receipt,
      label: t("rewardActionPosTransactions"),
      amount: "+JOD 3.5",
    },
    {
      icon: Store,
      label: t("rewardActionStartSelling"),
      amount: "+JOD 7",
    },
    {
      icon: ShoppingCart,
      label: t("rewardActionBuyConfirm"),
      amount: "+JOD 7",
    },
    {
      icon: PackageCheck,
      label: t("rewardActionConfirmMarketplace"),
      amount: "+JOD 7",
    },
  ];

  const rewardConfettiPieces = [
    {
      left: "10%",
      top: "14%",
      size: "10px",
      color: "#fde68a",
      x: "-18px",
      y: "120px",
      rotate: "160deg",
      duration: "2200ms",
      delay: "0ms",
    },
    {
      left: "22%",
      top: "8%",
      size: "12px",
      color: "#ffffff",
      x: "24px",
      y: "132px",
      rotate: "220deg",
      duration: "2500ms",
      delay: "180ms",
    },
    {
      left: "38%",
      top: "16%",
      size: "9px",
      color: "#fdba74",
      x: "-10px",
      y: "118px",
      rotate: "140deg",
      duration: "2100ms",
      delay: "320ms",
    },
    {
      left: "62%",
      top: "10%",
      size: "11px",
      color: "#fed7aa",
      x: "18px",
      y: "126px",
      rotate: "200deg",
      duration: "2400ms",
      delay: "120ms",
    },
    {
      left: "78%",
      top: "15%",
      size: "10px",
      color: "#ffffff",
      x: "-22px",
      y: "136px",
      rotate: "260deg",
      duration: "2600ms",
      delay: "260ms",
    },
    {
      left: "90%",
      top: "9%",
      size: "8px",
      color: "#fde68a",
      x: "14px",
      y: "112px",
      rotate: "180deg",
      duration: "2000ms",
      delay: "420ms",
    },
  ];

  if (!hasImportedInventory) {
    return (
      <div className="flex flex-col h-full bg-gray-50 overflow-y-auto">
        <ImportInventoryDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          onImportSuccess={handleImportSuccess}
          variant="onboarding"
          onNavigate={onNavigate}
        />
        <div className="p-6 flex-1">
          <div className="mx-auto flex min-h-[calc(100vh-180px)] max-w-7xl items-center justify-center">
            <div className="grid w-full gap-6 rounded-[32px] border border-teal-100 bg-gradient-to-br from-white via-teal-50/60 to-cyan-50 p-6 shadow-sm lg:grid-cols-[1.35fr_0.85fr] lg:p-8 xl:p-10">
              <div className="flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-4 py-2 text-sm font-medium text-teal-700 shadow-sm">
                    <Sparkles className="size-4" />
                    {t("inventoryOnboardingBadge")}
                  </div>
                  <div className="space-y-2.5">
                    <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-gray-950 lg:text-4xl">
                      {t("inventoryOnboardingTitle")}
                    </h1>
                    <p className="max-w-3xl text-base leading-7 text-gray-600">
                      {t("inventoryOnboardingDescription")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => setImportDialogOpen(true)}
                      className="h-11 rounded-full bg-teal-600 px-6 text-sm font-semibold text-white shadow-md shadow-teal-600/20 hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-600/30"
                    >
                      <Upload className="size-4" />
                      {t("inventoryOnboardingPrimaryCta")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        onNavigate("manualUpdateStock", {
                          manualUpdateEntryPoint: "onboarding",
                        })
                      }
                      className="h-11 rounded-full border-gray-300 bg-white px-6 text-sm font-semibold text-gray-700"
                    >
                      <FileEdit className="size-4" />
                      {t("inventoryOnboardingSecondaryCta")}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      icon: FileSpreadsheet,
                      title: t("inventoryOnboardingStepOneTitle"),
                      description: t("inventoryOnboardingStepOneDescription"),
                    },
                    {
                      icon: Sparkles,
                      title: t("inventoryOnboardingStepTwoTitle"),
                      description: t("inventoryOnboardingStepTwoDescription"),
                    },
                    {
                      icon: CheckCircle2,
                      title: t("inventoryOnboardingStepThreeTitle"),
                      description: t("inventoryOnboardingStepThreeDescription"),
                    },
                  ].map((step) => {
                    const Icon = step.icon;

                    return (
                      <div
                        key={step.title}
                        className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur"
                      >
                        <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                          <Icon className="size-5" />
                        </div>
                        <h2 className="text-sm font-semibold text-gray-900">
                          {step.title}
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-gray-600">
                          {step.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-[28px] border border-teal-100 bg-white/90 p-5 shadow-sm backdrop-blur">
                <div className="rounded-[24px] bg-gradient-to-br from-teal-600 to-cyan-600 p-5 text-white">
                  <p className="text-sm font-medium text-white/80">
                    {t("inventoryOnboardingPreviewLabel")}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold leading-tight">
                    {t("inventoryOnboardingPreviewTitle")}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-white/85">
                    {t("inventoryOnboardingPreviewDescription")}
                  </p>
                </div>
                <div className="mt-4 space-y-2.5">
                  {[
                    t("inventoryOnboardingBenefitOne"),
                    t("inventoryOnboardingBenefitTwo"),
                  ].map((benefit) => (
                    <div
                      key={benefit}
                      className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3"
                    >
                      <div className="mt-0.5 flex size-6 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                        <CheckCircle2 className="size-4" />
                      </div>
                      <p className="text-sm leading-6 text-gray-700">
                        {benefit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto">
      <CreateProductDialog
        open={createProductOpen}
        onOpenChange={setCreateProductOpen}
        onNavigate={onNavigate}
      />
      <Dialog
        open={createEntityDialog !== null}
        onOpenChange={handleCreateEntityOpenChange}
      >
        <DialogContent className="max-w-[480px] rounded-3xl border-gray-200 p-0 overflow-hidden">
          {createEntityConfig && (
            <>
              <DialogHeader className="border-b border-gray-200 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                    <createEntityConfig.icon
                      className="size-5"
                      strokeWidth={2.2}
                    />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                      {createEntityConfig.title[language]}
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-gray-500">
                      {createEntityConfig.description[language]}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="px-6 py-5">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {createEntityConfig.fieldLabel[language]}
                </label>
                <Input
                  value={createEntityValue}
                  onChange={(event) => setCreateEntityValue(event.target.value)}
                  placeholder={createEntityConfig.fieldPlaceholder[language]}
                  className="h-11 rounded-full border-gray-300"
                />
              </div>

              <DialogFooter className="border-t border-gray-200 px-6 py-4 sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-gray-300"
                  onClick={() => handleCreateEntityOpenChange(false)}
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </Button>
                <Button
                  type="button"
                  className="rounded-full bg-teal-500 hover:bg-teal-600"
                  onClick={handleCreateEntitySubmit}
                  disabled={!createEntityValue.trim()}
                >
                  {createEntityConfig.submitLabel[language]}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      <ImportInventoryDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImportSuccess={handleImportSuccess}
        onNavigate={onNavigate}
      />
      <Dialog open={showRewardDialog} onOpenChange={setShowRewardDialog}>
        <DialogContent className="reward-dialog-shell w-[calc(100vw-1.5rem)] max-w-[440px] overflow-hidden rounded-[22px] border-0 p-0 shadow-2xl">
          <DialogHeader className="relative items-center bg-gradient-to-r from-[#ff7a59] to-[#f85d0a] px-4 pb-5 pt-5 text-center sm:px-5 sm:pb-6 sm:pt-6">
            <div className="reward-confetti" aria-hidden="true">
              {rewardConfettiPieces.map((piece, index) => (
                <span
                  key={`${piece.left}-${piece.delay}-${index}`}
                  className="reward-confetti-piece"
                  style={{
                    ["--reward-left" as string]: piece.left,
                    ["--reward-top" as string]: piece.top,
                    ["--reward-size" as string]: piece.size,
                    ["--reward-color" as string]: piece.color,
                    ["--reward-x" as string]: piece.x,
                    ["--reward-y" as string]: piece.y,
                    ["--reward-rotate" as string]: piece.rotate,
                    ["--reward-duration" as string]: piece.duration,
                    ["--reward-delay" as string]: piece.delay,
                  }}
                />
              ))}
            </div>
            <div className="reward-badge-glow flex size-12 items-center justify-center rounded-full bg-white/15 text-white shadow-inner shadow-white/10 sm:size-14">
              <Gift className="size-6 sm:size-7" strokeWidth={2.2} />
            </div>
            <DialogTitle className="mt-3 text-xl font-bold tracking-tight text-white sm:text-2xl">
              {t("rewardTitle")}
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs text-white/85 sm:text-sm">
              {t("rewardReadySubtitle")}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-[#f7f7f8] px-3 pb-3 pt-3 sm:px-4 sm:pb-4 sm:pt-4">
            <div className="rounded-[18px] bg-white px-3.5 py-4 text-center shadow-sm sm:px-4 sm:py-5">
              <p className="text-3xl font-bold tracking-tight text-[#16a34a] sm:text-4xl">
                JOD 3.5
              </p>
              <p className="mt-2.5 text-xs leading-5 text-slate-500 sm:text-sm">
                {t("rewardReadyMessage")}
              </p>

              <div className="mt-4 text-start sm:mt-5">
                <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-semibold text-slate-800 sm:text-sm">
                  <span>{t("rewardProgressTitle")}</span>
                  <span className="text-[#14b8a6]">JOD 10.5</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-[30%] rounded-full bg-gradient-to-r from-[#ff8a4c] to-[#f85d0a]" />
                </div>
                <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">
                  {t("rewardActionsNeeded")}
                </p>
              </div>

              <div className="mt-4 text-start sm:mt-5">
                <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                  {t("rewardCompleteActions")}
                </h3>
                <div className="mt-2.5 space-y-2">
                  {rewardActions.map((action) => {
                    const Icon = action.icon;

                    return (
                      <div
                        key={action.label}
                        className="flex items-center gap-2.5 rounded-2xl bg-[#f5f5f6] px-2.5 py-2.5"
                      >
                        <div className="flex size-8 items-center justify-center rounded-full bg-[#fde7cf] text-[#f97316] sm:size-9">
                          <Icon className="size-4" strokeWidth={2.2} />
                        </div>
                        <p className="flex-1 text-xs font-medium leading-5 text-slate-600 sm:text-sm">
                          {action.label}
                        </p>
                        <div className="rounded-full bg-[#a8afba] px-2.5 py-1 text-xs font-semibold text-white sm:text-sm">
                          {action.amount}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={() => setShowRewardDialog(false)}
                className="mt-4 h-11 w-full rounded-full bg-[#ff7a59] text-sm font-semibold text-white hover:bg-[#f56a47] sm:mt-5"
              >
                {t("rewardContinue")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <InventoryBatchActionDialog
        open={batchActionDialogOpen}
        onOpenChange={setBatchActionDialogOpen}
        mode={batchActionMode}
        target={batchActionTarget}
      />
      <div className="p-6 space-y-4 flex-1">
        <div className="px-1 py-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h1 className="text-xl font-semibold tracking-tight text-gray-900">
                  {t("inventory")}
                </h1>
                <span className="text-sm text-gray-300">•</span>
                <p className="text-sm text-gray-500">
                  Monitor inventory performance and manage stock in one place.
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 text-[13px] font-medium text-gray-700 shadow-sm transition-colors hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">
                  <Sparkles className="size-3.5 text-teal-600" />
                  {language === "ar" ? "الإجراءات السريعة" : "Quick Actions"}
                  <ChevronDown className="size-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[348px] rounded-2xl border-gray-200 p-1.5 shadow-xl"
              >
                <DropdownMenuLabel className="px-2.5 py-2">
                  <div className="space-y-1">
                    <p className="text-[13px] font-semibold text-gray-900">
                      {language === "ar"
                        ? "الإجراءات السريعة"
                        : "Quick Actions"}
                    </p>
                    <p className="text-[11px] font-normal leading-4 text-gray-500">
                      {language === "ar"
                        ? "إنشاء المنتجات، تحديث المخزون، ومتابعة الشراء من مكان واحد"
                        : "Create products, update stock, and manage purchase flow from one place"}
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="px-2.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                  {language === "ar" ? "الإنشاء والسجل" : "Create and History"}
                </DropdownMenuLabel>
                <DropdownMenuItem
                  className="rounded-xl px-2.5 py-2.5"
                  onClick={() => setCreateProductOpen(true)}
                >
                  <PackagePlus className="size-4 text-teal-600" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-900">
                      {language === "ar"
                        ? "إنشاء منتج جديد"
                        : "Create New Product"}
                    </div>
                    <div className="text-[11px] leading-4 text-gray-500">
                      {language === "ar"
                        ? "ابدأ بإضافة منتج جديد إلى المخزون"
                        : "Start a new product record in inventory"}
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-xl px-2.5 py-2.5"
                  onClick={() => onNavigate("updateStock")}
                >
                  <History className="size-4 text-teal-600" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-900">
                      {t("stockHistory")}
                    </div>
                    <div className="text-[11px] leading-4 text-gray-500">
                      {language === "ar"
                        ? "راجع آخر تحديثات المخزون والمسودات"
                        : "Review recent stock updates and drafts"}
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl px-2.5 py-2.5">
                  <Printer className="size-4 text-teal-600" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-900">
                      {t("printBarcode")}
                    </div>
                    <div className="text-[11px] leading-4 text-gray-500">
                      {language === "ar"
                        ? "اطبع الباركود للمنتجات المحددة"
                        : "Print barcode labels for selected products"}
                    </div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="px-2.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                  {language === "ar" ? "تحديثات المخزون" : "Stock Updates"}
                </DropdownMenuLabel>
                <DropdownMenuItem
                  className="rounded-xl px-2.5 py-2.5"
                  onClick={() => setImportDialogOpen(true)}
                >
                  <Upload className="size-4 text-teal-600" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-900">
                      {t("uploadStockFile")}
                    </div>
                    <div className="text-[11px] leading-4 text-gray-500">
                      {language === "ar"
                        ? "استورد تحديثات المخزون من ملف"
                        : "Import stock updates from a file"}
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-xl px-2.5 py-2.5"
                  onClick={() => onNavigate("manualUpdateStock")}
                >
                  <FileEdit className="size-4 text-teal-600" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-900">
                      {t("manualUpdateStock")}
                    </div>
                    <div className="text-[11px] leading-4 text-gray-500">
                      {language === "ar"
                        ? "أدخل الكميات والتشغيلات يدويًا"
                        : "Enter quantities and batches manually"}
                    </div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="px-2.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                  {language === "ar" ? "تدفق الشراء" : "Purchase Flow"}
                </DropdownMenuLabel>
                <DropdownMenuItem className="rounded-xl px-2.5 py-2.5">
                  <ShoppingBag className="size-4 text-teal-600" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-medium text-gray-900">
                        {t("receiveMarketplacePurchaseOrders")}
                      </span>
                      <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700">
                        3 {t("new")}
                      </span>
                    </div>
                    <div className="text-[11px] leading-4 text-gray-500">
                      {language === "ar"
                        ? "استلم طلبات الشراء الواردة من السوق"
                        : "Receive incoming marketplace purchase orders"}
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl px-2.5 py-2.5">
                  <FileText className="size-4 text-teal-600" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-900">
                      {t("createNewPurchaseOrder")}
                    </div>
                    <div className="text-[11px] leading-4 text-gray-500">
                      {language === "ar"
                        ? "أنشئ أمر شراء جديد للموردين"
                        : "Create a new purchase order for suppliers"}
                    </div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="px-2.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                  {language === "ar" ? "إنشاء سريع" : "Quick Create"}
                </DropdownMenuLabel>
                <DropdownMenuItem
                  className="rounded-xl px-2.5 py-2.5"
                  onClick={() => {
                    setCreateEntityValue("");
                    setCreateEntityDialog("brand");
                  }}
                >
                  <Tags className="size-4 text-teal-600" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-900">
                      {language === "ar"
                        ? "إنشاء علامة تجارية جديدة"
                        : "Create New Brand"}
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-xl px-2.5 py-2.5"
                  onClick={() => {
                    setCreateEntityValue("");
                    setCreateEntityDialog("category");
                  }}
                >
                  <Shapes className="size-4 text-teal-600" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-900">
                      {language === "ar"
                        ? "إنشاء فئة جديدة"
                        : "Create New Category"}
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-xl px-2.5 py-2.5"
                  onClick={() => {
                    setCreateEntityValue("");
                    setCreateEntityDialog("manufacturer");
                  }}
                >
                  <Factory className="size-4 text-teal-600" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-900">
                      {language === "ar"
                        ? "إنشاء مُصنّع جديد"
                        : "Create New Manufacturer"}
                    </div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {rowActionMenu && (
          <div
            data-row-action-panel
            className="fixed z-[10000] min-w-44 rounded-xl border border-gray-200 bg-white shadow-xl p-1.5"
            style={{ left: rowActionMenu.x, top: rowActionMenu.y }}
          >
            <button
              type="button"
              className="w-full text-start px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => {
                setRowActionMenu(null);
                onNavigate("viewProduct");
              }}
            >
              {t("fullViewPageTitle")}
            </button>
            <button
              type="button"
              className="w-full text-start px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => {
                setRowActionMenu(null);
                onNavigate("manualUpdateStock");
              }}
            >
              {t("manualUpdateStock")}
            </button>
            {(() => {
              const selectedProduct = products.find(
                (product) => product.id === rowActionMenu.id,
              );

              if (!selectedProduct) return null;

              return (
                <>
                  <button
                    type="button"
                    className="w-full text-start px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() =>
                      openBatchActionDialog("stockIn", {
                        type: "product",
                        productId: selectedProduct.id,
                        productCode: selectedProduct.code,
                        productName: selectedProduct.name,
                        batches: selectedProduct.batches,
                      })
                    }
                  >
                    {language === "ar" ? "إدخال مخزون" : "Stock In"}
                  </button>
                  <button
                    type="button"
                    className="w-full text-start px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() =>
                      openBatchActionDialog("stockOut", {
                        type: "product",
                        productId: selectedProduct.id,
                        productCode: selectedProduct.code,
                        productName: selectedProduct.name,
                        batches: selectedProduct.batches,
                      })
                    }
                  >
                    {language === "ar" ? "إخراج مخزون" : "Stock Out"}
                  </button>
                  <button
                    type="button"
                    className="w-full text-start px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() =>
                      openBatchActionDialog("editBatch", {
                        type: "product",
                        productId: selectedProduct.id,
                        productCode: selectedProduct.code,
                        productName: selectedProduct.name,
                        batches: selectedProduct.batches,
                      })
                    }
                  >
                    {language === "ar" ? "تعديل الدفعة" : "Edit Batch"}
                  </button>
                  <button
                    type="button"
                    className="w-full text-start px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() =>
                      openBatchActionDialog("addBatch", {
                        type: "product",
                        productId: selectedProduct.id,
                        productCode: selectedProduct.code,
                        productName: selectedProduct.name,
                        batches: selectedProduct.batches,
                      })
                    }
                  >
                    {language === "ar" ? "إضافة دفعة" : "Add Batch"}
                  </button>
                </>
              );
            })()}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="border-b border-gray-200 p-4">
            <div className="flex flex-col gap-4">
              <div className="grid gap-2 xl:grid-cols-4">
                <div className="grid gap-2 sm:grid-cols-2 xl:col-span-4 xl:grid-cols-4">
                  {quickFilterCards.map((item) => {
                    const isActive = activeQuickFilter === item.key;
                    const isPending = pendingQuickFilter === item.key;

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleQuickFilterChange(item.key)}
                        disabled={isTableLoading}
                        className={`group overflow-hidden rounded-2xl border text-start transition-all ${
                          isActive ? item.activeClass : item.idleClass
                        } ${
                          isPending ? "ring-2 ring-teal-200 ring-offset-2" : ""
                        } ${
                          isTableLoading
                            ? "cursor-wait opacity-80"
                            : "cursor-pointer"
                        }`}
                      >
                        <div className="flex min-h-[98px] flex-col justify-between p-3.5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-[13px] font-semibold text-current">
                                {item.label}
                              </div>
                              <p
                                className={`mt-1 max-w-[20ch] text-[11px] leading-4 ${item.helperClass}`}
                              >
                                {item.helper}
                              </p>
                            </div>

                            <div
                              className={`shrink-0 text-[18px] font-semibold leading-none sm:text-[22px] ${item.valueClass}`}
                            >
                              <div className="flex items-center gap-2">
                                {isPending && (
                                  <span className="size-2 rounded-full bg-teal-500 animate-pulse" />
                                )}
                                <span>{item.value}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-2.5 flex items-center justify-between gap-2">
                            <div className="text-[9px] font-medium text-current/55">
                              {isPending
                                ? language === "ar"
                                  ? "جاري تحميل النتائج"
                                  : "Loading results"
                                : isActive
                                  ? language === "ar"
                                    ? "يعرض النتائج الآن"
                                    : "Showing results"
                                  : language === "ar"
                                    ? "اضغط لتصفية الجدول"
                                    : "Click to filter table"}
                            </div>

                            {item.showAction ? (
                              <span
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleQuickFilterChange(item.key);
                                }}
                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                                  isActive
                                    ? "border-teal-200 bg-white text-teal-700"
                                    : "border-teal-400 bg-white text-teal-600"
                                }`}
                              >
                                {item.actionLabel}
                              </span>
                            ) : (
                              <span
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleQuickFilterChange(item.key);
                                }}
                                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-medium ${
                                  isActive
                                    ? item.actionClass
                                    : "border-current/15 bg-white text-current"
                                }`}
                              >
                                {item.actionLabel}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1 min-w-[240px]">
                  <Search
                    className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-gray-400"
                    strokeWidth={2}
                  />
                  <Input
                    placeholder={t("searchByNameIdBarcodeHatch")}
                    className="ps-9 h-9 text-sm border-gray-300 rounded-full w-full"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:ms-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className={`h-9 gap-2 px-3 text-sm rounded-full border-gray-300 whitespace-nowrap ${
                      filtersOpen
                        ? "bg-teal-50 border-teal-600 text-teal-600"
                        : ""
                    }`}
                  >
                    <Filter className="size-4" strokeWidth={2} />
                    {t("filters")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCreateProductOpen(true)}
                    className="h-9 gap-2 px-3 text-sm rounded-full border-teal-200 bg-teal-50 text-teal-700 whitespace-nowrap hover:bg-teal-100 hover:text-teal-800"
                  >
                    <Plus className="size-4" strokeWidth={2.2} />
                    {language === "ar" ? "منتج جديد" : "New Product"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 px-3 text-sm rounded-full border-gray-300 whitespace-nowrap"
                  >
                    <Download className="size-4" strokeWidth={2} />
                    {t("export")}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <FiltersSection isOpen={filtersOpen} type="products" />

          <div className="relative overflow-x-auto">
            {isTableLoading && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-4">
                <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm">
                  <span className="size-2.5 rounded-full bg-teal-500 animate-pulse" />
                  <span className="size-2.5 rounded-full bg-teal-400 animate-pulse [animation-delay:150ms]" />
                  <span className="size-2.5 rounded-full bg-teal-300 animate-pulse [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 bg-gray-50/70 hover:bg-gray-50/70">
                  <TableHead className="w-10 h-11 px-2"></TableHead>
                  <TableHead className="h-11 px-2 text-start text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    {t("code")}
                  </TableHead>
                  <TableHead className="h-11 px-2 text-start text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    {language === "ar" ? "معلومات المنتج" : "Product Info"}
                  </TableHead>
                  <TableHead className="h-11 px-2 text-start text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    {t("lotBatch")}
                  </TableHead>
                  <TableHead className="h-11 px-2 text-start text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    {t("expiry")}
                  </TableHead>
                  <TableHead className="h-11 px-2 text-start text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    {t("lastSale")}
                  </TableHead>
                  <TableHead className="h-11 px-2 text-start text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    {t("stockQty")}
                  </TableHead>
                  <TableHead className="h-11 px-2 text-start text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    {t("avgCostPrice")}
                  </TableHead>
                  <TableHead className="h-11 px-2 text-start text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    {t("sellPrice")}
                  </TableHead>
                  <TableHead className="h-11 px-2 text-start text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    {t("tax")}
                  </TableHead>
                  <TableHead className="h-11 px-2 text-start text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    {t("warehouseLocation")}
                  </TableHead>
                  <TableHead className="h-11 px-2 text-start text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    {t("status")}
                  </TableHead>
                  <TableHead className="h-11 px-2 text-start text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    {t("actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody
                className={
                  isTableLoading
                    ? "bg-white transition-opacity"
                    : "transition-opacity"
                }
              >
                {isTableLoading ? (
                  <TableRow className="border-b-0 hover:bg-white">
                    <TableCell colSpan={13} className="h-[420px] bg-white" />
                  </TableRow>
                ) : (
                  displayedProducts.map((product) => {
                    const isExpanded = expandedProductIds.includes(product.id);

                    return (
                      <React.Fragment key={product.id}>
                        <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                          <TableCell className="py-2.5 px-2">
                            <button
                              type="button"
                              onClick={() => toggleExpanded(product.id)}
                              className="size-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                              aria-label={
                                isExpanded
                                  ? t("collapseBatches")
                                  : t("expandBatches")
                              }
                            >
                              {isExpanded ? (
                                <ChevronUp className="size-4 text-gray-600" />
                              ) : (
                                <ChevronDown className="size-4 text-gray-600" />
                              )}
                            </button>
                          </TableCell>
                          <TableCell className="text-[11px] text-gray-700 py-2.5 px-2 text-start">
                            {product.code}
                          </TableCell>
                          <TableCell className="py-2.5 px-2 text-start">
                            <div className="text-[11px] text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-[10px] text-gray-500 flex items-center gap-1.5 flex-wrap">
                              <span>{product.subtitle}</span>
                              <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 rounded-full px-1.5 py-0.5 text-[9px]">
                                {product.batchCount} {t("batches")}
                              </Badge>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-gray-500">
                              <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-gray-600">
                                {t("barcode")}: {product.barcode}
                              </span>
                              <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-gray-600">
                                {t("category")}: {product.category}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 px-2 text-start">
                            {product.lotBatch && (
                              <div className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full inline-block">
                                {product.lotBatch}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="py-2.5 px-2 text-start">
                            {product.expiry && (
                              <div className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full inline-block">
                                {product.expiry}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-[11px] text-gray-700 py-2.5 px-2 text-start">
                            {product.lastSale}
                          </TableCell>
                          <TableCell className="text-[11px] text-gray-700 py-2.5 px-2 text-start">
                            {product.stockQty}
                          </TableCell>
                          <TableCell className="text-[11px] text-gray-700 py-2.5 px-2 text-start">
                            {product.avgCost}
                          </TableCell>
                          <TableCell className="text-[11px] text-gray-700 py-2.5 px-2 text-start">
                            {product.sellPrice}
                          </TableCell>
                          <TableCell className="text-[11px] text-gray-700 py-2.5 px-2 text-start">
                            {product.tax}
                          </TableCell>
                          <TableCell className="text-[11px] text-gray-700 py-2.5 px-2 text-start">
                            {product.warehouse}
                          </TableCell>
                          <TableCell className="py-2.5 px-2 text-start">
                            {product.status && (
                              <Badge
                                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                  product.statusColor === "red"
                                    ? "bg-red-100 text-red-700 hover:bg-red-100"
                                    : product.statusColor === "orange"
                                      ? "bg-orange-100 text-orange-700 hover:bg-orange-100"
                                      : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                                }`}
                              >
                                {product.status}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="py-2.5 px-2">
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                title={
                                  language === "ar" ? "إدخال مخزون" : "Stock In"
                                }
                                aria-label={
                                  language === "ar" ? "إدخال مخزون" : "Stock In"
                                }
                                className="size-7 p-0 hover:bg-emerald-50 hover:text-emerald-700 rounded-full"
                                onClick={() =>
                                  openBatchActionDialog("stockIn", {
                                    type: "product",
                                    productId: product.id,
                                    productCode: product.code,
                                    productName: product.name,
                                    batches: product.batches,
                                  })
                                }
                              >
                                <ArrowDownToLine className="size-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                title={
                                  language === "ar"
                                    ? "إخراج مخزون"
                                    : "Stock Out"
                                }
                                aria-label={
                                  language === "ar"
                                    ? "إخراج مخزون"
                                    : "Stock Out"
                                }
                                className="size-7 p-0 hover:bg-rose-50 hover:text-rose-700 rounded-full"
                                onClick={() =>
                                  openBatchActionDialog("stockOut", {
                                    type: "product",
                                    productId: product.id,
                                    productCode: product.code,
                                    productName: product.name,
                                    batches: product.batches,
                                  })
                                }
                              >
                                <ArrowUpFromLine className="size-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                title={
                                  language === "ar"
                                    ? "تعديل الدفعة"
                                    : "Edit Batch"
                                }
                                aria-label={
                                  language === "ar"
                                    ? "تعديل الدفعة"
                                    : "Edit Batch"
                                }
                                className="size-7 p-0 hover:bg-amber-50 hover:text-amber-700 rounded-full"
                                onClick={() =>
                                  openBatchActionDialog("editBatch", {
                                    type: "product",
                                    productId: product.id,
                                    productCode: product.code,
                                    productName: product.name,
                                    batches: product.batches,
                                  })
                                }
                              >
                                <PencilLine className="size-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                title={
                                  language === "ar" ? "إضافة دفعة" : "Add Batch"
                                }
                                aria-label={
                                  language === "ar" ? "إضافة دفعة" : "Add Batch"
                                }
                                className="size-7 p-0 hover:bg-blue-50 hover:text-blue-700 rounded-full"
                                onClick={() =>
                                  openBatchActionDialog("addBatch", {
                                    type: "product",
                                    productId: product.id,
                                    productCode: product.code,
                                    productName: product.name,
                                    batches: product.batches,
                                  })
                                }
                              >
                                <PackagePlus className="size-3.5" />
                              </Button>

                              <div className="inline-block">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="size-7 p-0 hover:bg-gray-100 rounded-full"
                                  data-row-action-trigger
                                  onClick={(event) => {
                                    const targetRect =
                                      event.currentTarget.getBoundingClientRect();
                                    const menuWidth = 176;
                                    const clampedX = Math.min(
                                      window.innerWidth - menuWidth - 8,
                                      Math.max(8, targetRect.right - menuWidth),
                                    );
                                    const nextY = targetRect.bottom + 8;
                                    setRowActionMenu((current) =>
                                      current?.id === product.id
                                        ? null
                                        : {
                                            id: product.id,
                                            x: clampedX,
                                            y: nextY,
                                          },
                                    );
                                  }}
                                >
                                  <MoreVertical className="size-3.5 text-gray-600" />
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                        {isExpanded ? (
                          <TableRow
                            key={`${product.id}-expanded`}
                            className="bg-gray-50/70 border-b border-gray-200"
                          >
                            <TableCell colSpan={13} className="p-0">
                              <div className="px-5 py-4">
                                <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-3 flex-wrap">
                                    <div className="flex items-center gap-2">
                                      <div className="text-sm font-semibold text-gray-900">
                                        {t("batches")}
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        title={
                                          language === "ar"
                                            ? "إضافة دفعة"
                                            : "Add Batch"
                                        }
                                        aria-label={
                                          language === "ar"
                                            ? "إضافة دفعة"
                                            : "Add Batch"
                                        }
                                        className="size-7 p-0 hover:bg-blue-50 hover:text-blue-700 rounded-full"
                                        onClick={() =>
                                          openBatchActionDialog("addBatch", {
                                            type: "product",
                                            productId: product.id,
                                            productCode: product.code,
                                            productName: product.name,
                                            batches: product.batches,
                                          })
                                        }
                                      >
                                        <PackagePlus className="size-3.5" />
                                      </Button>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {product.batchCount} {t("batches")}
                                    </div>
                                  </div>

                                  <div className="overflow-x-auto">
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="border-b border-gray-200 bg-white">
                                          <TableHead className="text-xs font-semibold text-gray-700 h-10 text-start">
                                            {t("batchNumber")}
                                          </TableHead>
                                          <TableHead className="text-xs font-semibold text-gray-700 h-10 text-start">
                                            {t("expiry")}
                                          </TableHead>
                                          <TableHead className="text-xs font-semibold text-gray-700 h-10 text-start">
                                            {t("warehouseLocation")}
                                          </TableHead>
                                          <TableHead className="text-xs font-semibold text-gray-700 h-10 text-start">
                                            {t("stockQty")}
                                          </TableHead>
                                          <TableHead className="text-xs font-semibold text-gray-700 h-10 text-start">
                                            {t("avgCostPrice")}
                                          </TableHead>
                                          <TableHead className="text-xs font-semibold text-gray-700 h-10 text-start">
                                            {t("sellPrice")}
                                          </TableHead>
                                          <TableHead className="text-xs font-semibold text-gray-700 h-10 text-start">
                                            {t("actions")}
                                          </TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {product.batches.map((batch) => (
                                          <TableRow
                                            key={batch.id}
                                            className="border-b border-gray-200 last:border-b-0"
                                          >
                                            <TableCell className="text-[11px] text-gray-700 py-2.5 px-2 text-start">
                                              {batch.batchNumber}
                                            </TableCell>
                                            <TableCell className="text-[11px] text-gray-700 py-2.5 px-2 text-start">
                                              {batch.expiry}
                                            </TableCell>
                                            <TableCell className="text-[11px] text-gray-700 py-2.5 px-2 text-start">{`${t("main")} · ${batch.warehouseZone}`}</TableCell>
                                            <TableCell className="text-[11px] text-gray-700 py-2.5 px-2 text-start">
                                              {batch.stockQty}
                                            </TableCell>
                                            <TableCell className="text-[11px] text-gray-700 py-2.5 px-2 text-start">
                                              {batch.avgCost}
                                            </TableCell>
                                            <TableCell className="text-[11px] text-gray-700 py-2.5 px-2 text-start">
                                              {batch.sellPrice}
                                            </TableCell>
                                            <TableCell className="py-2.5 px-2 text-start">
                                              <div className="flex items-center gap-1.5 flex-wrap">
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  title={
                                                    language === "ar"
                                                      ? "تعديل الدفعة"
                                                      : "Edit Batch"
                                                  }
                                                  aria-label={
                                                    language === "ar"
                                                      ? "تعديل الدفعة"
                                                      : "Edit Batch"
                                                  }
                                                  className="size-7 p-0 hover:bg-amber-50 hover:text-amber-700 rounded-full"
                                                  onClick={() =>
                                                    openBatchActionDialog(
                                                      "editBatch",
                                                      {
                                                        type: "batch",
                                                        productId: product.id,
                                                        productCode:
                                                          product.code,
                                                        productName:
                                                          product.name,
                                                        batch,
                                                        batches:
                                                          product.batches,
                                                      },
                                                    )
                                                  }
                                                >
                                                  <PencilLine className="size-3.5" />
                                                </Button>
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  title={
                                                    language === "ar"
                                                      ? "إدخال مخزون"
                                                      : "Stock In"
                                                  }
                                                  aria-label={
                                                    language === "ar"
                                                      ? "إدخال مخزون"
                                                      : "Stock In"
                                                  }
                                                  className="size-7 p-0 hover:bg-emerald-50 hover:text-emerald-700 rounded-full"
                                                  onClick={() =>
                                                    openBatchActionDialog(
                                                      "stockIn",
                                                      {
                                                        type: "batch",
                                                        productId: product.id,
                                                        productCode:
                                                          product.code,
                                                        productName:
                                                          product.name,
                                                        batch,
                                                        batches:
                                                          product.batches,
                                                      },
                                                    )
                                                  }
                                                >
                                                  <ArrowDownToLine className="size-3.5" />
                                                </Button>
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  title={
                                                    language === "ar"
                                                      ? "إخراج مخزون"
                                                      : "Stock Out"
                                                  }
                                                  aria-label={
                                                    language === "ar"
                                                      ? "إخراج مخزون"
                                                      : "Stock Out"
                                                  }
                                                  className="size-7 p-0 hover:bg-rose-50 hover:text-rose-700 rounded-full"
                                                  onClick={() =>
                                                    openBatchActionDialog(
                                                      "stockOut",
                                                      {
                                                        type: "batch",
                                                        productId: product.id,
                                                        productCode:
                                                          product.code,
                                                        productName:
                                                          product.name,
                                                        batch,
                                                        batches:
                                                          product.batches,
                                                      },
                                                    )
                                                  }
                                                >
                                                  <ArrowUpFromLine className="size-3.5" />
                                                </Button>
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  title={
                                                    language === "ar"
                                                      ? "إضافة دفعة"
                                                      : "Add Batch"
                                                  }
                                                  aria-label={
                                                    language === "ar"
                                                      ? "إضافة دفعة"
                                                      : "Add Batch"
                                                  }
                                                  className="size-7 p-0 hover:bg-blue-50 hover:text-blue-700 rounded-full"
                                                  onClick={() =>
                                                    openBatchActionDialog(
                                                      "addBatch",
                                                      {
                                                        type: "product",
                                                        productId: product.id,
                                                        productCode:
                                                          product.code,
                                                        productName:
                                                          product.name,
                                                        batches:
                                                          product.batches,
                                                      },
                                                    )
                                                  }
                                                >
                                                  <PackagePlus className="size-3.5" />
                                                </Button>
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="px-4 py-3 border-t border-gray-200 bg-white">
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-600">
                {t("inventoryTablePaginationSummary")}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">{t("show")}</span>
                <select className="border border-gray-300 rounded-full px-3 py-1 text-sm">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <span className="text-gray-600">{t("perPage")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          {t("inventoryTableAllOnPage")}
        </div>
      </div>

      <footer className="sticky bottom-0 z-40 border-t border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">{t("poweredByPulse")}</div>
          <div className="flex items-center gap-4">
            <Button
              variant="link"
              className="text-teal-600 hover:text-teal-700 p-0 h-auto text-sm"
            >
              {t("startTour")}
            </Button>
            <Button className="bg-slate-900 hover:bg-slate-800 h-9 px-4 text-sm rounded-full">
              {t("help")}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
