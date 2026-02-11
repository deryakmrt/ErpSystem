using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ErpSystem.Domain.Entities;

namespace ErpSystem.Infrastructure.Data.Configurations;

/// <summary>
/// Customer entity'si için veritabanı yapılandırması
/// </summary>
public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        // Tablo adı
        builder.ToTable("customers");

        // Primary Key
        builder.HasKey(c => c.Id);

        // Properties
        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.Email)
            .HasMaxLength(100);

        builder.Property(c => c.Phone)
            .HasMaxLength(20);

        builder.Property(c => c.Address)
            .HasMaxLength(500);

        builder.Property(c => c.TaxNumber)
            .HasMaxLength(50);

        builder.Property(c => c.CreatedAt)
            .IsRequired();

        // Index'ler (Performans için)
        builder.HasIndex(c => c.Email)
            .IsUnique()
            .HasFilter("\"Email\" IS NOT NULL"); // NULL değerlere izin ver ama unique olsun

        builder.HasIndex(c => c.TaxNumber)
            .HasFilter("\"TaxNumber\" IS NOT NULL");

        // İlişkiler
        builder.HasMany(c => c.Orders)
            .WithOne(o => o.Customer)
            .HasForeignKey(o => o.CustomerId)
            .OnDelete(DeleteBehavior.Restrict); // Müşteri silinirse siparişler silinmesin (koruma)
    }
}