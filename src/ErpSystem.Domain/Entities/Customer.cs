namespace ErpSystem.Domain.Entities;
/// <summary>
/// Müşteri bilgilerini tutan entity
/// Bu tablo: Firmalar, kişiler, iletişim bilgileri
/// </summary>
public class Customer
{
    /// <summary>
    /// Birincil anahtar (Primary Key) - Her müşterinin benzersiz ID'si
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Müşteri adı (zorunlu)
    /// Örnek: "Renled Aydınlatma A.Ş."
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// E-posta adresi (opsiyonel)
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// Telefon numarası (opsiyonel)
    /// </summary>
    public string? Phone { get; set; }

    /// <summary>
    /// Adres bilgisi (opsiyonel)
    /// </summary>
    public string? Address { get; set; }

    /// <summary>
    /// Vergi numarası/TC kimlik (opsiyonel)
    /// </summary>
    public string? TaxNumber { get; set; }

    /// <summary>
    /// Kayıt oluşturulma tarihi - Otomatik set edilecek
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Son güncellenme tarihi (opsiyonel)
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    // ========== İLİŞKİLER (NAVIGATION PROPERTIES) ==========
    
    /// <summary>
    /// Bu müşterinin verdiği tüm siparişler
    /// 1 Müşteri -> Çok Sipariş (One-to-Many)
    /// </summary>
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}