namespace ErpSystem.Domain.Entities;

/// <summary>
/// Sipariş detay kalemlerini tutan entity (Detail/Lines)
/// Bu tablo: Siparişteki her bir ürün satırı
/// Örnek: "10 Adet LED Panel @ 1250 TL = 12500 TL"
/// </summary>
public class OrderItem
{
    /// <summary>
    /// Birincil anahtar - Kalem ID
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Sipariş ID (Foreign Key)
    /// Hangi siparişe ait?
    /// </summary>
    public int OrderId { get; set; }

    /// <summary>
    /// Ürün ID (Foreign Key)
    /// Hangi ürün?
    /// </summary>
    public int ProductId { get; set; }

    /// <summary>
    /// Ürün adı (snapshot - o anki ürün adı)
    /// Neden ayrı tutuyoruz? 
    /// Çünkü ürün adı sonradan değişebilir ama siparişteki ad aynı kalmalı
    /// </summary>
    public string ProductName { get; set; } = string.Empty;

    /// <summary>
    /// Birim (Adet, Kg, vb.)
    /// </summary>
    public string Unit { get; set; } = "Adet";

    /// <summary>
    /// Miktar
    /// Örnek: 10.5 (ondalıklı olabilir: 10.5 metre kablo)
    /// </summary>
    public decimal Quantity { get; set; }

    /// <summary>
    /// Birim fiyat (o anki fiyat - snapshot)
    /// Neden snapshot? Ürün fiyatı değişse de siparişteki fiyat aynı kalmalı
    /// </summary>
    public decimal UnitPrice { get; set; }

    /// <summary>
    /// Satır toplamı (hesaplanacak)
    /// LineTotal = Quantity * UnitPrice
    /// Örnek: 10 * 1250 = 12500
    /// </summary>
    public decimal LineTotal { get; set; }

    /// <summary>
    /// İndirim oranı (%) - opsiyonel
    /// Örnek: 10 (= %10 indirim)
    /// </summary>
    public decimal? DiscountPercent { get; set; }

    /// <summary>
    /// Ürün özeti/açıklaması (opsiyonel)
    /// Örnek: "Beyaz kasa, soğuk ışık"
    /// </summary>
    public string? ProductSummary { get; set; }

    /// <summary>
    /// Kayıt oluşturulma tarihi
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ========== İLİŞKİLER ==========
    
    /// <summary>
    /// Navigation Property: Bu kalemin ait olduğu sipariş
    /// OrderItem -> Order (Many-to-One)
    /// </summary>
    public Order Order { get; set; } = null!;

    /// <summary>
    /// Navigation Property: Bu kalemdeki ürün
    /// OrderItem -> Product (Many-to-One)
    /// </summary>
    public Product Product { get; set; } = null!;
}