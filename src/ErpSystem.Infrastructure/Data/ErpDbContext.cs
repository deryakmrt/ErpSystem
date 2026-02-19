using Microsoft.EntityFrameworkCore;
using ErpSystem.Domain.Entities;

namespace ErpSystem.Infrastructure.Data;

/// <summary>
/// ERP Sistemi Ana Database Context
/// Tüm entity'leri ve ilişkileri yönetir
/// </summary>
public class ErpDbContext : DbContext
{
    public ErpDbContext(DbContextOptions<ErpDbContext> options) : base(options)
    {
    }

    // ========== TABLOLAR (DbSet'ler) ==========
    
    /// <summary>
    /// Müşteriler tablosu
    /// </summary>
    public DbSet<Customer> Customers { get; set; } = null!;

    /// <summary>
    /// Ürünler tablosu (Ana ürünler + Varyasyonlar)
    /// </summary>
    public DbSet<Product> Products { get; set; } = null!;

    /// <summary>
    /// Ürün Attribute tablosu (Kriterler)
    /// </summary>
    public DbSet<ProductAttribute> ProductAttributes { get; set; }

    /// <summary>
    /// Siparişler tablosu (Header/Master)
    /// </summary>
    public DbSet<Order> Orders { get; set; } = null!;

    /// <summary>
    /// Sipariş kalemleri tablosu (Detail/Lines)
    /// </summary>
    public DbSet<OrderItem> OrderItems { get; set; } = null!;

    // ========== MODEL YAPILANDIRMA (Fluent API) ==========
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Entity Configuration'ları uygula
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ErpDbContext).Assembly);

        // Tablo isimlerini küçük harfle ayarla (PostgreSQL convention)
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            entity.SetTableName(entity.GetTableName()?.ToLowerInvariant());
        }
    }
}