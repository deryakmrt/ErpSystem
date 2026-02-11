using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ErpSystem.Domain.Entities;

namespace ErpSystem.Infrastructure.Data.Configurations;

/// <summary>
/// OrderItem entity'si için veritabanı yapılandırması
/// </summary>
public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        // Tablo adı
        builder.ToTable("order_items");

        // Primary Key
        builder.HasKey(oi => oi.Id);

        // Properties
        builder.Property(oi => oi.OrderId)
            .IsRequired();

        builder.Property(oi => oi.ProductId)
            .IsRequired();

        builder.Property(oi => oi.ProductName)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(oi => oi.Unit)
            .IsRequired()
            .HasMaxLength(20)
            .HasDefaultValue("Adet");

        builder.Property(oi => oi.Quantity)
            .HasColumnType("decimal(18,3)")
            .IsRequired();

        builder.Property(oi => oi.UnitPrice)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(oi => oi.LineTotal)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(oi => oi.DiscountPercent)
            .HasColumnType("decimal(5,2)") // Örn: 99.99%
            .IsRequired(false);

        builder.Property(oi => oi.ProductSummary)
            .HasMaxLength(1000);

        builder.Property(oi => oi.CreatedAt)
            .IsRequired();

        // Index'ler
        builder.HasIndex(oi => oi.OrderId);

        builder.HasIndex(oi => oi.ProductId);

        // İlişkiler
        builder.HasOne(oi => oi.Order)
            .WithMany(o => o.Items)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade); // Sipariş silinirse kalemleri de silinsin

        builder.HasOne(oi => oi.Product)
            .WithMany(p => p.OrderItems)
            .HasForeignKey(oi => oi.ProductId)
            .OnDelete(DeleteBehavior.Restrict); // Ürün silinirse sipariş kalemleri korunsun
    }
}
