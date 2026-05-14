import { useState, useRef } from "react";
import {
  FileSpreadsheet,
  Download,
  Sparkles,
  CircleHelp,
  CirclePlay,
  FileEdit,
  Upload,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  LoaderCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { useLanguage } from "../contexts/LanguageContext";
import { PHARMACY_INVENTORY_PRODUCTS_V2 } from "../data/pharmacyInventoryProducts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

interface ImportInventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: () => void;
  variant?: "default" | "onboarding";
  onNavigate?: (
    page:
      | "products"
      | "updateStock"
      | "manualUpdateStock"
      | "stockHistoryDetails",
  ) => void;
}

export function ImportInventoryDialog({
  open,
  onOpenChange,
  onImportSuccess,
  variant = "default",
  onNavigate,
}: ImportInventoryDialogProps) {
  const { t } = useLanguage();
  const [useAumetReference, setUseAumetReference] = useState(true);
  const [autoGenerateBarcode, setAutoGenerateBarcode] = useState(true);
  const [resetExistingStock, setResetExistingStock] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessingImport, setIsProcessingImport] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isOnboardingVariant = variant === "onboarding";

  const setFile = (file: File | null) => {
    setSelectedFile(file);
    setIsDragActive(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChooseFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDragActive) {
      setIsDragActive(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }
    setIsDragActive(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setFile(file);
    } else {
      setIsDragActive(false);
    }
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setIsProcessingImport(false);
      setIsDragActive(false);
    }

    onOpenChange(nextOpen);
  };

  const handleImport = () => {
    if (!selectedFile || isProcessingImport) {
      return;
    }

    setIsProcessingImport(true);

    window.setTimeout(() => {
      setIsProcessingImport(false);
      onImportSuccess?.();
      onOpenChange(false);
    }, 1800);
  };

  const escapeCsvValue = (value: string) => {
    const normalizedValue = value.replace(/"/g, '""');
    return `"${normalizedValue}"`;
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "productCode",
      "productNameEn",
      "productNameAr",
      "barcode",
      "category",
      "batchNumber",
      "expiryDate",
      "quantity",
      "avgCost",
      "sellPrice",
      "tax",
      "warehouseZone",
      "subtitleEn",
      "subtitleAr",
    ];

    const rows = PHARMACY_INVENTORY_PRODUCTS_V2.flatMap((product) =>
      product.batches.map((batch) => [
        product.code,
        product.nameEn,
        product.nameAr,
        product.barcode,
        t(product.categoryKey),
        batch.batchNumber,
        batch.expiry,
        batch.stockQty,
        batch.avgCost,
        batch.sellPrice,
        product.tax,
        batch.warehouseZone,
        product.subtitleEn,
        product.subtitleAr,
      ]),
    );

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((value) => escapeCsvValue(String(value ?? ""))).join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = "inventory-import-template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        className={`p-0 gap-0 rounded-3xl ${
          isOnboardingVariant
            ? "max-w-[760px] w-[calc(100vw-2rem)]"
            : "max-w-[1600px] w-[75vw]"
        }`}
      >
        <DialogHeader className="px-6 py-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-bold text-gray-900">
            {t("updateStockTitle")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("uploadInventoryDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className={`px-6 py-4 ${isOnboardingVariant ? "space-y-4" : ""}`}>
          {/* Top Info Banner */}
          <div
            className={`bg-teal-50 border border-teal-200 rounded-xl p-3 flex items-center gap-3 ${
              isOnboardingVariant ? "mb-0" : "mb-4"
            }`}
          >
            <Sparkles
              className="size-5 text-teal-600 flex-shrink-0"
              strokeWidth={2}
            />
            <p className="text-sm text-gray-700">
              <span className="font-bold text-gray-900">
                {t("uploadProductsFile")}
              </span>{" "}
              - {t("excelCsvFormat")}
            </p>
          </div>

          {/* Main 2-Column Layout */}
          <div
            className={`grid gap-4 ${
              isOnboardingVariant ? "grid-cols-1 mb-0" : "grid-cols-2 mb-4"
            }`}
          >
            {/* Left: Upload Area */}
            <div
              role="button"
              tabIndex={0}
              onClick={handleChooseFile}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleChooseFile();
                }
              }}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative overflow-hidden border-2 border-dashed rounded-[24px] flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                isDragActive
                  ? "border-teal-500 bg-teal-100 shadow-[0_0_0_4px_rgba(20,184,166,0.12)]"
                  : selectedFile
                    ? "border-teal-300 bg-white"
                    : "border-teal-200 bg-gradient-to-br from-teal-50 via-white to-cyan-50/70 hover:border-teal-300 hover:shadow-sm"
              } ${isOnboardingVariant ? "min-h-[300px] p-8" : "min-h-[260px] p-6"}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div
                className={`pointer-events-none absolute inset-0 rounded-[24px] transition-opacity ${
                  isDragActive ? "opacity-100 bg-teal-100/50" : "opacity-0"
                }`}
              />
              <div className="relative z-10 flex w-full flex-col items-center">
                {!selectedFile ? (
                  <>
                    <div
                      className={`mb-4 flex items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-50 ${
                        isOnboardingVariant ? "size-20" : "size-16"
                      }`}
                    >
                      <FileSpreadsheet
                        className={`${isOnboardingVariant ? "size-10" : "size-8"} text-teal-600`}
                        strokeWidth={2}
                      />
                    </div>
                    <h4
                      className={`${
                        isOnboardingVariant ? "text-xl" : "text-lg"
                      } mb-1.5 font-semibold text-gray-900`}
                    >
                      {t("dropFileHere")}
                    </h4>
                    <p
                      className={`${
                        isOnboardingVariant
                          ? "mb-5 max-w-sm text-sm"
                          : "mb-4 max-w-xs text-xs"
                      } text-gray-500`}
                    >
                      {t("orClickBrowse")}
                    </p>
                    <Button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleChooseFile();
                      }}
                      className={`bg-teal-600 hover:bg-teal-700 text-white rounded-full font-semibold h-auto shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-teal-600/30 transition-all ${
                        isOnboardingVariant
                          ? "px-7 py-2.5 text-sm"
                          : "px-6 py-2 text-sm"
                      }`}
                    >
                      {t("chooseFileComputer")}
                    </Button>
                    <p className="mt-3 text-[11px] text-gray-400">
                      CSV, XLSX, XLS
                    </p>
                  </>
                ) : (
                  <div className="w-full max-w-xl">
                    <div
                      className={`flex items-center gap-3 rounded-2xl border border-teal-200 bg-teal-50/60 ${
                        isOnboardingVariant ? "p-5 mb-4" : "p-4 mb-3"
                      }`}
                    >
                      <div className="size-12 rounded-xl border border-teal-100 bg-white flex items-center justify-center flex-shrink-0">
                        <FileSpreadsheet
                          className="size-6 text-teal-600"
                          strokeWidth={2}
                        />
                      </div>
                      <div className="flex-1 text-start min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleRemoveFile();
                        }}
                        className="size-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div
                      className={`flex items-center gap-2 justify-center rounded-xl border border-teal-100 bg-white text-teal-700 ${
                        isOnboardingVariant ? "p-3.5" : "p-3"
                      }`}
                    >
                      <CheckCircle2 className="size-4" />
                      <span className="text-xs font-semibold">
                        {t("fileReadyUpload")}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleChooseFile();
                      }}
                      className="text-xs text-gray-600 hover:text-gray-900 underline underline-offset-2 mt-3"
                    >
                      {t("chooseDifferentFile")}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: What you need */}
            <div
              className={`bg-white border-2 border-gray-200 rounded-xl ${
                isOnboardingVariant ? "p-5" : "p-4"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <CircleHelp className="size-4 text-teal-600" />
                <h4 className="text-sm font-bold text-gray-900">
                  {t("whatInfoNeeded")}
                </h4>
              </div>

              <div
                className={isOnboardingVariant ? "space-y-3" : "space-y-2.5"}
              >
                <div>
                  <p className="text-xs font-semibold text-gray-900 mb-1.5">
                    {t("required")}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      t("productNameField"),
                      t("priceField"),
                      t("expiryDateField"),
                      t("quantityField"),
                    ].map((col) => (
                      <div
                        key={col}
                        className="bg-teal-50 border border-teal-200 text-teal-900 rounded-md px-2 py-1 text-xs font-medium"
                      >
                        {col}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1.5">
                    {t("optional")}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {[t("barcode"), t("category"), t("batchNumberField")].map(
                      (col) => (
                        <div
                          key={col}
                          className="bg-gray-50 border border-gray-200 text-gray-600 rounded-md px-2 py-1 text-xs font-medium"
                        >
                          {col}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Options - Prominent Section */}
          {!isOnboardingVariant && (
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-6 bg-teal-600 rounded-full flex items-center justify-center">
                  <Sparkles className="size-4 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  {t("uploadOptions")}
                </h3>
                <span className="text-xs text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full font-semibold">
                  {t("configureBeforeUpload")}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-teal-300 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="size-8 bg-teal-100 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="size-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {t("matchAumetProducts")}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={useAumetReference}
                      onCheckedChange={setUseAumetReference}
                    />
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {t("autoFillProductDetails")}
                  </p>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-teal-300 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="size-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FileSpreadsheet className="size-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {t("autoCreateBarcodes")}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={autoGenerateBarcode}
                      onCheckedChange={setAutoGenerateBarcode}
                    />
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {t("generateBarcodesForProducts")}
                  </p>
                </div>

                <div className="bg-white border-2 border-orange-200 rounded-xl p-4 hover:border-orange-300 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="size-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="size-4 text-orange-600" />
                      </div>
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-bold text-gray-900">
                          {t("resetOldStock")}
                        </p>
                        <div className="group relative">
                          <CircleHelp className="size-3.5 text-gray-400 cursor-help" />
                          <div className="hidden group-hover:block absolute bottom-full end-0 mb-2 w-56 bg-gray-900 text-white text-xs rounded-lg p-2 z-50">
                            {t("clearExistingStock")}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={resetExistingStock}
                      onCheckedChange={setResetExistingStock}
                    />
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {t("setStockToZero")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Help Options Row */}
          <div
            className={`grid gap-4 ${
              isOnboardingVariant ? "grid-cols-1 mt-0" : "grid-cols-2 mt-5"
            }`}
          >
            {/* Download Template */}
            <button
              onClick={handleDownloadTemplate}
              className={`flex items-center gap-3 bg-white border-2 border-teal-200 hover:border-teal-400 rounded-xl transition-all group ${
                isOnboardingVariant ? "p-4" : "p-3"
              }`}
            >
              <div className="bg-teal-100 p-2 rounded-lg group-hover:bg-teal-200 transition-colors">
                <Download className="size-5 text-teal-700" />
              </div>
              <div className="text-start">
                <p className="text-sm font-bold text-gray-900">
                  {t("downloadSample")}
                </p>
                <p className="text-xs text-gray-600">{t("getTemplate")}</p>
              </div>
            </button>

            {!isOnboardingVariant && (
              <button
                onClick={() => {
                  onNavigate?.("manualUpdateStock");
                  onOpenChange(false);
                }}
                className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 hover:border-gray-400 rounded-xl transition-all group"
              >
                <div className="bg-gray-100 p-2 rounded-lg group-hover:bg-gray-200 transition-colors">
                  <FileEdit className="size-5 text-gray-700" />
                </div>
                <div className="text-start">
                  <p className="text-sm font-bold text-gray-900">
                    {t("addManually")}
                  </p>
                  <p className="text-xs text-gray-600">{t("enterOneByOne")}</p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-4 border-t border-gray-200 bg-white rounded-b-3xl ${
            isOnboardingVariant
              ? "flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"
              : "flex items-center justify-between"
          }`}
        >
          <Button
            variant="ghost"
            className={`text-gray-700 hover:text-gray-900 rounded-full text-sm h-auto py-1.5 px-3 flex items-center gap-2 ${
              isOnboardingVariant ? "justify-center sm:justify-start" : ""
            }`}
          >
            <CirclePlay className="size-4" />
            {t("viewTour")}
          </Button>

          <div
            className={`flex gap-2.5 ${
              isOnboardingVariant ? "w-full sm:w-auto" : "items-center"
            }`}
          >
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className={`text-gray-700 hover:text-gray-900 rounded-full text-sm h-auto py-1.5 px-5 border-gray-300 ${
                isOnboardingVariant ? "flex-1 sm:flex-none" : ""
              }`}
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleImport}
              className={`rounded-full px-6 text-sm h-auto py-1.5 flex items-center gap-2 ${
                selectedFile && !isProcessingImport
                  ? "bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-teal-600/30"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              } ${isOnboardingVariant ? "flex-1 sm:flex-none" : ""}`}
              disabled={!selectedFile || isProcessingImport}
            >
              {isProcessingImport ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {isProcessingImport ? t("processingImport") : t("uploadProcess")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
