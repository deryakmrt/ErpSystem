namespace ErpSystem.Domain.Entities;

/// <summary>
/// Ürün bilgilerini tutan entity
/// Bu tablo: Katalogdaki ürünler, stok kodları, fiyatlar
/// VARYASYON SİSTEMİ:
/// - parent_id NULL ise = Ana Ürün (Master)
/// - parent_id dolu ise = Varyasyon (Variant)
/// </summary>
public class Product
{
    /// <summary>
    /// Birincil anahtar - Ürünün benzersiz ID'si
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Stok kodu/SKU (Stock Keeping Unit)
    /// Ana Ürün: "AR-A"
    /// Varyasyon: "AR-A-030-56", "AR-A-060-65"
    /// </summary>
    public string Sku { get; set; } = string.Empty;

    /// <summary>
    /// Ürün adı
    /// Ana Ürün: "LED Armatür A Serisi"
    /// Varyasyon: "LED Armatür A Serisi 30cm 5600K"
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Ürün açıklaması (opsiyonel)
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Birim (Adet, Kg, Metre, vb.)
    /// </summary>
    public string Unit { get; set; } = "Adet";
        public string Currency { get; set; } = "TL";// 🟢 YENİ: Para Birimi (Varsayılan TL)

    /// <summary>
    /// Birim fiyat (Decimal = ondalıklı sayı, para için ideal)
    /// Ana üründe genelde varsayılan fiyat
    /// Varyasyonlarda özel fiyat olabilir
    /// </summary>
    public decimal Price { get; set; }

    /// <summary>
    /// Kategori (opsiyonel)
    /// Örnek: "Aydınlatma", "Armatür", "LED Panel"
    /// </summary>
    public string? Category { get; set; }

    /// <summary>
    /// Ürün görseli yolu (opsiyonel)
    /// Ana ürün: Genel görsel
    /// Varyasyon: Özel görsel olabilir (yoksa ana ürün görseli)
    /// </summary>
    public string? ImageUrl { get; set; }

    /// <summary>
    /// Aktif/Pasif durumu
    /// false = Ürün silinmiş veya devre dışı
    /// </summary>
    public bool IsActive { get; set; } = true;

    // ========== VARYASYON SİSTEMİ ==========
    
    /// <summary>
    /// Ana ürün ID'si (Foreign Key - NULL olabilir)
    /// NULL = Bu bir ana ürün (Master Product)
    /// Dolu = Bu bir varyasyon (Variant)
    /// </summary>
    public int? ParentId { get; set; }

    /// <summary>
    /// SKU yapılandırması (JSON formatında)
    /// Ana üründe: Varyasyonları nasıl oluşturacağımızın tarifi
    /// Örnek: [{"type":"length","label":"Uzunluk"},{"type":"kelvin","label":"Işık Rengi"}]
    /// Varyasyonda: NULL (boş)
    /// </summary>
    public string? SkuConfig { get; set; }

    /// <summary>
    /// Ürün özeti/kısa açıklama
    /// Varyasyonlarda özellikler için kullanılır
    /// Örnek: "30cm uzunluk, 5600K soğuk beyaz"
    /// </summary>
    public string? Summary { get; set; }

    /// <summary>
    /// Kullanım alanı bilgisi
    /// Örnek: "Ofis, mağaza, hastane"
    /// </summary>
    public string? UsageArea { get; set; }

    /// <summary>
    /// Mevcut stok miktarı
    /// Gerçek zamanlı stok takibi için
    /// </summary>
    public decimal StockQuantity { get; set; } = 0;

    /// <summary>
    /// Minimum stok seviyesi (uyarı için)
    /// </summary>
    public decimal? MinStockLevel { get; set; }

    /// <summary>
    /// Kayıt oluşturulma tarihi
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Son güncellenme tarihi (opsiyonel)
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    // ========== İLİŞKİLER (NAVIGATION PROPERTIES) ==========
    
    /// <summary>
    /// Ana ürün (Parent Product)
    /// Eğer bu bir varyasyonsa, ana ürüne referans
    /// NULL = Bu bir ana ürün
    /// </summary>
    public Product? ParentProduct { get; set; }

    /// <summary>
    /// Alt varyasyonlar (Child Variants)
    /// Eğer bu ana ürünse, tüm varyasyonları
    /// Boş = Bu bir varyasyon veya varyasyonu yok
    /// </summary>
    public ICollection<Product> Variants { get; set; } = new List<Product>();

    /// <summary>
    /// Bu ürünün bulunduğu sipariş kalemleri
    /// 1 Ürün -> Çok Sipariş Kalemi (One-to-Many)
    /// </summary>
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    // ========== HELPER METHODS ==========
    
    /// <summary>
    /// Bu ürün bir ana ürün mü?
    /// </summary>
    public bool IsMasterProduct => ParentId == null;

    /// <summary>
    /// Bu ürün bir varyasyon mu?
    /// </summary>
    public bool IsVariant => ParentId != null;

    /// <summary>
    /// Bu ana ürünün varyasyonları var mı?
    /// </summary>
    public bool HasVariants => Variants.Any();
}