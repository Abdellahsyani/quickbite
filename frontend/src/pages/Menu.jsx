import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Upload } from 'lucide-react';
import api from '../api';

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Modal and Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Burgers'
  });

  // 2. add state for the image file and preview
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // 2. Fetch function using async/await
  const fetchMenu = async () => {
    try {
      const response = await api.get('/menu');
      setMenuItems(response.data);
    } catch (error) {
      console.error("Failed to fetch menu:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on first render
  useEffect(() => {
    fetchMenu();
  }, []);

  // 3. ADDED: Function to handle when a user selects a file from their computer
  const handleImageChange = (e) => {
    const file = e.target.file[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 3. Handle Form Submission using async/await
  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('price', formData.price);
    submitData.append('category', formData.category);

    if (imageFile) {
      submitData.append('image', imageFile);
    }

    try {
      await api.post('/menu', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsModalOpen(false);
      setFormData({ name: '', description: '', price: '', category: 'Burgers' });
      setImageFile(null);
      setImagePreview(null);
      fetchMenu(); // Refresh the list
    } catch (error) {
      console.error("Failed to create item:", error);
      alert(error.response?.data?.message || "Failed to create item");
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Loading catalog...</div>;
  }

  return (
    <div className="p-8 relative">

      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Catalog</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your food items and prices</p>
        </div>

        {/* Fixed: changed setIsOpen to setIsModalOpen */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Menu Item
        </button>
      </div>

      {/* Grid or Empty State */}
      {menuItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">Your menu is completely empty.</p>
          <p className="text-sm text-gray-400">Click the button above to add your first item.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2 relative group hover:border-blue-300 transition-colors">

              <div className="absolute top-4 right-4 z-10">
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${item.isAvailable !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {item.isAvailable !== false ? 'Available' : 'Sold Out'}
                </span>
              </div>

              <div className="flex justify-between items-start mt-2">
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-md">
                  {item.category}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 pr-20">{item.name}</h3>
              <p className="text-sm text-gray-500 flex-1">{item.description}</p>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <span className="text-xl font-bold text-gray-900">${item.price}</span>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* The Add Item Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add New Item</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setImagePreview(null);
                  setImageFile(null);
                }}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* 6. ADDED: The Image Upload Dropzone area inside the form */}
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Image</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl relative overflow-hidden group hover:border-blue-500 transition-colors">

                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <span className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                          <span>Upload a file</span>
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Double Cheeseburger"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="12.50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Burgers">Burgers</option>
                    <option value="Sides">Sides</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Wraps">Wraps</option>
                    <option value="Salads">Salads</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Two smashed beef patties, American cheese..."
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
