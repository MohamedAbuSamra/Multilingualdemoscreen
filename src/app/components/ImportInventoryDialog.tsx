import { useState, useRef } from "react";
import {
  X,
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
} from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { useLanguage } from "../contexts/LanguageContext";
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
  onNavigate,
}: ImportInventoryDialogProps) {
  const { t } = useLanguage();
  const [useAumetReference, setUseAumetReference] = useState(true);
  const [autoGenerateBarcode, setAutoGenerateBarcode] = useState(true);
  const [resetExistingStock, setResetExistingStock] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1600px] w-[75vw] p-0 gap-0 rounded-3xl">
        <DialogHeader className="px-6 py-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-bold text-gray-900">
            {t("updateStockTitle")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("uploadInventoryDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4">
          {/* Top Info Banner */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 flex items-center gap-3 mb-4">
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
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Left: Upload Area */}
            <div className="border-2 border-dashed border-teal-300 rounded-xl p-6 bg-gradient-to-br from-teal-50/30 to-white flex flex-col items-center justify-center text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!selectedFile ? (
                <>
                  <div className="size-16 bg-teal-100 rounded-xl flex items-center justify-center mb-3">
                    <FileSpreadsheet
                      className="size-8 text-teal-600"
                      strokeWidth={2}
                    />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {t("dropFileHere")}
                  </h4>
                  <p className="text-xs text-gray-600 mb-4">
                    {t("orClickBrowse")}
                  </p>
                  <Button
                    onClick={handleChooseFile}
                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-6 py-2 text-sm font-semibold h-auto shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-teal-600/30 transition-all"
                  >
                    {t("chooseFileComputer")}
                  </Button>
                </>
              ) : (
                <div className="w-full">
                  <div className="flex items-center gap-3 bg-white border border-teal-200 rounded-xl p-4 mb-3">
                    <div className="size-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
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
                      onClick={handleRemoveFile}
                      className="size-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 justify-center text-teal-700 bg-teal-50 rounded-lg p-3">
                    <CheckCircle2 className="size-4" />
                    <span className="text-xs font-semibold">
                      {t("fileReadyUpload")}
                    </span>
                  </div>

                  <button
                    onClick={handleChooseFile}
                    className="text-xs text-gray-600 hover:text-gray-900 underline underline-offset-2 mt-3"
                  >
                    {t("chooseDifferentFile")}
                  </button>
                </div>
              )}
            </div>

            {/* Right: What you need */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <CircleHelp className="size-4 text-teal-600" />
                <h4 className="text-sm font-bold text-gray-900">
                  {t("whatInfoNeeded")}
                </h4>
              </div>

              <div className="space-y-2.5">
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
              {/* Option 1 */}
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

              {/* Option 2 */}
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

              {/* Option 3 */}
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

          {/* Help Options Row */}
          <div className="grid grid-cols-2 gap-4 mt-5">
            {/* Download Template */}
            <button className="flex items-center gap-3 p-3 bg-white border-2 border-teal-200 hover:border-teal-400 rounded-xl transition-all group">
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

            {/* Manual Entry */}
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
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white rounded-b-3xl">
          <Button
            variant="ghost"
            className="text-gray-700 hover:text-gray-900 rounded-full text-sm h-auto py-1.5 px-3 flex items-center gap-2"
          >
            <CirclePlay className="size-4" />
            {t("viewTour")}
          </Button>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-gray-700 hover:text-gray-900 rounded-full text-sm h-auto py-1.5 px-5 border-gray-300"
            >
              {t("cancel")}
            </Button>
            <Button
              className={`rounded-full px-6 text-sm h-auto py-1.5 flex items-center gap-2 ${
                selectedFile
                  ? "bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-teal-600/30"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!selectedFile}
            >
              <Upload className="size-4" />
              {t("uploadProcess")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
