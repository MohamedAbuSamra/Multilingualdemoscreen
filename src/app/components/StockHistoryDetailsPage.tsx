import { Save, Search } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useMemo, useState } from "react";

interface StockHistoryDetailsPageProps {
  onNavigate?: (
    page:
      | "products"
      | "updateStock"
      | "manualUpdateStock"
      | "stockHistoryDetails",
  ) => void;
}

interface StockHistoryItem {
  id: string;
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
  source: "core" | "inventory" | "custom";
}

const STOCK_HISTORY_DETAILS_SAMPLE: StockHistoryItem[] = [
  {
    id: "history-1",
    productCode: "PH-201",
    productNameEn: "Pantoprazole Sodium 40 mg",
    productNameAr: "بانتوبرازول صوديوم ٤٠ مجم",
    subtitleEn: "Gastro-Resistant Tablets, 30s, 20 Packs per Case",
    subtitleAr: "أقراص معوية ٣٠، ٢٠ عبوة في الكرتون",
    barcode: "6250123450123",
    categoryKey: "categoryGastrointestinal",
    currentStock: 42,
    stockTypeUpdate: "stockIn",
    newStockQty: "18",
    avgCost: "11.20",
    sellPrice: "18.50",
    reason: "Seasonal replenishment",
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
    currentStock: 120,
    stockTypeUpdate: "stockOut",
    newStockQty: "12",
    avgCost: "5.40",
    sellPrice: "9.75",
    reason: "Damaged units adjustment",
    source: "core",
  },
  {
    id: "history-3",
    productCode: "CUS-901",
    productNameEn: "Custom Herbal Mix",
    productNameAr: "خليط أعشاب مخصص",
    subtitleEn: "",
    subtitleAr: "",
    barcode: "9900123412345",
    categoryKey: "categoryVitamins",
    currentStock: 8,
    stockTypeUpdate: "stockIn",
    newStockQty: "5",
    avgCost: "3.25",
    sellPrice: "6.00",
    reason: "New handmade batch",
    source: "custom",
  },
];

export function StockHistoryDetailsPage({
  onNavigate,
}: StockHistoryDetailsPageProps) {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";
  const [searchQuery, setSearchQuery] = useState("");
  const [stockItems, setStockItems] = useState<StockHistoryItem[]>(
    STOCK_HISTORY_DETAILS_SAMPLE,
  );

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

  const updateStockItem = (
    id: string,
    field: keyof StockHistoryItem,
    value: string,
  ) => {
    setStockItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        return { ...item, [field]: value };
      }),
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto">
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
          <span
            className="text-teal-600 cursor-pointer"
            onClick={() => onNavigate?.("updateStock")}
          >
            {t("bulkStocksHistory")}
          </span>
          <span className="text-gray-400" aria-hidden>
            {t("breadcrumbSeparator")}
          </span>
          <span className="text-gray-600">{t("viewStockUpdateDetails")}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className={isRTL ? "text-right" : "text-left"}>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("viewStockUpdateDetails")}
            </h1>
            <p className="text-gray-500 text-base">
              {t("viewStockUpdateDetailsDescription")}
            </p>
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
            </div>
          </div>

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
                          <SelectItem value="stockIn">{t("stockIn")}</SelectItem>
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
                          updateStockItem(item.id, "newStockQty", e.target.value)
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
                          updateStockItem(item.id, "avgCost", e.target.value)
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
                          updateStockItem(item.id, "sellPrice", e.target.value)
                        }
                        dir="ltr"
                        className="w-[120px] h-10 rounded-full text-center mx-auto"
                      />
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <div
                        className={`inline-flex min-w-[88px] items-center justify-center rounded-md px-2 py-1 text-sm font-semibold ${
                          (item.stockTypeUpdate === "stockIn"
                            ? item.currentStock + (Number(item.newStockQty) || 0)
                            : Math.max(
                                0,
                                item.currentStock - (Number(item.newStockQty) || 0),
                              )) > item.currentStock
                            ? "bg-green-50 text-green-700"
                            : (item.stockTypeUpdate === "stockIn"
                                  ? item.currentStock + (Number(item.newStockQty) || 0)
                                  : Math.max(
                                      0,
                                      item.currentStock - (Number(item.newStockQty) || 0),
                                    )) < item.currentStock
                              ? "bg-red-50 text-red-700"
                              : "bg-gray-50 text-gray-900"
                        }`}
                      >
                        {(item.stockTypeUpdate === "stockIn"
                          ? item.currentStock + (Number(item.newStockQty) || 0)
                          : Math.max(
                              0,
                              item.currentStock - (Number(item.newStockQty) || 0),
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
                onClick={() => onNavigate?.("updateStock")}
                className="h-10 px-4 rounded-full border-gray-300"
              >
                {t("backToHistory")}
              </Button>
              <Button
                className="bg-teal-500 hover:bg-teal-600 h-10 px-5 text-white rounded-full gap-2"
              >
                <Save className="size-4" />
                {t("saveAdjustments")}
              </Button>
            </div>
          </div>
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