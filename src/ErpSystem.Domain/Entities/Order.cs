namespace ErpSystem.Domain.Entities;

/// <summary>
/// Sipariş ana bilgilerini tutan entity (Header/Master)
/// Bu tablo: Sipariş numarası, müşteri, tarih, durum
/// </summary>
public class Order
{
    /// <summary>
    /// Birincil anahtar - Sipariş ID
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Sipariş kodu/numarası (benzersiz)
    /// Örnek: "SIP-2025-0001"
    /// </summary>
    public string OrderCode { get; set; } = string.Empty;

    /// <summary>
    /// Müşteri ID (Foreign Key - Yabancı Anahtar)
    /// Hangi müşteriye ait?
    /// </summary>
    public int CustomerId { get; set; }

    /// <summary>
    /// Sipariş tarihi
    /// </summary>
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Sipariş durumu
    /// Örnek: "Tedarik", "Üretim", "Sevkiyat", "Teslim Edildi"
    /// </summary>
    public string Status { get; set; } = "Tedarik";

    /// <summary>
    /// Para birimi
    /// Örnek: "TRY", "USD", "EUR"
    /// </summary>
    public string Currency { get; set; } = "TRY";

    /// <summary>
    /// Toplam tutar (hesaplanacak)
    /// Tüm kalemlerin (qty * price) toplamı
    /// </summary>
    public decimal TotalAmount { get; set; }

    /// <summary>
    /// Termin tarihi (teslim edilmesi gereken tarih)
    /// </summary>
    public DateTime? DueDate { get; set; }

    /// <summary>
    /// Not/Açıklama (opsiyonel)
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>
    /// Sipariş veren kişi (opsiyonel)
    /// </summary>
    public string? OrderedBy { get; set; }

    /// <summary>
    /// Kayıt oluşturulma tarihi
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Son güncellenme tarihi
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    // ========== İLİŞKİLER ==========
    
    /// <summary>
    /// Navigation Property: Bu siparişin sahibi müşteri
    /// Order -> Customer (Many-to-One)
    /// </summary>
    public Customer Customer { get; set; } = null!;

    /// <summary>
    /// Navigation Property: Bu siparişin içindeki tüm kalemler
    /// 1 Sipariş -> Çok Kalem (One-to-Many)
    /// </summary>
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}