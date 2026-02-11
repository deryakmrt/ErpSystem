using ErpSystem.Application.DTOs;
using ErpSystem.Domain.Entities;

namespace ErpSystem.Application.Interfaces;

public interface IProductRepository
{
    // Tüm ürünleri getir
    Task<IEnumerable<ProductDto>> GetAllAsync();
    
    // ID'ye göre ürün getir
    Task<ProductDto?> GetByIdAsync(int id);
    
    // Yeni ürün ekle
    Task<ProductDto> CreateAsync(CreateProductDto dto);
    
    // Ürün güncelle
    Task<ProductDto?> UpdateAsync(int id, UpdateProductDto dto);
    
    // Ürün sil
    Task<bool> DeleteAsync(int id);
    
    // Ürünün varyasyonlarını getir
    Task<IEnumerable<ProductVariantDto>> GetVariantsAsync(int productId);
    
    // Kod ile ürün ara
    Task<ProductDto?> GetByCodeAsync(string code);
}