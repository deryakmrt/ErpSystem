namespace ErpSystem.Domain.Entities;

public class ProductAttribute
{
    public int Id { get; set; }
    
    // Kriterin Adı (Örn: "Tüketim Gücü", "Gövde Rengi")
    public string Name { get; set; } = string.Empty;
    
    // Kriterin Değerleri (JSON veya virgülle ayrılmış string olarak tutacağız. Örn: "18W,30W,40W")
    public string Options { get; set; } = string.Empty;
    
    // Sistem anahtarı (Frontend tarafında custom_... veya global_... olarak eşlemek için)
    public string SystemKey { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
}