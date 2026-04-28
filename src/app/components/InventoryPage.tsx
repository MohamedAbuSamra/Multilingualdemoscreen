import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  History,
  Search,
  Filter,
  Download,
  MoreVertical,
  ShoppingBag,
  FileText,
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
import { CreateProductDialog } from "./CreateProductDialog";
import {
  INVENTORY_PRODUCT_COUNT_V2,
  PHARMACY_INVENTORY_PRODUCTS_V2,
} from "../data/pharmacyInventoryProducts";

interface InventoryPageProps {
  onNavigate: (page: "products" | "updateStock") => void;
}

export function InventoryPage({ onNavigate }: InventoryPageProps) {
  const { t, language } = useLanguage();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [expandedProductIds, setExpandedProductIds] = useState<string[]>([]);

  const products = useMemo(
    () =>
      PHARMACY_INVENTORY_PRODUCTS_V2.map((product) => {
        const totalStockQty = product.batches.reduce(
          (sum, batch) => sum + (Number(batch.stockQty) || 0),
          0,
        );
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
          expiry: firstBatch?.expiry ?? "",
          lastSale: `${t("jod")} ${product.lastSaleAmount}`,
          stockQty: totalStockQty.toLocaleString("en-GB"),
          avgCost: firstBatch?.avgCost ?? "",
          sellPrice: firstBatch?.sellPrice ?? "",
          tax: product.tax,
          warehouse: firstBatch
            ? `${t("main")} · ${firstBatch.warehouseZone}`
            : "",
          status: product.statusKey ? t(product.statusKey) : "",
          statusColor: product.statusColor,
          batchCount: product.batches.length,
          batches: product.batches,
        };
      }),
    [language, t],
  );

  const toggleExpanded = (productId: string) => {
    setExpandedProductIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto">
      <CreateProductDialog
        open={createProductOpen}
        onOpenChange={setCreateProductOpen}
      />
      <div className="p-6 space-y-5 flex-1">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setCreateProductOpen(true)}
            className="bg-teal-500 hover:bg-teal-600 h-9 gap-2 px-4 text-sm rounded-full"
          >
            <Plus className="size-4" />
            {t("createNew")}
          </Button>
          <Button
            onClick={() => onNavigate("updateStock")}
            variant="outline"
            className="h-9 gap-2 px-4 text-sm rounded-full border-gray-300"
          >
            <History className="size-4" />
            {t("stockHistory")}
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {t("totalProducts")}
                </div>
                <div className="text-xs text-gray-500">
                  {t("activeProductsInInventory")}
                </div>
              </div>
              <div className="text-end">
                <div className="text-4xl font-semibold text-gray-900">
                  {INVENTORY_PRODUCT_COUNT_V2}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {t("stagnantProducts")}
                </div>
                <div className="text-xs text-gray-500">
                  {t("productsNoSales90Days")}
                </div>
              </div>
              <div className="text-end flex flex-col items-end gap-2">
                <div className="text-4xl font-semibold text-gray-900">0</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-teal-600 border-teal-600 hover:bg-teal-50 h-7 px-3 text-xs rounded-full"
                >
                  {t("review")}
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {t("expiringsSoon")}
                </div>
                <div className="text-xs text-gray-500">
                  {t("productsExpiringsNext90Days")}
                </div>
              </div>
              <div className="text-end flex flex-col items-end gap-2">
                <div className="text-4xl font-semibold text-gray-900">0</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-teal-600 border-teal-600 hover:bg-teal-50 h-7 px-3 text-xs rounded-full"
                >
                  {t("review")}
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {t("lowStock")}
                </div>
                <div className="text-xs text-gray-500">
                  {t("productsBelowMinimumLevel")}
                </div>
              </div>
              <div className="text-end flex flex-col items-end gap-2">
                <div className="text-4xl font-semibold text-gray-900">0</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-teal-600 border-teal-600 hover:bg-teal-50 h-7 px-3 text-xs rounded-full"
                >
                  {t("review")}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <ShoppingBag
                    className="size-5 text-gray-600"
                    strokeWidth={2}
                  />
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {t("receiveMarketplacePurchaseOrders")}
                </div>
              </div>
              <Badge className="bg-teal-500 hover:bg-teal-500 h-6 px-2.5 text-xs rounded-full">
                0 {t("new")}
              </Badge>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <FileText className="size-5 text-gray-600" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {t("createNewPurchaseOrder")}
                  </div>
                  <div className="text-xs text-gray-500">
                    {t("lastAdded")} 6 {t("daysAgo")}
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                  placeholder={t("searchByNameIdBarcodeHatch")}
                  className="ps-9 h-9 text-sm border-gray-300 rounded-full w-full"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className={`h-9 gap-2 px-3 text-sm rounded-full border-gray-300 whitespace-nowrap ${
                  filtersOpen ? "bg-teal-50 border-teal-600 text-teal-600" : ""
                }`}
              >
                <Filter className="size-4" strokeWidth={2} />
                {t("filters")}
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

          <FiltersSection isOpen={filtersOpen} type="products" />

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 bg-gray-50">
                  <TableHead className="w-12 h-11"></TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">
                    {t("code")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">
                    {t("productName")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">
                    {t("barcode")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">
                    {t("category")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">
                    {t("lotBatch")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">
                    {t("expiry")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">
                    {t("lastSale")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">
                    {t("stockQty")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">
                    {t("avgCostPrice")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">
                    {t("sellPrice")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">
                    {t("tax")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">
                    {t("warehouseLocation")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">
                    {t("status")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 h-11 text-start">
                    {t("actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const isExpanded = expandedProductIds.includes(product.id);

                  return (
                    <>
                      <TableRow
                        key={product.id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <TableCell className="py-3">
                          <button
                            type="button"
                            onClick={() => toggleExpanded(product.id)}
                            className="size-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
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
                        <TableCell className="text-xs text-gray-700 py-3 text-start">
                          {product.code}
                        </TableCell>
                        <TableCell className="py-3 text-start">
                          <div className="text-xs text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                            <span>{product.subtitle}</span>
                            <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 rounded-full px-2 py-0.5 text-[10px]">
                              {product.batchCount} {t("batches")}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-gray-700 py-3 text-start">
                          {product.barcode}
                        </TableCell>
                        <TableCell className="text-xs text-gray-700 py-3 text-start">
                          {product.category}
                        </TableCell>
                        <TableCell className="py-3 text-start">
                          {product.lotBatch && (
                            <div className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full inline-block">
                              {product.lotBatch}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-3 text-start">
                          {product.expiry && (
                            <div className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full inline-block">
                              {product.expiry}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-gray-700 py-3 text-start">
                          {product.lastSale}
                        </TableCell>
                        <TableCell className="text-xs text-gray-700 py-3 text-start">
                          {product.stockQty}
                        </TableCell>
                        <TableCell className="text-xs text-gray-700 py-3 text-start">
                          {product.avgCost}
                        </TableCell>
                        <TableCell className="text-xs text-gray-700 py-3 text-start">
                          {product.sellPrice}
                        </TableCell>
                        <TableCell className="text-xs text-gray-700 py-3 text-start">
                          {product.tax}
                        </TableCell>
                        <TableCell className="text-xs text-gray-700 py-3 text-start">
                          {product.warehouse}
                        </TableCell>
                        <TableCell className="py-3 text-start">
                          {product.status && (
                            <Badge
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                product.statusColor === "red"
                                  ? "bg-red-100 text-red-700 hover:bg-red-100"
                                  : product.statusColor === "green"
                                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                                    : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                              }`}
                            >
                              {product.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-8 p-0 hover:bg-gray-100 rounded-full"
                          >
                            <MoreVertical className="size-4 text-gray-600" />
                          </Button>
                        </TableCell>
                      </TableRow>

                      {isExpanded && (
                        <TableRow className="bg-gray-50/70 border-b border-gray-200">
                          <TableCell colSpan={15} className="p-0">
                            <div className="px-5 py-4">
                              <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-3 flex-wrap">
                                  <div className="text-sm font-semibold text-gray-900">
                                    {t("batches")}
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
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {product.batches.map((batch) => (
                                        <TableRow
                                          key={batch.id}
                                          className="border-b border-gray-200 last:border-b-0"
                                        >
                                          <TableCell className="text-xs text-gray-700 py-3 text-start">
                                            {batch.batchNumber}
                                          </TableCell>
                                          <TableCell className="text-xs text-gray-700 py-3 text-start">
                                            {batch.expiry}
                                          </TableCell>
                                          <TableCell className="text-xs text-gray-700 py-3 text-start">{`${t("main")} · ${batch.warehouseZone}`}</TableCell>
                                          <TableCell className="text-xs text-gray-700 py-3 text-start">
                                            {batch.stockQty}
                                          </TableCell>
                                          <TableCell className="text-xs text-gray-700 py-3 text-start">
                                            {batch.avgCost}
                                          </TableCell>
                                          <TableCell className="text-xs text-gray-700 py-3 text-start">
                                            {batch.sellPrice}
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
                      )}
                    </>
                  );
                })}
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
