using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ErpSystem.Domain.Entities;

namespace ErpSystem.Infrastructure.Data.Configurations;

/// <summary>
/// Order entity'si için veritabanı yapılandırması
/// </summary>
public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        // Tablo adı
        builder.ToTable("orders");

        // Primary Key
        builder.HasKey(o => o.Id);

        // Properties
        builder.Property(o => o.OrderCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(o => o.CustomerId)
            .IsRequired();

        builder.Property(o => o.OrderDate)
            .IsRequired();

        builder.Property(o => o.Status)
            .IsRequired()
            .HasMaxLength(50)
            .HasDefaultValue("Tedarik");

        builder.Property(o => o.Currency)
            .IsRequired()
            .HasMaxLength(10)
            .HasDefaultValue("TRY");

        builder.Property(o => o.TotalAmount)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(o => o.DueDate)
            .IsRequired(false);

        builder.Property(o => o.Notes)
            .HasMaxLength(2000);

        builder.Property(o => o.OrderedBy)
            .HasMaxLength(100);

        builder.Property(o => o.CreatedAt)
            .IsRequired();

        // Index'ler
        builder.HasIndex(o => o.OrderCode)
            .IsUnique(); // Sipariş kodu benzersiz

        builder.HasIndex(o => o.CustomerId);

        builder.HasIndex(o => o.Status);

        builder.HasIndex(o => o.OrderDate);

        builder.HasIndex(o => o.DueDate);

        // İlişkiler
        builder.HasOne(o => o.Customer)
            .WithMany(c => c.Orders)
            .HasForeignKey(o => o.CustomerId)
            .OnDelete(DeleteBehavior.Restrict); // Müşteri silinirse siparişler korunsun

        builder.HasMany(o => o.Items)
            .WithOne(oi => oi.Order)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade); // Sipariş silinirse kalemleri de silinsin
    }
}
