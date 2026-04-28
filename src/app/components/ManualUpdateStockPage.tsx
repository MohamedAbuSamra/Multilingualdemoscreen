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
import { MyProductsDialog } from "./MyProductsDialog";
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

  const addInventoryProductsToTable = (products: PharmacyInventoryRow[]) => {
    setStockItems((current) => {
      const existingCodes = new Set(current.map((item) => item.productCode));
      const nextItems = products
        .filter((product) => !existingCodes.has(product.code))
        .map(buildInventoryStockItem);

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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 bg-gray-50">
                      <TableHead
                        className={`text-xs font-semibold text-gray-700 h-11 ${isRTL ? "text-right" : "text-left"}`}
                      >
                        {t("code")}
                      </TableHead>
                      <TableHead
                        className={`text-xs font-semibold text-gray-700 h-11 ${isRTL ? "text-right" : "text-left"}`}
                      >
                        {t("productName")}
                      </TableHead>
                      <TableHead
                        className={`text-xs font-semibold text-gray-700 h-11 ${isRTL ? "text-right" : "text-left"}`}
                      >
                        {t("barcode")}
                      </TableHead>
                      <TableHead
                        className={`text-xs font-semibold text-gray-700 h-11 ${isRTL ? "text-right" : "text-left"}`}
                      >
                        {t("category")}
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
                    {visibleRows.map((item) => (
                      <TableRow
                        key={item.id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <TableCell
                          className={`text-xs font-medium text-gray-900 py-3 ${isRTL ? "text-right" : "text-left"}`}
                          dir="ltr"
                        >
                          {item.productCode}
                        </TableCell>
                        <TableCell
                          className={`py-3 min-w-[240px] ${isRTL ? "text-right" : "text-left"}`}
                        >
                          <div className="text-sm font-medium text-gray-900">
                            {language === "ar"
                              ? item.productNameAr
                              : item.productNameEn}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
                            {(language === "ar"
                              ? item.subtitleAr
                              : item.subtitleEn) && (
                              <span>
                                {language === "ar"
                                  ? item.subtitleAr
                                  : item.subtitleEn}
                              </span>
                            )}
                            <Badge className="rounded-full px-2 py-0.5 text-[10px] bg-gray-100 text-gray-700 hover:bg-gray-100">
                              {t(`productSource.${item.source}`)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell
                          className={`text-xs text-gray-700 py-3 ${isRTL ? "text-right" : "text-left"}`}
                          dir="ltr"
                        >
                          {item.barcode}
                        </TableCell>
                        <TableCell
                          className={`py-3 ${isRTL ? "text-right" : "text-left"}`}
                        >
                          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 rounded-full px-2 py-0.5 text-xs">
                            {t(item.categoryKey)}
                          </Badge>
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
                              updateStockItem(item.id, "stockTypeUpdate", value)
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
                              (item.stockTypeUpdate === "stockIn"
                                ? item.currentStock +
                                  (Number(item.newStockQty) || 0)
                                : Math.max(
                                    0,
                                    item.currentStock -
                                      (Number(item.newStockQty) || 0),
                                  )) > item.currentStock
                                ? "bg-green-50 text-green-700"
                                : (item.stockTypeUpdate === "stockIn"
                                      ? item.currentStock +
                                        (Number(item.newStockQty) || 0)
                                      : Math.max(
                                          0,
                                          item.currentStock -
                                            (Number(item.newStockQty) || 0),
                                        )) < item.currentStock
                                  ? "bg-red-50 text-red-700"
                                  : "bg-gray-50 text-gray-900"
                            }`}
                          >
                            {(item.stockTypeUpdate === "stockIn"
                              ? item.currentStock +
                                (Number(item.newStockQty) || 0)
                              : Math.max(
                                  0,
                                  item.currentStock -
                                    (Number(item.newStockQty) || 0),
                                )
                            ).toLocaleString("en-GB")}
                          </div>
                        </TableCell>
                        <TableCell
                          className={`py-3 ${isRTL ? "text-right" : "text-left"}`}
                        >
                          <Input
                            value={item.reason}
                            onChange={(e) =>
                              updateStockItem(item.id, "reason", e.target.value)
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
                    ))}
                  </TableBody>
                </Table>
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
