import type { ProductCategoryKey } from "./pharmacyInventorySample";

export interface AumetCoreProduct {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  subtitleEn: string;
  subtitleAr: string;
  barcode: string;
  categoryKey: ProductCategoryKey;
  currentStock: number;
  avgCost: string;
  sellPrice: string;
  tax: string;
  manufacturerEn: string;
  manufacturerAr: string;
  imageUrl: string;
}

export const AUMET_CORE_PRODUCTS: AumetCoreProduct[] = [
  {
    id: "core-1",
    code: "AC-201",
    nameEn: "Pantoprazole Sodium 40 mg",
    nameAr: "بانتوبرازول صوديوم ٤٠ مجم",
    subtitleEn: "Gastro-Resistant Tablets, 30s",
    subtitleAr: "أقراص معوية، ٣٠ قرصاً",
    barcode: "6250123451123",
    categoryKey: "categoryGastrointestinal",
    currentStock: 42,
    avgCost: "11.20",
    sellPrice: "18.50",
    tax: "4.00",
    manufacturerEn: "Aumet Pharma",
    manufacturerAr: "أوميت فارما",
    imageUrl:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "core-2",
    code: "AC-105",
    nameEn: "Amoxicillin 500 mg Capsules",
    nameAr: "أموكسيسيلين ٥٠٠ مجم كبسولات",
    subtitleEn: "21 Capsules",
    subtitleAr: "٢١ كبسولة",
    barcode: "6250123451234",
    categoryKey: "categoryAntibiotic",
    currentStock: 120,
    avgCost: "5.40",
    sellPrice: "9.75",
    tax: "4.00",
    manufacturerEn: "Hikma",
    manufacturerAr: "حكمة",
    imageUrl:
      "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "core-3",
    code: "AC-330",
    nameEn: "Atorvastatin 20 mg Tablets",
    nameAr: "أتورفاستاتين ٢٠ مجم أقراص",
    subtitleEn: "30 Tablets",
    subtitleAr: "٣٠ قرصاً",
    barcode: "6250123451345",
    categoryKey: "categoryCardiovascular",
    currentStock: 64,
    avgCost: "14.30",
    sellPrice: "22.00",
    tax: "4.00",
    manufacturerEn: "Pfizer",
    manufacturerAr: "فايزر",
    imageUrl:
      "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "core-4",
    code: "AC-410",
    nameEn: "Vitamin D3 1,000 IU Softgels",
    nameAr: "فيتامين د٣ ١٠٠٠ وحدة كبسولات",
    subtitleEn: "Softgels, 60s",
    subtitleAr: "كبسولات جيلاتينية، ٦٠ حبة",
    barcode: "6250123451456",
    categoryKey: "categoryVitamins",
    currentStock: 28,
    avgCost: "8.90",
    sellPrice: "14.25",
    tax: "0.00",
    manufacturerEn: "Jamjoom Pharma",
    manufacturerAr: "جمجوم فارما",
    imageUrl:
      "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "core-5",
    code: "AC-512",
    nameEn: "Cetirizine 10 mg Tablets",
    nameAr: "سيتيريزين ١٠ مجم أقراص",
    subtitleEn: "30 Tablets (OTC)",
    subtitleAr: "٣٠ قرصاً (بدون وصفة)",
    barcode: "6250123451567",
    categoryKey: "categoryOtc",
    currentStock: 200,
    avgCost: "3.10",
    sellPrice: "6.20",
    tax: "4.00",
    manufacturerEn: "Julphar",
    manufacturerAr: "جلفار",
    imageUrl:
      "https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "core-6",
    code: "AC-220",
    nameEn: "Metformin 850 mg Tablets",
    nameAr: "ميتفورمين ٨٥٠ مجم أقراص",
    subtitleEn: "60 Tablets",
    subtitleAr: "٦٠ قرصاً",
    barcode: "6250123451678",
    categoryKey: "categoryDiabetes",
    currentStock: 88,
    avgCost: "6.50",
    sellPrice: "11.40",
    tax: "4.00",
    manufacturerEn: "Merck",
    manufacturerAr: "ميرك",
    imageUrl:
      "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "core-7",
    code: "AC-600",
    nameEn: "Hydrocortisone 1% Cream",
    nameAr: "هيدروكورتيزون ١٪ كريم",
    subtitleEn: "30 g Tube",
    subtitleAr: "أنبوب ٣٠ غ",
    barcode: "6250123451789",
    categoryKey: "categoryDermatology",
    currentStock: 36,
    avgCost: "4.20",
    sellPrice: "7.90",
    tax: "4.00",
    manufacturerEn: "Bayer",
    manufacturerAr: "باير",
    imageUrl:
      "https://images.unsplash.com/photo-1580281657527-47baf0d8e66b?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "core-8",
    code: "AC-100",
    nameEn: "Paracetamol 500 mg Tablets",
    nameAr: "باراسيتامول ٥٠٠ مجم أقراص",
    subtitleEn: "24 Tablets",
    subtitleAr: "٢٤ قرصاً",
    barcode: "6250123451901",
    categoryKey: "categoryAnalgesic",
    currentStock: 0,
    avgCost: "1.80",
    sellPrice: "3.50",
    tax: "4.00",
    manufacturerEn: "Acino",
    manufacturerAr: "أكينو",
    imageUrl:
      "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=300&q=80",
  },
];
