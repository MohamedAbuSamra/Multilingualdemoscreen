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

import { useState } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Navbar } from './components/Navbar';
import { InventoryPage } from './components/InventoryPage';
import { UpdateStockPage } from './components/UpdateStockPage';
import { ManualUpdateStockPage } from './components/ManualUpdateStockPage';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<'products' | 'updateStock' | 'manualUpdateStock'>('products');
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar onNavigate={setCurrentPage} currentPage={currentPage} />
      <div className="flex-1 overflow-y-auto">
        {currentPage === 'products' ? (
          <InventoryPage onNavigate={setCurrentPage} />
        ) : currentPage === 'updateStock' ? (
          <UpdateStockPage onNavigate={setCurrentPage} />
        ) : (
          <ManualUpdateStockPage />
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