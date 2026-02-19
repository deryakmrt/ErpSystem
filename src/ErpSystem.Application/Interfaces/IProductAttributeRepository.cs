using ErpSystem.Application.DTOs;

namespace ErpSystem.Application.Interfaces;

public interface IProductAttributeRepository
{
    Task<IEnumerable<ProductAttributeDto>> GetAllAsync();
    Task<ProductAttributeDto> CreateAsync(ProductAttributeDto dto);
    
    // 👇 YENİ: Kriteri bulmak, güncellemek ve silmek (pasife çekmek) için gereken komutlar
    Task<ProductAttributeDto?> GetByIdAsync(int id);
    Task<ProductAttributeDto> UpdateAsync(int id, ProductAttributeDto dto);
    Task<bool> DeleteAsync(int id);
    // Mevcutların altına ekle
    Task<bool> RestoreAsync(int id);
}