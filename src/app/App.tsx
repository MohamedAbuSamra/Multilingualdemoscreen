/**
 * RTL/LTR BILINGUAL APP - CRITICAL RULES:
 *
 * 1. NEVER use: left-*, right-*, pl-*, pr-*, ml-*, mr-*, text-left, text-right
 *    ALWAYS use: start-*, end-*, ps-*, pe-*, ms-*, me-*, text-start, text-end
 *
 * 2. NO hardcoded text - use t('translationKey') for ALL user-facing strings
 *
 * 3. Portal components (Dialog, Dropdown) MUST observe document.documentElement.dir
 *
 * See RTL_RULES.md for complete guidelines
 */

import { useState } from "react";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { Navbar } from "./components/Navbar";
import { InventoryPage } from "./components/InventoryPage";
import { UpdateStockPage } from "./components/UpdateStockPage";
import { ManualUpdateStockPage } from "./components/ManualUpdateStockPage";
import { StockHistoryDetailsPage } from "./components/StockHistoryDetailsPage";
import { FullProductCreationPage } from "./components/FullProductCreationPage";
import { ViewProductPage } from "./components/ViewProductPage";

function AppContent() {
  const [currentPage, setCurrentPage] = useState<
    | "products"
    | "updateStock"
    | "manualUpdateStock"
    | "stockHistoryDetails"
    | "fullProductCreation"
    | "viewProduct"
  >("products");
  const [manualUpdateEntryPoint, setManualUpdateEntryPoint] = useState<
    "default" | "onboarding"
  >("default");
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const handleNavigate = (
    page:
      | "products"
      | "updateStock"
      | "manualUpdateStock"
      | "stockHistoryDetails"
      | "fullProductCreation"
      | "viewProduct",
    options?: {
      manualUpdateEntryPoint?: "default" | "onboarding";
    },
  ) => {
    if (page === "manualUpdateStock") {
      setManualUpdateEntryPoint(options?.manualUpdateEntryPoint ?? "default");
    }

    setCurrentPage(page);
  };

  return (
    <div
      className="h-screen flex flex-col bg-gray-50 overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
      <div className="flex-1 overflow-y-auto">
        {currentPage === "products" ? (
          <InventoryPage onNavigate={handleNavigate} />
        ) : currentPage === "updateStock" ? (
          <UpdateStockPage onNavigate={handleNavigate} />
        ) : currentPage === "manualUpdateStock" ? (
          <ManualUpdateStockPage
            onNavigate={handleNavigate}
            entryPoint={manualUpdateEntryPoint}
          />
        ) : currentPage === "stockHistoryDetails" ? (
          <StockHistoryDetailsPage onNavigate={handleNavigate} />
        ) : currentPage === "fullProductCreation" ? (
          <FullProductCreationPage onNavigate={handleNavigate} />
        ) : (
          <ViewProductPage onNavigate={handleNavigate} />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
