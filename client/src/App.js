import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductList from './pages/ProductList';
import ProductFormAdvanced from './pages/ProductFormAdvanced';
import ProductDetail from './pages/ProductDetail';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <div className="container">
            <h1>🏢 ERP Sistemi</h1>
            <p>Ürün Yönetimi</p>
          </div>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/products/new" element={<ProductFormAdvanced />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/products/:id/edit" element={<ProductFormAdvanced />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <div className="container">
            <p>&copy; 2026 ERP Sistemi - Tüm hakları saklıdır.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;