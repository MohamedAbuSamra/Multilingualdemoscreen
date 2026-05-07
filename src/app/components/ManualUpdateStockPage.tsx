import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Package,
  Plus,
  Save,
  Search,
  Sparkles,
  Trash2,
  Boxes,
  PencilLine,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useLanguage } from "../contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { AddProductDialog, type AddProductSource } from "./AddProductDialog";
import type { SelectedInventoryProductWithBatches } from "./MyProductsPanel";
import type { ManualCustomProductInput } from "./ManualStockCustomProductPanel";
import type { AumetCoreProduct } from "../data/aumetCoreProductsSample";
import type { PharmacyInventoryRow } from "../data/pharmacyInventorySample";
import { PHARMACY_INVENTORY_PRODUCTS_V2 } from "../data/pharmacyInventoryProducts";

type StockItemSource = "core" | "inventory" | "custom";
type UnitOption =
  | "box"
  | "pack"
  | "bottle"
  | "blister"
  | "strip"
  | "vial"
  | "ampoule"
  | "tablet"
  | "capsule"
  | "piece";

interface StockItem {
  id: string;
  source: StockItemSource;
  productCode: string;
  productNameEn: string;
  productNameAr: string;
  subtitleEn: string;
  subtitleAr: string;
  barcode: string;
  categoryKey: string;
  batchNumber: string;
  expiry: string;
  warehouseZone: string;
  currentStock: number;
  stockTypeUpdate: "stockIn" | "stockOut";
  newStockQty: string;
  avgCost: string;
  sellPrice: string;
  reason: string;
}

interface ProductGroupMeta {
  key: string;
  source: StockItemSource;
  productCode: string;
  productNameEn: string;
  productNameAr: string;
  subtitleEn: string;
  subtitleAr: string;
  barcode: string;
  categoryKey: string;
  largestUnit: UnitOption;
  smallestUnit: UnitOption;
  smallestUnitsPerLargePack: string;
}

type ProductGroupWithRows = ProductGroupMeta & { rows: StockItem[] };

function buildCoreStockItem(product: AumetCoreProduct): StockItem {
  return {
    id: product.id,
    source: "core",
    productCode: product.code,
    productNameEn: product.nameEn,
    productNameAr: product.nameAr,
    subtitleEn: product.subtitleEn,
    subtitleAr: product.subtitleAr,
    barcode: product.barcode,
    categoryKey: product.categoryKey,
    batchNumber: "",
    expiry: "",
    warehouseZone: "",
    currentStock: product.currentStock,
    stockTypeUpdate: "stockIn",
    newStockQty: "",
    avgCost: product.avgCost,
    sellPrice: product.sellPrice,
    reason: "",
  };
}

function buildInventoryStockItem(product: PharmacyInventoryRow): StockItem {
  return {
    id: `inventory-${product.code}`,
    source: "inventory",
    productCode: product.code,
    productNameEn: product.nameEn,
    productNameAr: product.nameAr,
    subtitleEn: product.subtitleEn,
    subtitleAr: product.subtitleAr,
    barcode: product.barcode,
    categoryKey: product.categoryKey,
    batchNumber: product.lotBatch || "NEW-BATCH",
    expiry: product.expiry || "",
    warehouseZone: product.warehouseZone || "",
    currentStock: Number(product.stockQty) || 0,
    stockTypeUpdate: "stockIn",
    newStockQty: "",
    avgCost: product.avgCost,
    sellPrice: product.sellPrice,
    reason: "",
  };
}

function buildCustomStockItem(product: ManualCustomProductInput): StockItem {
  return {
    id: `custom-${product.productCode}`,
    source: "custom",
    productCode: product.productCode,
    productNameEn: product.productNameEn,
    productNameAr: product.productNameAr,
    subtitleEn: "",
    subtitleAr: "",
    barcode: product.barcode,
    categoryKey: product.categoryKey,
    batchNumber: "NEW-BATCH",
    expiry: "",
    warehouseZone: "",
    currentStock: Number(product.currentStock) || 0,
    stockTypeUpdate: "stockIn",
    newStockQty: "",
    avgCost: product.avgCost,
    sellPrice: product.sellPrice,
    reason: "",
  };
}

