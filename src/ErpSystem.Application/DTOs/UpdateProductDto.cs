namespace ErpSystem.Application.DTOs;

public class UpdateProductDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal BasePrice { get; set; }
    public string Unit { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}