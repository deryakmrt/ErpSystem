import React, { useState, useEffect } from 'react';
import { getProductAttributes, createProductAttribute, updateProductAttributePut, deleteProductAttribute, restoreProductAttribute } from '../services/productService';
import './AttributeManagement.css'; // Birazdan oluşturacağız

const AttributeManagement = () => {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', options: '' });

  useEffect(() => { loadAttributes(); }, []);

  const loadAttributes = async () => {
    setLoading(true);
    try {
      const data = await getProductAttributes();
      setAttributes(data);
    } catch (err) { console.error("Yükleme hatası:", err); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const optionsArray = formData.options.split(',').map(s => s.trim()).filter(Boolean);
    
    try {
      if (editingId) {
        await updateProductAttributePut(editingId, { name: formData.name, options: optionsArray });
      } else {
        await createProductAttribute({ 
            name: formData.name, 
            options: optionsArray, 
            systemKey: `global_${Date.now()}` 
        });
      }
      setFormData({ name: '', options: '' });
      setEditingId(null);
      loadAttributes();
    } catch (err) { alert("Hata oluştu!"); }
  };

  const handleEdit = (attr) => {
    setEditingId(attr.id);
    setFormData({ name: attr.name, options: attr.options.join(', ') });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu kriteri silmek istediğinize emin misiniz?")) return;
    await deleteProductAttribute(id);
    loadAttributes();
  };

  const handleRestore = async (id) => {
    try {
      await restoreProductAttribute(id);
      loadAttributes();
    } catch (err) {
      alert("Geri yükleme sırasında bir hata oluştu.");
    }
  };

  return (
    <div className="attribute-mgmt-container">
      <h1>⚙️ Ürün Kriter Yönetimi (Ana Veri)</h1>
      
      <form onSubmit={handleSubmit} className="attr-form">
        <input 
          type="text" 
          placeholder="Kriter Adı (Örn: Işık Rengi)" 
          value={formData.name} 
          onChange={(e) => setFormData({...formData, name: e.target.value})} 
          required 
        />
        <input 
          type="text" 
          placeholder="Değerler (Virgülle ayırın: 3000K, 4000K)" 
          value={formData.options} 
          onChange={(e) => setFormData({...formData, options: e.target.value})} 
          required 
        />
        <button type="submit" className="btn-save">
          {editingId ? 'Güncelle' : 'Yeni Ekle'}
        </button>
        {editingId && <button onClick={() => {setEditingId(null); setFormData({name:'', options:''})}}>İptal</button>}
      </form>

      <table className="attr-table">
        <thead>
          <tr>
            <th>Kriter Adı</th>
            <th>Mevcut Değerler</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {attributes.map(attr => (
            <tr key={attr.id} className={!attr.isActive ? 'row-passive' : ''}>
              <td>
                <strong style={{ 
                  textDecoration: !attr.isActive ? 'line-through' : 'none', 
                  color: !attr.isActive ? '#94a3b8' : 'inherit' 
                }}>
                  {attr.name} {!attr.isActive && <span className="passive-badge">(Pasif)</span>}
                </strong>
              </td>
              <td>
                {attr.options.map(opt => (
                  <span key={opt} className={attr.isActive ? 'opt-tag' : 'opt-tag-passive'}>
                    {opt}
                  </span>
                ))}
              </td>
              <td>
                {attr.isActive ? (
                  <div className="action-buttons">
                    <button className="btn-icon" title="Düzenle" onClick={() => handleEdit(attr)}>🖊</button>
                    <button className="btn-icon btn-delete" title="Sil" onClick={() => handleDelete(attr.id)}>🗑</button>
                  </div>
                ) : (
                  <button className="btn-restore" onClick={() => handleRestore(attr.id)}>
                    🔄 Geri Yükle
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttributeManagement;