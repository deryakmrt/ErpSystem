using ErpSystem.Application.DTOs;
using ErpSystem.Application.Interfaces;
using ErpSystem.Domain.Entities;
using ErpSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Infrastructure.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly ErpDbContext _context;

    public ProductRepository(ErpDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ProductDto>> GetAllAsync()
    {
        return await _context.Products
            .Include(p => p.Variants)
            .Where(p => p.ParentId == null)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Code = p.Sku,
                Name = p.Name,
                Description = p.Description,
                BasePrice = p.Price,
                Unit = p.Unit,
                IsActive = p.IsActive,
                CreatedAt = p.CreatedAt,
                VariantCount = p.Variants.Count,
                SkuConfig = p.SkuConfig
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<ProductDto>> GetMasterProductsAsync()
    {
        // GetAllAsync zaten sadece ana ürünleri döndürüyor
        return await GetAllAsync();
    }

    public async Task<ProductDto?> GetByIdAsync(int id)
{
    return await _context.Products
        .Include(p => p.Variants)
        .Where(p => p.Id == id) // 🟢 DÜZELTME: && p.ParentId == null KALDIRILDI
        .Select(p => new ProductDto
        {
            Id = p.Id,
            Code = p.Sku,
            Name = p.Name,
            Description = p.Description,
            BasePrice = p.Price,
            Unit = p.Unit,
            IsActive = p.IsActive,
            CreatedAt = p.CreatedAt,
            VariantCount = p.Variants.Count,
            ParentId = p.ParentId, // 👈 Bunu ekledik
            SkuConfig = p.SkuConfig
        })
        .FirstOrDefaultAsync();
}

    public async Task<ProductDto?> GetByCodeAsync(string code)
{
    return await _context.Products
        .Include(p => p.Variants)
        .Where(p => p.Sku == code) // 🟢 DÜZELTME: && p.ParentId == null KALDIRILDI
        .Select(p => new ProductDto
        {
            // ... (içerik aynı)
            Id = p.Id,
            Code = p.Sku,
            Name = p.Name,
            Description = p.Description,
            BasePrice = p.Price,
            Unit = p.Unit,
            IsActive = p.IsActive,
            CreatedAt = p.CreatedAt,
            VariantCount = p.Variants.Count,
            ParentId = p.ParentId, // 👈 Bunu ekledik
            SkuConfig = p.SkuConfig
        })
        .FirstOrDefaultAsync();
}

    public async Task<ProductDto> CreateAsync(CreateProductDto dto)
{
    var product = new Product
    {
        Sku = dto.Code,
        Name = dto.Name,
        Description = dto.Description,
        Price = dto.BasePrice,
        Unit = dto.Unit,
        IsActive = dto.IsActive,
        
        // 🔴 ESKİSİ: ParentId = null
        // 🟢 YENİSİ: Gelen veriyi kullanıyoruz
        ParentId = dto.ParentId, 
        
        SkuConfig = dto.SkuConfig // Bunu da ekleyelim, React tarafında gönderiyorsun
    };

    _context.Products.Add(product);
    await _context.SaveChangesAsync();

    // Dönüş değerini hazırla
    return new ProductDto
    {
        Id = product.Id,
        Code = product.Sku,
        Name = product.Name,
        Description = product.Description,
        BasePrice = product.Price,
        Unit = product.Unit,
        IsActive = product.IsActive,
        CreatedAt = product.CreatedAt,
        VariantCount = 0,
        SkuConfig = product.SkuConfig
    };
}

    public async Task<ProductDto?> UpdateAsync(int id, UpdateProductDto dto)
    {
        var product = await _context.Products
        .Where(p => p.Id == id) // 🟢 DÜZELTME: && p.ParentId == null KALDIRILDI
        .FirstOrDefaultAsync();
        
    if (product == null)
        return null;

        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Price = dto.BasePrice;
        product.Unit = dto.Unit;
        product.IsActive = dto.IsActive;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new ProductDto
    {
        Id = product.Id,
        Code = product.Sku,
        Name = product.Name,
        Description = product.Description,
        BasePrice = product.Price,
        Unit = product.Unit,
        IsActive = product.IsActive,
        CreatedAt = product.CreatedAt,
        VariantCount = await _context.Products.CountAsync(v => v.ParentId == id),
        SkuConfig = product.SkuConfig
    };
    }

    public async Task<bool> DeleteAsync(int id)
{
    var product = await _context.Products
        .Where(p => p.Id == id) // 🟢 DÜZELTME: && p.ParentId == null KALDIRILDI
        .FirstOrDefaultAsync();
        
    if (product == null)
        return false;

    _context.Products.Remove(product);
    await _context.SaveChangesAsync();
    return true;
}

    public async Task<IEnumerable<ProductVariantDto>> GetVariantsAsync(int productId)
    {
        return await _context.Products
            .Include(v => v.ParentProduct)
            .Where(v => v.ParentId == productId)
            .Select(v => new ProductVariantDto
            {
                Id = v.Id,
                ProductId = v.ParentId ?? 0,
                VariantCode = v.Sku,
                VariantName = v.Name,
                Description = v.Description,
                Price = v.Price,
                SKU = v.Sku,
                Barcode = null,
                IsActive = v.IsActive,
                CreatedAt = v.CreatedAt,
                ProductName = v.ParentProduct != null ? v.ParentProduct.Name : null
            })
            .ToListAsync();
    }

    public async Task<ProductDto?> UpdateSkuConfigAsync(int id, string skuConfig)
    {
        var product = await _context.Products
            .Where(p => p.Id == id && p.ParentId == null)
            .FirstOrDefaultAsync();
            
        if (product == null)
            return null;

        product.SkuConfig = skuConfig;
        product.UpdatedAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }
}