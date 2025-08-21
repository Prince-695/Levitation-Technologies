import { useState } from 'react';
import { invoiceAPI } from '../services/api';
import type { SimpleProduct } from '../types';

export default function Dashboard() {
  const [products, setProducts] = useState<SimpleProduct[]>([]);
  const [newProduct, setNewProduct] = useState<SimpleProduct>({
    name: '',
    qty: 1,
    rate: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleAddProduct = () => {
    if (newProduct.name.trim() && newProduct.rate > 0) {
      setProducts([...products, { ...newProduct, id: Date.now() }]);
      setNewProduct({ name: '', qty: 1, rate: 0 });
    }
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
    <div className="h-full overflow-hidden mx-40 text-white">
        {/* Add Products Section */}
        <div className="mb-8 mt-20">
          <h1 className="text-4xl font-bold mb-2">Add Products</h1>
          <p className="text-gray-400 mb-8">
            This is basic login page which is used for levitation assignment purpose.
          </p>

          {/* Product Form */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium mb-2">Product Name</label>
              <input
                type="text"
                placeholder="Enter the product name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full  border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Product Price</label>
              <input
                type="number"
                placeholder="Enter the price"
                value={newProduct.rate || ''}
                onChange={(e) => setNewProduct({ ...newProduct, rate: parseFloat(e.target.value) || 0 })}
                className="w-full  border  rounded px-3 py-2 text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <input
                type="number"
                placeholder="Enter the Qty"
                min="1"
                value={newProduct.qty || ''}
                onChange={(e) => setNewProduct({ ...newProduct, qty: parseInt(e.target.value) || 1 })}
                className="w-full border rounded px-3 py-2 text-white placeholder-gray-400"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddProduct}
                className="w-full bg-[#ccf575] text-black py-2 px-4 rounded font-medium flex items-center justify-center"
              >
                Add Product
                <span className="ml-2 text-white rounded-full w-5 h-5 flex items-center justify-center text-sm">+</span>
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className=" rounded-lg overflow-hidden border-2 border-[#1f1f1f]">
            <table className="w-full">
              <thead className="bg-[#1f1f1f]">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">
                    Product name 
                    <span className="inline-block ml-1 text-gray-400">↕</span>
                  </th>
                  <th className="text-left py-3 px-4 font-medium">Price</th>
                  <th className="text-left py-3 px-4 font-medium">
                    Quantity 
                    <span className="inline-block ml-1 text-gray-400">↕</span>
                  </th>
                  <th className="text-left py-3 px-4 font-medium">Total Price</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product.id || index}>
                    <td className="py-3 px-4 text-gray-300">({product.name})</td>
                    <td className="py-3 px-4">{product.rate}</td>
                    <td className="py-3 px-4">{product.qty}</td>
                    <td className="py-3 px-4">INR {(product.qty * product.rate).toFixed(0)}</td>
                  </tr>
                ))}
                
                {/* Summary Rows */}
                <tr className="border-t border-gray-600">
                  <td colSpan={3} className="py-3 px-4 text-right font-medium">Sub-Total</td>
                  <td className="py-3 px-4 font-medium">INR {totals.subtotal.toFixed(1)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="py-3 px-4 text-right font-medium">Incl + GST 18%</td>
                  <td className="py-3 px-4 font-medium">INR {totals.total.toFixed(1)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Generate PDF Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleGenerateInvoice}
              disabled={loading || products.length === 0}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black px-8 py-3 rounded font-medium"
            >
              {loading ? 'Generating...' : 'Generate PDF Invoice'}
            </button>
          </div>
        </div>
      </div>
  );
}
