import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, addProduct, updateProduct, deleteProduct, getCategories, addCategory, updateCategory, deleteCategory, BACKEND_URL } from '../../https';
import { enqueueSnackbar } from 'notistack';
import Modal from '../ui/Modal';

import { useDispatch, useSelector } from 'react-redux';
import { setSearchQuery } from '../../redux/slices/appSlice';
import { FaSearch, FaTrash, FaPen } from 'react-icons/fa';

// Component to handle image loading with fallback
const ProductImage = ({ product, categories }) => {
    const [imageError, setImageError] = useState(false);

    const getFallbackIcon = () => {
        let catId = typeof product.category_id === 'object' ? product.category_id?._id : product.category_id;
        const category = categories.find(c => c._id === catId);

        if (category && category.icon) return <span className="text-3xl">{category.icon}</span>;

        const name = product.name.toLowerCase();
        if (name.includes('pizza')) return <span className="text-3xl">🍕</span>;
        if (name.includes('burger')) return <span className="text-3xl">🍔</span>;
        if (name.includes('drink') || name.includes('coke') || name.includes('pepsi')) return <span className="text-3xl">🥤</span>;
        if (name.includes('fries')) return <span className="text-3xl">🍟</span>;
        if (name.includes('pasta')) return <span className="text-3xl">🍝</span>;
        if (name.includes('roll')) return <span className="text-3xl">🍣</span>;
        if (name.includes('chicken')) return <span className='text-3xl'>🍗</span>

        if (product.isHotDeal) return <span className="text-3xl">🔥</span>;
        return <span className="text-3xl">📦</span>;
    };

    if (product.image_url && !imageError && product.image_url !== 'undefined' && product.image_url !== 'null') {
        let src = product.image_url;

        // DB stores: /upload/filename.jpg
        if (src.startsWith('/upload')) {
            const filename = src.split('/').pop(); // Get filename

            // Check if we are running in Electron
            if (window.electronAPI) {
                src = `media://${filename}?t=${new Date().getTime()}`;
            } else {
                // In browser development, use the backend URL directly
                src = `${BACKEND_URL}${src}`;
            }
        }

        return (
            <img
                src={src}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                    console.error('Image Error:', e.target.src);
                    setImageError(true);
                }}
            />
        );
    }

    return <div className="flex items-center justify-center w-full h-full text-gray-400">{getFallbackIcon()}</div>;
};

