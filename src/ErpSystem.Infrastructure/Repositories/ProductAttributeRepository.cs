using ErpSystem.Application.DTOs;
using ErpSystem.Application.Interfaces;
using ErpSystem.Domain.Entities;
using ErpSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Infrastructure.Repositories;

public class ProductAttributeRepository : IProductAttributeRepository
{
    private readonly ErpDbContext _context;

    public ProductAttributeRepository(ErpDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ProductAttributeDto>> GetAllAsync()
    {
        // 🟢 .Where(pa => pa.IsActive) satırını kaldırdık! 
        // Yönetim sayfasında her şeyi görmek istiyoruz.
        var attributes = await _context.ProductAttributes
            .OrderByDescending(pa => pa.Id)
            .ToListAsync();

        return attributes.Select(pa => new ProductAttributeDto
        {
            Id = pa.Id,
            Name = pa.Name,
            Options = string.IsNullOrWhiteSpace(pa.Options) 
                ? new List<string>() 
                : pa.Options.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(o => o.Trim()).ToList(),
            SystemKey = pa.SystemKey,
            IsActive = pa.IsActive // 🟢 DTO'ya aktarıyoruz
        });
    }

    public async Task<ProductAttributeDto?> GetByIdAsync(int id)
    {
        var pa = await _context.ProductAttributes.FindAsync(id);
        if (pa == null) return null; // Silinmiş olsa bile (IsActive=false) düzenlemek için getirsin

        return new ProductAttributeDto
        {
            Id = pa.Id,
            Name = pa.Name,
            Options = string.IsNullOrWhiteSpace(pa.Options) 
                ? new List<string>() 
                : pa.Options.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(o => o.Trim()).ToList(),
            SystemKey = pa.SystemKey,
            IsActive = pa.IsActive
        };
    }

    public async Task<ProductAttributeDto> CreateAsync(ProductAttributeDto dto)
    {
        var attribute = new ProductAttribute
        {
            Name = dto.Name,
            Options = string.Join(",", dto.Options),
            SystemKey = dto.SystemKey,
            IsActive = true
        };

        _context.ProductAttributes.Add(attribute);
        await _context.SaveChangesAsync();

        dto.Id = attribute.Id;
        dto.IsActive = true;
        return dto;
    }

    public async Task<ProductAttributeDto> UpdateAsync(int id, ProductAttributeDto dto)
    {
        var attribute = await _context.ProductAttributes.FindAsync(id);
        if (attribute == null) throw new Exception("Kriter bulunamadı.");

        attribute.Name = dto.Name;
        attribute.Options = string.Join(",", dto.Options);
        
        await _context.SaveChangesAsync();
        return dto;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var attribute = await _context.ProductAttributes.FindAsync(id);
        if (attribute == null) return false;

        attribute.IsActive = false; // 🔴 Soft Delete
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RestoreAsync(int id)
    {
        var attribute = await _context.ProductAttributes.FindAsync(id);
        if (attribute == null) return false;

        attribute.IsActive = true; // 🔵 Restore (Geri Yükle)
        await _context.SaveChangesAsync();
        return true;
    }
}