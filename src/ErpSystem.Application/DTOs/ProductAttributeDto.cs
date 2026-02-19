namespace ErpSystem.Application.DTOs;

public class ProductAttributeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<string> Options { get; set; } = new();
    public string SystemKey { get; set; } = string.Empty;
    public bool IsActive { get; set; } // 🟢 YENİ: Aktiflik bilgisini taşıyacak
}