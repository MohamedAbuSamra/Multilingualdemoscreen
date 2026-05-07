import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Download,
  Upload,
  FileEdit,
  ChevronDown,
  Package,
  PackageCheck,
  AlertTriangle,
  PackageX,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Layers3,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useLanguage } from "../contexts/LanguageContext";
import { FiltersSection } from "./FiltersSection";
import { ImportInventoryDialog } from "./ImportInventoryDialog";

type UiLanguage = "en" | "ar";

type StatusColor = "green" | "blue" | "yellow" | "red" | "purple" | "gray";
type StockHistoryQuickFilter =
  | "all"
  | "adjustmentStatusDraft"
  | "adjustmentStatusPending"
  | "adjustmentStatusConfirmed"
  | "adjustmentStatusReversal"
  | "adjustmentStatusFailed";

function formatStockDateTime(d: Date, language: UiLanguage): string {
  const locale = language === "ar" ? "ar" : "en-GB";
  const datePart = d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const timePart = d.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${datePart}\n${timePart}`;
}

const STOCK_ADJUSTMENT_HISTORY_RAW: {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  statusKey: string;
  statusColor: StatusColor;
  userKey: string;
  totalProducts: number;
  autoMigrated: string | null;
  failedMigrated: string | null;
}[] = [
  {
    id: "#Stock-21316",
    createdAt: new Date(2025, 0, 15, 14, 51),
    updatedAt: new Date(2025, 0, 15, 14, 51),
    statusKey: "adjustmentStatusConfirmed",
    statusColor: "green",
    userKey: "userSarahWilson",
    totalProducts: 10000,
    autoMigrated: "2600 - 96.7%",
    failedMigrated: "87 - 3.2%",
  },
  {
    id: "#Stock-21315",
    createdAt: new Date(2025, 0, 15, 11, 12),
    updatedAt: new Date(2025, 0, 15, 14, 55),
    statusKey: "adjustmentStatusProcessing",
    statusColor: "blue",
    userKey: "userAhmedRashid",
    totalProducts: 2687,
    autoMigrated: null,
    failedMigrated: null,
  },
  {
    id: "#Stock-21314",
    createdAt: new Date(2025, 0, 14, 16, 45),
    updatedAt: new Date(2025, 0, 14, 16, 45),
    statusKey: "adjustmentStatusPending",
    statusColor: "yellow",
    userKey: "userFatimaHassan",
    totalProducts: 3212,
    autoMigrated: "2100 - 65.3%",
    failedMigrated: "1312 - 34.6%",
  },
  {
    id: "#Stock-21313",
    createdAt: new Date(2025, 0, 14, 10, 30),
    updatedAt: new Date(2025, 0, 14, 11, 15),
    statusKey: "adjustmentStatusFailed",
    statusColor: "red",
    userKey: "userSarahWilson",
    totalProducts: 1203,
    autoMigrated: "1100 - 91.4%",
    failedMigrated: "103 - 8.6%",
  },
  {
    id: "#Stock-21312",
    createdAt: new Date(2025, 0, 13, 9, 20),
    updatedAt: new Date(2025, 0, 13, 10, 5),
    statusKey: "adjustmentStatusReversal",
    statusColor: "purple",
    userKey: "userAhmedRashid",
    totalProducts: 845,
    autoMigrated: "800 - 94.7%",
    failedMigrated: "45 - 5.3%",
  },
  {
    id: "#Stock-21311",
    createdAt: new Date(2025, 0, 12, 8, 10),
    updatedAt: new Date(2025, 0, 12, 8, 10),
    statusKey: "adjustmentStatusDraft",
    statusColor: "gray",
    userKey: "userFatimaHassan",
    totalProducts: 432,
    autoMigrated: null,
    failedMigrated: null,
  },
];

const LAST_STOCK_ADJUSTMENT_DATE = new Date(2025, 3, 15);

const STATUS_DISPLAY_ORDER = [
  "adjustmentStatusDraft",
  "adjustmentStatusPending",
  "adjustmentStatusProcessing",
  "adjustmentStatusConfirmed",
  "adjustmentStatusFailed",
  "adjustmentStatusReversal",
] as const;

const getStatusOrder = (statusKey: string) => {
  const index = STATUS_DISPLAY_ORDER.indexOf(
    statusKey as (typeof STATUS_DISPLAY_ORDER)[number],
  );
  return index === -1 ? STATUS_DISPLAY_ORDER.length : index;
};

export function UpdateStockPage({
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] =
    useState<StockHistoryQuickFilter>("all");
  const [stockHistoryRows, setStockHistoryRows] = useState(
    STOCK_ADJUSTMENT_HISTORY_RAW,
  );

  const stats = useMemo(
    () =>
      [
        {
          titleKey: "all" as const,
          value: String(stockHistoryRows.length),
          icon: Layers3,
          iconClassName: "bg-teal-50 text-teal-600",
        },
        {
          titleKey: "adjustmentStatusDraft",
          value: String(
            stockHistoryRows.filter(
              (item) => item.statusKey === "adjustmentStatusDraft",
            ).length,
          ),
          icon: FileEdit,
          iconClassName: "bg-slate-100 text-slate-700",
        },
        {
          titleKey: "adjustmentStatusPending",
          value: String(
            stockHistoryRows.filter(
              (item) => item.statusKey === "adjustmentStatusPending",
            ).length,
          ),
          icon: AlertTriangle,
          iconClassName: "bg-amber-50 text-amber-600",
        },
        {
          titleKey: "adjustmentStatusConfirmed",
          value: String(
            stockHistoryRows.filter(
              (item) => item.statusKey === "adjustmentStatusConfirmed",
            ).length,
          ),
          icon: PackageCheck,
          iconClassName: "bg-green-50 text-green-600",
        },
        {
          titleKey: "adjustmentStatusReversal",
          value: String(
            stockHistoryRows.filter(
              (item) => item.statusKey === "adjustmentStatusReversal",
            ).length,
          ),
          icon: RotateCcw,
          iconClassName: "bg-purple-50 text-purple-600",
        },
        {
          titleKey: "adjustmentStatusFailed",
          value: String(
            stockHistoryRows.filter(
              (item) => item.statusKey === "adjustmentStatusFailed",
            ).length,
          ),
          icon: PackageX,
          iconClassName: "bg-red-50 text-red-600",
        },
      ] as const,
    [stockHistoryRows],
  );

  const filteredStockHistoryRows = useMemo(() => {
    if (activeQuickFilter === "all") {
      return stockHistoryRows;
    }

    return stockHistoryRows.filter(
      (row) => row.statusKey === activeQuickFilter,
    );
  }, [activeQuickFilter, stockHistoryRows]);

  const stockHistory = useMemo(
    () =>
      [...filteredStockHistoryRows]
        .sort((a, b) => {
          const statusDifference =
            getStatusOrder(a.statusKey) - getStatusOrder(b.statusKey);

          if (statusDifference !== 0) return statusDifference;

          return b.createdAt.getTime() - a.createdAt.getTime();
        })
        .map((row) => ({
          id: row.id,
          statusKey: row.statusKey,
          createdAt: formatStockDateTime(row.createdAt, language),
          status: t(row.statusKey),
          statusColor: row.statusColor,
          createdUser: t(row.userKey),
          updatedAt: formatStockDateTime(row.updatedAt, language),
          totalProducts: row.totalProducts.toLocaleString("en-GB"),
          autoMigrated: row.autoMigrated,
          failedMigrated: row.failedMigrated,
        })),
    [filteredStockHistoryRows, language, t],
  );

  const handleQuickFilterChange = (nextFilter: StockHistoryQuickFilter) => {
    setActiveQuickFilter((current) =>
      current === nextFilter ? "all" : nextFilter,
    );
  };

  const lastAdjustmentDateLabel = LAST_STOCK_ADJUSTMENT_DATE.toLocaleDateString(
    language === "ar" ? "ar" : "en-GB",
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto">
      <div className="p-6 space-y-5 flex-1">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {t("bulkStocksHistory")}
            </h1>
            <p className="text-sm text-gray-500">{t("trackStocksMovements")}</p>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="bg-teal-500 hover:bg-teal-600 h-10 gap-2 px-4 text-sm rounded-full inline-flex items-center justify-center text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/30 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">
                  <Plus className="size-4" />
                  {t("updateYourStock")}
                  <ChevronDown className="size-4 ms-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={language === "ar" ? "start" : "end"}
                className="w-56 rounded-xl bg-white shadow-xl border border-gray-100 p-1.5 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
              >
                <DropdownMenuItem
                  onClick={() => setImportDialogOpen(true)}
                  className="cursor-pointer gap-3 text-sm hover:bg-gray-50 hover:text-gray-900 rounded-lg px-3 py-2.5 transition-all duration-150 text-start"
                >
                  <Upload className="size-4 text-teal-600" />
                  <span>{t("uploadStockFile")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onNavigate?.("manualUpdateStock")}
                  className="cursor-pointer gap-3 text-sm hover:bg-gray-50 hover:text-gray-900 rounded-lg px-3 py-2.5 transition-all duration-150 text-start"
                >
                  <FileEdit className="size-4 text-teal-600" />
                  <span>{t("manualUpdateStock")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <ImportInventoryDialog
            open={importDialogOpen}
            onOpenChange={setImportDialogOpen}
            onNavigate={onNavigate}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const isActive = activeQuickFilter === stat.titleKey;
            return (
              <button
                key={stat.titleKey}
                type="button"
                onClick={() => handleQuickFilterChange(stat.titleKey)}
                className={`cursor-pointer inline-flex min-w-[150px] items-center gap-2.5 rounded-full border px-3 py-2 text-start transition-all duration-200 ${
                  isActive
                    ? "border-teal-300 bg-teal-50 text-teal-900"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                <div
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full ${stat.iconClassName}`}
                >
                  <Icon className="size-3.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-current">
                      {stat.titleKey === "all"
                        ? language === "ar"
                          ? "الكل"
                          : "All"
                        : t(stat.titleKey)}
                    </p>
                    <span className="text-xs text-gray-400">/</span>
                    <p className="text-sm font-semibold text-current">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search
                  className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-gray-400"
                  strokeWidth={2}
                />
                <Input
                  placeholder={t("searchAdjustmentHistory")}
                  className="ps-9 h-10 text-sm border-gray-300 rounded-full w-full"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className={`h-10 gap-2 px-4 text-sm rounded-full border-gray-300 whitespace-nowrap ${
                  filtersOpen ? "bg-teal-50 border-teal-600 text-teal-600" : ""
                }`}
              >
                <Filter className="size-4" strokeWidth={2} />
                {t("filters")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImportDialogOpen(true)}
                className="h-10 gap-2 px-4 text-sm rounded-full border-teal-200 bg-teal-50 text-teal-700 whitespace-nowrap hover:bg-teal-100 hover:text-teal-800"
              >
                <Upload className="size-4" strokeWidth={2} />
                {language === "ar" ? "استيراد" : "Import"}
              </Button>
            </div>
          </div>

          <FiltersSection isOpen={filtersOpen} type="stockHistory" />

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 bg-gray-50">
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">
                    {t("stockId")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">
                    {t("createdAt")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">
                    {t("status")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">
                    {t("createdUser")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">
                    {t("updatedAt")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-center w-[120px]">
                    {t("totalNumberOfProducts")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-center w-[120px]">
                    {t("autoMigrated")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-center w-[120px]">
                    {t("failedMigrated")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">
                    {t("actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockHistory.map((item) => {
                  const isLockedStatus =
                    item.statusKey === "adjustmentStatusPending" ||
                    item.statusKey === "adjustmentStatusDraft" ||
                    item.statusKey === "adjustmentStatusReversal";

                  const canCancel =
                    item.statusKey === "adjustmentStatusConfirmed" ||
                    item.statusKey === "adjustmentStatusProcessing" ||
                    item.statusKey === "adjustmentStatusFailed";

                  return (
                    <TableRow
                      key={item.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <TableCell className="text-sm font-medium text-gray-900 py-4 text-start">
                        {item.id}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600 py-4 whitespace-pre-line text-start">
                        {item.createdAt}
                      </TableCell>
                      <TableCell className="py-4 text-start">
                        <Badge
                          className={`text-xs px-2 py-1 rounded-full ${
                            item.statusColor === "green"
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : item.statusColor === "blue"
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                : item.statusColor === "yellow"
                                  ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                                  : item.statusColor === "purple"
                                    ? "bg-purple-100 text-purple-700 hover:bg-purple-100"
                                    : item.statusColor === "gray"
                                      ? "bg-gray-100 text-gray-700 hover:bg-gray-100"
                                      : "bg-red-100 text-red-700 hover:bg-red-100"
                          }`}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-900 py-4 text-start">
                        {item.createdUser}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600 py-4 whitespace-pre-line text-start">
                        {item.updatedAt}
                      </TableCell>
                      <TableCell className="py-4 text-center align-middle">
                        <div className="inline-flex min-w-[96px] flex-col items-center justify-center rounded-md bg-gray-50 px-2 py-1 text-center leading-4">
                          <span className="text-sm font-semibold text-gray-900">
                            {item.totalProducts}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-center align-middle">
                        {item.autoMigrated != null ? (
                          <div className="inline-flex min-w-[96px] flex-col items-center justify-center rounded-md bg-green-50 px-2 py-1 text-center text-xs leading-4 text-green-700">
                            <span className="font-medium">
                              {item.autoMigrated.split(" - ")[0]}
                            </span>
                            <span>{item.autoMigrated.split(" - ")[1]}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">
                            {t("notAvailableMark")}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-center align-middle">
                        {item.failedMigrated != null ? (
                          <div className="inline-flex min-w-[96px] flex-col items-center justify-center rounded-md bg-red-50 px-2 py-1 text-center text-xs leading-4 text-red-700">
                            <span className="font-medium">
                              {item.failedMigrated.split(" - ")[0]}
                            </span>
                            <span>{item.failedMigrated.split(" - ")[1]}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">
                            {t("notAvailableMark")}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-start">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="size-8 p-0 inline-flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                              aria-label={t("actions")}
                            >
                              <MoreVertical className="size-4 text-gray-600" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align={language === "ar" ? "start" : "end"}
                            className="rounded-xl"
                          >
                            <DropdownMenuItem
                              onClick={() =>
                                onNavigate?.("stockHistoryDetails")
                              }
                              className="cursor-pointer gap-2 text-start"
                            >
                              <Eye className="size-4" />
                              {t("viewEditDetails")}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer gap-2 text-start">
                              <Download className="size-4" />
                              {t("exportReport")}
                            </DropdownMenuItem>
                            {canCancel ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  setStockHistoryRows((currentRows) =>
                                    currentRows.map((row) =>
                                      row.id === item.id
                                        ? {
                                            ...row,
                                            statusKey:
                                              "adjustmentStatusReversal",
                                            statusColor: "purple",
                                            updatedAt: new Date(),
                                          }
                                        : row,
                                    ),
                                  );
                                }}
                                className="cursor-pointer gap-2 text-start"
                              >
                                <RotateCcw className="size-4" />
                                {t("cancelAdjustment")}
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                disabled
                                className="gap-2 text-start opacity-50 cursor-not-allowed"
                              >
                                <RotateCcw className="size-4" />
                                {isLockedStatus
                                  ? t("actionNotAvailable")
                                  : t("cancelAdjustment")}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="px-4 py-3 border-t border-gray-200 bg-white">
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-600">
                {t("stockHistoryPaginationSummary")}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="size-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
                  aria-label={t("paginationPreviousPage")}
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  className="size-8 flex items-center justify-center bg-teal-500 text-white rounded-full"
                  aria-label="1"
                >
                  1
                </button>
                <button
                  type="button"
                  className="size-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
                  aria-label="2"
                >
                  2
                </button>
                <button
                  type="button"
                  className="size-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
                  aria-label="3"
                >
                  3
                </button>
                <button
                  type="button"
                  className="size-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
                  aria-label="4"
                >
                  4
                </button>
                <button
                  type="button"
                  className="size-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
                  aria-label="5"
                >
                  5
                </button>
                <button
                  type="button"
                  className="size-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
                  aria-label={t("paginationNextPage")}
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          {t("lastStockAdjustmentPrefix")} {lastAdjustmentDateLabel}
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
