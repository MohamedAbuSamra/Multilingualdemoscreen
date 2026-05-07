import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  FileSpreadsheet,
  Package,
  PencilLine,
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

interface StockHistoryDetailsPageProps {
  onNavigate?: (
    page:
      | "products"
      | "updateStock"
      | "manualUpdateStock"
      | "stockHistoryDetails",
  ) => void;
}

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

interface StockHistoryItem {
  id: string;
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
  status: string;
  source: StockItemSource;
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

type ProductGroupWithRows = ProductGroupMeta & { rows: StockHistoryItem[] };

const STOCK_HISTORY_DETAILS_SAMPLE: StockHistoryItem[] = [
  {
    id: "history-1",
    productCode: "PH-201",
    productNameEn: "Pantoprazole Sodium 40 mg",
    productNameAr: "بانتوبرازول صوديوم ٤٠ مجم",
    subtitleEn: "Gastro-Resistant Tablets, 30s",
    subtitleAr: "أقراص معوية، ٣٠ قرص",
    barcode: "6250123450123",
    categoryKey: "categoryGastrointestinal",
    batchNumber: "PT-2401-A",
    expiry: "12/2026",
    warehouseZone: "A1-R2",
    currentStock: 42,
    stockTypeUpdate: "stockIn",
    newStockQty: "18",
    avgCost: "11.20",
    sellPrice: "18.50",
    reason: "Seasonal replenishment",
    status: "draft",
    source: "inventory",
  },
  {
    id: "history-1-b",
    productCode: "PH-201",
    productNameEn: "Pantoprazole Sodium 40 mg",
    productNameAr: "بانتوبرازول صوديوم ٤٠ مجم",
    subtitleEn: "Gastro-Resistant Tablets, 30s",
    subtitleAr: "أقراص معوية، ٣٠ قرص",
    barcode: "6250123450123",
    categoryKey: "categoryGastrointestinal",
    batchNumber: "PT-2402-B",
    expiry: "03/2027",
    warehouseZone: "A1-R3",
    currentStock: 16,
    stockTypeUpdate: "stockIn",
    newStockQty: "6",
    avgCost: "11.40",
    sellPrice: "18.50",
    reason: "Second batch count",
    status: "draft",
    source: "inventory",
  },
  {
    id: "history-2",
    productCode: "AC-105-1",
    productNameEn: "Amoxicillin 500 mg Capsules",
    productNameAr: "أموكسيسيلين ٥٠٠ مجم كبسولات",
    subtitleEn: "21 Capsules",
    subtitleAr: "٢١ كبسولة",
    barcode: "6250123451234",
    categoryKey: "categoryAntibiotic",
    batchNumber: "AMX-778",
    expiry: "09/2026",
    warehouseZone: "B2-R1",
    currentStock: 120,
    stockTypeUpdate: "stockOut",
    newStockQty: "12",
    avgCost: "5.40",
    sellPrice: "9.75",
    reason: "Damaged units adjustment",
    status: "draft",
    source: "core",
  },
  {
    id: "history-3",
    productCode: "CUS-901",
    productNameEn: "Custom Herbal Mix",
    productNameAr: "خليط أعشاب مخصص",
    subtitleEn: "Prepared in-house",
    subtitleAr: "تحضير داخلي",
    barcode: "9900123412345",
    categoryKey: "categoryVitamins",
    batchNumber: "HB-NEW-01",
    expiry: "01/2027",
    warehouseZone: "C1-R4",
    currentStock: 8,
    stockTypeUpdate: "stockIn",
    newStockQty: "5",
    avgCost: "3.25",
    sellPrice: "6.00",
    reason: "New handmade batch",
    status: "draft",
    source: "custom",
  },
];

const DEFAULT_GROUP_UNITS: Record<StockItemSource, ProductGroupMeta["largestUnit"]> = {
  core: "box",
  inventory: "box",
  custom: "pack",
};

function buildInitialProductGroups(items: StockHistoryItem[]): ProductGroupMeta[] {
  const groups = new Map<string, ProductGroupMeta>();

  items.forEach((item) => {
    const key = `${item.source}::${item.productCode}`;
    if (groups.has(key)) return;

    groups.set(key, {
      key,
      source: item.source,
      productCode: item.productCode,
      productNameEn: item.productNameEn,
      productNameAr: item.productNameAr,
      subtitleEn: item.subtitleEn,
      subtitleAr: item.subtitleAr,
      barcode: item.barcode,
      categoryKey: item.categoryKey,
      largestUnit: DEFAULT_GROUP_UNITS[item.source],
      smallestUnit: "piece",
      smallestUnitsPerLargePack: "",
    });
  });

  return Array.from(groups.values());
}

export function StockHistoryDetailsPage({
  onNavigate,
}: StockHistoryDetailsPageProps) {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";
  const largestUnitLabel = language === "ar" ? "أكبر وحدة" : "Largest Unit";
  const smallestUnitLabel = language === "ar" ? "أصغر وحدة" : "Smallest Unit";
  const conversionCountLabel =
    language === "ar" ? "عدد الصغرى/كبرى" : "Smallest Unit Count";
  const productLabel = language === "ar" ? "المنتج" : "Product";
  const sourceLabel = language === "ar" ? "المصدر" : "Source";
  const unitsLabel = language === "ar" ? "الوحدات" : "Units";
  const draftEditorTitle =
    language === "ar" ? "تحرير مسودة تحديث المخزون" : "Edit Draft Stock Update";
  const draftEditorDescription =
    language === "ar"
      ? "نفس تجربة التحديث اليدوي لكن مع تحميل المسودة المحفوظة مسبقًا للتعديل والمتابعة."
      : "The same manual update editor, preloaded with a saved draft so you can continue editing before submitting.";
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
  const [stockItems, setStockItems] = useState<StockHistoryItem[]>(
    STOCK_HISTORY_DETAILS_SAMPLE,
  );
  const [productGroups, setProductGroups] = useState<ProductGroupMeta[]>(() =>
    buildInitialProductGroups(STOCK_HISTORY_DETAILS_SAMPLE),
  );
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
        item.reason,
      ].some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [searchQuery, stockItems]);

  const groupedVisibleRows = useMemo<ProductGroupWithRows[]>(() => {
    const rowsMap = new Map<string, StockHistoryItem[]>();

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

  const updateStockItem = (
    id: string,
    field: keyof StockHistoryItem,
    value: string | number,
  ) => {
    setStockItems((current) =>
      current.map((item) =>
        item.id === id ? ({ ...item, [field]: value } as StockHistoryItem) : item,
      ),
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

  const removeStockItem = (id: string) => {
    setStockItems((current) => current.filter((item) => item.id !== id));
  };

  const handleSaveDraft = () => {
    console.log("Saving edited draft stock update:", stockItems);
  };

  const handleUpdateStock = () => {
    console.log("Submitting edited draft stock update:", stockItems);
  };

  const handleCancel = () => {
    onNavigate?.("updateStock");
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto">
      <div className="p-6 space-y-3.5 flex-1" dir={isRTL ? "rtl" : "ltr"}>
        <div className={isRTL ? "text-right" : "text-left"}>
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{draftEditorTitle}</h1>
            <span className="text-gray-300 text-xl leading-none" aria-hidden>
              •
            </span>
            <p className="text-gray-500 text-base">{draftEditorDescription}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-2xl p-3">
          <div className="flex items-center gap-2 mb-2.5 flex-wrap">
            <div className="size-5 bg-teal-600 rounded-full flex items-center justify-center">
              <Sparkles className="size-3 text-white" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">
              {language === "ar" ? "إعدادات المسودة" : "Draft settings"}
            </h3>
            <span className="text-[11px] text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full font-semibold">
              {language === "ar" ? "وضع التحرير" : "Editor mode"}
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
                  <div className="size-7 bg-sky-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <FileSpreadsheet className="size-3.5 text-sky-600" />
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
              <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 h-10 text-sm text-amber-800 whitespace-nowrap">
                <PencilLine className="size-4" />
                {language === "ar" ? "مسودة محفوظة" : "Saved draft"}
              </div>
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
                            {t("status")}
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
                                  <span className="text-[10px] text-gray-500" dir="ltr">
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
                                {unitLabels[group.largestUnit]} / {unitLabels[group.smallestUnit]}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge className="rounded-full px-2 py-0.5 text-[10px] h-5 bg-amber-100 text-amber-700 hover:bg-amber-100">
                                  {language === "ar" ? "مسودة" : "Draft"}
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
                                        current === group.key ? null : group.key,
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
                                              <SelectItem key={unitOption} value={unitOption}>
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
                                              <SelectItem key={unitOption} value={unitOption}>
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
                                          value={group.smallestUnitsPerLargePack}
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

                                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                                        <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 h-9 text-xs text-gray-600">
                                          <Boxes className="size-3.5 text-teal-600" />
                                          {language === "ar" ? "تحرير دفعات المسودة" : "Editing draft batches"}
                                        </div>
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
                                                item.stockTypeUpdate === "stockIn"
                                                  ? item.currentStock + (Number(item.newStockQty) || 0)
                                                  : Math.max(
                                                      0,
                                                      item.currentStock - (Number(item.newStockQty) || 0),
                                                    );

                                              return (
                                                <TableRow key={`inline-${item.id}`}>
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
                                                      placeholder={t("batchNumber")}
                                                      dir="ltr"
                                                      className="h-9 rounded-full w-[118px] text-[11px] border-gray-300 bg-white"
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
                                                      className="h-9 rounded-full w-[110px] text-[11px] border-gray-300 bg-white"
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
                                                      placeholder={t("warehouseLocation")}
                                                      className="h-9 rounded-full w-[128px] text-[11px] border-gray-300 bg-white"
                                                    />
                                                  </TableCell>
                                                  <TableCell className="py-2">
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
                                                      <SelectTrigger className="w-[120px] rounded-full h-9 text-[11px] border-gray-300 bg-white">
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
                                                      placeholder={language === "ar" ? "الكمية" : "Qty"}
                                                      dir="ltr"
                                                      className="w-[90px] h-9 rounded-full text-center mx-auto text-[11px] border-gray-300 bg-white"
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
                                                      placeholder={language === "ar" ? "التكلفة" : "Cost"}
                                                      className="w-[90px] h-9 rounded-full text-center mx-auto text-[11px] border-gray-300 bg-white"
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
                                                      placeholder={language === "ar" ? "السعر" : "Price"}
                                                      className="w-[90px] h-9 rounded-full text-center mx-auto text-[11px] border-gray-300 bg-white"
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
                                                      placeholder={t("enterAdjustmentReason")}
                                                      className={`h-9 rounded-full w-[168px] text-[11px] border-gray-300 bg-white ${
                                                        isRTL ? "text-right" : "text-left"
                                                      }`}
                                                    />
                                                  </TableCell>
                                                  <TableCell className="py-2 text-center">
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
                                    ) : (
                                      <div className="px-4 py-4 text-center border border-gray-200 rounded-xl bg-white">
                                        <div className="text-sm font-semibold text-gray-900">
                                          {t("noBatchRowsYet")}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                          {language === "ar"
                                            ? "هذه المسودة لا تحتوي على دفعات مرئية بعد."
                                            : "This draft does not have visible batch rows yet."}
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
                  {language === "ar" ? "لا توجد عناصر في هذه المسودة" : "No items in this draft"}
                </h3>
                <p className="text-sm text-gray-600 mb-5">
                  {language === "ar"
                    ? "تم فتح صفحة التحرير لكن المسودة الحالية لا تحتوي على منتجات قابلة للتعديل."
                    : "The editor opened, but the current draft does not contain editable products."}
                </p>
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
