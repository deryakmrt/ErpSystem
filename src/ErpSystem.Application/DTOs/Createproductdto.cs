namespace ErpSystem.Application.DTOs;

public class CreateProductDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal BasePrice { get; set; }
    public string Unit { get; set; } = string.Empty;
    public string Currency { get; set; } = "TL";
    public bool IsActive { get; set; } = true;
    public int? ParentId { get; set; }
    public string? SkuConfig { get; set; }
    public string? Category { get; set; }
    
    // 🟢 YENİ ALANLAR
    public string? UsageArea { get; set; }
    public decimal? StockQuantity { get; set; } // 🟢 Soru işareti eklendi
    public decimal? MinStockLevel { get; set; } // 🟢 Soru işareti eklendi
}