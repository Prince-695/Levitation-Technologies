import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { invoiceAPI } from '../services/api';
import type { SimpleProduct } from '../types';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState<SimpleProduct[]>([]);
  const [newProduct, setNewProduct] = useState<SimpleProduct>({
    name: '',
    qty: 1,
    rate: 0,
  });
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Initialize with empty products array for MVP
    setProducts([]);
  }, []);

  const handleAddProduct = () => {
    if (newProduct.name.trim() && newProduct.rate > 0) {
      setProducts([...products, { ...newProduct, id: Date.now() }]);
      setNewProduct({ name: '', qty: 1, rate: 0 });
      setShowAddProduct(false);
    }
  };

  const handleEditProduct = (index: number) => {
    setEditingProduct(index);
    setNewProduct(products[index]);
  };

  const handleUpdateProduct = () => {
    if (editingProduct !== null && newProduct.name.trim() && newProduct.rate > 0) {
      const updatedProducts = [...products];
      updatedProducts[editingProduct] = newProduct;
      setProducts(updatedProducts);
      setEditingProduct(null);
      setNewProduct({ name: '', qty: 1, rate: 0 });
    }
  };

  const handleDeleteProduct = (index: number) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
  };

  const calculateTotal = () => {
    const subtotal = products.reduce((total, product) => total + (product.qty * product.rate), 0);
    const gstAmount = subtotal * 0.18;
    return {
      subtotal,
      gstAmount,
      total: subtotal + gstAmount,
    };
  };

  const handleGenerateInvoice = async () => {
    if (products.length === 0) {
      setError('Please add at least one product');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const convertedProducts = products.map(product => ({
        name: product.name,
        quantity: product.qty,
        rate: product.rate,
        totalAmount: product.qty * product.rate,
      }));

      const invoiceData = {
        products: convertedProducts,
      };

      const response = await invoiceAPI.generatePDF(invoiceData);
      
      if (response.data) {
        // Create blob and download
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        setError('Failed to generate invoice');
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to generate invoice';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotal();

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Invoice Generator Dashboard</h1>
        <div>
          <span style={{ marginRight: '15px' }}>Welcome, {user?.fullName}</span>
          <button onClick={logout} style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', marginBottom: '20px', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {/* Add Product Section */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2>Products</h2>
          <button
            onClick={() => setShowAddProduct(!showAddProduct)}
            style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            {showAddProduct ? 'Cancel' : 'Add Product'}
          </button>
        </div>

        {(showAddProduct || editingProduct !== null) && (
          <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '4px', marginBottom: '15px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '10px', alignItems: 'end' }}>
              <div>
                <label>Product Name:</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>
              <div>
                <label>Quantity:</label>
                <input
                  type="number"
                  min="1"
                  value={newProduct.qty}
                  onChange={(e) => setNewProduct({ ...newProduct, qty: parseInt(e.target.value) || 1 })}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>
              <div>
                <label>Rate (₹):</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProduct.rate}
                  onChange={(e) => setNewProduct({ ...newProduct, rate: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>
              <div>
                <button
                  onClick={editingProduct !== null ? handleUpdateProduct : handleAddProduct}
                  style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                  {editingProduct !== null ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products List */}
        {products.length === 0 ? (
          <p>No products added yet. Add your first product to generate an invoice.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Product Name</th>
                <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>Qty</th>
                <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>Rate (₹)</th>
                <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>Amount (₹)</th>
                <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id || index}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{product.name}</td>
                  <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>{product.qty}</td>
                  <td style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>₹{product.rate.toFixed(2)}</td>
                  <td style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>₹{(product.qty * product.rate).toFixed(2)}</td>
                  <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>
                    <button
                      onClick={() => handleEditProduct(index)}
                      style={{ padding: '4px 8px', marginRight: '5px', background: '#ffc107', color: 'black', border: 'none', cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(index)}
                      style={{ padding: '4px 8px', background: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Invoice Summary */}
        {products.length > 0 && (
          <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '4px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ marginBottom: '5px' }}>Subtotal: ₹{totals.subtotal.toFixed(2)}</div>
              <div style={{ marginBottom: '5px' }}>GST (18%): ₹{totals.gstAmount.toFixed(2)}</div>
              <div style={{ fontWeight: 'bold', fontSize: '18px', borderTop: '1px solid #ddd', paddingTop: '5px' }}>
                Total: ₹{totals.total.toFixed(2)}
              </div>
            </div>
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <button
                onClick={handleGenerateInvoice}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  background: loading ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  fontSize: '16px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  borderRadius: '4px',
                }}
              >
                {loading ? 'Generating Invoice...' : 'Generate Invoice PDF'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