const ProductGrid = ({ onAddToCart, onRemoveFromCart }) => {
    const [selectedCategory, setSelectedCategory] = useState(null); // ID or 'HOT_DEALS'
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCategoryDeleteModalOpen, setIsCategoryDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [isHotDealCreation, setIsHotDealCreation] = useState(false);

    const searchQuery = useSelector((state) => state.app.searchQuery);
    const dispatch = useDispatch();

    // Forms State
    const [newItem, setNewItem] = useState({ name: '', price: '', image_url: '', specifications: [], isHotDeal: false });
    const [selectedImage, setSelectedImage] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryIcon, setNewCategoryIcon] = useState("");

    const queryClient = useQueryClient();

    // Data Fetching
    const { data: productsData, isLoading: productsLoading } = useQuery({ queryKey: ['products'], queryFn: getProducts });
    const { data: categoriesData, isLoading: categoriesLoading } = useQuery({ queryKey: ['categories'], queryFn: getCategories });

    const products = productsData?.data?.data || [];
    const categories = categoriesData?.data?.data || [];

    // Mutations
    const addProductMutation = useMutation({
        mutationFn: addProduct,
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            enqueueSnackbar('Product added', { variant: 'success' });
            setIsAddModalOpen(false);
            setIsHotDealCreation(false);
            setNewItem({ name: '', price: '', image_url: '', specifications: [], isHotDeal: false });
            setSelectedImage(null);
        },
        onError: () => enqueueSnackbar('Failed to add product', { variant: 'error' })
    });

    const updateProductMutation = useMutation({
        mutationFn: updateProduct,
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            enqueueSnackbar('Product updated', { variant: 'success' });
            setIsAddModalOpen(false);
            setEditingProduct(null);
            setIsHotDealCreation(false);
            setNewItem({ name: '', price: '', image_url: '', specifications: [], isHotDeal: false });
            setSelectedImage(null);
        },
        onError: () => enqueueSnackbar('Failed to update product', { variant: 'error' })
    });

    const deleteProductMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            if (productToDelete) onRemoveFromCart(productToDelete._id);
            queryClient.invalidateQueries(['products']);
            enqueueSnackbar('Product deleted', { variant: 'success' });
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
        },
        onError: () => enqueueSnackbar('Failed to delete product', { variant: 'error' })
    });

    const addCategoryMutation = useMutation({
        mutationFn: addCategory,
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            enqueueSnackbar('Category added', { variant: 'success' });
            setIsAddModalOpen(false);
            setNewCategoryName("");
            setNewCategoryIcon("");
        },
        onError: () => enqueueSnackbar('Failed to add category', { variant: 'error' })
    });

    const updateCategoryMutation = useMutation({
        mutationFn: updateCategory,
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            enqueueSnackbar('Category updated', { variant: 'success' });
            setIsAddModalOpen(false);
            setEditingCategory(null);
            setNewCategoryName("");
            setNewCategoryIcon("");
        },
        onError: () => enqueueSnackbar('Failed to update category', { variant: 'error' })
    });

    const deleteCategoryMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            if (categoryToDelete) onRemoveFromCart(null, categoryToDelete._id);
            queryClient.invalidateQueries(['categories']);
            queryClient.invalidateQueries(['products']);
            enqueueSnackbar('Category and associated products deleted', { variant: 'success' });
            setIsCategoryDeleteModalOpen(false);
            setCategoryToDelete(null);
            setSelectedCategory(null);
        },
        onError: () => enqueueSnackbar('Failed to delete category', { variant: 'error' })
    });

    // Formatting
    const handleAddSubmit = (e) => {
        e.preventDefault();

        if (selectedCategory) { // Product or Hot Deal
            const formData = new FormData();
            formData.append('name', newItem.name);
            formData.append('price', Number(newItem.price));

            if (newItem.image_url) formData.append('image_url', newItem.image_url);

            if (selectedImage) {
                formData.append('image', selectedImage);
            }

            formData.append('specifications', JSON.stringify(newItem.specifications));

            const isHotDeal = selectedCategory === 'HOT_DEALS' || newItem.isHotDeal; // Force true if creating in Hot Deals
            formData.append('isHotDeal', String(!!isHotDeal));

            // Only append category_id if it's a real MongoDB ID
            if (selectedCategory && selectedCategory._id && selectedCategory._id !== 'HOT_DEALS') {
                formData.append('category_id', selectedCategory._id);
            }

            console.log("📤 Submitting Product:", Object.fromEntries(formData));
            if (selectedImage) console.log("📷 Image file to upload:", selectedImage.name);

            if (editingProduct) {
                updateProductMutation.mutate({
                    productId: editingProduct._id,
                    formData: formData
                });
            } else {
                addProductMutation.mutate(formData);
            }
        } else {
            // Add or Update Category
            if (editingCategory) {
                updateCategoryMutation.mutate({
                    categoryId: editingCategory._id,
                    name: newCategoryName,
                    icon: newCategoryIcon
                });
            } else {
                addCategoryMutation.mutate({ name: newCategoryName, icon: newCategoryIcon });
            }
        }
    };

    // Filter Logic: Search > Category > All
    let filteredProducts = products;
    if (searchQuery) {
        filteredProducts = products.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    } else if (selectedCategory === 'HOT_DEALS') {
        filteredProducts = products.filter(p => p.isHotDeal);
    } else if (selectedCategory) {
        filteredProducts = products.filter(p =>
            p.category_id === selectedCategory._id || p.category_id?._id === selectedCategory._id
        );
    }

    const handleEditClick = (e, product) => {
        e.stopPropagation();
        setEditingProduct(product);
        setNewItem({
            name: product.name,
            price: product.price,
            image_url: product.image_url || '',
            specifications: product.specifications || []
        });
        setSelectedImage(null); // Reset file input

        // Ensure we switch to the category of the product being edited if not already selected
        if (!selectedCategory) {
            if (product.isHotDeal) {
                setSelectedCategory('HOT_DEALS');
            } else {
                const catId = typeof product.category_id === 'object' ? product.category_id?._id : product.category_id;
                const cat = categories.find(c => c._id === catId);
                if (cat) setSelectedCategory(cat);
            }
        }
        setIsAddModalOpen(true);
    };

    const handleDeleteClick = (e, product) => {
        e.stopPropagation();
        setProductToDelete(product);
        setIsDeleteModalOpen(true);
    };

    const handleEditCategory = (e, cat) => {
        e.stopPropagation();
        setEditingCategory(cat);
        setNewCategoryName(cat.name);
        setNewCategoryIcon(cat.icon || "");
        setSelectedCategory(null); // This triggers the Category modal view
        setIsAddModalOpen(true);
    };

    const handleDeleteCategory = (e, cat) => {
        e.stopPropagation();
        setCategoryToDelete(cat);
        setIsCategoryDeleteModalOpen(true);
    };

    if (productsLoading || categoriesLoading) return <div className="text-white p-6">Loading resources...</div>;

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] relative overflow-hidden">
            {/* Header / Actions */}
            <div className="flex justify-between items-center p-4 border-b border-white/5 bg-[#141414] gap-4">
                <div className="flex gap-3 overflow-visible flex-1 items-center">
                    {/* Search Bar */}
                    <div className="relative w-full max-w-[200px] shrink-0">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-[10px]" />
                        <input
                            type="text"
                            placeholder="Search Items..."
                            className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg pl-8 pr-4 py-2.5 text-xs text-white focus:border-orange-500 outline-none transition-all placeholder-gray-600"
                            value={searchQuery}
                            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                        />
                    </div>

                    <div className="h-6 w-px bg-white/10 mx-1 shrink-0"></div>

                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${!selectedCategory ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-[#1c1c1c] text-gray-400 hover:bg-white/10 border border-white/5'}`}
                    >
                        All Items
                    </button>

                    <button
                        onClick={() => setSelectedCategory('HOT_DEALS')}
                        className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 ${selectedCategory === 'HOT_DEALS' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-[#1c1c1c] text-gray-400 hover:bg-white/10 border border-white/5'}`}
                    >
                        <span className="text-sm border-r border-white/10 pr-2">🔥</span>
                        Hot Deals
                    </button>

                    <div className="relative shrink-0 z-30">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${selectedCategory && selectedCategory !== 'HOT_DEALS' ? 'bg-[#1c1c1c] border-orange-500 text-white shadow-lg shadow-orange-500/10' : 'bg-[#1c1c1c] border-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                        >
                            {selectedCategory && selectedCategory !== 'HOT_DEALS' ? (
                                <><span className="text-orange-500 mr-1 opacity-50">●</span> {selectedCategory.icon && <span className="text-sm">{selectedCategory.icon}</span>} {selectedCategory.name} <span className="ml-2 text-[8px] opacity-50">▼</span></>
                            ) : (
                                <><span>🗂️</span> Categories <span className="ml-2 text-[8px] opacity-50">▼</span></>
                            )}
                        </button>

                        {isDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                                <div className="absolute top-full mt-2 left-0 w-72 bg-[#1c1c1c] border border-white/10 rounded-xl shadow-2xl z-50 py-3 max-h-96 overflow-y-auto">
                                    <div className="px-4 py-2 text-[10px] text-gray-500 font-black uppercase tracking-widest border-b border-white/5 mb-2 pb-3">Select Category</div>
                                    {categories.length === 0 ? (
                                        <div className="px-4 py-6 text-xs text-gray-500 italic text-center">No categories found.<br />Click "+ Add Category" to create one.</div>
                                    ) : (
                                        categories.map(cat => (
                                            <div key={cat._id} className="relative group/cat px-2 mb-1">
                                                <button
                                                    onClick={() => { setSelectedCategory(cat); setIsDropdownOpen(false); }}
                                                    className={`w-full text-left px-3 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-3 ${selectedCategory?._id === cat._id ? 'bg-orange-500/10 text-orange-500' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                                >
                                                    {cat.icon ? <span className="text-lg w-6 flex justify-center items-center">{cat.icon}</span> : <span className="w-6 flex justify-center items-center opacity-30">📁</span>}
                                                    <span className="flex-1 truncate">{cat.name}</span>
                                                </button>
                                                {/* Edit/Delete absolute positioned on hover */}
                                                <div className="absolute top-1/2 -translate-y-1/2 right-4 flex gap-1.5 opacity-0 group-hover/cat:opacity-100 transition-all">
                                                    <button
                                                        onClick={(e) => { setIsDropdownOpen(false); handleEditCategory(e, cat); }}
                                                        className="p-2 bg-[#262626] border border-white/10 text-gray-400 hover:text-white hover:border-blue-500 rounded-lg shadow-lg transition-all"
                                                        title="Edit Category"
                                                    >
                                                        <FaPen size={10} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { setIsDropdownOpen(false); handleDeleteCategory(e, cat); }}
                                                        className="p-2 bg-[#262626] border border-white/10 text-gray-400 hover:text-white hover:border-red-500 rounded-lg shadow-lg transition-all"
                                                        title="Delete Category"
                                                    >
                                                        <FaTrash size={10} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => {
                        setIsHotDealCreation(selectedCategory === 'HOT_DEALS');
                        setIsAddModalOpen(true);
                    }}
                    className="bg-white text-black hover:bg-gray-200 px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-xl"
                >
                    {selectedCategory === 'HOT_DEALS' ? '+ Add Hot Deal' : (selectedCategory ? '+ Add Product' : '+ Add Category')}
                </button>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-[#0a0a0a]">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map(product => (
                        <div
                            key={product._id}
                            onClick={() => onAddToCart(product)}
                            className="bg-[#1c1c1c] border border-white/5 rounded-3xl hover:border-orange-500/50 transition-all cursor-pointer group flex flex-col overflow-hidden relative shadow-xl hover:shadow-orange-500/10 min-h-[10rem] h-auto"
                        >
                            {/* Card Content */}
                            <div className="flex flex-row p-5 gap-6 items-center h-full">
                                {/* Thumbnail */}
                                <div className="w-28 h-28 bg-[#242424] rounded-2xl shrink-0 overflow-hidden flex items-center justify-center shadow-inner relative">
                                    <ProductImage product={product} categories={categories} />
                                </div>
                                {/* Info */}
                                <div className="flex flex-col min-w-0 flex-1 justify-center py-2">
                                    <h4 className="text-gray-100 font-black text-lg leading-snug mb-2 group-hover:text-orange-500 transition-colors break-words">
                                        {product.name}
                                    </h4>
                                    <span className="text-orange-500 font-mono font-black text-2xl tracking-tighter">
                                        PKR {product.price}
                                    </span>
                                </div>
                                {product.isHotDeal && (
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-red-600 text-[10px] text-white px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-lg border border-white/10">HOT DEAL</span>
                                    </div>
                                )}
                            </div>

                            {/* Actions Overlay */}
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-[-10px] group-hover:translate-y-0 z-10">
                                <button
                                    onClick={(e) => handleEditClick(e, product)}
                                    className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 shadow-xl transition-all hover:scale-110"
                                    title="Edit"
                                >
                                    <FaPen size={14} />
                                </button>
                                <button
                                    onClick={(e) => handleDeleteClick(e, product)}
                                    className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-500 shadow-xl transition-all hover:scale-110"
                                    title="Delete"
                                >
                                    <FaTrash size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredProducts.length === 0 && (
                        <div className="col-span-full py-12 flex flex-col items-center opacity-30">
                            <p className="text-xs uppercase font-bold tracking-widest">No products found</p>
                            <p className="text-[10px] mt-2 text-gray-500 text-center">
                                {selectedCategory ? "Click '+ Add Product' above to add items here." : "Start by creating a category with '+ Add Category' above."}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                    setEditingCategory(null);
                    setIsHotDealCreation(false);
                    setNewItem({ name: '', price: '', image_url: '', specifications: [], isHotDeal: false });
                    setNewCategoryName("");
                    setNewCategoryIcon("");
                    setSelectedImage(null);
                }}
                title={selectedCategory === 'HOT_DEALS' ? (editingProduct ? 'Edit Hot Deal' : 'New Hot Deal') : (selectedCategory ? (editingProduct ? 'Edit Product' : `Add to ${selectedCategory.name}`) : (editingCategory ? 'Edit Category' : 'New Category'))}
            >
                <form onSubmit={handleAddSubmit} className="space-y-4">
                    {selectedCategory ? (
                        <>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-500">Product Name</label>
                                <input
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-orange-500 outline-none"
                                    placeholder="e.g. Zinger Burger"
                                    value={newItem.name}
                                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-500">Price (PKR)</label>
                                <input
                                    type="number"
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-orange-500 outline-none font-mono"
                                    placeholder="0"
                                    value={newItem.price}
                                    onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-500">Product Image (Optional)</label>
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-orange-500 outline-none"
                                        onChange={e => setSelectedImage(e.target.files[0])}
                                    />
                                    <div className="text-[10px] text-gray-500">
                                        {selectedImage ? `Selected: ${selectedImage.name}` : (newItem.image_url ? 'Current image will be kept unless you upload a new one.' : 'No image selected')}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-500">Category Name</label>
                                <input
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-orange-500 outline-none"
                                    placeholder="e.g. Burgers"
                                    value={newCategoryName}
                                    onChange={e => setNewCategoryName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-500">Icon (Emoji or URL)</label>
                                <input
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-orange-500 outline-none"
                                    placeholder="🍔"
                                    value={newCategoryIcon}
                                    onChange={e => setNewCategoryIcon(e.target.value)}
                                />
                            </div>
                        </>
                    )}
                    <button className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-lg font-bold uppercase tracking-widest mt-4 shadow-lg transition-all">
                        {isHotDealCreation ? (editingProduct ? 'Update Hot Deal' : 'Save Hot Deal') : (selectedCategory ? (editingProduct ? 'Update Product' : 'Save Product') : 'Create Category')}
                    </button>
                </form>
            </Modal>

            {/* Delete Product Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setProductToDelete(null);
                }}
                title="Confirm Delete"
            >
                <div className="space-y-6">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white shrink-0">
                            <FaTrash />
                        </div>
                        <div>
                            <p className="text-white font-bold">Delete {productToDelete?.name}?</p>
                            <p className="text-gray-500 text-xs">This action cannot be undone and will permanently remove this item.</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setIsDeleteModalOpen(false);
                                setProductToDelete(null);
                            }}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg font-bold uppercase tracking-widest transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => deleteProductMutation.mutate(productToDelete?._id)}
                            disabled={deleteProductMutation.isPending}
                            className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white py-3 rounded-lg font-bold uppercase tracking-widest shadow-lg shadow-red-600/20 transition-all"
                        >
                            {deleteProductMutation.isPending ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Category Confirmation Modal */}
            <Modal
                isOpen={isCategoryDeleteModalOpen}
                onClose={() => {
                    setIsCategoryDeleteModalOpen(false);
                    setCategoryToDelete(null);
                }}
                title="⚠️ CASCADE DELETE WARNING"
            >
                <div className="space-y-6">
                    <div className="bg-red-600/10 border border-red-600/20 rounded-xl p-6 flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white scale-110 shadow-xl shadow-red-600/30">
                            <FaTrash size={24} />
                        </div>
                        <div>
                            <p className="text-xl text-white font-black uppercase tracking-tight">Delete "{categoryToDelete?.name}" Category?</p>
                            <p className="text-red-400 text-sm mt-3 font-bold">CRITICAL WARNING:</p>
                            <p className="text-gray-400 text-sm mt-1">
                                Deleting this category will <span className="text-white font-bold decoration-red-500 underline underline-offset-4 tracking-wide">PERMANENTLY REMOVE ALL PRODUCTS</span> associated with it from the database.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                setIsCategoryDeleteModalOpen(false);
                                setCategoryToDelete(null);
                            }}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all border border-white/5"
                        >
                            Abort
                        </button>
                        <button
                            onClick={() => deleteCategoryMutation.mutate(categoryToDelete?._id)}
                            disabled={deleteCategoryMutation.isPending}
                            className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-2xl shadow-red-600/40 transition-all relative overflow-hidden group"
                        >
                            <span className="relative z-10">
                                {deleteCategoryMutation.isPending ? 'Processing...' : 'Delete Everything'}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ProductGrid;
