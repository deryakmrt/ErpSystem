import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { createProduct, updateProduct, getProductById, getProductVariants, deleteProduct } from '../services/productService';
import './ProductFormAdvanced.css';

// 👇 Helper: Seçenekten Kısaltma Kodu Üretme (SkuBuilder ile aynı mantık olmalı)
const generateCode = (type, value) => {
  if (!value) return '';
  // Örn: "3000K" -> "30", "4000K" -> "40"
  // Eğer özel bir mantığın varsa buraya ekle, yoksa basitçe:
  return value.replace(/[^0-9a-zA-Z]/g, '').substring(0, 3).toUpperCase();
};
const getSymbol = (curr) => curr === 'USD' ? '$' : curr === 'EUR' ? '€' : '₺';

const ProductFormAdvanced = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = Boolean(id);

  // Active Tab
  // 🟢 YENİ: Eğer URL /variants/new ile bitiyorsa direkt Varyasyon Sihirbazı sekmesini aç
  const [activeTab, setActiveTab] = useState(
    location.pathname.endsWith('/variants/new') ? 'variants' : 'general'
  );
  // 👇 YENİ: Bu ürün bir varyasyon mu?
  const [isVariant, setIsVariant] = useState(false);
  
  // 👇 YENİ: Hafıza ve Fiyat State'leri
  const [lastWizardState, setLastWizardState] = useState({});
  const [priceWhole, setPriceWhole] = useState('');
  const [priceDecimal, setPriceDecimal] = useState('');
  const [rootSkuBase, setRootSkuBase] = useState('');
  const [rootNameBase, setRootNameBase] = useState(''); // 👇 YENİ: Varyasyon ismi üretmek için baba adı

  // Form Data
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    price: '',
    unit: 'Adet',
    currency: 'TL',
    category: '',
    image: null,
    imagePreview: null,
    isActive: true
  });

  // SKU Recipe (Kriter Elde)
  const [attributePool] = useState({
    light_color: {
      label: 'Işık Rengi',
      options: ['3000K (Günışığı)', '4000K (Doğal Beyaz)', '6500K (Soğuk Beyaz)']
    },
    ip_class: {
      label: 'IP Sınıfı',
      options: ['IP20', 'IP40', 'IP54', 'IP65']
    },
    power: {
      label: 'Tüketim Gücü',
      options: ['18W', '30W', '40W', '60W']
    },
    length: {
      label: 'Uzunluk',
      options: ['60cm', '90cm', '120cm', '150cm', '200cm']
    },
    diffuser: {
      label: 'Difüzör Tipi',
      options: ['Opak', 'Şeffaf', 'Buzlu']
    }
  });

  const [skuRecipe, setSkuRecipe] = useState([]);
  const [recipeOptions, setRecipeOptions] = useState({});

  // Variants
  const [variants, setVariants] = useState([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardData, setWizardData] = useState({});
  const [wizardPreview, setWizardPreview] = useState({ sku: '', name: '' });
  const [manualCode, setManualCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load product in edit mode
  useEffect(() => {
    if (isEditMode) {
      // 🛑 1. HER ŞEYİ SIFIRLA (HARD RESET)
      // Sayfayı yenilemiş gibi tüm hafızayı temizliyoruz
      setLoading(true); 
      setIsVariant(false);       // Varsayılan: Ana ürün
      setVariants([]);           // Eski listeyi uçur
      setWizardData({});         // Dropdownları boşalt
      setSkuRecipe([]);          // Tarifi temizle
      setRecipeOptions({});      // Seçenekleri temizle
      setPriceWhole('');         // Fiyatları temizle
      setPriceDecimal('');
      setRootNameBase('');       // İsim hafızasını sil
      setRootSkuBase('');
      // 🟢 DÜZELTİLDİ: variants/new'den gelince Varyasyon sekmesi açık kalsın
      setActiveTab(location.pathname.endsWith('/variants/new') ? 'variants' : 'general');
      
      // Formun içini de boşalt ki eski yazılar (örn: Ana Ürün İsmi) kalmasın
      setFormData({
        sku: '',
        name: '', // Yüklenene kadar boş kalsın
        description: '',
        price: '',
        unit: 'Adet',
        currency: 'TL',
        category: '',
        image: null,
        imagePreview: null,
        isActive: true
      });

      // 🚀 2. ŞİMDİ TAZE VERİYİ ÇEK
      loadProduct();
      loadExistingVariants();
    }
  }, [id]);

const loadProduct = async () => {
  // 🟢 Koruma: id yoksa veya undefined ise API çağrısı yapma
  if (!id || id === 'undefined') return;
  
  // 👇 YENİ: Yüklemeye başlarken varyasyon listesini ve state'i temizle
    setVariants([]); 
    setIsVariant(false);
    try {
      setLoading(true);
      const product = await getProductById(id);
      
      // Fiyat Ayrıştırma
      const priceStr = (product.basePrice || 0).toFixed(2);
      const [whole, decimal] = priceStr.split('.');
      setPriceWhole(whole);
      setPriceDecimal(decimal);

      let currentConfig = null;
      let fetchedParentName = '';
      // 🟢 DÜZELTİLDİ: Başlangıç değerleri ürünün kendi değerinden geliyor
      // Baba yoksa kendi değeri geçerli olacak
      let inheritedCurrency = product.currency || 'TL'; 
      let inheritedUnit = product.unit || 'Adet';

      // 🟢 ADIM 1: BABA ÜRÜN KONTROLÜ (İsim, Config ve Para Birimi için)
      if (product.parentId) {
        // Bu bir VARYASYON. Mutlaka babasını çağırıp ismini ve para birimini almalıyız.
        try {
          const parentProduct = await getProductById(product.parentId);
          fetchedParentName = parentProduct.name; // ✅ Doğru Kök İsim (Örn: Canna Açelya)
          
          // 🟢 YENİ: Babadan para birimini ve birimi miras al
          // Varyasyonun kendi değeri yoksa veya boşsa babadan al
          if (!product.currency || product.currency === 'TL') {
            inheritedCurrency = parentProduct.currency || 'TL';
          }
          if (!product.unit || product.unit === 'Adet') {
            inheritedUnit = parentProduct.unit || 'Adet';
          }
          
          // Eğer varyasyonun kendi configi yoksa babadan al (Fallback)
          if (!product.skuConfig && parentProduct.skuConfig) {
             currentConfig = JSON.parse(parentProduct.skuConfig);
          }
        } catch (err) {
          console.error("Baba ürün bulunamadı:", err);
          fetchedParentName = product.name; // Hata olursa mecburen kendi ismini kullan
        }
      } else {
        // Bu bir ANA ÜRÜN
        fetchedParentName = product.name;
      }

      // 🟢 ADIM 2: CONFIG YÜKLEME
      if (product.skuConfig) {
        currentConfig = JSON.parse(product.skuConfig);
      }

      // 🟢 ADIM 3: STATE GÜNCELLEME
      if (currentConfig) {
        setSkuRecipe(currentConfig);
        
        // Dropdown seçeneklerini yükle
        const newOptions = {};
        currentConfig.forEach(item => {
          if (attributePool[item.type]) {
            newOptions[item.type] = attributePool[item.type].options;
          }
        });
        setRecipeOptions(newOptions);

        // VARYASYON İSE: Dropdownları Doldur
        if (product.parentId) {
          const fullSku = product.code || '';
          const parts = fullSku.split('-'); 
          
          // Tarif listesi (Örn: Işık Rengi, IP Sınıfı...)
          const configItems = [...currentConfig]; 
          const parsedData = {};

          // SKU'nun sonundan başlayarak, tarifteki özellik sayısı kadar geriye git
          // Örn: SKU = RN-CNN-SR-30-IP65 ve Tarif = [Renk, IP] ise
          // Son parça (IP65) -> IP Sınıfı
          // Ondan önceki (30) -> Işık Rengi
          
          const suffixCount = configItems.length;
          // Eğer SKU parçaları tariften kısaysa işlem yapma (Hata önleyici)
          if (parts.length > suffixCount) {
             const suffixParts = parts.slice(-suffixCount); // Son N parçayı al

             configItems.forEach((item, index) => {
                const partCode = suffixParts[index]; // Sırayla eşleşir (Çünkü config ve suffix aynı sırada)
                const attr = attributePool[item.type];
                
                if (attr && partCode) {
                   // Dropdown seçenekleri içinde bu kodu üreten var mı diye bak
                   const matchingOption = attr.options.find(opt => generateCode(item.type, opt) === partCode);
                   if (matchingOption) {
                      parsedData[item.type] = matchingOption;
                   }
                }
             });
          }
          
          setWizardData(parsedData);

          // Kök SKU ve Kök İsim Ayarı
          // Varyasyon parçalarını at, geriye kalanı Kök SKU yap
          const rootParts = parts.slice(0, parts.length - suffixCount);
          setRootSkuBase(rootParts.join('-'));
          
          // 🟢 Kök İsim Hafızası (Artık temiz parent ismi var)
          setRootNameBase(fetchedParentName); 
        }
      }

      setFormData({
        sku: product.code || '',
        name: product.name || '',
        description: product.description || '',
        price: (product.basePrice || 0).toString(),
        
        // 🟢 MANTIK: Ürünün kendi birimi varsa (veya doluysa) onu kullan.
        // Boşsa veya null ise, babadan geleni (mirası) kullan.
        unit: product.unit || inheritedUnit, 
        
        // 🟢 MANTIK: Ürünün kendi parası varsa onu kullan. Yoksa babadan geleni.
        currency: product.currency || inheritedCurrency,
        
        category: product.category || '',
        image: null,
        imagePreview: product.imageUrl || null,
        isActive: product.isActive,
        parentId: product.parentId
      });

      if (product.parentId) setIsVariant(true);

    } catch (err) {
      console.error('Ürün yükleme hatası:', err);
      setError('Ürün yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
const loadExistingVariants = async () => {
    // Eğer bu bir varyasyon ise, kendi kardeşlerini değil, babasının çocuklarını getirmeli (isteğe bağlı)
    // Ama şimdilik sadece "Ana Ürün"de çalışsın istiyoruz.
    if (!id || isVariant) return; 

    try {
      const data = await getProductVariants(id);
      const rawList = Array.isArray(data) ? data : (data.data || []);
      
      // 🟢 ÖNEMLİ: Gelenlerin veritabanında var olduğunu işaretle (isExisting: true)
      // Böylece kaydederken tekrar oluşturmaya çalışmayız.
      const markedList = rawList.map(v => ({
        ...v,
        isExisting: true, // Bu bayrak hayat kurtarır
        // Eğer backend 'code' gönderiyorsa onu 'sku' olarak eşle
        sku: v.code || v.sku, 
        price: v.basePrice || v.price
      }));
      
      setVariants(markedList);
      
      // 🟢 DÜZELTİLDİ: markedList kullanıyoruz
      if (markedList.length > 0) {
        // Eğer varyasyon varsa, sonuncusunun özelliklerini hafızaya atma mantığı (varsa) buradadır
      }
    } catch (error) {
       console.error("Varyasyonlar yüklenemedi:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // 🟢 YENİ: Yeni ürün modunda SKU veya isim değişince kök değerleri de güncelle
    // Böylece wizard preview doğru kökten üretilir
    if (!isEditMode) {
      if (name === 'sku') setRootSkuBase(value);
      if (name === 'name') setRootNameBase(value);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  // ========== SKU RECIPE MANAGEMENT ==========

  const addToRecipe = (attrType) => {
    if (skuRecipe.find(r => r.type === attrType)) {
      alert('Bu özellik zaten eklenmiş!');
      return;
    }

    const attr = attributePool[attrType];
    setSkuRecipe([...skuRecipe, { 
      type: attrType, 
      label: attr.label 
    }]);

    // Initialize options for this attribute
    setRecipeOptions(prev => ({
      ...prev,
      [attrType]: attr.options
    }));
  };

  const removeFromRecipe = (attrType) => {
    setSkuRecipe(skuRecipe.filter(r => r.type !== attrType));
    
    // Remove options
    const newOptions = { ...recipeOptions };
    delete newOptions[attrType];
    setRecipeOptions(newOptions);
  };

  const moveRecipeItem = (index, direction) => {
    const newRecipe = [...skuRecipe];
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= newRecipe.length) return;

    [newRecipe[index], newRecipe[targetIndex]] = [newRecipe[targetIndex], newRecipe[index]];
    setSkuRecipe(newRecipe);
  };

  // Add option to attribute
  const addOptionToAttribute = (attrType, newOption) => {
    if (!newOption.trim()) return;

    setRecipeOptions(prev => ({
      ...prev,
      [attrType]: [...(prev[attrType] || []), newOption]
    }));
  };

  // ========== WIZARD ==========

  const openWizard = () => {
    setWizardData(lastWizardState || {}); // Hafızadaki son seçimi getir
    setManualCode('');
    setWizardPreview({ 
      sku: formData.sku, 
      name: formData.name 
    });
    setWizardOpen(true);
  };

  const handleWizardChange = (type, value) => {
    const newData = { ...wizardData, [type]: value };
    setWizardData(newData);
    updateWizardPreview(newData);
  };

  const updateWizardPreview = (data) => {
    // 🟢 DÜZELTİLDİ: formData.sku/name yerine kök değerleri kullan
    // rootSkuBase: Ana ürünün kök SKU'su (Örn: "RN-BMB R")
    // rootNameBase: Ana ürünün adı (Örn: "Bambu R Aydınlatma Direği")
    // Eğer kök değerler boşsa (yeni ürün oluşturulurken) formData'ya düş
    let sku = rootSkuBase || formData.sku;
    let name = rootNameBase || formData.name;

    skuRecipe.forEach(item => {
      const value = data[item.type];
      if (value) {
        const code = generateCode(item.type, value);
        sku += `-${code}`;
        name += ` ${value}`;
      }
    });

    if (manualCode) {
      sku += `-${manualCode}`;
    }

    setWizardPreview({ sku, name });
  };

  const generateCode = (type, value) => {
    // Extract numbers
    const match = value.match(/\d+/);
    if (match) {
      const num = match[0];
      if (type === 'power') return num.padStart(2, '0'); // 18W → 18
      if (type === 'light_color') return num.substring(0, 2); // 3000K → 30
      if (type === 'length') return num.padStart(3, '0'); // 60cm → 060
      return num;
    }

    // Extract parentheses code
    const parenMatch = value.match(/\((.*?)\)/);
    if (parenMatch) return parenMatch[1];

    // First 2-3 chars uppercase
    return value.replace(/[^a-zA-Z0-9]/g, '').substring(0, 2).toUpperCase();
  };

  const addVariantFromWizard = () => {
    // Hafızaya Al
    setLastWizardState(wizardData);

    // Validation
    for (const item of skuRecipe) {
      if (!wizardData[item.type]) {
        alert(`Lütfen ${item.label} seçin!`);
        return;
      }
    }

    // Duplicate check
    const isDuplicate = variants.some(v => v.sku === wizardPreview.sku);
    if (isDuplicate) {
      alert(`⚠️ SKU "${wizardPreview.sku}" zaten mevcut!`);
      return;
    }

    const newVariant = {
      id: `temp-${Date.now()}`,
      sku: wizardPreview.sku,
      name: wizardPreview.name,
      price: parseFloat(formData.price) || 0,
      // 🟢 DÜZELTİLDİ: Ana ürünün para birimini varyasyona aktar
      // Böylece listede € veya $ doğru gösterilir
      currency: formData.currency,
      summary: Object.entries(wizardData).map(([k, v]) => v).join(', '),
      isActive: true,
      isExisting: false // New variant
    };

    setVariants([...variants, newVariant]);
    setWizardOpen(false);
  };

  const removeVariant = async (variantId) => {
    if (!window.confirm('Bu varyasyonu silmek istediğinize emin misiniz?')) return;

    const variantToDelete = variants.find(v => v.id === variantId);

    // Eğer bu varyasyon daha önceden veritabanına kaydedilmişse (isExisting), önce API'den sil!
    if (variantToDelete && variantToDelete.isExisting) {
      try {
        setLoading(true);
        await deleteProduct(variantId);
        // Silme başarılı olursa bilgi verebiliriz (istersen alert'i kaldırabilirsin)
        console.log('Varyasyon veritabanından başarıyla silindi.');
      } catch (err) {
        console.error("Varyasyon silinirken hata oluştu:", err);
        alert('Hata: Varyasyon silinemedi! ' + (err.response?.data?.message || err.message));
        setLoading(false);
        return; // İşlem başarısız olursa state'i güncelleme (ekrandan kaybolmasın)
      } finally {
        setLoading(false);
      }
    }

    // İşlem başarılıysa veya zaten sadece eklenen geçici (temp) bir varyasyonsa ekrandan kaldır:
    setVariants(variants.filter(v => v.id !== variantId));
  };

  // ========== SUBMIT ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Fiyatı Hesapla
    const finalPrice = parseFloat(`${priceWhole || '0'}.${priceDecimal || '00'}`);
    
    // 🟢 YENİ: Fiyat 0'dan küçük olamaz
    if (isNaN(finalPrice) || finalPrice < 0) {
      setError('Birim fiyat 0 veya daha büyük bir değer olmalıdır!');
      return;
    }
    
    if (!formData.sku || !formData.name) {
      setError('Lütfen zorunlu alanları doldurun!');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 2. Ana Ürün Verisi Paketi
      const productData = {
        id: isEditMode ? parseInt(id) : 0,
        code: formData.sku,
        name: formData.name,
        description: formData.description || '',
        basePrice: finalPrice, 
        unit: formData.unit,
        currency: formData.currency,
        category: formData.category || '',
        isActive: formData.isActive,
        skuConfig: JSON.stringify(skuRecipe),
        parentId: isVariant ? formData.parentId : null
      };

      let createdProduct; // Değişken tanımlandı

      // --- GÜNCELLEME MODU ---
      if (isEditMode) {
        // A) Ana Ürünü Güncelle
        await updateProduct(id, productData);
        
        // 🟢 KRİTİK DÜZELTME BURADA: 
        // Edit modunda 'createdProduct' boş kaldığı için hata alıyordun.
        // Güncellediğimiz ürünün ID'sini değişkene atıyoruz ki aşağıda kullanabilelim.
        createdProduct = { ...productData, id: parseInt(id) };

        // B) Eğer bu bir Ana Ürünse (Varyasyon değilse), altındaki varyasyonları da güncelle/ekle
        if (variants.length > 0) {
          for (const variant of variants) {
            const variantData = {
              code: variant.sku,
              name: variant.name,
              basePrice: variant.price,
              unit: formData.unit,
              currency: formData.currency,
              category: formData.category,
              isActive: variant.isActive,
              parentId: createdProduct.id, 
              skuConfig: variant.skuConfig || null
            };
            
            // 🟢 DÜZELTME BURADA: "temp-" kontrolünü ekledik!
            // ID string ise (temp-...) VEYA sayı ise ve 1'den küçükse bu YENİ bir kayıttır.
            const isNewVariant = 
                (typeof variant.id === 'string' && variant.id.startsWith('temp')) || 
                (typeof variant.id === 'number' && variant.id < 1);

            if (isNewVariant) { 
                // Yeni Kayıt: ID gönderme, Backend yeni ID verecek
                await createProduct(variantData);
            } else {
                // Eski Kayıt: ID ile güncelle
                await updateProduct(variant.id, { ...variantData, id: variant.id });
            }
          }
        } else {
            alert('✅ Varyasyon başarıyla güncellendi!');
        }
        
        navigate('/'); 

      } else {
        // --- YENİ KAYIT MODU ---
        createdProduct = await createProduct(productData); // Burada zaten API'den dönen cevabı alıyorduk, sorun yoktu.
        
        if (variants.length > 0) {
          for (const variant of variants) {
            const variantData = {
              code: variant.sku,
              name: variant.name,
              basePrice: variant.price,
              
              unit: formData.unit,
              currency: formData.currency,
              
              category: formData.category,
              isActive: variant.isActive,
              parentId: createdProduct.id, 
              skuConfig: variant.skuConfig || null
            };
            
            if (typeof variant.id === 'number' && variant.id < 1) { 
                await createProduct(variantData);
            } else {
                await updateProduct(variant.id, { ...variantData, id: variant.id });
            }
          }
        }
        
        alert('✅ Ürün başarıyla eklendi!');
        navigate('/');
      }

    } catch (err) {
      console.error("Submit Hatası:", err);
      setError('İşlem sırasında hata oluştu: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode && !formData.sku) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="product-form-advanced">
      {/* Header */}
      <div className="form-header">
        <div>
          <h1>
            {/* 👇 YENİ: Başlığın yanına etiket */}
            {isVariant ? <span style={{color:'orange', fontSize:'0.6em', border:'1px solid orange', padding:'2px 5px', borderRadius:'4px', marginRight:'10px', verticalAlign:'middle'}}>VARYASYON</span> : null}
            Ürün Düzenle: {formData.name || 'Yeni Ürün'}
          </h1>
          <p className="subtitle">Gelişmiş ürün yapılandırıcı</p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate('/')}>
            ✕ VAZGEÇ
          </button>
          <button type="button" className="btn-save" onClick={handleSubmit} disabled={loading}>
            💾 KAYDET
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Tabs */}
      <div className="tabs">
        <button
          type="button"
          className={`tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          🎨 Genel Bilgiler
        </button>
        
        {/* 👇 YENİ: Sadece varyasyon DEĞİLSE bu sekmeyi göster */}
        {/* 👇 Varyasyon ise bu butonu gizle */}
        {!isVariant && (
          <button
            type="button"
            className={`tab ${activeTab === 'variants' ? 'active' : ''}`}
            onClick={() => setActiveTab('variants')}
          >
            🧙 Varyasyon Sihirbazı ({variants.length})
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* TAB 1: GENEL BİLGİLER */}
        {activeTab === 'general' && (
          <div className="tab-content">
            {/* Rest of the form continues... */}
            <div className="form-grid">
              {/* Left Column */}
              <div className="form-column">
                <div className="form-section">
                  <h3>Ürün Adı (Ana Model)</h3>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Canna Sarkit Lineer Armatür"
                    required
                  />
                </div>

                {isVariant ? (
                  /* VARYASYON DÜZENLEME MODU (Dropdownlar) */
                  <div className="form-section sku-edit-section">
                    <h3 style={{color:'#d97706'}}>
                      {isVariant ? '🔧 Seçili Özellikler (Tarif)' : '🔧 Varyasyon Yapılandırma'}
                    </h3>
                    {/* Varyasyon ise, hangi özelliklerin seçildiğini gösteren dinamik form */}
                    <div className="wizard-form" style={{gridTemplateColumns: '1fr', gap:'10px', marginTop:'10px'}}>
                      {skuRecipe.map(item => (
                        <div key={item.type} className="wizard-field">
                          <label>{item.label}</label>
                          <select
                            value={wizardData[item.type] || ''}
                            onChange={(e) => {
                              const newData = { ...wizardData, [item.type]: e.target.value };
                              setWizardData(newData);
                              
                              // Anlık SKU ve İsim Güncelleme
                              let newSku = rootSkuBase;
                              let newNameSuffix = ''; // 🟢 İsim ekleri
                              
                              skuRecipe.forEach(r => {
                                const val = (r.type === item.type) ? e.target.value : newData[r.type];
                                if (val) {
                                  newSku += `-${generateCode(r.type, val)}`;
                                  newNameSuffix += ` ${val}`; // 🟢 İsim parçası ekle (Örn: " 60cm")
                                }
                              });
                              
                              setFormData(prev => ({
                                ...prev,
                                sku: newSku,
                                // 🟢 İSMİ DE GÜNCELLE: Baba Adı + Özellikler
                                name: rootNameBase ? `${rootNameBase} ${newNameSuffix.trim()}` : prev.name
                              }));
                            }}
                          >
                            <option value="">Seçiniz...</option>
                            {(recipeOptions[item.type] || []).map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                    <div className="sku-preview-box" style={{marginTop:'10px', padding:'10px', background:'#fffbeb', border:'1px solid #fcd34d', borderRadius:'6px'}}>
                      <small style={{display:'block', color:'#92400e', fontWeight:'bold'}}>GÜNCEL SKU:</small>
                      <code style={{fontSize:'14px', color:'#b45309'}}>{formData.sku}</code>
                    </div>
                  </div>
                ) : (
                  /* ANA ÜRÜN MODU (Normal Input) */
                  <div className="form-section">
                    <h3>Kök SKU (Model Kodu)</h3>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      placeholder="RN-CNN SR"
                      disabled={isEditMode}
                      required
                    />
                  </div>
                )}

                {/* Kategori */}
                <div className="form-section">
                  <label>Kategori</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="form-control"
                    // 🟢 PROFESYONEL DOKUNUŞ: Eğer varyasyonsa, kullanıcı değiştiremesin (disabled)
                    disabled={isVariant} 
                  >
                    <option value="">Seçiniz</option>
                    <option value="Armatür">Armatür</option>
                    <option value="Aydınlatma">Aydınlatma</option>
                    <option value="Panel">Panel</option>
                    <option value="Ampul">Ampul</option>
                    <option value="Şerit LED">Şerit LED</option>
                    <option value="Driver">Driver (Sürücü)</option>
                  </select>
                  {/* Kullanıcı bilgilendirme notu */}
                  {isVariant && <small className="text-muted">Varyasyon kategorisi ana ürüne bağlıdır.</small>}
                </div>
                {/* 🟢 YENİ: Durum (Aktif/Pasif) Kutusu */}
                <div className="form-section">
                  <label>Durum</label>
                  <select
                    name="isActive"
                    value={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    className="form-control"
                    style={{ backgroundColor: formData.isActive ? '#e6fffa' : '#fff5f5' }} // Görsel güzellik: Aktifse yeşilimsi, Pasifse kırmızımsı
                  >
                    <option value="true">Aktif (Satışta)</option>
                    <option value="false">Pasif (Satış Dışı)</option>
                  </select>
                </div>

                {/* SKU Recipe */}
                <div className="form-section sku-recipe-section">
                  <h3>⭐ Ana SKU Tarifi (Sabit)</h3>
                  <p className="help-text">Bu ürün için bir kez ayarlanır, otomatik kaydedilir.</p>

                  <div className="recipe-builder">
                    <div className="recipe-pool">
                      <h4>➕ Kriter Ekle</h4>
                      <select 
                        onChange={(e) => {
                          if (e.target.value) {
                            addToRecipe(e.target.value);
                            e.target.value = '';
                          }
                        }}
                      >
                        <option value="">Tüketim Gücü</option>
                        {Object.entries(attributePool).map(([key, attr]) => (
                          <option key={key} value={key}>{attr.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="recipe-list">
                      <h4>📋 Aktif Kodlama Sırası</h4>
                      {skuRecipe.length === 0 ? (
                        <p className="empty-state">Henüz kriter eklenmedi</p>
                      ) : (
                        <ul>
                          {skuRecipe.map((item, index) => (
                            <li key={item.type}>
                              <span className="recipe-num">{index + 1}</span>
                              <span className="recipe-label">{item.label}</span>
                              <div className="recipe-actions">
                                <button type="button" onClick={() => moveRecipeItem(index, -1)} disabled={index === 0}>↑</button>
                                <button type="button" onClick={() => moveRecipeItem(index, 1)} disabled={index === skuRecipe.length - 1}>↓</button>
                                <button type="button" onClick={() => removeFromRecipe(item.type)} className="btn-remove">×</button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Ürün Özet Şablonu</h3>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Ürün açıklaması..."
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="form-column">
                <div className="form-section image-section">
                  <h3>Ürün Görseli</h3>
                  <div className="image-upload">
                    {formData.imagePreview ? (
                      <div className="image-preview">
                        <img src={formData.imagePreview} alt="Preview" />
                        <button type="button" className="btn-remove-image" onClick={() => setFormData(prev => ({...prev, image: null, imagePreview: null}))}>
                          🗑️
                        </button>
                      </div>
                    ) : (
                      <div className="image-placeholder">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          id="imageInput"
                          style={{display: 'none'}}
                        />
                        <label htmlFor="imageInput" className="upload-label">
                          <span>📁 Dosya Seç</span>
                          <small>veya sürükle/bırak</small>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* ✅ Fiyat Alanı (Tam + Ondalık Ayrılmış) */}
                {/* Fiyat ve Para Birimi */}
                <div className="form-section">
                  <label>Birim Fiyat</label>
                  <div className="price-input-group" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input
                      type="text"
                      placeholder="0"
                      className="form-control price-whole"
                      value={priceWhole}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Sadece rakam kabul et (nokta, virgül, eksi işareti YOK)
                        if (/^\d*$/.test(val)) {
                          setPriceWhole(val);
                        }
                      }}
                      onBlur={(e) => {
                        // Alan boş bırakılırsa 0 yaz
                        if (e.target.value === '') setPriceWhole('0');
                      }}
                      style={{ width: '80px', textAlign: 'right' }}
                    />
                    <span className="currency-sep">,</span>
                    <input
                      type="text"
                      placeholder="00"
                      className="form-control price-decimal"
                      value={priceDecimal}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Sadece rakam, max 2 karakter, nokta/virgül YOK
                        if (/^\d{0,2}$/.test(val)) {
                          setPriceDecimal(val);
                        }
                      }}
                      onBlur={(e) => {
                        // Alan boş bırakılırsa 00 yaz
                        if (e.target.value === '') setPriceDecimal('00');
                        // 1 rakam girilirse başına 0 ekle: "5" → "05"
                        if (e.target.value.length === 1) setPriceDecimal('0' + e.target.value);
                      }}
                      style={{ width: '50px' }}
                    />
                    
                    {/* 🟢 YENİ: Para Birimi Seçimi */}
                    <select
                      className="form-control"
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      style={{ width: '80px', marginLeft: '5px', fontWeight: 'bold' }}
                    >
                      <option value="TL">₺ (TL)</option>
                      <option value="USD">$ (USD)</option>
                      <option value="EUR">€ (EUR)</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-section">
                    <h3>Birim</h3>
                    <select name="unit" value={formData.unit} onChange={handleChange}>
                      <option value="Adet">Adet</option>
                      <option value="Kutu">Kutu</option>
                      <option value="Metre">Metre</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VARYASYON SİHİRBAZI */}
        {activeTab === 'variants' && (
          <div className="tab-content">
            <div className="variants-wizard">
              <div className="wizard-help">
                <h3>🧙 Varyasyon Sihirbazı</h3>
                <p>Genel Bilgiler sekmesinde oluşturduğunuz tarife göre alanlar aşağıda listelenir.</p>
              </div>

              {skuRecipe.length === 0 ? (
                <div className="empty-wizard">
                  <p>⚠️ Önce "Genel Bilgiler" sekmesinden SKU tarifi oluşturun!</p>
                </div>
              ) : (
                <>
                  {/* Wizard Form */}
                  <div className="wizard-form">
                    {skuRecipe.map(item => (
                      <div key={item.type} className="wizard-field">
                        <label>{item.label}</label>
                        <select
                          value={wizardData[item.type] || ''}
                          onChange={(e) => handleWizardChange(item.type, e.target.value)}
                        >
                          <option value="">Seçiniz...</option>
                          {(recipeOptions[item.type] || []).map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    ))}

                    <div className="wizard-field">
                      <label>Ek Kod</label>
                      <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => {
                          setManualCode(e.target.value);
                          updateWizardPreview(wizardData);
                        }}
                        placeholder="-EK"
                      />
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="wizard-preview">
                    <h4>OLUŞACAK KOD VE İSİM:</h4>
                    <div className="preview-sku">
                      <strong>SKU:</strong> <code>{wizardPreview.sku}</code>
                    </div>
                    <div className="preview-name">
                      <strong>İsim:</strong> {wizardPreview.name}
                    </div>
                  </div>

                  <button type="button" className="btn-add-variant" onClick={addVariantFromWizard}>
                    📦 EKLE
                  </button>

                  {/* Variants Table */}
                  {variants.length > 0 && (
                    <div className="variants-table">
                      <h4># Varyasyon Adı SKU Fiyat İşlemler</h4>
                      <table>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Varyasyon Adı</th>
                            <th>Varyasyon SKU</th>
                            <th>Fiyat</th>
                            <th>İşlemler</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variants.map((variant, index) => (
                            <tr key={variant.id}>
                              <td>
                                {variant.isExisting ? (
                                  <span className="badge-existing">📦 {variant.id}</span>
                                ) : (
                                  <span className="badge-new">🆕 {index + 1}</span>
                                )}
                              </td>
                              <td>{variant.name}</td>
                              <td><code>{variant.sku}</code></td>
                              <td>{variant.price.toFixed(2)} {getSymbol(variant.currency || 'TL')}</td>
                              <td>
                                <div className="action-btns">
                                  <button 
                                    type="button" 
                                    className="btn-edit" 
                                    // 🟢 DÜZELTME: '/products/ID/edit' formatına çevirdik
                                    onClick={() => navigate(`/products/${variant.id}/edit`)}
                                  >
                                    🖊 Düzenle
                                  </button>
                                  <button 
                                    type="button" 
                                    className="btn-delete" 
                                    onClick={() => removeVariant(variant.id)}
                                  >
                                    🗑 Sil
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProductFormAdvanced;