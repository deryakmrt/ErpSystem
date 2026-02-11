using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ErpSystem.Domain.Entities;

namespace ErpSystem.Infrastructure.Data.Configurations;

/// <summary>
/// Product entity'si için veritabanı yapılandırması
/// Varyasyon sistemi Self-Referencing ilişki içerir
/// </summary>
public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        // Tablo adı
        builder.ToTable("products");

        // Primary Key
        builder.HasKey(p => p.Id);

        // Properties
        builder.Property(p => p.Sku)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(p => p.Description)
            .HasMaxLength(2000);

        builder.Property(p => p.Unit)
            .IsRequired()
            .HasMaxLength(20)
            .HasDefaultValue("Adet");

        builder.Property(p => p.Price)
            .HasColumnType("decimal(18,2)") // 18 basamak, 2 ondalık
            .IsRequired();

        builder.Property(p => p.Category)
            .HasMaxLength(100);

        builder.Property(p => p.ImageUrl)
            .HasMaxLength(500);

        builder.Property(p => p.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        // Varyasyon alanları
        builder.Property(p => p.ParentId)
            .IsRequired(false); // NULL olabilir

        builder.Property(p => p.SkuConfig)
            .HasColumnType("jsonb"); // PostgreSQL JSON binary

        builder.Property(p => p.Summary)
            .HasMaxLength(1000);

        builder.Property(p => p.UsageArea)
            .HasMaxLength(500);

        builder.Property(p => p.StockQuantity)
            .HasColumnType("decimal(18,3)") // Ondalıklı stok için (örn: 10.5 metre)
            .HasDefaultValue(0);

        builder.Property(p => p.MinStockLevel)
            .HasColumnType("decimal(18,3)");

        builder.Property(p => p.CreatedAt)
            .IsRequired();

        // Index'ler
        builder.HasIndex(p => p.Sku)
            .IsUnique(); // SKU benzersiz olmalı

        builder.HasIndex(p => p.ParentId)
            .HasFilter("\"ParentId\" IS NOT NULL"); // Sadece varyasyonlar için

        builder.HasIndex(p => p.Category);

        builder.HasIndex(p => p.IsActive);

        // ========== VARYASYON SİSTEMİ: Self-Referencing İlişki ==========
        
        // Ana Ürün -> Varyasyonlar (One-to-Many)
        builder.HasMany(p => p.Variants)
            .WithOne(p => p.ParentProduct)
            .HasForeignKey(p => p.ParentId)
            .OnDelete(DeleteBehavior.Restrict); // Ana ürün silinirse varyasyonlar silinmesin

        // İlişkiler: Order Items
        builder.HasMany(p => p.OrderItems)
            .WithOne(oi => oi.Product)
            .HasForeignKey(oi => oi.ProductId)
            .OnDelete(DeleteBehavior.Restrict); // Ürün silinirse sipariş kalemleri korunsun
    }
}