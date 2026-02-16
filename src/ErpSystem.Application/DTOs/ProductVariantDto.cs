namespace ErpSystem.Application.DTOs;

public class ProductVariantDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string VariantCode { get; set; } = string.Empty;
    public string VariantName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string? SKU { get; set; }
    public string? Barcode { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Ana ürün bilgisi (isteğe bağlı)
    public string? ProductName { get; set; }
    public string Currency { get; set; } = "TL";
}