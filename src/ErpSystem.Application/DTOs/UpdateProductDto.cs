namespace ErpSystem.Application.DTOs
{
    public class UpdateProductDto
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public string Unit { get; set; } = "Adet";
        public string Currency { get; set; } = "TL";
        
        // 🟢 Soru işareti (?) önemli: Kategori boş olabilir demek
        public string? Category { get; set; } 
        
        public bool IsActive { get; set; }

        // 🟢 YENİ: Tarif bilgisini de güncellemek istiyoruz!
        public string? SkuConfig { get; set; }

        // 🟢 YENİ ALANLAR
        public string? UsageArea { get; set; }
        public decimal? StockQuantity { get; set; } // 🟢 Soru işareti eklendi
        public decimal? MinStockLevel { get; set; } // 🟢 Soru işareti eklendi
    }
}