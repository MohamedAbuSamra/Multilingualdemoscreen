/**
 * Localized seed rows for the “Your products” inventory table.
 * English names use Title Case; Arabic strings are pharmacy-appropriate.
 */

export type ProductStatusKey =
  | "productStatusExpiringSoon"
  | "productStatusExpired"
  | "productStatusLowStock"
  | "productStatusOutOfStock"
  | "";

export type ProductCategoryKey =
  | "categoryGastrointestinal"
  | "categoryAntibiotic"
  | "categoryCardiovascular"
  | "categoryVitamins"
  | "categoryOtc"
  | "categoryDiabetes"
  | "categoryDermatology"
  | "categoryAnalgesic";

export type StatusColor = "red" | "yellow" | "orange" | "";

export interface PharmacyInventoryRow {
  code: string;
  nameEn: string;
  nameAr: string;
  subtitleEn: string;
  subtitleAr: string;
  barcode: string;
  categoryKey: ProductCategoryKey;
  lotBatch: string;
  expiry: string;
  lastSaleAmount: string;
  stockQty: string;
  avgCost: string;
  sellPrice: string;
  tax: string;
  /** Shelf / zone (numbers stay the same; “Main” comes from t('main')) */
  warehouseZone: string;
  statusKey: ProductStatusKey;
  statusColor: StatusColor;
}

export const PHARMACY_INVENTORY_PRODUCTS: PharmacyInventoryRow[] = [
  {
    code: "PH-201",
    nameEn: "Pantoprazole Sodium 40 mg",
    nameAr: "بانتوبرازول صوديوم ٤٠ مجم",
    subtitleEn: "Gastro-Resistant Tablets, 30s, 20 Packs per Case",
    subtitleAr: "أقراص معوية ٣٠، ٢٠ عبوة في الكرتون",
    barcode: "6250123450123",
    categoryKey: "categoryGastrointestinal",
    lotBatch: "GRS-24A",
    expiry: "2026-11",
    lastSaleAmount: "18.50",
    stockQty: "42.0",
    avgCost: "11.20",
    sellPrice: "18.50",
    tax: "4.00",
    warehouseZone: "A-1",
    statusKey: "productStatusExpiringSoon",
    statusColor: "red",
  },
  {
    code: "PH-105",
    nameEn: "Amoxicillin 500 mg Capsules",
    nameAr: "أموكسيسيلين ٥٠٠ مجم كبسولات",
    subtitleEn: "21 Capsules, 48 Units per Case",
    subtitleAr: "٢١ كبسولة، ٤٨ وحدة في الكرتون",
    barcode: "6250123450234",
    categoryKey: "categoryAntibiotic",
    lotBatch: "AMX-09F",
    expiry: "2027-03",
    lastSaleAmount: "9.75",
    stockQty: "120.0",
    avgCost: "5.40",
    sellPrice: "9.75",
    tax: "4.00",
    warehouseZone: "B-2",
    statusKey: "",
    statusColor: "",
  },
  {
    code: "PH-330",
    nameEn: "Atorvastatin 20 mg Tablets",
    nameAr: "أتورفاستاتين ٢٠ مجم أقراص",
    subtitleEn: "30 Tablets, 36 Packs per Case",
    subtitleAr: "٣٠ قرصاً، ٣٦ عبوة في الكرتون",
    barcode: "6250123450345",
    categoryKey: "categoryCardiovascular",
    lotBatch: "ATV-17K",
    expiry: "2027-01",
    lastSaleAmount: "22.00",
    stockQty: "64.0",
    avgCost: "14.30",
    sellPrice: "22.00",
    tax: "4.00",
    warehouseZone: "A-3",
    statusKey: "",
    statusColor: "",
  },
  {
    code: "PH-410",
    nameEn: "Cholecalciferol (Vitamin D3) 1,000 IU",
    nameAr: "فيتامين د٣ ١٠٠٠ وحدة",
    subtitleEn: "Softgels, 60s, 12 Bottles per Case",
    subtitleAr: "سائل كبسولات ٦٠، ١٢ زجاجة في الكرتون",
    barcode: "6250123450456",
    categoryKey: "categoryVitamins",
    lotBatch: "VD3-32M",
    expiry: "2028-05",
    lastSaleAmount: "14.25",
    stockQty: "28.0",
    avgCost: "8.90",
    sellPrice: "14.25",
    tax: "0.00",
    warehouseZone: "C-1",
    statusKey: "productStatusLowStock",
    statusColor: "orange",
  },
  {
    code: "PH-512",
    nameEn: "Cetirizine 10 mg Tablets",
    nameAr: "سيتيريزين ١٠ مجم أقراص",
    subtitleEn: "30 Tablets, 24 Packs per Case (OTC)",
    subtitleAr: "٣٠ قرصاً، ٢٤ عبوة في الكرتون (بدون وصفة)",
    barcode: "6250123450567",
    categoryKey: "categoryOtc",
    lotBatch: "CTZ-11P",
    expiry: "2027-09",
    lastSaleAmount: "6.20",
    stockQty: "200.0",
    avgCost: "3.10",
    sellPrice: "6.20",
    tax: "4.00",
    warehouseZone: "A-1",
    statusKey: "",
    statusColor: "",
  },
  {
    code: "PH-220",
    nameEn: "Metformin 850 mg Tablets",
    nameAr: "ميتفورمين ٨٥٠ مجم أقراص",
    subtitleEn: "60 Tablets, 20 Packs per Case",
    subtitleAr: "٦٠ قرصاً، ٢٠ عبوة في الكرتون",
    barcode: "6250123450678",
    categoryKey: "categoryDiabetes",
    lotBatch: "MTF-44R",
    expiry: "2026-12",
    lastSaleAmount: "11.40",
    stockQty: "88.0",
    avgCost: "6.50",
    sellPrice: "11.40",
    tax: "4.00",
    warehouseZone: "A-2",
    statusKey: "productStatusExpiringSoon",
    statusColor: "red",
  },
  {
    code: "PH-600",
    nameEn: "Hydrocortisone 1% Cream",
    nameAr: "هيدروكورتيزون ١٪ كريم",
    subtitleEn: "30 g Tube, 24 Tubes per Case",
    subtitleAr: "أنبوب ٣٠ غ، ٢٤ أنبوباً في الكرتون",
    barcode: "6250123450789",
    categoryKey: "categoryDermatology",
    lotBatch: "HCT-02S",
    expiry: "2027-06",
    lastSaleAmount: "7.90",
    stockQty: "36.0",
    avgCost: "4.20",
    sellPrice: "7.90",
    tax: "4.00",
    warehouseZone: "B-1",
    statusKey: "",
    statusColor: "",
  },
  {
    code: "PH-100",
    nameEn: "Paracetamol 500 mg Tablets",
    nameAr: "باراسيتامول ٥٠٠ مجم أقراص",
    subtitleEn: "24 Tablets, 30 Packs per Case",
    subtitleAr: "٢٤ قرصاً، ٣٠ عبوة في الكرتون",
    barcode: "6250123450901",
    categoryKey: "categoryAnalgesic",
    lotBatch: "PCM-28T",
    expiry: "2028-02",
    lastSaleAmount: "3.50",
    stockQty: "0.0",
    avgCost: "1.80",
    sellPrice: "3.50",
    tax: "4.00",
    warehouseZone: "A-1",
    statusKey: "productStatusOutOfStock",
    statusColor: "red",
  },
];

export const INVENTORY_PRODUCT_COUNT = PHARMACY_INVENTORY_PRODUCTS.length;
