import { useMemo, useState } from "react";
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
import { AumetCoreProductsDialog } from "./AumetCoreProductsDialog";
import {
  MyProductsDialog,
  type SelectedInventoryProductWithBatches,
} from "./MyProductsDialog";
import {
  AddProductSourceDialog,
  type ProductSourceOption,
} from "./AddProductSourceDialog";
import {
  ManualStockCustomProductDialog,
  type ManualCustomProductInput,
} from "./ManualStockCustomProductDialog";
import type { AumetCoreProduct } from "../data/aumetCoreProductsSample";
import type { PharmacyInventoryRow } from "../data/pharmacyInventorySample";
import { PHARMACY_INVENTORY_PRODUCTS_V2 } from "../data/pharmacyInventoryProducts";

type StockItemSource = "core" | "inventory" | "custom";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [addSourceOpen, setAddSourceOpen] = useState(false);
  const [corePickerOpen, setCorePickerOpen] = useState(false);
  const [inventoryPickerOpen, setInventoryPickerOpen] = useState(false);
  const [customProductOpen, setCustomProductOpen] = useState(false);
  const [activeSource, setActiveSource] = useState<ProductSourceOption | null>(
    null,
  );
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [existingBatchPickerOpenKey, setExistingBatchPickerOpenKey] = useState<
    string | null
  >(null);
  const [batchActionMenuOpenKey, setBatchActionMenuOpenKey] = useState<
    string | null
  >(null);
  const [selectedExistingBatchIds, setSelectedExistingBatchIds] = useState<
    Record<string, string[]>
  >({});

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
    setStockItems((current) => {
      const existingCodes = new Set(current.map((item) => item.productCode));
      if (existingCodes.has(product.productCode)) return current;

      return [...current, buildCustomStockItem(product)];
    });
  };

  const removeStockItem = (id: string) => {
    setStockItems((current) => current.filter((item) => item.id !== id));
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

  const openSourceStep = (source: ProductSourceOption) => {
    setActiveSource(source);
    setAddSourceOpen(false);
    setCorePickerOpen(source === "core");
    setInventoryPickerOpen(source === "inventory");
    setCustomProductOpen(source === "custom");
  };

  const openSourceChooser = () => {
    setCorePickerOpen(false);
    setInventoryPickerOpen(false);
    setCustomProductOpen(false);
    setAddSourceOpen(true);
  };

  const groupedVisibleRows = useMemo(() => {
    const groups = new Map<string, StockItem[]>();

    visibleRows.forEach((item) => {
      const key = `${item.source}::${item.productCode}`;
      const currentGroup = groups.get(key) ?? [];
      currentGroup.push(item);
      groups.set(key, currentGroup);
    });

    return Array.from(groups.entries()).map(([key, items]) => ({
      key,
      source: items[0].source,
      productCode: items[0].productCode,
      productNameEn: items[0].productNameEn,
      productNameAr: items[0].productNameAr,
      subtitleEn: items[0].subtitleEn,
      subtitleAr: items[0].subtitleAr,
      barcode: items[0].barcode,
      categoryKey: items[0].categoryKey,
      rows: items,
    }));
  }, [visibleRows]);

  const addNewBatchRow = (groupKey: string) => {
    const [, productCode] = groupKey.split("::");
    const baseRow = stockItems.find((item) => item.productCode === productCode);
    if (!baseRow) return;

    setStockItems((current) => [
      ...current,
      {
        ...baseRow,
        id: `${baseRow.source}-${baseRow.productCode}-new-${Date.now()}-${Math.random()}`,
        batchNumber: "",
        expiry: "",
        warehouseZone: "",
        currentStock: 0,
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
    if (!normalizedProduct || !baseRow) return;

    const existingBatchNumbers = new Set(
      stockItems
        .filter((item) => item.productCode === productCode)
        .map((item) => item.batchNumber),
    );

    const rowsToAdd = normalizedProduct.batches
      .filter((batch) => selectedBatchIds.includes(batch.id))
      .filter((batch) => !existingBatchNumbers.has(batch.batchNumber))
      .map((batch) => ({
        ...baseRow,
        id: `${baseRow.source}-${productCode}-${batch.id}-${Date.now()}`,
        batchNumber: batch.batchNumber,
        expiry: batch.expiry,
        warehouseZone: batch.warehouseZone,
        currentStock: Number(batch.stockQty) || 0,
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
    if (!normalizedProduct || !baseRow) return;

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
        ...baseRow,
        id: `${baseRow.source}-${productCode}-${targetBatch.id}-${Date.now()}`,
        batchNumber: targetBatch.batchNumber,
        expiry: targetBatch.expiry,
        warehouseZone: targetBatch.warehouseZone,
        currentStock: Number(targetBatch.stockQty) || 0,
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
      <AddProductSourceDialog
        open={addSourceOpen}
        onOpenChange={setAddSourceOpen}
        selectedSource={activeSource}
        onSelectSource={openSourceStep}
      />

      <AumetCoreProductsDialog
        open={corePickerOpen}
        onOpenChange={setCorePickerOpen}
        selectedCodes={stockItems.map((item) => item.productCode)}
        onAddProducts={addCoreProductsToTable}
        onBackToSource={openSourceChooser}
      />

      <MyProductsDialog
        open={inventoryPickerOpen}
        onOpenChange={setInventoryPickerOpen}
        selectedCodes={stockItems.map((item) => item.productCode)}
        onAddProducts={addInventoryProductsToTable}
        onBackToSource={openSourceChooser}
      />

      <ManualStockCustomProductDialog
        open={customProductOpen}
        onOpenChange={setCustomProductOpen}
        existingCodes={stockItems.map((item) => item.productCode)}
        onAddProduct={addCustomProductToTable}
        onBackToSource={openSourceChooser}
      />

      <div className="p-6 space-y-5 flex-1" dir={isRTL ? "rtl" : "ltr"}>
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <span className="text-teal-600 cursor-pointer">{t("dashboard")}</span>
          <span className="text-gray-400" aria-hidden>
            {t("breadcrumbSeparator")}
          </span>
          <span className="text-teal-600 cursor-pointer">{t("stocks")}</span>
          <span className="text-gray-400" aria-hidden>
            {t("breadcrumbSeparator")}
          </span>
          <span className="text-gray-600">{t("manualUpdateStock")}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className={isRTL ? "text-right" : "text-left"}>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("manualUpdateStock")}
            </h1>
            <p className="text-gray-500 text-base">
              {t("manualUpdateStockDescription")}
            </p>
          </div>
          <Button
            onClick={() => setAddSourceOpen(true)}
            className="bg-teal-500 hover:bg-teal-600 h-10 gap-2 px-4 text-sm rounded-full"
          >
            <Plus className="size-4" />
            {t("addProduct")}
          </Button>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-2xl p-3.5">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
            <div className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 hover:border-teal-300 transition-all">
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

            <div className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 hover:border-teal-300 transition-all">
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

            <div className="bg-white border border-orange-200 rounded-xl px-3 py-2.5 hover:border-orange-300 transition-all">
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

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-200">
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
                onClick={() => setAddSourceOpen(true)}
                variant="outline"
                className="h-10 gap-2 px-4 text-sm rounded-full border-gray-300"
              >
                <Package className="size-4" />
                {t("addProduct")}
              </Button>
            </div>
          </div>

          {stockItems.length > 0 ? (
            <>
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {t("batchDetails")}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {t("existingBatchesCanBeEdited")}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {t("manualStockRowsCount")} {visibleRows.length}
                </div>
              </div>

              <div className="p-4 space-y-4">
                {groupedVisibleRows.map((group) => (
                  <div
                    key={group.key}
                    className="rounded-2xl border border-gray-200 bg-white overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-start justify-between gap-3 flex-wrap">
                      <div className={isRTL ? "text-right" : "text-left"}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {language === "ar"
                              ? group.productNameAr
                              : group.productNameEn}
                          </div>
                          <Badge className="rounded-full px-2 py-0.5 text-[10px] bg-gray-100 text-gray-700 hover:bg-gray-100">
                            {t(`productSource.${group.source}`)}
                          </Badge>
                          <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100 rounded-full px-2 py-0.5 text-[10px]">
                            {group.rows.length} {t("batches")}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                          <span dir="ltr">{group.productCode}</span>
                          <span>•</span>
                          <span dir="ltr">{group.barcode}</span>
                          <span>•</span>
                          <span>{t(group.categoryKey)}</span>
                        </div>
                        {(language === "ar"
                          ? group.subtitleAr
                          : group.subtitleEn) && (
                          <div className="text-xs text-gray-500 mt-1">
                            {language === "ar"
                              ? group.subtitleAr
                              : group.subtitleEn}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap relative">
                        {(() => {
                          const normalizedProduct =
                            group.source === "inventory"
                              ? PHARMACY_INVENTORY_PRODUCTS_V2.find(
                                  (item) => item.code === group.productCode,
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
                                !usedBatchNumbers.has(batch.batchNumber),
                            ) ?? [];

                          return (
                            <>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  if (availableBatches.length === 0) {
                                    addNewBatchRow(group.key);
                                    return;
                                  }

                                  setBatchActionMenuOpenKey((current) =>
                                    current === group.key ? null : group.key,
                                  );
                                  setExistingBatchPickerOpenKey(null);
                                }}
                                className="h-9 px-4 rounded-full border-gray-300 gap-2"
                              >
                                <Plus className="size-4" />
                                {t("addBatch")}
                              </Button>

                              {availableBatches.length > 0 &&
                                batchActionMenuOpenKey === group.key && (
                                  <div className="absolute top-11 end-0 z-10 w-56 rounded-2xl border border-gray-200 bg-white shadow-lg p-2 space-y-1">
                                    {existingBatchPickerOpenKey ===
                                    group.key ? (
                                      <>
                                        <div className="px-3 py-2 border-b border-gray-100 mb-1">
                                          <div className="text-sm font-semibold text-gray-900">
                                            {t("selectExistingBatch")}
                                          </div>
                                          <div className="text-xs text-gray-500 mt-0.5">
                                            {t("chooseBatchToEditAndAdd")}
                                          </div>
                                        </div>

                                        {availableBatches.map((batch) => (
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
                                            <div className="flex items-center justify-between gap-3">
                                              <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                  {batch.batchNumber}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                  {t("expiry")}: {batch.expiry}
                                                </div>
                                              </div>
                                              <div className="size-8 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                                                <PencilLine className="size-4 text-sky-700" />
                                              </div>
                                            </div>
                                          </button>
                                        ))}

                                        <button
                                          type="button"
                                          onClick={() =>
                                            setExistingBatchPickerOpenKey(null)
                                          }
                                          className="w-full rounded-xl px-3 py-2 text-sm text-start hover:bg-gray-50 text-gray-700 border-t border-gray-100 mt-1"
                                        >
                                          {t("cancel")}
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setExistingBatchPickerOpenKey(
                                              group.key,
                                            );
                                          }}
                                          className="w-full rounded-xl px-3 py-3 text-sm text-start bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 transition-colors"
                                        >
                                          <div className="flex items-start gap-3">
                                            <div className="size-8 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                                              <PencilLine className="size-4 text-sky-700" />
                                            </div>
                                            <div>
                                              <div className="font-medium text-sky-900">
                                                {t("editExistingBatch")}
                                              </div>
                                              <div className="text-xs text-sky-700 mt-0.5">
                                                {t("selectExistingBatch")}
                                              </div>
                                            </div>
                                          </div>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            addNewBatchRow(group.key);
                                            setBatchActionMenuOpenKey(null);
                                          }}
                                          className="w-full rounded-xl px-3 py-3 text-sm text-start bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-colors"
                                        >
                                          <div className="flex items-start gap-3">
                                            <div className="size-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                              <Boxes className="size-4 text-emerald-700" />
                                            </div>
                                            <div>
                                              <div className="font-medium text-emerald-900">
                                                {t("addNewBatch")}
                                              </div>
                                              <div className="text-xs text-emerald-700 mt-0.5">
                                                {t("newBatch")}
                                              </div>
                                            </div>
                                          </div>
                                        </button>
                                      </>
                                    )}
                                  </div>
                                )}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-gray-200 bg-white">
                            <TableHead
                              className={`text-xs font-semibold text-gray-700 h-11 ${isRTL ? "text-right" : "text-left"}`}
                            >
                              {t("batchNumber")}
                            </TableHead>
                            <TableHead
                              className={`text-xs font-semibold text-gray-700 h-11 ${isRTL ? "text-right" : "text-left"}`}
                            >
                              {t("expiry")}
                            </TableHead>
                            <TableHead
                              className={`text-xs font-semibold text-gray-700 h-11 ${isRTL ? "text-right" : "text-left"}`}
                            >
                              {t("warehouseLocation")}
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-gray-700 h-11 text-center">
                              {t("currentStock")}
                            </TableHead>
                            <TableHead
                              className={`text-xs font-semibold text-gray-700 h-11 ${isRTL ? "text-right" : "text-left"}`}
                            >
                              {t("stockTypeUpdate")}
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-gray-700 h-11 text-center w-[140px]">
                              {t("newStockQty")}
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-gray-700 h-11 text-center w-[140px]">
                              {t("cost")}
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-gray-700 h-11 text-center w-[140px]">
                              {t("sellingPrice")}
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-gray-700 h-11 text-center">
                              {t("newStockLevel")}
                            </TableHead>
                            <TableHead
                              className={`text-xs font-semibold text-gray-700 h-11 min-w-[220px] ${isRTL ? "text-right" : "text-left"}`}
                            >
                              {t("reason")}
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-gray-700 h-11 text-center">
                              {t("actions")}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.rows.map((item) => {
                            const nextLevel =
                              item.stockTypeUpdate === "stockIn"
                                ? item.currentStock +
                                  (Number(item.newStockQty) || 0)
                                : Math.max(
                                    0,
                                    item.currentStock -
                                      (Number(item.newStockQty) || 0),
                                  );

                            return (
                              <TableRow
                                key={item.id}
                                className="border-b border-gray-200 hover:bg-gray-50"
                              >
                                <TableCell
                                  className={`py-3 ${isRTL ? "text-right" : "text-left"}`}
                                >
                                  <Input
                                    value={item.batchNumber}
                                    onChange={(e) =>
                                      updateStockItem(
                                        item.id,
                                        "batchNumber",
                                        e.target.value,
                                      )
                                    }
                                    placeholder={t("newBatch")}
                                    dir="ltr"
                                    className="h-10 rounded-full min-w-[140px]"
                                  />
                                </TableCell>
                                <TableCell
                                  className={`py-3 ${isRTL ? "text-right" : "text-left"}`}
                                >
                                  <Input
                                    value={item.expiry}
                                    onChange={(e) =>
                                      updateStockItem(
                                        item.id,
                                        "expiry",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="YYYY-MM"
                                    dir="ltr"
                                    className="h-10 rounded-full min-w-[120px]"
                                  />
                                </TableCell>
                                <TableCell
                                  className={`py-3 ${isRTL ? "text-right" : "text-left"}`}
                                >
                                  <Input
                                    value={item.warehouseZone}
                                    onChange={(e) =>
                                      updateStockItem(
                                        item.id,
                                        "warehouseZone",
                                        e.target.value,
                                      )
                                    }
                                    placeholder={t("warehouseLocation")}
                                    dir={isRTL ? "rtl" : "ltr"}
                                    className={`h-10 rounded-full min-w-[140px] ${isRTL ? "text-right" : "text-left"}`}
                                  />
                                </TableCell>
                                <TableCell className="py-3 text-center">
                                  <div className="inline-flex min-w-[88px] items-center justify-center rounded-md bg-gray-50 px-2 py-1 text-sm font-semibold text-gray-900">
                                    {item.currentStock.toLocaleString("en-GB")}
                                  </div>
                                </TableCell>
                                <TableCell
                                  className={`py-3 ${isRTL ? "text-right" : "text-left"}`}
                                >
                                  <Select
                                    value={item.stockTypeUpdate}
                                    onValueChange={(value) =>
                                      updateStockItem(
                                        item.id,
                                        "stockTypeUpdate",
                                        value,
                                      )
                                    }
                                  >
                                    <SelectTrigger
                                      className={`w-[150px] rounded-full border-gray-300 h-10 text-sm ${isRTL ? "text-right" : "text-left"}`}
                                      dir={isRTL ? "rtl" : "ltr"}
                                    >
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                      <SelectItem value="stockIn">
                                        {t("stockIn")}
                                      </SelectItem>
                                      <SelectItem value="stockOut">
                                        {t("stockOut")}
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell className="py-3 text-center">
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
                                    dir="ltr"
                                    className="w-[120px] h-10 rounded-full text-center mx-auto"
                                  />
                                </TableCell>
                                <TableCell className="py-3 text-center">
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
                                    dir="ltr"
                                    className="w-[120px] h-10 rounded-full text-center mx-auto"
                                  />
                                </TableCell>
                                <TableCell className="py-3 text-center">
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
                                    dir="ltr"
                                    className="w-[120px] h-10 rounded-full text-center mx-auto"
                                  />
                                </TableCell>
                                <TableCell className="py-3 text-center">
                                  <div
                                    className={`inline-flex min-w-[88px] items-center justify-center rounded-md px-2 py-1 text-sm font-semibold ${
                                      nextLevel > item.currentStock
                                        ? "bg-green-50 text-green-700"
                                        : nextLevel < item.currentStock
                                          ? "bg-red-50 text-red-700"
                                          : "bg-gray-50 text-gray-900"
                                    }`}
                                  >
                                    {nextLevel.toLocaleString("en-GB")}
                                  </div>
                                </TableCell>
                                <TableCell
                                  className={`py-3 ${isRTL ? "text-right" : "text-left"}`}
                                >
                                  <Input
                                    value={item.reason}
                                    onChange={(e) =>
                                      updateStockItem(
                                        item.id,
                                        "reason",
                                        e.target.value,
                                      )
                                    }
                                    placeholder={t("enterAdjustmentReason")}
                                    dir={isRTL ? "rtl" : "ltr"}
                                    className={`h-10 rounded-full min-w-[220px] ${isRTL ? "text-right" : "text-left"}`}
                                  />
                                </TableCell>
                                <TableCell className="py-3 text-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeStockItem(item.id)}
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
                  </div>
                ))}
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
                  onClick={() => setAddSourceOpen(true)}
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
