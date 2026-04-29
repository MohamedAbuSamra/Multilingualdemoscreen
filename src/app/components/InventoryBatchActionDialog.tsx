import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  PencilLine,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useLanguage } from "../contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export type InventoryBatchActionDialogMode =
  | "editBatch"
  | "stockIn"
  | "stockOut"
  | "addBatch";

type BatchOption = {
  id: string;
  batchNumber: string;
  expiry: string;
  warehouseZone: string;
  stockQty: string;
  avgCost: string;
  sellPrice: string;
};

export type InventoryBatchActionTarget =
  | {
      type: "product";
      productId: string;
      productCode: string;
      productName: string;
      batches: BatchOption[];
    }
  | {
      type: "batch";
      productId: string;
      productCode: string;
      productName: string;
      batch: BatchOption;
      batches: BatchOption[];
    };

interface InventoryBatchActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: InventoryBatchActionDialogMode;
  target: InventoryBatchActionTarget | null;
}

interface InventoryBatchActionFormState {
  selectedBatchId: string;
  batchNumber: string;
  expiry: string;
  warehouseZone: string;
  stockQty: string;
  qtyChange: string;
  avgCost: string;
  sellPrice: string;
  notes: string;
}

const INITIAL_FORM: InventoryBatchActionFormState = {
  selectedBatchId: "",
  batchNumber: "",
  expiry: "",
  warehouseZone: "",
  stockQty: "",
  qtyChange: "",
  avgCost: "",
  sellPrice: "",
  notes: "",
};

