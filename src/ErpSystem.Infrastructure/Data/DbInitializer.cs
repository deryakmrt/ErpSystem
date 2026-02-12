using ErpSystem.Domain.Entities;

namespace ErpSystem.Infrastructure.Data;

public static class DbInitializer
{
    public static void Initialize(ErpDbContext context)
    {
        // Veritabanını oluştur (yoksa)
        context.Database.EnsureCreated();

        // Zaten veri varsa çık
        if (context.Products.Any())
        {
            return; // DB zaten dolu
        }

        // Ana Ürünler
        var products = new[]
        {
            new Product
            {
                Sku = "LED-A-001",
                Name = "LED Armatür A Serisi",
                Description = "Yüksek verimli LED armatür",
                Price = 250.00m,
                Unit = "Adet",
                Category = "Aydınlatma",
                IsActive = true,
                StockQuantity = 50,
                MinStockLevel = 10,
                ParentId = null,
                SkuConfig = "[{\"type\":\"length\",\"label\":\"Uzunluk\"},{\"type\":\"kelvin\",\"label\":\"Işık Rengi\"}]"
            },
            new Product
            {
                Sku = "LED-B-001",
                Name = "LED Panel B Serisi",
                Description = "Slim tasarım LED panel",
                Price = 180.00m,
                Unit = "Adet",
                Category = "Aydınlatma",
                IsActive = true,
                StockQuantity = 30,
                MinStockLevel = 5,
                ParentId = null
            },
            new Product
            {
                Sku = "SPOT-001",
                Name = "Spot Armatür",
                Description = "Ayarlanabilir spot armatür",
                Price = 85.00m,
                Unit = "Adet",
                Category = "Aydınlatma",
                IsActive = true,
                StockQuantity = 100,
                MinStockLevel = 20,
                ParentId = null
            }
        };

        context.Products.AddRange(products);
        context.SaveChanges();

        // İlk ürünün ID'sini al (varyasyonlar için)
        var ledAProduct = context.Products.First(p => p.Sku == "LED-A-001");

        // Varyasyonlar (LED-A ürünü için)
        var variants = new[]
        {
            new Product
            {
                Sku = "LED-A-030-56",
                Name = "LED Armatür A Serisi 30cm 5600K",
                Description = "30cm uzunluk, 5600K soğuk beyaz",
                Price = 250.00m,
                Unit = "Adet",
                Category = "Aydınlatma",
                IsActive = true,
                StockQuantity = 25,
                ParentId = ledAProduct.Id,
                Summary = "30cm, 5600K"
            },
            new Product
            {
                Sku = "LED-A-030-40",
                Name = "LED Armatür A Serisi 30cm 4000K",
                Description = "30cm uzunluk, 4000K doğal beyaz",
                Price = 250.00m,
                Unit = "Adet",
                Category = "Aydınlatma",
                IsActive = true,
                StockQuantity = 15,
                ParentId = ledAProduct.Id,
                Summary = "30cm, 4000K"
            },
            new Product
            {
                Sku = "LED-A-060-56",
                Name = "LED Armatür A Serisi 60cm 5600K",
                Description = "60cm uzunluk, 5600K soğuk beyaz",
                Price = 320.00m,
                Unit = "Adet",
                Category = "Aydınlatma",
                IsActive = true,
                StockQuantity = 18,
                ParentId = ledAProduct.Id,
                Summary = "60cm, 5600K"
            },
            new Product
            {
                Sku = "LED-A-060-40",
                Name = "LED Armatür A Serisi 60cm 4000K",
                Description = "60cm uzunluk, 4000K doğal beyaz",
                Price = 320.00m,
                Unit = "Adet",
                Category = "Aydınlatma",
                IsActive = true,
                StockQuantity = 12,
                ParentId = ledAProduct.Id,
                Summary = "60cm, 4000K"
            }
        };

        context.Products.AddRange(variants);
        context.SaveChanges();
    }
}