import { useState } from "react";
import { Bell, ChevronDown, Activity } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useLanguage } from "../contexts/LanguageContext";
import { CreateProductDialog } from "./CreateProductDialog";

interface NavbarProps {
  onNavigate: (
    page:
      | "products"
      | "updateStock"
      | "manualUpdateStock"
      | "stockHistoryDetails"
      | "fullProductCreation"
      | "viewProduct",
  ) => void;
  currentPage:
    | "products"
    | "updateStock"
    | "manualUpdateStock"
    | "stockHistoryDetails"
    | "fullProductCreation"
    | "viewProduct";
}

export function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const { language, toggleLanguage, t } = useLanguage();
  const [createProductOpen, setCreateProductOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b bg-white px-6 py-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-teal-500" strokeWidth={2.5} />
            <span className="text-sm font-semibold">Pulse</span>
          </div>

          <div className="flex items-center">
            <Button
              variant="ghost"
              className="h-9 px-3 text-xs text-gray-700 hover:text-gray-900 hover:bg-transparent"
            >
              {t("dashboard")}
            </Button>
            <Button
              variant="ghost"
              className="h-9 px-3 text-xs text-gray-700 hover:text-gray-900 hover:bg-transparent gap-1"
            >
              {t("pointOfSale")} <ChevronDown className="size-3.5" />
            </Button>

            <button
              type="button"
              onClick={() => onNavigate("products")}
              className={`h-9 px-3 text-xs gap-1 font-medium transition-colors focus-visible:outline-none border-b-2 relative rounded-none hover:bg-transparent inline-flex items-center justify-center bg-transparent outline-none ${
                currentPage === "products"
                  ? "text-teal-600 hover:text-teal-700 border-teal-600"
                  : "text-gray-700 hover:text-gray-900 border-transparent"
              }`}
            >
              {t("inventory")}
            </button>

            <Button
              variant="ghost"
              className="h-9 px-3 text-xs text-gray-700 hover:text-gray-900 hover:bg-transparent gap-1"
            >
              {t("marketplace")} <ChevronDown className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              className="h-9 px-3 text-xs text-gray-700 hover:text-gray-900 hover:bg-transparent gap-1"
            >
              {t("purchase")} <ChevronDown className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              className="h-9 px-3 text-xs text-gray-700 hover:text-gray-900 hover:bg-transparent gap-1"
            >
              {t("sellerPXP")} <ChevronDown className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              className="h-9 px-3 text-xs text-gray-700 hover:text-gray-900 hover:bg-transparent gap-1"
            >
              {t("customers")} <ChevronDown className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              className="h-9 px-3 text-xs text-gray-700 hover:text-gray-900 hover:bg-transparent gap-1"
            >
              {t("reports")} <ChevronDown className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              className="h-9 px-3 text-xs text-gray-700 hover:text-gray-900 hover:bg-transparent gap-1"
            >
              {t("settings")} <ChevronDown className="size-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="text-xs h-8 rounded-full"
          >
            {language === "en" ? "العربية" : "English"}
          </Button>

          <div className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-medium">
            JOD 7.00
          </div>

          <div className="relative">
            <Bell
              className="size-5 text-gray-600 cursor-pointer"
              strokeWidth={2}
            />
            <Badge className="absolute -top-1 -end-1 size-4 p-0 flex items-center justify-center bg-red-500 text-[10px] rounded-full border-2 border-white">
              3
            </Badge>
          </div>

          <Avatar className="size-8 cursor-pointer rounded-full">
            <AvatarFallback className="bg-teal-100 text-teal-700 text-xs font-medium rounded-full">
              T
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <CreateProductDialog
        open={createProductOpen}
        onOpenChange={setCreateProductOpen}
        onNavigate={onNavigate}
      />
    </nav>
  );
}