export function InventoryBatchActionDialog({
  open,
  onOpenChange,
  mode,
  target,
}: InventoryBatchActionDialogProps) {
  const { language, t } = useLanguage();
  const isRTL = language === "ar";
  const [form, setForm] = useState<InventoryBatchActionFormState>(INITIAL_FORM);

  const selectedBatch = useMemo(() => {
    if (!target) return null;
    return (
      target.batches.find((batch) => batch.id === form.selectedBatchId) ?? null
    );
  }, [form.selectedBatchId, target]);

  useEffect(() => {
    if (!target || !open) {
      setForm(INITIAL_FORM);
      return;
    }

    const defaultBatch =
      target.type === "batch" ? target.batch : (target.batches[0] ?? null);

    if (mode === "addBatch") {
      setForm({
        selectedBatchId: "new-batch",
        batchNumber: "",
        expiry: "",
        warehouseZone: "",
        stockQty: "",
        qtyChange: "",
        avgCost: "",
        sellPrice: "",
        notes: "",
      });
      return;
    }

    setForm({
      selectedBatchId: defaultBatch?.id ?? "",
      batchNumber: defaultBatch?.batchNumber ?? "",
      expiry: defaultBatch?.expiry ?? "",
      warehouseZone: defaultBatch?.warehouseZone ?? "",
      stockQty: defaultBatch?.stockQty ?? "",
      qtyChange: "",
      avgCost: defaultBatch?.avgCost ?? "",
      sellPrice: defaultBatch?.sellPrice ?? "",
      notes: "",
    });
  }, [target, open, mode]);

  useEffect(() => {
    if (!selectedBatch) return;

    setForm((current) => ({
      ...current,
      batchNumber: selectedBatch.batchNumber,
      expiry: selectedBatch.expiry,
      warehouseZone: selectedBatch.warehouseZone,
      stockQty: selectedBatch.stockQty,
      avgCost: selectedBatch.avgCost,
      sellPrice: selectedBatch.sellPrice,
    }));
  }, [selectedBatch]);

  const isEditMode = mode === "editBatch";
  const isStockInMode = mode === "stockIn";
  const isStockOutMode = mode === "stockOut";
  const isAddBatchMode = mode === "addBatch";

  const dialogMeta = isAddBatchMode
    ? {
        title: language === "ar" ? "إضافة دفعة جديدة" : "Add New Batch",
        description:
          language === "ar"
            ? "أضف دفعة جديدة لهذا المنتج مباشرة من الجدول."
            : "Add a new batch for this product directly from the table.",
        icon: <Boxes className="size-5 text-blue-600" strokeWidth={2} />,
        iconWrapperClassName: "bg-blue-100",
        actionLabel: language === "ar" ? "إضافة الدفعة" : "Add Batch",
      }
    : isEditMode
      ? {
          title: language === "ar" ? "تعديل الدفعة" : "Edit Batch",
          description:
            target?.type === "batch"
              ? language === "ar"
                ? "قم بتحديث بيانات هذه الدفعة مباشرة."
                : "Update this batch details directly."
              : language === "ar"
                ? "اختر دفعة من هذا المنتج ثم حدّث بياناتها."
                : "Choose a batch from this product and update its details.",
          icon: (
            <PencilLine className="size-5 text-amber-600" strokeWidth={2} />
          ),
          iconWrapperClassName: "bg-amber-100",
          actionLabel:
            language === "ar" ? "حفظ تعديلات الدفعة" : "Save Batch Changes",
        }
      : isStockInMode
        ? {
            title: language === "ar" ? "إدخال مخزون" : "Stock In",
            description:
              target?.type === "batch"
                ? language === "ar"
                  ? "قم بزيادة كمية المخزون لهذه الدفعة."
                  : "Increase stock quantity for this batch."
                : language === "ar"
                  ? "اختر دفعة من هذا المنتج ثم أضف مخزونًا لها."
                  : "Choose a batch from this product and add stock.",
            icon: (
              <ArrowDownToLine
                className="size-5 text-emerald-600"
                strokeWidth={2}
              />
            ),
            iconWrapperClassName: "bg-emerald-100",
            actionLabel:
              language === "ar" ? "تأكيد إدخال المخزون" : "Confirm Stock In",
          }
        : {
            title: language === "ar" ? "إخراج مخزون" : "Stock Out",
            description:
              target?.type === "batch"
                ? language === "ar"
                  ? "قم بإنقاص كمية المخزون لهذه الدفعة."
                  : "Decrease stock quantity for this batch."
                : language === "ar"
                  ? "اختر دفعة من هذا المنتج ثم اسحب منها مخزونًا."
                  : "Choose a batch from this product and remove stock.",
            icon: (
              <ArrowUpFromLine
                className="size-5 text-rose-600"
                strokeWidth={2}
              />
            ),
            iconWrapperClassName: "bg-rose-100",
            actionLabel:
              language === "ar" ? "تأكيد إخراج المخزون" : "Confirm Stock Out",
          };

  const updateField = <K extends keyof InventoryBatchActionFormState>(
    field: K,
    value: InventoryBatchActionFormState[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleBatchChange = (batchId: string) => {
    updateField("selectedBatchId", batchId);
  };

  const handleSubmit = () => {
    onOpenChange(false);
  };

  if (!target) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[760px] w-[92vw] p-0 gap-0 rounded-3xl overflow-hidden">
        <DialogHeader className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`size-10 rounded-xl flex items-center justify-center ${dialogMeta.iconWrapperClassName}`}
            >
              {dialogMeta.icon}
            </div>
            <div className={isRTL ? "text-right" : "text-left"}>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {dialogMeta.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                {dialogMeta.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 bg-gray-50 space-y-5" dir={isRTL ? "rtl" : "ltr"}>
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <Boxes className="size-5 text-slate-600" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900">
                  {target.productName}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {language === "ar" ? "الكود" : "Code"}: {target.productCode}
                </div>
              </div>
            </div>
          </div>

          {!isAddBatchMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  {language === "ar" ? "اختر الدفعة" : "Select Batch"}
                </Label>
                <Select
                  value={form.selectedBatchId}
                  onValueChange={handleBatchChange}
                  disabled={target.type === "batch"}
                >
                  <SelectTrigger
                    className={`h-11 rounded-full border-gray-300 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    <SelectValue
                      placeholder={
                        language === "ar" ? "اختر دفعة" : "Select a batch"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {target.batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.batchNumber} · {batch.expiry} ·{" "}
                        {batch.warehouseZone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  {language === "ar" ? "الكمية الحالية" : "Current Quantity"}
                </Label>
                <Input
                  value={form.stockQty}
                  readOnly
                  dir="ltr"
                  className="h-11 rounded-full bg-gray-100"
                />
              </div>
            </div>
          ) : null}

          {isEditMode || isAddBatchMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  {language === "ar" ? "رقم الدفعة" : "Batch Number"}
                </Label>
                <Input
                  value={form.batchNumber}
                  onChange={(e) => updateField("batchNumber", e.target.value)}
                  className="h-11 rounded-full"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label>{language === "ar" ? "تاريخ الانتهاء" : "Expiry"}</Label>
                <Input
                  value={form.expiry}
                  onChange={(e) => updateField("expiry", e.target.value)}
                  className="h-11 rounded-full"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  {language === "ar" ? "موقع المستودع" : "Warehouse Zone"}
                </Label>
                <Input
                  value={form.warehouseZone}
                  onChange={(e) => updateField("warehouseZone", e.target.value)}
                  className="h-11 rounded-full"
                />
              </div>

              <div className="space-y-2">
                <Label>{language === "ar" ? "الكمية" : "Quantity"}</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.stockQty}
                  onChange={(e) => updateField("stockQty", e.target.value)}
                  className="h-11 rounded-full"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  {language === "ar" ? "متوسط التكلفة" : "Average Cost"}
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.avgCost}
                  onChange={(e) => updateField("avgCost", e.target.value)}
                  className="h-11 rounded-full"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label>{language === "ar" ? "سعر البيع" : "Sell Price"}</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.sellPrice}
                  onChange={(e) => updateField("sellPrice", e.target.value)}
                  className="h-11 rounded-full"
                  dir="ltr"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  {isStockInMode
                    ? language === "ar"
                      ? "الكمية المراد إضافتها"
                      : "Quantity to Add"
                    : language === "ar"
                      ? "الكمية المراد إخراجها"
                      : "Quantity to Remove"}
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={form.qtyChange}
                  onChange={(e) => updateField("qtyChange", e.target.value)}
                  placeholder={language === "ar" ? "0" : "0"}
                  className="h-11 rounded-full"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label>{language === "ar" ? "ملاحظات" : "Notes"}</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder={
                    language === "ar" ? "ملاحظة اختيارية" : "Optional note"
                  }
                  className="h-11 rounded-full"
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-between gap-3">
          <div className="text-sm text-gray-500">
            {target.type === "batch"
              ? language === "ar"
                ? "سيتم تطبيق هذا الإجراء على صف الدفعة المحدد."
                : "This action applies to the selected batch row."
              : isAddBatchMode
                ? language === "ar"
                  ? "سيتم إنشاء دفعة جديدة لهذا المنتج."
                  : "A new batch will be created for this product."
                : language === "ar"
                  ? "يبدأ هذا الإجراء من مستوى المنتج ويتيح لك اختيار الدفعة المستهدفة."
                  : "This action starts from the product level and lets you choose the target batch."}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 px-5 rounded-full border-gray-300"
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              className={`h-10 px-5 rounded-full ${
                isAddBatchMode
                  ? "bg-blue-600 hover:bg-blue-700"
                  : isEditMode
                    ? "bg-amber-600 hover:bg-amber-700"
                    : isStockInMode
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {dialogMeta.actionLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
