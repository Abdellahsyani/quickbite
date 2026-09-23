import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Upload, Search, Star, Leaf, Flame } from 'lucide-react';
import api from '../api';

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUnavailable, setShowUnavailable] = useState(true);
  const [editingItemId, setEditingItemId] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category: 'Burgers'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('price', formData.price);
    submitData.append('category', formData.category);
    if (imageFile) submitData.append('image', imageFile);

    try {
      await api.post('/menu', submitData);
      setIsModalOpen(false);
      setFormData({ name: '', description: '', price: '', category: 'Burgers' });
      setImageFile(null);
      setImagePreview(null);
      fetchMenu();
    } catch (error) {
      console.error("Failed to create item:", error);
      alert(error.response?.data?.message || "Failed to create item");
    }
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      await api.patch(`/menu/${id}`, { isAvailable: !currentStatus });
      fetchMenu();
    } catch (error) {
      console.error("Failed to update availability", error);
    }
  };

  // Dynamic Filtering Logic
  const categories = ['All', 'Burgers', 'Sides', 'Drinks', 'Salads', 'Wraps', 'Desserts'];

  const getCategoryCount = (cat) => {
    if (cat === 'All') return menuItems.length;
    return menuItems.filter(item => item.category === cat).length;
  };

  const filteredItems = menuItems.filter(item => {
    const matchCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchAvail = showUnavailable ? true : item.isAvailable !== false;
    return matchCategory && matchSearch && matchAvail;
  });

  // Calculate stats for the subtitle
  const totalItems = menuItems.length;
  const availItems = menuItems.filter(i => i.isAvailable !== false).length;
  const unavailItems = totalItems - availItems;

  const deletedCard = async (id) => {
    try {
      await api.delete(`/menu/${id}`);
      setMenuItems(menuItems.filter(item => item.id !== id));
    } catch (error) {
      console.error("Failed to delete card", error);
    };
  }

  const EditCard = (item) => {
    setEditingItemId(item.id);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
    });
    if (item.imageUrl) {
      setImagePreview(`http://localhost:3000${item.imageUrl}`);
    } else {
      setImagePreview(null);
    }
    setIsModalOpen(true);
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('price', formData.price);
    submitData.append('category', formData.category);
    if (imageFile) submitData.append('image', imageFile);

    try {
      await api.patch(`/menu/${editingItemId}`, submitData);
      setIsModalOpen(false);
      setFormData({ name: '', description: '', price: '', category: 'Burgers' });
      setImageFile(null);
      setImagePreview(null);
      fetchMenu();
    } catch (error) {
      console.error("Failed to create item:", error);
      alert(error.response?.data?.message || "Failed to create item");
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Loading catalog...</div>;
  }

  return (
    // Main Container: Fills the screen, white background for header
    <div className="flex flex-col h-full bg-white">

      {/* --- TOP HEADER SECTION --- */}
      <div className="px-8 py-6 shrink-0">

        {/* Title & Add Button Row */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 leading-tight">Menu Catalog</h1>
            <p className="text-sm text-gray-400 mt-1">
              {totalItems} items · {availItems} available · {unavailItems} unavailable
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2563eb] text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>

        {/* Search & Filter Row */}
        <div className="flex items-center gap-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow text-sm text-gray-700"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer hover:text-gray-900 select-none">
            <input
              type="checkbox"
              checked={showUnavailable}
              onChange={(e) => setShowUnavailable(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
            />
            Show unavailable
          </label>
        </div>
      </div>

      {/* --- MAIN CONTENT SPLIT --- */}
      <div className="flex flex-1 overflow-hidden border-t border-gray-200">

        {/* Left Sidebar (White background, precise borders) */}
        <div className="w-60 bg-white border-r border-gray-200 overflow-y-auto py-6 shrink-0">
          <h3 className="text-[11px] font-bold text-gray-400 tracking-wider mb-3 px-6">CATEGORIES</h3>
          <div className="flex flex-col">
            {categories.map(cat => {
              const count = getCategoryCount(cat);
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex justify-between items-center px-6 py-2.5 text-sm transition-colors ${isActive
                    ? 'border-l-[3px] border-blue-600 bg-blue-50 text-blue-700 font-medium'
                    : 'border-l-[3px] border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <span>{cat}</span>
                  {count > 0 && (
                    <span className={isActive ? 'text-blue-700 font-bold' : 'text-gray-400'}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Area: Grid Container (Slightly gray background to make cards pop) */}
        <div className="flex-1 bg-[#f8f9fa] p-8 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300 shadow-sm">
              <p className="text-gray-500 mb-2">No items found.</p>
              <p className="text-sm text-gray-400">Try adjusting your filters or add a new item.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
              {filteredItems.map(item => {
                const isAvail = item.isAvailable !== false;
                return (
                  <div key={item.id} className="bg-white rounded-[14px] border border-gray-200 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col group hover:shadow-md transition-shadow">

                    {/* Card Image */}
                    <div className="relative h-[180px] w-full bg-gray-100 shrink-0 border-b border-gray-100">
                      {item.imageUrl ? (
                        <img
                          src={`http://localhost:3000${item.imageUrl}`}
                          alt={item.name}
                          className={`w-full h-full object-cover transition-all ${!isAvail ? 'grayscale opacity-60' : ''}`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>
                      )}

                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm text-gray-700 text-xs font-bold rounded-full shadow-sm border border-gray-100/50">
                          {item.category}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button onClick={() => EditCard(item)} className="p-1.5 bg-white/95 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-lg shadow-sm border border-gray-100 transition-colors">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => deletedCard(item.id)} className="p-1.5 bg-white/95 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg shadow-sm border border-gray-100 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {!isAvail && (
                        <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center backdrop-blur-[0.5px] z-10">
                          <span className="px-3 py-1 bg-gray-900/80 text-white text-[11px] font-bold tracking-widest rounded-md shadow-lg">UNAVAILABLE</span>
                        </div>
                      )}
                    </div>

                    {/* Card Text Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2 gap-4">
                        <h3 className={`text-[15px] font-bold leading-tight ${!isAvail ? 'text-gray-400' : 'text-gray-900'}`}>
                          {item.name}
                        </h3>
                        <span className={`font-mono text-[15px] font-bold whitespace-nowrap ${!isAvail ? 'text-gray-400' : 'text-gray-900'}`}>
                          ${Number(item.price).toFixed(2)}
                        </span>
                      </div>

                      <p className={`text-[13px] mb-4 line-clamp-2 leading-relaxed ${!isAvail ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.description}
                      </p>

                      {/* Simulated Dietary Tags Matching Mockup */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.category === 'Burgers' && (
                          <span className={`px-2 py-0.5 border text-[10px] rounded-full flex items-center gap-1 font-medium ${!isAvail ? 'bg-gray-50 text-gray-400 border-gray-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                            <Star size={10} className={!isAvail ? 'text-gray-400' : 'text-orange-500'} /> popular
                          </span>
                        )}
                        {item.name.toLowerCase().includes('bbq') && (
                          <span className={`px-2 py-0.5 border text-[10px] rounded-full flex items-center gap-1 font-medium ${!isAvail ? 'bg-gray-50 text-gray-400 border-gray-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                            <Flame size={10} className={!isAvail ? 'text-gray-400' : 'text-red-500'} /> spicy
                          </span>
                        )}
                        {(item.category === 'Wraps' || item.category === 'Salads') && (
                          <span className={`px-2 py-0.5 border text-[10px] rounded-full flex items-center gap-1 font-medium ${!isAvail ? 'bg-gray-50 text-gray-400 border-gray-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                            <Leaf size={10} className={!isAvail ? 'text-gray-400' : 'text-green-600'} /> vegetarian
                          </span>
                        )}
                      </div>

                      <div className="flex-1"></div>

                      {/* Card Footer (Stats & Toggle) */}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-50 mt-auto">
                        <div className="flex gap-4 text-[12px] text-gray-400">
                          <span>{Math.floor(Math.random() * 400 + 300)} kcal</span>
                          <span className="w-px bg-gray-200"></span>
                          <span>{Math.floor(Math.random() * 10 + 5)} min prep</span>
                        </div>

                        <button
                          onClick={() => toggleAvailability(item.id, isAvail)}
                          className={`w-9 h-5 rounded-full relative flex items-center px-0.5 transition-colors duration-300 ${isAvail ? 'bg-[#2563eb]' : 'bg-gray-200'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${isAvail ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* The Add Item Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900"> {editingItemId ? "Edit Item" : "Add New Item"}</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setImagePreview(null);
                  setImageFile(null);
                  setEditingItemId(null);
                }}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={editingItemId ? handleSubmit : handleSaveEdit} className="flex flex-col gap-4">
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Image</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl relative overflow-hidden group hover:border-blue-500 hover:bg-blue-50/50 transition-colors">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="space-y-2 text-center">
                      <Upload className="mx-auto h-10 w-10 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <span className="relative cursor-pointer bg-transparent font-medium text-blue-600 hover:text-blue-700">
                          <span>Upload a file</span>
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input type="text" required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Double Cheeseburger" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input type="number" step="0.01" required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="12.50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow bg-white" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
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
                <textarea className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow min-h-[100px] resize-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Two smashed beef patties, American cheese..." />
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setImagePreview(null);
                    setImageFile(null);
                    setEditingItemId(null); // <-- Added this
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  {editingItemId ? "Save Changes" : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
