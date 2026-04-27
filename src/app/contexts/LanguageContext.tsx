import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<
  LanguageContextType | undefined
>(undefined);

/**
 * IMPORTANT: When adding new translation keys:
 * 1. Add to BOTH 'en' and 'ar' sections
 * 2. Use descriptive keys (e.g., 'uploadFile' not 'button1')
 * 3. Never hardcode text in components - always use t('key')
 */
const translations = {
  en: {
    // Navbar
    dashboard: "Dashboard",
    pointOfSale: "Point of Sale",
    stocks: "Stocks",
    pos: "POS",
    inventory: "Inventory",
    marketplace: "Marketplace",
    purchase: "Purchase",
    sellerPXP: "Seller PXP",
    customers: "Customers",
    reports: "Reports",
    settings: "Settings",

    // Inventory Menu
    yourProducts: "Your Products",
    inventoryProductsList: "Inventory Products List",
    createProduct: "Create Product",
    updateStock: "Update Stock",
    manualUpdateStock: "Manual Update Stock",
    openingStock: "Opening Stock",
    createStockAdjustment: "Create Stock Adjustment",
    inventoryAdjustmentHistory: "Inventory Adjustment History",
    printBarcode: "Print Barcode",

    // Buttons
    createNew: "Create New",
    checkAdjustmentHistory: "Check Adjustment History",
    stockHistory: "Stock History",
    stockAdjustment: "Stock Adjustment",
    review: "Review",
    filters: "Filters",
    export: "Export",

    // Stats
    totalProducts: "Total Products",
    activeProductsInInventory: "Active products in inventory",
    expiringsSoon: "Expiring Soon",
    productsExpiringsNext90Days:
      "Products expirings next 90 days",
    lowStock: "Low Stock",
    productsBelowMinimumLevel: "Products below minimum level",
    stagnantProducts: "Stagnant Products",
    productsNoSales90Days:
      "Products with no sales in the last 90+ days",

    // Bulk Stocks Page
    bulkStocksHistory: "Bulk Stocks History",
    trackStocksMovements:
      "Track all stocks movements and changes made to your stock levels",
    updateYourStock: "Update your Stock",
    uploadStockFile: "Upload Stock File",
    createManualList: "Create Manual List",

    // Cards
    receiveMarketplacePurchaseOrders:
      "Receive Marketplace Purchase Orders",
    new: "New",
    createNewPurchaseOrder: "Create New Purchase Order",
    lastAdded: "Last Added",
    daysAgo: "days ago",

    // Search & Table
    searchByNameIdBarcodeHatch:
      "Search by name, ID, barcode, batch...",
    code: "Code",
    productName: "Product Name",
    barcode: "Barcode",
    category: "Category",
    lotBatch: "Lot/Batch",
    expiry: "Expiry",
    lastSale: "Last Sale",
    stockQty: "Stock Qty",
    avgCostPrice: "Avg Cost Price",
    sellPrice: "Sell Price",
    tax: "Tax %",
    warehouseLocation: "Warehouse Location",
    status: "Status",
    actions: "Actions",
    noSales: "No Sales",

    // Pagination
    showing: "Showing",
    to: "to",
    of: "of",
    results: "results",
    show: "Show",
    perPage: "Per Page",
    allResultsOnThisPage: "All 2 results on this page",

    // Footer
    poweredByPulse:
      "Powered by Pulse - The Heartbeat of Your Pharmacy",
    startTour: "Start Tour",
    help: "Help",

    // Create Product Dialog
    quickNewProductCreation: "Quick New Product Creation",
    quickAddYourProduct: "Quick add your product",
    fillInTheDetailsBelow: "Fill in the details below",
    searchAumetProducts: "Search Aumet Products",
    searchProductName: "Search product name",
    generateBarcode: "Generate",
    enterOrScanBarcode: "Enter, scan, or generate barcode",
    selectCategory: "Select category",
    medicine: "Medicine",
    supplement: "Supplement",
    equipment: "Equipment",
    unitType: "Unit Type",
    selectUnit: "Unit",
    tablet: "Tablet",
    capsule: "Capsule",
    bottle: "Bottle",
    box: "Box",
    count: "Count",
    price: "Price",
    sellingPrice: "Selling Price",
    taxRate: "Tax",
    productDetails: "Product Details",
    firstBatchOptional: "First Batch (Optional)",
    addInitialStock: "Add initial stock",
    warehouse: "Warehouse",
    main: "Main",
    expiryDate: "Expiry Date",
    selectDate: "Select date",
    batchNumber: "Batch Number",
    qty: "Qty",
    cost: "Cost",
    reason: "Reason",
    selectReason: "Select reason",
    newStock: "New Stock",
    restock: "Restock",
    addAnotherBatch: "Add Another Batch",
    moreOptions: "More Options",
    needMoreFields: "Need More Fields? Switch to Full Page",
    cancel: "Cancel",
    saveProduct: "Save Product",

    // Stock History Page
    searchAdjustmentHistory: "Search by adjustment ID, user, status, or product name...",
    stockId: "Stock ID",
    createdAt: "Created At",
    createdUser: "Created User",
    updatedAt: "Updated At",
    totalNumberOfProducts: "Total Number of Products",
    autoMigrated: "Auto migrated",
    failedMigrated: "Failed migrated",
    viewEditDetails: "View & Edit Details",
    exportReport: "Export Report",

    // Import Dialog
    updateStockTitle: "Update Stock",
    uploadInventoryDescription: "Upload your inventory file with AI-powered migration",
    uploadProductsFile: "Upload your products file",
    excelCsvFormat: "Excel or CSV format • Maximum 25MB",
    dropFileHere: "Drop your file here",
    orClickBrowse: "or click below to browse",
    chooseFileComputer: "Choose File from Computer",
    fileReadyUpload: "File ready to upload",
    chooseDifferentFile: "Choose different file",
    whatInfoNeeded: "What information do you need?",
    required: "Required:",
    optional: "Optional:",
    productNameField: "Product Name",
    priceField: "Price",
    expiryDateField: "Expiry Date",
    quantityField: "Quantity",
    batchNumberField: "Batch Number",
    uploadOptions: "Upload Options",
    configureBeforeUpload: "Configure before upload",
    matchAumetProducts: "Match Aumet Products",
    autoFillProductDetails: "Automatically fill in product details from Aumet database",
    autoCreateBarcodes: "Auto-Create Barcodes",
    generateBarcodesForProducts: "Generate barcodes for products without them",
    resetOldStock: "Reset Old Stock",
    clearExistingStock: "Clear all existing stock for products in this file before adding new stock",
    setStockToZero: "Set existing stock to zero before upload",
    downloadSample: "Download Sample",
    getTemplate: "Get a template to fill in",
    addManually: "Add Manually",
    enterOneByOne: "Enter products one by one",
    viewTour: "View Tour",
    uploadProcess: "Upload & Process",
    generate: "Generate",

    // Filters
    categoryFilter: "Category",
    selectCategory: "Select a category",
    stockRange: "Stock Range",
    selectStockRange: "Select Stock Range",
    expiryStatus: "Expiry Status",
    selectExpiryStatus: "Select Expiry Status",
    agingLastSale: "Aging last sale",
    selectAgingLastSale: "Select Aging last sale",
    selectStatus: "Select Status",
    reset: "Reset",
    apply: "Apply",
    createdDateRange: "Created Date Range",
    selectDateRange: "Select date range",
    createdUserFilter: "Created User",
    allUsers: "All Users",
    allStatus: "All Status",
  },
  ar: {
    // Navbar
    dashboard: "لوحة التحكم",
    pointOfSale: "نقطة البيع",
    stocks: "المخزون",
    pos: "نقطة البيع",
    inventory: "الجرد",
    marketplace: "السوق",
    purchase: "المشتريات",
    sellerPXP: "البائع PXP",
    customers: "العملاء",
    reports: "التقارير",
    settings: "الإعدادات",

    // Inventory Menu
    yourProducts: "منتجاتك",
    inventoryProductsList: "قائمة منتجات المخزون",
    createProduct: "إنشاء منتج",
    updateStock: "تحديث المخزون",
    manualUpdateStock: "تحديث المخزون يدوياً",
    openingStock: "المخزون الافتتاحي",
    createStockAdjustment: "إنشاء تعديل المخزون",
    inventoryAdjustmentHistory: "سجل تعديلات المخزون",
    printBarcode: "طباعة الباركود",

    // Buttons
    createNew: "إنشاء جديد",
    checkAdjustmentHistory: "التحقق من سجل التعديلات",
    stockHistory: "سجل تعديل المخزون",
    stockAdjustment: "تعديل المخزون",
    review: "مراجعة",
    filters: "الفلاتر",
    export: "تصدير",

    // Stats
    totalProducts: "إجمالي المنتجات",
    activeProductsInInventory: "المنتجات النشطة في المخزون",
    expiringsSoon: "تنتهي قريباً",
    productsExpiringsNext90Days:
      "المنتجات التي تنتهي في الـ 90 يوماً القادمة",
    lowStock: "مخزون منخفض",
    productsBelowMinimumLevel: "المنتجات تحت الحد الأدنى",
    stagnantProducts: "منتجات راكدة",
    productsNoSales90Days:
      "منتجات بدون مبيعات في آخر 90+ يوماً",

    // Bulk Stocks Page
    bulkStocksHistory: "سجل تعديلات المخزون",
    trackStocksMovements:
      "تتبع جميع حركات المخزون والتغييرات المجراة على مستويات مخزونك",
    updateYourStock: "تحديث المخزون",
    uploadStockFile: "رفع ملف المخزون",
    createManualList: "إنشاء قائمة يدوية",

    // Cards
    receiveMarketplacePurchaseOrders: "استلام طلبات شراء السوق",
    new: "جديد",
    createNewPurchaseOrder: "إنشاء طلب شراء جديد",
    lastAdded: "آخر إضافة",
    daysAgo: "أيام مضت",

    // Search & Table
    searchByNameIdBarcodeHatch:
      "البحث بالاسم، المعرف، الباركود، الدفعة...",
    code: "الرمز",
    productName: "اسم المنتج",
    barcode: "الباركود",
    category: "الفئة",
    lotBatch: "الدفعة",
    expiry: "انتهاء الصلاحية",
    lastSale: "آخر بيع",
    stockQty: "كمية المخزون",
    avgCostPrice: "متوسط سعر التكلفة",
    sellPrice: "سعر البيع",
    tax: "الضريبة %",
    warehouseLocation: "موقع المستودع",
    status: "الحالة",
    actions: "الإجراءات",
    noSales: "لا مبيعات",

    // Pagination
    showing: "عرض",
    to: "إلى",
    of: "من",
    results: "نتيجة",
    show: "عرض",
    perPage: "لكل صفحة",
    allResultsOnThisPage: "جميع النتائج 2 في هذه الصفحة",

    // Footer
    poweredByPulse: "مدعوم من Pulse - نبض صيدليتك",
    startTour: "بدء الجولة",
    help: "مساعدة",

    // Create Product Dialog
    quickNewProductCreation: "إنشاء منتج جديد سريع",
    quickAddYourProduct: "أضف منتجك بسرعة",
    fillInTheDetailsBelow: "املأ التفاصيل أدناه",
    searchAumetProducts: "البحث في منتجات أوميت",
    searchProductName: "ابحث عن اسم المنتج",
    generateBarcode: "توليد",
    enterOrScanBarcode: "أدخل أو امسح الباركود",
    selectCategory: "اختر الفئة",
    medicine: "دواء",
    supplement: "مكمل غذائي",
    equipment: "معدات",
    unitType: "نوع الوحدة",
    selectUnit: "الوحدة",
    tablet: "قرص",
    capsule: "كبسولة",
    bottle: "زجاجة",
    box: "علبة",
    count: "العدد",
    price: "السعر",
    sellingPrice: "سعر البيع",
    taxRate: "الضريبة",
    productDetails: "تفاصيل المنتج",
    firstBatchOptional: "الدفعة الأولى (اختياري)",
    addInitialStock: "إضافة مخزون أولي",
    warehouse: "المستودع",
    main: "الرئيسي",
    expiryDate: "تاريخ الانتهاء",
    selectDate: "اختر التاريخ",
    batchNumber: "رقم الدفعة",
    qty: "الكمية",
    cost: "التكلفة",
    reason: "السبب",
    selectReason: "اختر السبب",
    newStock: "مخزون جديد",
    restock: "إعادة تخزين",
    addAnotherBatch: "إضافة دفعة أخرى",
    moreOptions: "خيارات أكثر",
    needMoreFields:
      "تحتاج المزيد من الحقول؟ انتقل إلى الصفحة الكاملة",
    cancel: "إلغاء",
    saveProduct: "حفظ المنتج",

    // Stock History Page
    searchAdjustmentHistory: "البحث بمعرف التعديل، المستخدم، الحالة، أو اسم المنتج...",
    stockId: "معرف المخزون",
    createdAt: "تاريخ الإنشاء",
    createdUser: "المستخدم المنشئ",
    updatedAt: "تاريخ التحديث",
    totalNumberOfProducts: "إجمالي عدد المنتجات",
    autoMigrated: "تم الترحيل تلقائياً",
    failedMigrated: "فشل الترحيل",
    viewEditDetails: "عرض وتعديل التفاصيل",
    exportReport: "تصدير التقرير",

    // Import Dialog
    updateStockTitle: "تحديث المخزون",
    uploadInventoryDescription: "رفع ملف المخزون الخاص بك مع الترحيل المدعوم بالذكاء الاصطناعي",
    uploadProductsFile: "رفع ملف المنتجات الخاص بك",
    excelCsvFormat: "صيغة Excel أو CSV • الحد الأقصى 25 ميجابايت",
    dropFileHere: "ضع ملفك هنا",
    orClickBrowse: "أو انقر أدناه للتصفح",
    chooseFileComputer: "اختر ملف من الكمبيوتر",
    fileReadyUpload: "الملف جاهز للرفع",
    chooseDifferentFile: "اختر ملف مختلف",
    whatInfoNeeded: "ما المعلومات التي تحتاجها؟",
    required: "مطلوب:",
    optional: "اختياري:",
    productNameField: "اسم المنتج",
    priceField: "السعر",
    expiryDateField: "تاريخ الانتهاء",
    quantityField: "الكمية",
    batchNumberField: "رقم الدفعة",
    uploadOptions: "خيارات الرفع",
    configureBeforeUpload: "تكوين قبل الرفع",
    matchAumetProducts: "مطابقة منتجات أوميت",
    autoFillProductDetails: "ملء تفاصيل المنتج تلقائياً من قاعدة بيانات أوميت",
    autoCreateBarcodes: "إنشاء باركود تلقائي",
    generateBarcodesForProducts: "توليد باركود للمنتجات التي لا تحتوي عليه",
    resetOldStock: "إعادة تعيين المخزون القديم",
    clearExistingStock: "مسح جميع المخزون الموجود للمنتجات في هذا الملف قبل إضافة مخزون جديد",
    setStockToZero: "تعيين المخزون الموجود إلى الصفر قبل الرفع",
    downloadSample: "تنزيل نموذج",
    getTemplate: "احصل على قالب للتعبئة",
    addManually: "إضافة يدوياً",
    enterOneByOne: "إدخال المنتجات واحداً تلو الآخر",
    viewTour: "عرض الجولة",
    uploadProcess: "رفع ومعالجة",
    generate: "توليد",

    // Filters
    categoryFilter: "الفئة",
    selectCategory: "اختر الفئة",
    stockRange: "نطاق المخزون",
    selectStockRange: "اختر نطاق المخزون",
    expiryStatus: "حالة الصلاحية",
    selectExpiryStatus: "اختر حالة الصلاحية",
    agingLastSale: "عمر آخر بيع",
    selectAgingLastSale: "اختر عمر آخر بيع",
    selectStatus: "اختر الحالة",
    reset: "إعادة تعيين",
    apply: "تطبيق",
    createdDateRange: "نطاق تاريخ الإنشاء",
    selectDateRange: "اختر نطاق التاريخ",
    createdUserFilter: "المستخدم المنشئ",
    allUsers: "جميع المستخدمين",
    allStatus: "جميع الحالات",
  },
};

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguage] = useState<Language>("ar");

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir =
      language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ar" : "en"));
  };

  const t = (key: string): string => {
    return (
      translations[language][
        key as keyof typeof translations.en
      ] || key
    );
  };

  return (
    <LanguageContext.Provider
      value={{ language, toggleLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error(
      "useLanguage must be used within a LanguageProvider",
    );
  }
  return context;
}