export function ManualUpdateStockPage({
  onNavigate,
}: {
  onNavigate?: (
    page:
      | "products"
      | "updateStock"
      | "manualUpdateStock"
      | "stockHistoryDetails",
  ) => void;
}) {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";
  const largestUnitLabel = language === "ar" ? "أكبر وحدة" : "Largest Unit";
  const smallestUnitLabel = language === "ar" ? "أصغر وحدة" : "Smallest Unit";
  const conversionCountLabel =
    language === "ar" ? "عدد الصغرى/كبرى" : "Smallest Unit Count";
  const editProductLabel = language === "ar" ? "تعديل المنتج" : "Edit Product";
  const productLabel = language === "ar" ? "المنتج" : "Product";
  const sourceLabel = language === "ar" ? "المصدر" : "Source";
  const unitsLabel = language === "ar" ? "الوحدات" : "Units";
  const aumetReferenceLabel =
    language === "ar" ? "مرجع Aumet" : "Aumet Reference";
  const openDetailsLabel = language === "ar" ? "فتح التفاصيل" : "Open Details";
  const selectedProductDetailsLabel =
    language === "ar" ? "تفاصيل المنتج المحدد" : "Selected Product Details";
  const unitLabels: Record<UnitOption, string> =
    language === "ar"
      ? {
          box: "صندوق",
          pack: "عبوة",
          bottle: "زجاجة",
          blister: "شريط",
          strip: "ستريب",
          vial: "فيال",
          ampoule: "أمبول",
          tablet: "قرص",
          capsule: "كبسولة",
          piece: "قطعة",
        }
      : {
          box: "Box",
          pack: "Pack",
          bottle: "Bottle",
          blister: "Blister",
          strip: "Strip",
          vial: "Vial",
          ampoule: "Ampoule",
          tablet: "Tablet",
          capsule: "Capsule",
          piece: "Piece",
        };
  const unitOptions: UnitOption[] = [
    "box",
    "pack",
    "bottle",
    "blister",
    "strip",
    "vial",
    "ampoule",
    "tablet",
    "capsule",
    "piece",
  ];
  const [searchQuery, setSearchQuery] = useState("");
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
  const [activeSource, setActiveSource] =
    useState<AddProductSource>("inventory");
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [productGroups, setProductGroups] = useState<ProductGroupMeta[]>([]);
  const [existingBatchPickerOpenKey, setExistingBatchPickerOpenKey] = useState<
    string | null
  >(null);
  const [batchActionMenuOpenKey, setBatchActionMenuOpenKey] = useState<
    string | null
  >(null);
  const [selectedExistingBatchIds, setSelectedExistingBatchIds] = useState<
    Record<string, string[]>
  >({});
  const [editableProductMetaKeys, setEditableProductMetaKeys] = useState<
    Record<string, boolean>
  >({});
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);

  const [useAumetReference, setUseAumetReference] = useState(true);
  const [autoGenerateBarcode, setAutoGenerateBarcode] = useState(true);
  const [resetExistingStock, setResetExistingStock] = useState(false);

  const visibleRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) return stockItems;

    return stockItems.filter((item) =>
      [
        item.productCode,
        item.barcode,
        item.productNameEn,
        item.productNameAr,
        item.subtitleEn,
        item.subtitleAr,
        item.batchNumber,
        item.expiry,
        item.warehouseZone,
      ].some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [searchQuery, stockItems]);

  const addCoreProductsToTable = (products: AumetCoreProduct[]) => {
    setProductGroups((current) => {
      const existingCodes = new Set(current.map((item) => item.productCode));
      const nextGroups = products
        .filter((product) => !existingCodes.has(product.code))
        .map((product) => ({
          key: `core::${product.code}`,
          source: "core" as const,
          productCode: product.code,
          productNameEn: product.nameEn,
          productNameAr: product.nameAr,
          subtitleEn: product.subtitleEn,
          subtitleAr: product.subtitleAr,
          barcode: product.barcode,
          categoryKey: product.categoryKey,
          largestUnit: "box" as const,
          smallestUnit: "piece" as const,
          smallestUnitsPerLargePack: "",
        }));

      return [...current, ...nextGroups];
    });

    setStockItems((current) => {
      const existingCodes = new Set(current.map((item) => item.productCode));
      const nextItems = products
        .filter((product) => !existingCodes.has(product.code))
        .map(buildCoreStockItem);

      return [...current, ...nextItems];
    });
  };

  const addInventoryProductsToTable = (
    products: SelectedInventoryProductWithBatches[],
  ) => {
    setProductGroups((current) => {
      const existingCodes = new Set(current.map((item) => item.productCode));
      const nextGroups = products
        .filter(({ product }) => !existingCodes.has(product.code))
        .map(({ product }) => ({
          key: `inventory::${product.code}`,
          source: "inventory" as const,
          productCode: product.code,
          productNameEn: product.nameEn,
          productNameAr: product.nameAr,
          subtitleEn: product.subtitleEn,
          subtitleAr: product.subtitleAr,
          barcode: product.barcode,
          categoryKey: product.categoryKey,
          largestUnit: "box" as const,
          smallestUnit: "piece" as const,
          smallestUnitsPerLargePack: "",
        }));

      return [...current, ...nextGroups];
    });

    setStockItems((current) => {
      const existingRowKeys = new Set(
        current.map((item) => `${item.productCode}::${item.batchNumber}`),
      );

      const nextItems = products.flatMap(({ product, selectedBatchIds }) => {
        const normalizedProduct = PHARMACY_INVENTORY_PRODUCTS_V2.find(
          (item) => item.code === product.code,
        );

        if (!normalizedProduct) {
          const fallbackRow = buildInventoryStockItem(product);
          return existingRowKeys.has(
            `${fallbackRow.productCode}::${fallbackRow.batchNumber}`,
          )
            ? []
            : [fallbackRow];
        }

        if (selectedBatchIds.length === 0) {
          const newBatchRow: StockItem = {
            id: `inventory-${product.code}-new-${current.length + Math.random()}`,
            source: "inventory",
            productCode: product.code,
            productNameEn: product.nameEn,
            productNameAr: product.nameAr,
            subtitleEn: product.subtitleEn,
            subtitleAr: product.subtitleAr,
            barcode: product.barcode,
            categoryKey: product.categoryKey,
            batchNumber: "",
            expiry: "",
            warehouseZone: "",
            currentStock: 0,
            stockTypeUpdate: "stockIn",
            newStockQty: "",
            avgCost: "",
            sellPrice: "",
            reason: "",
          };

          return [newBatchRow];
        }

        return normalizedProduct.batches
          .filter((batch) => selectedBatchIds.includes(batch.id))
          .map((batch) => ({
            id: `inventory-${product.code}-${batch.id}`,
            source: "inventory" as const,
            productCode: product.code,
            productNameEn: product.nameEn,
            productNameAr: product.nameAr,
            subtitleEn: product.subtitleEn,
            subtitleAr: product.subtitleAr,
            barcode: product.barcode,
            categoryKey: product.categoryKey,
            batchNumber: batch.batchNumber,
            expiry: batch.expiry,
            warehouseZone: batch.warehouseZone,
            currentStock: Number(batch.stockQty) || 0,
            stockTypeUpdate: "stockIn" as const,
            newStockQty: "",
            avgCost: batch.avgCost,
            sellPrice: batch.sellPrice,
            reason: "",
          }))
          .filter(
            (item) =>
              !existingRowKeys.has(`${item.productCode}::${item.batchNumber}`),
          );
      });

      return [...current, ...nextItems];
    });
  };

  const addCustomProductToTable = (product: ManualCustomProductInput) => {
    setProductGroups((current) => {
      const existingCodes = new Set(current.map((item) => item.productCode));
      if (existingCodes.has(product.productCode)) return current;

      return [
        ...current,
        {
          key: `custom::${product.productCode}`,
          source: "custom" as const,
          productCode: product.productCode,
          productNameEn: product.productNameEn,
          productNameAr: product.productNameAr,
          subtitleEn: "",
          subtitleAr: "",
          barcode: product.barcode,
          categoryKey: product.categoryKey,
          largestUnit: "box" as const,
          smallestUnit: "piece" as const,
          smallestUnitsPerLargePack: "",
        },
      ];
    });

    setStockItems((current) => {
      const existingCodes = new Set(current.map((item) => item.productCode));
      if (existingCodes.has(product.productCode)) return current;

      return [...current, buildCustomStockItem(product)];
    });
  };

  const removeStockItem = (id: string) => {
    setStockItems((current) => current.filter((item) => item.id !== id));
  };

  const removeProductGroup = (groupKey: string) => {
    const [, productCode] = groupKey.split("::");
    setProductGroups((current) =>
      current.filter((item) => item.productCode !== productCode),
    );
    setStockItems((current) =>
      current.filter((item) => item.productCode !== productCode),
    );
    setExistingBatchPickerOpenKey((current) =>
      current === groupKey ? null : current,
    );
    setBatchActionMenuOpenKey((current) =>
      current === groupKey ? null : current,
    );
  };

  const updateStockItem = (
    id: string,
    field: keyof StockItem,
    value: string | number,
  ) => {
    setStockItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;

        return {
          ...item,
          [field]: value,
        } as StockItem;
      }),
    );
  };

  const updateProductGroupMeta = (
    groupKey: string,
    field: "largestUnit" | "smallestUnit" | "smallestUnitsPerLargePack",
    value: string,
  ) => {
    setProductGroups((current) =>
      current.map((group) =>
        group.key === groupKey ? { ...group, [field]: value } : group,
      ),
    );
  };

  const toggleProductMetaEditing = (groupKey: string) => {
    setEditableProductMetaKeys((current) => ({
      ...current,
      [groupKey]: !current[groupKey],
    }));
  };

  const updateProductIdentityMeta = (
    groupKey: string,
    field: "productNameEn" | "productNameAr" | "barcode",
    value: string,
  ) => {
    const [source, productCode] = groupKey.split("::");

    setProductGroups((current) =>
      current.map((group) =>
        group.key === groupKey ? { ...group, [field]: value } : group,
      ),
    );

    setStockItems((current) =>
      current.map((item) =>
        item.productCode === productCode && item.source === source
          ? { ...item, [field]: value }
          : item,
      ),
    );
  };

  const groupedVisibleRows = useMemo<ProductGroupWithRows[]>(() => {
    const rowsMap = new Map<string, StockItem[]>();

    visibleRows.forEach((item) => {
      const key = `${item.source}::${item.productCode}`;
      const currentGroup = rowsMap.get(key) ?? [];
      currentGroup.push(item);
      rowsMap.set(key, currentGroup);
    });

    const normalizedQuery = searchQuery.trim().toLowerCase();

    return productGroups
      .filter((group) => {
        if (!normalizedQuery) return true;

        return [
          group.productCode,
          group.barcode,
          group.productNameEn,
          group.productNameAr,
          group.subtitleEn,
          group.subtitleAr,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));
      })
      .map((group) => ({
        ...group,
        rows: rowsMap.get(group.key) ?? [],
      }));
  }, [productGroups, searchQuery, visibleRows]);

  useEffect(() => {
    if (groupedVisibleRows.length === 0) {
      setSelectedGroupKey(null);
      return;
    }
    if (
      selectedGroupKey &&
      !groupedVisibleRows.some((group) => group.key === selectedGroupKey)
    ) {
      setSelectedGroupKey(null);
    }
  }, [groupedVisibleRows, selectedGroupKey]);

  const displayedGroups = useMemo<ProductGroupWithRows[]>(() => {
    return [];
  }, []);

  const addNewBatchRow = (groupKey: string) => {
    const [, productCode] = groupKey.split("::");
    const baseRow = stockItems.find((item) => item.productCode === productCode);
    const groupMeta = productGroups.find((group) => group.key === groupKey);
    if (!baseRow && !groupMeta) return;

    setStockItems((current) => [
      ...current,
      {
        id: `${(baseRow?.source ?? groupMeta?.source) || "inventory"}-${productCode}-new-${Date.now()}-${Math.random()}`,
        source: (baseRow?.source ??
          groupMeta?.source ??
          "inventory") as StockItemSource,
        productCode,
        productNameEn: baseRow?.productNameEn ?? groupMeta?.productNameEn ?? "",
        productNameAr: baseRow?.productNameAr ?? groupMeta?.productNameAr ?? "",
        subtitleEn: baseRow?.subtitleEn ?? groupMeta?.subtitleEn ?? "",
        subtitleAr: baseRow?.subtitleAr ?? groupMeta?.subtitleAr ?? "",
        barcode: baseRow?.barcode ?? groupMeta?.barcode ?? "",
        categoryKey: baseRow?.categoryKey ?? groupMeta?.categoryKey ?? "",
        batchNumber: "",
        expiry: "",
        warehouseZone: "",
        currentStock: 0,
        stockTypeUpdate: "stockIn",
        newStockQty: "",
        avgCost: "",
        sellPrice: "",
        reason: "",
      },
    ]);
  };

  const toggleExistingBatchSelection = (groupKey: string, batchId: string) => {
    setSelectedExistingBatchIds((current) => {
      const existing = current[groupKey] ?? [];
      const next = existing.includes(batchId)
        ? existing.filter((id) => id !== batchId)
        : [...existing, batchId];

      return {
        ...current,
        [groupKey]: next,
      };
    });
  };

  const addSelectedExistingBatches = (groupKey: string) => {
    const [, productCode] = groupKey.split("::");
    const selectedBatchIds = selectedExistingBatchIds[groupKey] ?? [];
    if (selectedBatchIds.length === 0) return;

    const normalizedProduct = PHARMACY_INVENTORY_PRODUCTS_V2.find(
      (item) => item.code === productCode,
    );
    const baseRow = stockItems.find((item) => item.productCode === productCode);
    const groupMeta = productGroups.find((group) => group.key === groupKey);
    if (!normalizedProduct || (!baseRow && !groupMeta)) return;

    const existingBatchNumbers = new Set(
      stockItems
        .filter((item) => item.productCode === productCode)
        .map((item) => item.batchNumber),
    );

    const rowsToAdd: StockItem[] = normalizedProduct.batches
      .filter((batch) => selectedBatchIds.includes(batch.id))
      .filter((batch) => !existingBatchNumbers.has(batch.batchNumber))
      .map((batch) => ({
        id: `${(baseRow?.source ?? groupMeta?.source) || "inventory"}-${productCode}-${batch.id}-${Date.now()}`,
        source: (baseRow?.source ??
          groupMeta?.source ??
          "inventory") as StockItemSource,
        productCode,
        productNameEn: baseRow?.productNameEn ?? groupMeta?.productNameEn ?? "",
        productNameAr: baseRow?.productNameAr ?? groupMeta?.productNameAr ?? "",
        subtitleEn: baseRow?.subtitleEn ?? groupMeta?.subtitleEn ?? "",
        subtitleAr: baseRow?.subtitleAr ?? groupMeta?.subtitleAr ?? "",
        barcode: baseRow?.barcode ?? groupMeta?.barcode ?? "",
        categoryKey: baseRow?.categoryKey ?? groupMeta?.categoryKey ?? "",
        batchNumber: batch.batchNumber,
        expiry: batch.expiry,
        warehouseZone: batch.warehouseZone,
        currentStock: Number(batch.stockQty) || 0,
        stockTypeUpdate: "stockIn" as const,
        newStockQty: "",
        avgCost: batch.avgCost,
        sellPrice: batch.sellPrice,
        reason: "",
      }));

    setStockItems((current) => [...current, ...rowsToAdd]);
    setSelectedExistingBatchIds((current) => ({
      ...current,
      [groupKey]: [],
    }));
    setExistingBatchPickerOpenKey(null);
    setBatchActionMenuOpenKey(null);
  };

  const addExistingBatchDirectly = (groupKey: string, batchId: string) => {
    const [, productCode] = groupKey.split("::");
    const normalizedProduct = PHARMACY_INVENTORY_PRODUCTS_V2.find(
      (item) => item.code === productCode,
    );
    const baseRow = stockItems.find((item) => item.productCode === productCode);
    const groupMeta = productGroups.find((group) => group.key === groupKey);
    if (!normalizedProduct || (!baseRow && !groupMeta)) return;

    const targetBatch = normalizedProduct.batches.find(
      (batch) => batch.id === batchId,
    );
    if (!targetBatch) return;

    const existingBatchNumbers = new Set(
      stockItems
        .filter((item) => item.productCode === productCode)
        .map((item) => item.batchNumber),
    );

    if (existingBatchNumbers.has(targetBatch.batchNumber)) return;

    setStockItems((current) => [
      ...current,
      {
        id: `${(baseRow?.source ?? groupMeta?.source) || "inventory"}-${productCode}-${targetBatch.id}-${Date.now()}`,
        source: (baseRow?.source ??
          groupMeta?.source ??
          "inventory") as StockItemSource,
        productCode,
        productNameEn: baseRow?.productNameEn ?? groupMeta?.productNameEn ?? "",
        productNameAr: baseRow?.productNameAr ?? groupMeta?.productNameAr ?? "",
        subtitleEn: baseRow?.subtitleEn ?? groupMeta?.subtitleEn ?? "",
        subtitleAr: baseRow?.subtitleAr ?? groupMeta?.subtitleAr ?? "",
        barcode: baseRow?.barcode ?? groupMeta?.barcode ?? "",
        categoryKey: baseRow?.categoryKey ?? groupMeta?.categoryKey ?? "",
        batchNumber: targetBatch.batchNumber,
        expiry: targetBatch.expiry,
        warehouseZone: targetBatch.warehouseZone,
        currentStock: Number(targetBatch.stockQty) || 0,
        stockTypeUpdate: "stockIn",
        newStockQty: "",
        avgCost: targetBatch.avgCost,
        sellPrice: targetBatch.sellPrice,
        reason: "",
      },
    ]);

    setSelectedExistingBatchIds((current) => ({
      ...current,
      [groupKey]: [],
    }));
    setExistingBatchPickerOpenKey(null);
    setBatchActionMenuOpenKey(null);
  };

  const handleSaveDraft = () => {
    console.log("Saving stock adjustments as draft:", stockItems);
  };

  const handleUpdateStock = () => {
    console.log("Updating stock:", stockItems);
  };

  const handleCancel = () => {
    setStockItems([]);
    onNavigate?.("updateStock");
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto">
      <AddProductDialog
        open={addProductDialogOpen}
        onOpenChange={setAddProductDialogOpen}
        activeSource={activeSource}
        onActiveSourceChange={setActiveSource}
        selectedCodes={stockItems.map((item) => item.productCode)}
        onAddCoreProducts={addCoreProductsToTable}
        onAddInventoryProducts={addInventoryProductsToTable}
        onAddCustomProduct={addCustomProductToTable}
      />

      <div className="p-6 space-y-3.5 flex-1" dir={isRTL ? "rtl" : "ltr"}>
        <div className={isRTL ? "text-right" : "text-left"}>
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">
              {t("manualUpdateStock")}
            </h1>
            <span className="text-gray-300 text-xl leading-none" aria-hidden>
              •
            </span>
            <p className="text-gray-500 text-base">
              {t("manualUpdateStockDescription")}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-2xl p-3">
          <div className="flex items-center gap-2 mb-2.5 flex-wrap">
            <div className="size-5 bg-teal-600 rounded-full flex items-center justify-center">
              <Sparkles className="size-3 text-white" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">
              {t("manualStockOptions")}
            </h3>
            <span className="text-[11px] text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full font-semibold">
              {t("configureBeforeManualUpdate")}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 hover:border-teal-300 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0">
                  <div className="size-7 bg-teal-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="size-3.5 text-teal-600" />
                  </div>
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <p className="text-xs font-bold text-gray-900 leading-5">
                      {t("matchAumetProducts")}
                    </p>
                    <p className="text-[11px] text-gray-600 leading-4 mt-0.5">
                      {t("autoFillProductDetails")}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={useAumetReference}
                  onCheckedChange={setUseAumetReference}
                />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 hover:border-teal-300 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0">
                  <div className="size-7 bg-purple-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <FileSpreadsheet className="size-3.5 text-purple-600" />
                  </div>
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <p className="text-xs font-bold text-gray-900 leading-5">
                      {t("autoCreateBarcodes")}
                    </p>
                    <p className="text-[11px] text-gray-600 leading-4 mt-0.5">
                      {t("generateBarcodesForProducts")}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={autoGenerateBarcode}
                  onCheckedChange={setAutoGenerateBarcode}
                />
              </div>
            </div>

            <div className="bg-white border border-orange-200 rounded-xl px-3 py-2 hover:border-orange-300 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0">
                  <div className="size-7 bg-orange-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="size-3.5 text-orange-600" />
                  </div>
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <p className="text-xs font-bold text-gray-900 leading-5">
                      {t("resetOldStock")}
                    </p>
                    <p className="text-[11px] text-gray-600 leading-4 mt-0.5">
                      {t("setStockToZero")}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={resetExistingStock}
                  onCheckedChange={setResetExistingStock}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="-mx-6 sm:mx-0 bg-white border border-gray-200 rounded-none sm:rounded-2xl overflow-visible">
          <div className="p-4 border-b border-gray-200 space-y-3 bg-gradient-to-b from-gray-50 to-white">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("searchManualStockTable")}
                  dir={isRTL ? "rtl" : "ltr"}
                  className={`ps-9 h-10 text-sm border-gray-300 rounded-full w-full ${isRTL ? "text-right" : "text-left"}`}
                />
              </div>
              <Button
                type="button"
                onClick={() => {
                  setActiveSource("core");
                  setAddProductDialogOpen(true);
                }}
                className="h-10 gap-2 rounded-full bg-teal-500 px-4 text-sm text-white whitespace-nowrap hover:bg-teal-600"
              >
                <Plus className="size-4" />
                {t("addProduct")}
              </Button>
            </div>
          </div>

          {stockItems.length > 0 ? (
            <>
              <div className="p-3 space-y-3 bg-gray-50">
                {groupedVisibleRows.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl overflow-auto">
                    <Table className="text-[11px] sm:text-xs">
                      <TableHeader>
                        <TableRow className="bg-gray-50 border-b border-gray-200">
                          <TableHead
                            className={`h-9 text-[10px] sm:text-[11px] ${isRTL ? "text-right" : "text-left"}`}
                          >
                            {productLabel}
                          </TableHead>
                          <TableHead className="h-9 text-[10px] sm:text-[11px] text-center">
                            {sourceLabel}
                          </TableHead>
                          <TableHead className="h-9 text-[10px] sm:text-[11px] text-center">
                            {t("batches")}
                          </TableHead>
                          <TableHead className="h-9 text-[10px] sm:text-[11px] text-center">
                            {unitsLabel}
                          </TableHead>
                          <TableHead className="h-9 text-[10px] sm:text-[11px] text-center">
                            {aumetReferenceLabel}
                          </TableHead>
                          <TableHead className="h-9 text-[10px] sm:text-[11px] text-center">
                            {t("actions")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupedVisibleRows.map((group) => (
                          <React.Fragment key={`summary-${group.key}`}>
                            <TableRow
                              onClick={() =>
                                setSelectedGroupKey((current) =>
                                  current === group.key ? null : group.key,
                                )
                              }
                              className={`border-b border-gray-100 ${
                                selectedGroupKey === group.key
                                  ? "bg-teal-50 ring-1 ring-inset ring-teal-200"
                                  : "hover:bg-gray-50 cursor-pointer"
                              }`}
                            >
                              <TableCell
                                className={`${isRTL ? "text-right" : "text-left"}`}
                              >
                                <div
                                  className="font-medium text-gray-900 truncate whitespace-nowrap"
                                  dir={isRTL ? "rtl" : "ltr"}
                                >
                                  {language === "ar"
                                    ? group.productNameAr
                                    : group.productNameEn}{" "}
                                  <span
                                    className="text-[10px] text-gray-500"
                                    dir="ltr"
                                  >
                                    • {group.productCode} • {group.barcode}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge className="rounded-full px-2 py-0.5 text-[10px] bg-gray-100 text-gray-700 hover:bg-gray-100 h-5">
                                  {t(`productSource.${group.source}`)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center text-gray-700 font-medium">
                                {group.rows.length}
                              </TableCell>
                              <TableCell className="text-center text-gray-700">
                                {unitLabels[group.largestUnit]} /{" "}
                                {unitLabels[group.smallestUnit]}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge
                                  className={`rounded-full px-2 py-0.5 text-[10px] h-5 ${
                                    group.source === "core"
                                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                      : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                                  }`}
                                >
                                  {group.source === "core"
                                    ? t("linked")
                                    : t("notLinked")}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-1 flex-wrap">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedGroupKey((current) =>
                                        current === group.key
                                          ? null
                                          : group.key,
                                      );
                                    }}
                                    className="h-7 px-2 text-[10px] sm:text-xs rounded-full border-gray-300"
                                  >
                                    {selectedGroupKey === group.key
                                      ? language === "ar"
                                        ? "إخفاء"
                                        : "Collapse"
                                      : language === "ar"
                                        ? "توسيع"
                                        : "Expand"}
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedGroupKey(group.key);
                                      const normalizedProduct =
                                        group.source === "inventory"
                                          ? PHARMACY_INVENTORY_PRODUCTS_V2.find(
                                              (item) =>
                                                item.code === group.productCode,
                                            )
                                          : null;
                                      const usedBatchNumbers = new Set(
                                        group.rows
                                          .map((row) => row.batchNumber)
                                          .filter(Boolean),
                                      );
                                      const availableBatches =
                                        normalizedProduct?.batches.filter(
                                          (batch) =>
                                            !usedBatchNumbers.has(
                                              batch.batchNumber,
                                            ),
                                        ) ?? [];

                                      if (availableBatches.length === 0) {
                                        addNewBatchRow(group.key);
                                        return;
                                      }

                                      setBatchActionMenuOpenKey((current) =>
                                        current === group.key
                                          ? null
                                          : group.key,
                                      );
                                      setExistingBatchPickerOpenKey(null);
                                    }}
                                    className="h-7 px-2 text-[10px] sm:text-xs rounded-full bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200"
                                  >
                                    {t("addBatch")}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeProductGroup(group.key);
                                    }}
                                    className="h-7 px-2 text-[10px] sm:text-xs rounded-full border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                                  >
                                    {language === "ar" ? "حذف" : "Delete"}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>

                            {selectedGroupKey === group.key && (
                              <TableRow className="bg-white">
                                <TableCell colSpan={6} className="p-3">
                                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-3">
                                    <div
                                      className={`flex items-start justify-between gap-3 flex-wrap ${isRTL ? "flex-row-reverse" : "flex-row"}`}
                                    >
                                      <div className="flex items-center gap-2 whitespace-nowrap overflow-x-auto pb-1 flex-1 min-w-0">
                                        <Input
                                          value={
                                            language === "ar"
                                              ? group.productNameAr
                                              : group.productNameEn
                                          }
                                          onChange={(e) =>
                                            updateProductIdentityMeta(
                                              group.key,
                                              language === "ar"
                                                ? "productNameAr"
                                                : "productNameEn",
                                              e.target.value,
                                            )
                                          }
                                          dir={isRTL ? "rtl" : "ltr"}
                                          className={`h-7 rounded-full w-[220px] text-xs border-gray-300 bg-white ${isRTL ? "text-right" : "text-left"}`}
                                        />
                                        <Input
                                          value={group.barcode}
                                          onChange={(e) =>
                                            updateProductIdentityMeta(
                                              group.key,
                                              "barcode",
                                              e.target.value,
                                            )
                                          }
                                          dir="ltr"
                                          className="h-7 rounded-full w-[150px] text-xs border-gray-300 bg-white"
                                        />
                                        <span className="text-[10px] sm:text-[11px] text-gray-600">
                                          {largestUnitLabel}
                                        </span>
                                        <Select
                                          value={group.largestUnit}
                                          onValueChange={(value) =>
                                            updateProductGroupMeta(
                                              group.key,
                                              "largestUnit",
                                              value,
                                            )
                                          }
                                        >
                                          <SelectTrigger className="h-7 rounded-full w-[104px] text-xs border-gray-300 bg-white">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent className="rounded-xl">
                                            {unitOptions.map((unitOption) => (
                                              <SelectItem
                                                key={unitOption}
                                                value={unitOption}
                                              >
                                                {unitLabels[unitOption]}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>

                                        <span className="text-[10px] sm:text-[11px] text-gray-600">
                                          {smallestUnitLabel}
                                        </span>
                                        <Select
                                          value={group.smallestUnit}
                                          onValueChange={(value) =>
                                            updateProductGroupMeta(
                                              group.key,
                                              "smallestUnit",
                                              value,
                                            )
                                          }
                                        >
                                          <SelectTrigger className="h-7 rounded-full w-[104px] text-xs border-gray-300 bg-white">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent className="rounded-xl">
                                            {unitOptions.map((unitOption) => (
                                              <SelectItem
                                                key={unitOption}
                                                value={unitOption}
                                              >
                                                {unitLabels[unitOption]}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>

                                        <span className="text-[10px] sm:text-[11px] text-gray-600">
                                          {conversionCountLabel}
                                        </span>
                                        <Input
                                          type="number"
                                          min="0"
                                          value={
                                            group.smallestUnitsPerLargePack
                                          }
                                          onChange={(e) =>
                                            updateProductGroupMeta(
                                              group.key,
                                              "smallestUnitsPerLargePack",
                                              e.target.value,
                                            )
                                          }
                                          dir="ltr"
                                          className="h-7 rounded-full w-[92px] text-xs text-center border-gray-300 bg-white"
                                        />
                                      </div>

                                      <div
                                        className={`flex items-center gap-2 flex-wrap relative shrink-0 ${isRTL ? "justify-start" : "justify-end"}`}
                                      >
                                        {(() => {
                                          const normalizedProduct =
                                            group.source === "inventory"
                                              ? PHARMACY_INVENTORY_PRODUCTS_V2.find(
                                                  (item) =>
                                                    item.code ===
                                                    group.productCode,
                                                )
                                              : null;
                                          const usedBatchNumbers = new Set(
                                            group.rows
                                              .map((row) => row.batchNumber)
                                              .filter(Boolean),
                                          );
                                          const availableBatches =
                                            normalizedProduct?.batches.filter(
                                              (batch) =>
                                                !usedBatchNumbers.has(
                                                  batch.batchNumber,
                                                ),
                                            ) ?? [];

                                          return (
                                            <>
                                              <Button
                                                onClick={() => {
                                                  if (
                                                    availableBatches.length ===
                                                    0
                                                  ) {
                                                    addNewBatchRow(group.key);
                                                    return;
                                                  }
                                                  setBatchActionMenuOpenKey(
                                                    (current) =>
                                                      current === group.key
                                                        ? null
                                                        : group.key,
                                                  );
                                                  setExistingBatchPickerOpenKey(
                                                    null,
                                                  );
                                                }}
                                                className="h-9 px-4 rounded-full text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 shadow-sm gap-2"
                                              >
                                                <Plus className="size-4" />
                                                {t("addBatch")}
                                              </Button>
                                              {availableBatches.length > 0 &&
                                                batchActionMenuOpenKey ===
                                                  group.key && (
                                                  <div
                                                    className={`absolute top-11 ${isRTL ? "left-0" : "right-0"} z-[99999] w-56 rounded-2xl border border-gray-200 bg-white shadow-2xl p-2 space-y-1`}
                                                  >
                                                    {existingBatchPickerOpenKey ===
                                                    group.key ? (
                                                      <>
                                                        <div className="px-3 py-2 border-b border-gray-100 mb-1">
                                                          <div className="text-sm font-semibold text-gray-900">
                                                            {t(
                                                              "selectExistingBatch",
                                                            )}
                                                          </div>
                                                          <div className="text-xs text-gray-500 mt-0.5">
                                                            {t(
                                                              "chooseBatchToEditAndAdd",
                                                            )}
                                                          </div>
                                                        </div>

                                                        {availableBatches.map(
                                                          (batch) => (
                                                            <button
                                                              key={batch.id}
                                                              type="button"
                                                              onClick={() =>
                                                                addExistingBatchDirectly(
                                                                  group.key,
                                                                  batch.id,
                                                                )
                                                              }
                                                              className="w-full rounded-xl px-3 py-3 text-start bg-white hover:bg-sky-50 text-gray-700 border border-gray-200 hover:border-sky-300 transition-colors"
                                                            >
                                                              <div className="text-sm font-medium text-gray-900">
                                                                {
                                                                  batch.batchNumber
                                                                }
                                                              </div>
                                                              <div className="text-xs text-gray-500 mt-0.5">
                                                                {t("expiry")}:{" "}
                                                                {batch.expiry}
                                                              </div>
                                                            </button>
                                                          ),
                                                        )}

                                                        <button
                                                          type="button"
                                                          onClick={() =>
                                                            setExistingBatchPickerOpenKey(
                                                              null,
                                                            )
                                                          }
                                                          className="w-full rounded-xl px-3 py-2 text-sm text-start hover:bg-gray-50 text-gray-700 border-t border-gray-100 mt-1"
                                                        >
                                                          {t("cancel")}
                                                        </button>
                                                      </>
                                                    ) : (
                                                      <div className="flex flex-col gap-2 w-full">
                                                        <button
                                                          type="button"
                                                          onClick={() =>
                                                            setExistingBatchPickerOpenKey(
                                                              group.key,
                                                            )
                                                          }
                                                          className="block w-full rounded-xl px-3 py-3 text-sm text-start bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 transition-colors"
                                                        >
                                                          {t(
                                                            "editExistingBatch",
                                                          )}
                                                        </button>
                                                        <button
                                                          type="button"
                                                          onClick={() => {
                                                            addNewBatchRow(
                                                              group.key,
                                                            );
                                                            setBatchActionMenuOpenKey(
                                                              null,
                                                            );
                                                          }}
                                                          className="block w-full rounded-xl px-3 py-3 text-sm text-start bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-colors"
                                                        >
                                                          {t("addNewBatch")}
                                                        </button>
                                                      </div>
                                                    )}
                                                  </div>
                                                )}
                                            </>
                                          );
                                        })()}
                                      </div>
                                    </div>

                                    {group.rows.length > 0 ? (
                                      <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white">
                                        <Table className="text-[11px] sm:text-xs">
                                          <TableHeader>
                                            <TableRow className="border-b border-gray-200 bg-white">
                                              <TableHead className="text-[10px] sm:text-[11px] font-semibold text-gray-700 h-8 sm:h-10">
                                                {t("batchNumber")}
                                              </TableHead>
                                              <TableHead className="text-[10px] sm:text-[11px] font-semibold text-gray-700 h-8 sm:h-10">
                                                {t("expiry")}
                                              </TableHead>
                                              <TableHead className="text-[10px] sm:text-[11px] font-semibold text-gray-700 h-8 sm:h-10">
                                                {t("warehouseLocation")}
                                              </TableHead>
                                              <TableHead className="text-[10px] sm:text-[11px] font-semibold text-gray-700 h-8 sm:h-10">
                                                {t("stockTypeUpdate")}
                                              </TableHead>
                                              <TableHead className="text-[10px] sm:text-[11px] font-semibold text-gray-700 h-8 sm:h-10 text-center">
                                                {t("currentStock")}
                                              </TableHead>
                                              <TableHead className="text-[10px] sm:text-[11px] font-semibold text-gray-700 h-8 sm:h-10 text-center">
                                                {t("newStockQty")}
                                              </TableHead>
                                              <TableHead className="text-[10px] sm:text-[11px] font-semibold text-gray-700 h-8 sm:h-10 text-center">
                                                {t("cost")}
                                              </TableHead>
                                              <TableHead className="text-[10px] sm:text-[11px] font-semibold text-gray-700 h-8 sm:h-10 text-center">
                                                {t("sellingPrice")}
                                              </TableHead>
                                              <TableHead className="text-[10px] sm:text-[11px] font-semibold text-gray-700 h-8 sm:h-10 text-center">
                                                {t("newStockLevel")}
                                              </TableHead>
                                              <TableHead className="text-[10px] sm:text-[11px] font-semibold text-gray-700 h-8 sm:h-10">
                                                {t("reason")}
                                              </TableHead>
                                              <TableHead className="text-[10px] sm:text-[11px] font-semibold text-gray-700 h-8 sm:h-10 text-center">
                                                {t("actions")}
                                              </TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {group.rows.map((item) => {
                                              const nextLevel =
                                                item.stockTypeUpdate ===
                                                "stockIn"
                                                  ? item.currentStock +
                                                    (Number(item.newStockQty) ||
                                                      0)
                                                  : Math.max(
                                                      0,
                                                      item.currentStock -
                                                        (Number(
                                                          item.newStockQty,
                                                        ) || 0),
                                                    );
                                              return (
                                                <TableRow
                                                  key={`inline-${item.id}`}
                                                >
                                                  <TableCell className="py-2">
                                                    <Input
                                                      value={item.batchNumber}
                                                      onChange={(e) =>
                                                        updateStockItem(
                                                          item.id,
                                                          "batchNumber",
                                                          e.target.value,
                                                        )
                                                      }
                                                      placeholder={t(
                                                        "batchNumber",
                                                      )}
                                                      dir="ltr"
                                                      className="h-9 rounded-full w-[118px] text-[11px] border-gray-300 bg-white placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-teal-500/20"
                                                    />
                                                  </TableCell>
                                                  <TableCell className="py-2">
                                                    <Input
                                                      value={item.expiry}
                                                      onChange={(e) =>
                                                        updateStockItem(
                                                          item.id,
                                                          "expiry",
                                                          e.target.value,
                                                        )
                                                      }
                                                      placeholder={t("expiry")}
                                                      dir="ltr"
                                                      className="h-9 rounded-full w-[110px] text-[11px] border-gray-300 bg-white placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-teal-500/20"
                                                    />
                                                  </TableCell>
                                                  <TableCell className="py-2">
                                                    <Input
                                                      value={item.warehouseZone}
                                                      onChange={(e) =>
                                                        updateStockItem(
                                                          item.id,
                                                          "warehouseZone",
                                                          e.target.value,
                                                        )
                                                      }
                                                      placeholder={t(
                                                        "warehouseLocation",
                                                      )}
                                                      className="h-9 rounded-full w-[128px] text-[11px] border-gray-300 bg-white placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-teal-500/20"
                                                    />
                                                  </TableCell>
                                                  <TableCell className="py-2">
                                                    <Select
                                                      value={
                                                        item.stockTypeUpdate
                                                      }
                                                      onValueChange={(value) =>
                                                        updateStockItem(
                                                          item.id,
                                                          "stockTypeUpdate",
                                                          value,
                                                        )
                                                      }
                                                    >
                                                      <SelectTrigger className="w-[120px] rounded-full h-9 text-[11px] border-gray-300 bg-white focus:ring-2 focus:ring-teal-500/20">
                                                        <SelectValue />
                                                      </SelectTrigger>
                                                      <SelectContent>
                                                        <SelectItem value="stockIn">
                                                          {t("stockIn")}
                                                        </SelectItem>
                                                        <SelectItem value="stockOut">
                                                          {t("stockOut")}
                                                        </SelectItem>
                                                      </SelectContent>
                                                    </Select>
                                                  </TableCell>
                                                  <TableCell className="py-2 text-center">
                                                    {item.currentStock}
                                                  </TableCell>
                                                  <TableCell className="py-2 text-center">
                                                    <Input
                                                      type="number"
                                                      min="0"
                                                      value={item.newStockQty}
                                                      onChange={(e) =>
                                                        updateStockItem(
                                                          item.id,
                                                          "newStockQty",
                                                          e.target.value,
                                                        )
                                                      }
                                                      placeholder={
                                                        language === "ar"
                                                          ? "الكمية"
                                                          : "Qty"
                                                      }
                                                      dir="ltr"
                                                      className="w-[90px] h-9 rounded-full text-center mx-auto text-[11px] border-gray-300 bg-white placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-teal-500/20"
                                                    />
                                                  </TableCell>
                                                  <TableCell className="py-2 text-center">
                                                    <Input
                                                      type="number"
                                                      min="0"
                                                      step="0.01"
                                                      value={item.avgCost}
                                                      onChange={(e) =>
                                                        updateStockItem(
                                                          item.id,
                                                          "avgCost",
                                                          e.target.value,
                                                        )
                                                      }
                                                      placeholder={
                                                        language === "ar"
                                                          ? "التكلفة"
                                                          : "Cost"
                                                      }
                                                      className="w-[90px] h-9 rounded-full text-center mx-auto text-[11px] border-gray-300 bg-white placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-teal-500/20"
                                                    />
                                                  </TableCell>
                                                  <TableCell className="py-2 text-center">
                                                    <Input
                                                      type="number"
                                                      min="0"
                                                      step="0.01"
                                                      value={item.sellPrice}
                                                      onChange={(e) =>
                                                        updateStockItem(
                                                          item.id,
                                                          "sellPrice",
                                                          e.target.value,
                                                        )
                                                      }
                                                      placeholder={
                                                        language === "ar"
                                                          ? "السعر"
                                                          : "Price"
                                                      }
                                                      className="w-[90px] h-9 rounded-full text-center mx-auto text-[11px] border-gray-300 bg-white placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-teal-500/20"
                                                    />
                                                  </TableCell>
                                                  <TableCell className="py-2 text-center">
                                                    <span className="inline-flex min-w-[64px] items-center justify-center rounded-md px-2 py-1 text-[11px] font-semibold bg-gray-50 text-gray-900">
                                                      {nextLevel}
                                                    </span>
                                                  </TableCell>
                                                  <TableCell className="py-2">
                                                    <Input
                                                      value={item.reason}
                                                      onChange={(e) =>
                                                        updateStockItem(
                                                          item.id,
                                                          "reason",
                                                          e.target.value,
                                                        )
                                                      }
                                                      placeholder={t(
                                                        "enterAdjustmentReason",
                                                      )}
                                                      className={`h-9 rounded-full w-[168px] text-[11px] border-gray-300 bg-white placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-teal-500/20 ${
                                                        isRTL
                                                          ? "text-right"
                                                          : "text-left"
                                                      }`}
                                                    />
                                                  </TableCell>
                                                  <TableCell className="py-2 text-center">
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={() =>
                                                        removeStockItem(item.id)
                                                      }
                                                      className="size-8 p-0 hover:bg-red-50 text-red-600 rounded-full"
                                                    >
                                                      <Trash2 className="size-4" />
                                                    </Button>
                                                  </TableCell>
                                                </TableRow>
                                              );
                                            })}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    ) : (
                                      <div className="px-4 py-4 text-center border border-gray-200 rounded-xl bg-white">
                                        <div className="text-sm font-semibold text-gray-900">
                                          {t("noBatchRowsYet")}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                          {t("addExistingOrCreateNewBatch")}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              <div className="px-4 py-3 border-t border-gray-200 bg-white flex items-center justify-between gap-3">
                <div className="text-sm text-gray-600">
                  {t("manualStockRowsCount")} {visibleRows.length}
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="h-10 px-4 rounded-full border-gray-300"
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSaveDraft}
                    className="h-10 px-4 rounded-full border-gray-300 text-gray-700"
                  >
                    {t("saveAsDraft")}
                  </Button>
                  <Button
                    onClick={handleUpdateStock}
                    className="bg-teal-500 hover:bg-teal-600 h-10 px-5 text-white rounded-full gap-2"
                  >
                    <Save className="size-4" />
                    {t("updateStock")}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="size-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="size-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("noProductsAddedYet")}
                </h3>
                <p className="text-sm text-gray-600 mb-5">
                  {t("manualStockEmptyStateDescription")}
                </p>
                <Button
                  onClick={() => {
                    setActiveSource("core");
                    setAddProductDialogOpen(true);
                  }}
                  className="bg-teal-500 hover:bg-teal-600 rounded-full h-10 px-5 gap-2"
                >
                  <Plus className="size-4" />
                  {t("addProduct")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer
        className="sticky bottom-0 z-40 border-t border-gray-200 bg-white px-6 py-3"
        dir={isRTL ? "rtl" : "ltr"}
      >
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
