namespace ErpSystem.Application.DTOs;

public class ProductDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal BasePrice { get; set; }
    public string Unit { get; set; } = string.Empty;
    public string Currency { get; set; } = "TL";
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Category { get; set; } 
    
    // Varyasyon sayısı (ilişkili varyasyon varsa)
    public int VariantCount { get; set; }
    public int? ParentId { get; set; }
    
    // SKU Configuration (JSON string)
    public string? SkuConfig { get; set; }
}