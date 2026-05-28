"use client";

import { useEffect, useState, useMemo } from "react";
import { productsApi } from "@/mocks/products";
import AdminGuard from "../AdminGuard";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiInfo, FiSearch, FiBox } from "react-icons/fi";
import { useToast } from "@/context/toaster";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAdminTheme } from "../layout";
import { debounce } from "@/utils/debounce";

export default function AdminProductsPage() {
  const { theme } = useAdminTheme();
  const queryClient = useQueryClient();
  
  // Search state with debounce
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const handleSearchDebounced = useMemo(
    () => debounce((value) => setDebouncedSearch(value), 300),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    handleSearchDebounced(value);
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    id: "", // database _id for editing
    name: "",
    description: "",
    basePrice: "",
    discountType: "PERCENT",
    discountValue: 0,
    stock: 10,
    gender: "unisex-adults",
    category: "footwear",
    img: "/Images/Products/cards/Easy-Rider-Leather-Unisex-Sneakers2.jpeg",
    isTrending: false,
    isCollaboration: false,
    collaborationName: "",
    colors: [{ colorName: "PUMA Black-Frosted Ivory", colorCode: "#000000" }],
    sizes: [], // empty by default
  });

  const toastContext = useToast();
  const setAlert = toastContext?.setAlert;

  const { data: products = [], isLoading: loading, refetch } = useQuery({
    queryKey: ["adminProducts", debouncedSearch],
    queryFn: async () => {
      try {
        const res = await productsApi.getProducts({ q: debouncedSearch });
        if (res.data?.status === "SUCCESS") {
          return res.data.data;
        }
        return [];
      } catch (error) {
        console.error(error);
        setAlert?.({
          open: true,
          message: "Failed to load product catalog from server",
          severity: "error",
        });
        return [];
      }
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await productsApi.createProduct({
        name: formData.name,
        description: formData.description,
        basePrice: Number(formData.basePrice),
        discountType: formData.discountType || null,
        discountValue: Number(formData.discountValue),
        stock: Number(formData.stock),
        gender: formData.gender,
        category: formData.category,
        img: formData.img,
        isTrending: formData.isTrending,
        isCollaboration: formData.isCollaboration,
        collaborationName: formData.isCollaboration ? formData.collaborationName : "",
        colors: formData.colors,
        sizes: formData.sizes,
      });

      if (res.data?.status === "SUCCESS") {
        setAlert?.({
          open: true,
          message: "Product created successfully in catalog database!",
          severity: "success",
        });
        setIsAddModalOpen(false);
        resetForm();
        queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
        queryClient.invalidateQueries({ queryKey: ["homepageCollaborations"] });
        queryClient.invalidateQueries({ queryKey: ["homepageTrending"] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
      }
    } catch (error) {
      console.error(error);
      setAlert?.({
        open: true,
        message: error.response?.data?.message || "Failed to add product.",
        severity: "error",
      });
    }
  };

  const handleEditClick = (product) => {
    queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
    setFormData({
      id: product._id,
      name: product.name,
      description: product.description,
      basePrice: product.basePrice,
      discountType: product.discountType || "PERCENT",
      discountValue: product.discountValue || 0,
      stock: product.stock,
      gender: product.gender,
      category: product.category || "footwear",
      img: product.img,
      isTrending: product.isTrending || false,
      isCollaboration: product.isCollaboration || false,
      collaborationName: product.collaborationName || "",
      colors: product.colors?.length ? product.colors : [{ colorName: "PUMA Black-Frosted Ivory", colorCode: "#000000" }],
      sizes: product.sizes || [],
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await productsApi.updateProduct(formData.id, {
        name: formData.name,
        description: formData.description,
        basePrice: Number(formData.basePrice),
        discountType: formData.discountType || null,
        discountValue: Number(formData.discountValue),
        stock: Number(formData.stock),
        gender: formData.gender,
        category: formData.category,
        img: formData.img,
        isTrending: formData.isTrending,
        isCollaboration: formData.isCollaboration,
        collaborationName: formData.isCollaboration ? formData.collaborationName : "",
        colors: formData.colors,
        sizes: formData.sizes,
      });

      if (res.data?.status === "SUCCESS") {
        setAlert?.({
          open: true,
          message: "Product updated successfully!",
          severity: "success",
        });
        setIsEditModalOpen(false);
        resetForm();
        queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
        queryClient.invalidateQueries({ queryKey: ["homepageCollaborations"] });
        queryClient.invalidateQueries({ queryKey: ["homepageTrending"] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
      }
    } catch (error) {
      console.error(error);
      setAlert?.({
        open: true,
        message: error.response?.data?.message || "Failed to edit product.",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product from the Puma catalog?")) {
      return;
    }

    try {
      const res = await productsApi.deleteProduct(id);

      if (res.data?.status === "SUCCESS") {
        setAlert?.({
          open: true,
          message: "Product removed from catalog.",
          severity: "success",
        });
        queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
        queryClient.invalidateQueries({ queryKey: ["homepageCollaborations"] });
        queryClient.invalidateQueries({ queryKey: ["homepageTrending"] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
      }
    } catch (error) {
      console.error(error);
      setAlert?.({
        open: true,
        message: "Failed to delete product.",
        severity: "error",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      description: "",
      basePrice: "",
      discountType: "PERCENT",
      discountValue: 0,
      stock: 10,
      gender: "unisex-adults",
      category: "footwear",
      img: "/Images/Products/cards/Easy-Rider-Leather-Unisex-Sneakers2.jpeg",
      isTrending: false,
      isCollaboration: false,
      collaborationName: "",
      colors: [{ colorName: "PUMA Black-Frosted Ivory", colorCode: "#000000" }],
      sizes: [],
    });
  };

  // Reset pagination on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const filteredProducts = products.filter((product) => {
    return (
      product.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      product.productId?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      product.gender?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStockBadgeClass = (stock) => {
    const isOutOfStock = stock === 0;
    if (isOutOfStock) {
      return theme === "dark"
        ? "bg-red-950/20 text-red-400 border border-red-900/30"
        : "bg-red-50 text-red-600 border border-red-200";
    } else if (stock < 5) {
      return theme === "dark"
        ? "bg-yellow-950/20 text-yellow-400 border border-yellow-900/30"
        : "bg-yellow-50 text-yellow-700 border border-yellow-200";
    } else {
      return theme === "dark"
        ? "bg-green-950/20 text-green-400 border border-green-900/30"
        : "bg-green-50 text-green-600 border border-green-200";
    }
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        {/* Controls Bar */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-between items-center border p-4 rounded-xl transition-all duration-200 ${
          theme === "dark" ? "bg-[#0c0c0e] border-[#1a1a1f]" : "bg-white border-gray-200 shadow-sm"
        }`}>
          {/* Search */}
          <div className="relative w-full sm:w-80 flex items-center">
            <FiSearch className={`absolute left-3 transition-colors duration-200 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search catalog by name or gender..."
              className={`w-full pl-10 pr-10 py-2.5 border rounded-lg text-xs placeholder-gray-400 focus:outline-none focus:border-red-600 transition-colors duration-200 ${
                theme === "dark"
                  ? "bg-[#131317] border-[#23232a] text-white hover:border-[#333]"
                  : "bg-gray-50 border-gray-200 text-gray-900 hover:border-gray-300"
              }`}
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setDebouncedSearch("");
                }}
                className={`absolute right-3 p-1 rounded-full transition-colors ${
                  theme === "dark" ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-gray-500 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                <FiX size={14} />
              </button>
            )}
          </div>

          {/* Add Product Trigger */}
          <button
            onClick={() => {
              resetForm();
              queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
              setIsAddModalOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md shadow-red-900/10 transition-all cursor-pointer"
          >
            <FiPlus className="text-sm" />
            ADD NEW PRODUCT
          </button>
        </div>

        {/* Products Catalog Table */}
        <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${
          theme === "dark" ? "bg-[#0c0c0e] border-[#1a1a1f]" : "bg-white border-gray-200 shadow-sm"
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b transition-colors duration-200 ${
                  theme === "dark" ? "border-[#1a1a1f] text-gray-500" : "border-gray-200 text-gray-400"
                } text-[10px] uppercase tracking-widest font-bold`}>
                  <th className="p-4 pl-6">Model Info</th>
                  <th className="p-4">SKU / ID</th>
                  <th className="p-4">Price details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y transition-colors duration-200 ${
                theme === "dark" ? "divide-[#1a1a1f] text-gray-300" : "divide-gray-200 text-gray-600"
              } text-xs font-semibold`}>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-20 text-center">
                      <div className={`w-8 h-8 border-4 border-t-red-600 rounded-full animate-spin inline-block ${
                        theme === "dark" ? "border-[#333]" : "border-gray-200"
                      }`}></div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-500 uppercase tracking-widest text-[10px]">
                      No catalog products matched search query.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => {
                    const isOutOfStock = product.stock === 0;
                    return (
                      <tr key={product._id} className={`transition-all group ${
                        theme === "dark" ? "hover:bg-[#121215]/40" : "hover:bg-gray-50/50"
                      }`}>
                        {/* Model Info */}
                        <td className="p-4 pl-6 flex items-center gap-3">
                          <div className={`w-12 h-12 rounded border overflow-hidden flex items-center justify-center shrink-0 transition-colors duration-200 ${
                            theme === "dark" ? "bg-[#131317] border-[#23232a]" : "bg-gray-50 border-gray-200"
                          }`}>
                            <img
                              src={product.img}
                              alt={product.name}
                              className="object-contain w-10 h-10"
                              onError={(e) => {
                                e.target.src = "/Images/Products/cards/Easy-Rider-Leather-Unisex-Sneakers2.jpeg";
                              }}
                            />
                          </div>
                          <div className="flex flex-col min-w-0 max-w-[200px]">
                            <span className={`font-bold truncate transition-colors duration-200 ${theme === "dark" ? "text-white" : "text-gray-950"}`}>{product.name}</span>
                            <span className="text-[10px] text-red-500 uppercase tracking-wider mt-0.5">
                              {product.gender}
                            </span>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className={`p-4 font-mono transition-colors duration-200 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          {product.productId}
                        </td>

                        {/* Price details */}
                        <td className="p-4">
                          <div className="flex flex-col">
                            {product.offerPrice ? (
                              <>
                                <span className={`font-bold transition-colors duration-200 ${theme === "dark" ? "text-white" : "text-gray-955"}`}>{product.offerPrice}</span>
                                <span className={`text-[10px] line-through mt-0.5 transition-colors duration-200 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                                  {product.price}
                                </span>
                              </>
                            ) : (
                              <span className={`font-bold transition-colors duration-200 ${theme === "dark" ? "text-white" : "text-gray-955"}`}>{product.price}</span>
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td className={`p-4 uppercase text-[10px] transition-colors duration-200 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          {product.category || "footwear"}
                        </td>

                        {/* Stock */}
                        <td className="p-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${getStockBadgeClass(product.stock)}`}
                          >
                            {isOutOfStock ? "SOLD OUT" : `${product.stock} UNITS`}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-4 pr-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditClick(product)}
                              className={`p-2 border rounded-lg transition-colors cursor-pointer ${
                                theme === "dark"
                                  ? "bg-[#131317] border-[#23232a] text-gray-400 hover:text-white hover:border-[#3a3a45]"
                                  : "bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300"
                              }`}
                              title="Edit product"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className={`p-2 border rounded-lg transition-all cursor-pointer ${
                                theme === "dark"
                                  ? "bg-red-950/10 border-red-900/20 text-red-400 hover:bg-red-600 hover:text-white"
                                  : "bg-red-50 border-red-200 text-red-600 hover:bg-red-600 hover:text-white"
                              }`}
                              title="Delete product"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredProducts.length > 10 && (
            <div className={`p-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors duration-200 ${
              theme === "dark" ? "border-[#1a1a1f] bg-[#0c0c0e]" : "border-gray-200 bg-white"
            }`}>
              <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"} font-medium`}>
                Showing <strong className={theme === "dark" ? "text-white" : "text-gray-900"}>{(currentPage - 1) * itemsPerPage + 1}</strong> to{" "}
                <strong className={theme === "dark" ? "text-white" : "text-gray-900"}>
                  {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
                </strong>{" "}
                of <strong className={theme === "dark" ? "text-white" : "text-gray-900"}>{filteredProducts.length}</strong> products
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    currentPage === 1
                      ? theme === "dark"
                        ? "bg-[#131317] border border-[#23232a] text-gray-600 cursor-not-allowed"
                        : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
                      : theme === "dark"
                        ? "bg-[#131317] border border-[#23232a] text-gray-400 hover:text-white hover:border-[#3a3a45]"
                        : "bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        currentPage === pageNum
                          ? "bg-red-600 text-white border border-red-600 shadow-sm"
                          : theme === "dark"
                            ? "bg-[#131317] border border-[#23232a] text-gray-400 hover:text-white hover:border-[#3a3a45]"
                            : "bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    currentPage === totalPages
                      ? theme === "dark"
                        ? "bg-[#131317] border border-[#23232a] text-gray-600 cursor-not-allowed"
                        : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
                      : theme === "dark"
                        ? "bg-[#131317] border border-[#23232a] text-gray-400 hover:text-white hover:border-[#3a3a45]"
                        : "bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MODALS */}
        {/* ADD PRODUCT MODAL */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className={`border rounded-xl w-full max-w-5xl md:w-[80%] overflow-hidden shadow-2xl relative animate-slideIn my-8 transition-colors duration-200 ${
              theme === "dark" ? "bg-[#0c0c0e] border-[#1d1d22]" : "bg-white border-gray-200"
            }`}>
              {/* Header */}
              <div className={`h-16 border-b flex justify-between items-center px-6 transition-colors duration-200 ${
                theme === "dark" ? "border-[#1a1a1f] bg-[#0f0f11]" : "border-gray-200 bg-gray-50"
              }`}>
                <h3 className={`font-bold text-sm uppercase tracking-wider ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  Add Catalog Product
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className={`text-lg cursor-pointer transition-colors ${
                    theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <FiX />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddSubmit} className="max-h-[80vh] overflow-y-auto">
                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column - General & Visuals */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Product Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Puma Suede Classic"
                        className={`w-full px-3 py-2.5 border rounded-lg text-xs focus:outline-none focus:border-red-600 transition-colors ${
                          theme === "dark" ? "bg-[#131317] border-[#23232a] text-white" : "bg-white border-gray-300 text-gray-900"
                        }`}
                        required
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Product Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter description details..."
                        rows="4"
                        className={`w-full px-3 py-2.5 border rounded-lg text-xs focus:outline-none focus:border-red-600 transition-colors ${
                          theme === "dark" ? "bg-[#131317] border-[#23232a] text-white" : "bg-white border-gray-300 text-gray-900"
                        }`}
                        required
                      />
                    </div>

                    {/* Image path & live preview */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          Product Image (Asset Path or Web URL)
                        </label>
                        <input
                          type="text"
                          name="img"
                          value={formData.img}
                          onChange={handleInputChange}
                          placeholder="Paste URL (https://...) or enter asset path (/Images/...)"
                          className={`w-full px-3 py-2.5 border rounded-lg text-xs focus:outline-none focus:border-red-600 transition-colors ${
                            theme === "dark" ? "bg-[#131317] border-[#23232a] text-white" : "bg-white border-gray-300 text-gray-900"
                          }`}
                          required
                        />
                        <p className={`text-[9px] ${theme === "dark" ? "text-gray-500" : "text-gray-400"} leading-normal`}>
                          Supports web URLs directly, or local assets path like `/Images/Products/cards/filename.jpeg`.
                        </p>
                      </div>

                      {/* Visual Live Preview Box */}
                      <div className="space-y-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          Image Live Preview
                        </span>
                        <div className={`h-40 w-full border border-dashed rounded-lg overflow-hidden flex items-center justify-center relative p-3 transition-colors ${
                          theme === "dark" ? "bg-[#131317]/50 border-gray-800" : "bg-gray-50 border-gray-200"
                        }`}>
                          {formData.img ? (
                            <img
                              src={formData.img}
                              alt="Product Live Preview"
                              className="object-contain max-h-full max-w-full rounded shadow-sm"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                const fallback = document.getElementById('add-preview-fallback');
                                if (fallback) fallback.style.display = 'flex';
                              }}
                              onLoad={(e) => {
                                e.target.style.display = 'block';
                                const fallback = document.getElementById('add-preview-fallback');
                                if (fallback) fallback.style.display = 'none';
                              }}
                            />
                          ) : null}
                          <div id="add-preview-fallback" className="absolute inset-0 flex flex-col items-center justify-center text-center p-3" style={{ display: formData.img ? 'none' : 'flex' }}>
                            <FiBox className={`text-2xl mb-1.5 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`} />
                            <span className={`text-[10px] font-semibold uppercase tracking-wider ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                              No Image Loaded
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Pricing, Inventory, Classifications */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Base Price */}
                      <div className="space-y-1.5">
                        <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          Base Price (₹)
                        </label>
                        <input
                          type="number"
                          name="basePrice"
                          value={formData.basePrice}
                          onChange={handleInputChange}
                          placeholder="e.g. 8999"
                          min="1"
                          className={`w-full px-3 py-2.5 border rounded-lg text-xs focus:outline-none focus:border-red-600 transition-colors ${
                            theme === "dark" ? "bg-[#131317] border-[#23232a] text-white" : "bg-white border-gray-300 text-gray-900"
                          }`}
                          required
                        />
                      </div>

                      {/* Stock */}
                      <div className="space-y-1.5">
                        <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          Available Stock
                        </label>
                        <input
                          type="number"
                          name="stock"
                          value={formData.stock}
                          onChange={handleInputChange}
                          placeholder="e.g. 15"
                          min="0"
                          className={`w-full px-3 py-2.5 border rounded-lg text-xs focus:outline-none focus:border-red-600 transition-colors ${
                            theme === "dark" ? "bg-[#131317] border-[#23232a] text-white" : "bg-white border-gray-300 text-gray-900"
                          }`}
                          required
                        />
                      </div>

                      {/* Discount Type */}
                      <div className="space-y-1.5">
                        <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          Discount Method
                        </label>
                        <select
                          name="discountType"
                          value={formData.discountType}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2.5 border rounded-lg text-xs focus:outline-none focus:border-red-600 transition-colors ${
                            theme === "dark" ? "bg-[#131317] border-[#23232a] text-white" : "bg-white border-gray-300 text-gray-900"
                          }`}
                        >
                          <option value="PERCENT">PERCENTAGE (%)</option>
                          <option value="FLAT">FLAT VALUE (₹)</option>
                        </select>
                      </div>

                      {/* Discount Value */}
                      <div className="space-y-1.5">
                        <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          Discount Value
                        </label>
                        <input
                          type="number"
                          name="discountValue"
                          value={formData.discountValue}
                          onChange={handleInputChange}
                          placeholder="e.g. 15"
                          min="0"
                          className={`w-full px-3 py-2.5 border rounded-lg text-xs focus:outline-none focus:border-red-600 transition-colors ${
                            theme === "dark" ? "bg-[#131317] border-[#23232a] text-white" : "bg-white border-gray-300 text-gray-900"
                          }`}
                        />
                      </div>

                      {/* Target Gender */}
                      <div className="space-y-1.5">
                        <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          Gender classification
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2.5 border rounded-lg text-xs focus:outline-none focus:border-red-600 transition-colors ${
                            theme === "dark" ? "bg-[#131317] border-[#23232a] text-white" : "bg-white border-gray-300 text-gray-900"
                          }`}
                          required
                        >
                          <option value="unisex-adults">Unisex - Adults</option>
                          <option value="male">Male Only</option>
                          <option value="female">Female Only</option>
                          <option value="boys">Boys Only</option>
                          <option value="girls">Girls Only</option>
                          <option value="kids">Small Kids Only</option>
                          <option value="unisex-kids">Unisex - Kids</option>
                        </select>
                      </div>

                      {/* Catalog Category */}
                      <div className="space-y-1.5">
                        <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          Catalog Category
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2.5 border rounded-lg text-xs focus:outline-none focus:border-red-600 transition-colors ${
                            theme === "dark" ? "bg-[#131317] border-[#23232a] text-white" : "bg-white border-gray-300 text-gray-900"
                          }`}
                          required
                        >
                          <option value="footwear">Footwear</option>
                          <option value="apparel">Apparel</option>
                          <option value="accessories">Accessories</option>
                        </select>
                      </div>

                      {/* Colors Manager */}
                      <div className={`sm:col-span-2 space-y-3 border-t pt-4 mt-2 transition-colors ${theme === "dark" ? "border-[#1a1a1f]" : "border-gray-200"}`}>
                        <div className="flex justify-between items-center">
                          <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            Dynamic Color Variants
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                colors: [...prev.colors, { colorName: "", colorCode: "#000000" }]
                              }));
                            }}
                            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                          >
                            <FiPlus /> ADD COLOR
                          </button>
                        </div>
                        
                        {formData.colors.length === 0 ? (
                          <div className={`text-xs p-4 border border-dashed rounded-lg text-center ${
                            theme === "dark" ? "text-gray-500 border-[#23232a]" : "text-gray-400 border-gray-300"
                          }`}>
                            No color variants added. Schema default color will be used.
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {formData.colors.map((clr, idx) => (
                              <div key={idx} className={`flex items-center gap-3 p-2 rounded-lg border ${
                                theme === "dark" ? "bg-[#131317] border-[#23232a]" : "bg-gray-50 border-gray-200"
                              }`}>
                                <input
                                  type="text"
                                  placeholder="Color Name (e.g. Puma Black)"
                                  value={clr.colorName}
                                  onChange={(e) => {
                                    const newColors = [...formData.colors];
                                    newColors[idx].colorName = e.target.value;
                                    setFormData(prev => ({ ...prev, colors: newColors }));
                                  }}
                                  className={`flex-1 px-2 py-1.5 border rounded text-xs focus:outline-none focus:border-red-600 transition-colors ${
                                    theme === "dark" ? "bg-[#0c0c0e] border-[#3a3a45] text-white" : "bg-white border-gray-300 text-gray-900"
                                  }`}
                                  required
                                />
                                <div className={`flex items-center border rounded overflow-hidden focus-within:border-red-600 transition-colors ${
                                  theme === "dark" ? "border-[#3a3a45] bg-[#0c0c0e]" : "border-gray-300 bg-white"
                                }`}>
                                  <input
                                    type="color"
                                    value={clr.colorCode}
                                    onChange={(e) => {
                                      const newColors = [...formData.colors];
                                      newColors[idx].colorCode = e.target.value;
                                      setFormData(prev => ({ ...prev, colors: newColors }));
                                    }}
                                    className="w-8 h-8 border-0 bg-transparent cursor-pointer p-0.5"
                                  />
                                  <input
                                    type="text"
                                    value={clr.colorCode}
                                    onChange={(e) => {
                                      const newColors = [...formData.colors];
                                      newColors[idx].colorCode = e.target.value;
                                      setFormData(prev => ({ ...prev, colors: newColors }));
                                    }}
                                    placeholder="#000000"
                                    className={`w-20 px-2 py-1.5 text-xs focus:outline-none bg-transparent ${
                                      theme === "dark" ? "text-white" : "text-gray-900"
                                    }`}
                                    required
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newColors = formData.colors.filter((_, i) => i !== idx);
                                    setFormData(prev => ({ ...prev, colors: newColors }));
                                  }}
                                  className={`p-1.5 rounded transition-colors ${
                                    theme === "dark" ? "text-gray-500 hover:text-red-400 hover:bg-red-950/30" : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                                  }`}
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Sizes Manager */}
                      <div className={`sm:col-span-2 space-y-3 border-t pt-4 mt-2 transition-colors ${theme === "dark" ? "border-[#1a1a1f]" : "border-gray-200"}`}>
                        <div className="flex justify-between items-center">
                          <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            Dynamic Sizes Inventory
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                sizes: [...prev.sizes, { size: "", stock: 0 }]
                              }));
                            }}
                            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                          >
                            <FiPlus /> ADD SIZE
                          </button>
                        </div>
                        
                        {formData.sizes.length === 0 ? (
                          <div className={`text-xs p-4 border border-dashed rounded-lg text-center ${
                            theme === "dark" ? "text-gray-500 border-[#23232a]" : "text-gray-400 border-gray-300"
                          }`}>
                            No dynamic sizes added. Schema default sizes will be used.
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {formData.sizes.map((sz, idx) => (
                              <div key={idx} className={`flex items-center gap-3 p-2 rounded-lg border ${
                                theme === "dark" ? "bg-[#131317] border-[#23232a]" : "bg-gray-50 border-gray-200"
                              }`}>
                                <input
                                  type="text"
                                  placeholder="Size (e.g. UK 8)"
                                  value={sz.size}
                                  onChange={(e) => {
                                    const newSizes = [...formData.sizes];
                                    newSizes[idx].size = e.target.value;
                                    setFormData(prev => ({ ...prev, sizes: newSizes }));
                                  }}
                                  className={`flex-1 px-2 py-1.5 border rounded text-xs focus:outline-none focus:border-red-600 transition-colors ${
                                    theme === "dark" ? "bg-[#0c0c0e] border-[#3a3a45] text-white" : "bg-white border-gray-300 text-gray-900"
                                  }`}
                                  required
                                />
                                <input
                                  type="number"
                                  placeholder="Stock"
                                  min="0"
                                  value={sz.stock}
                                  onChange={(e) => {
                                    const newSizes = [...formData.sizes];
                                    newSizes[idx].stock = Number(e.target.value);
                                    setFormData(prev => ({ ...prev, sizes: newSizes }));
                                  }}
                                  className={`w-24 px-2 py-1.5 border rounded text-xs focus:outline-none focus:border-red-600 transition-colors ${
                                    theme === "dark" ? "bg-[#0c0c0e] border-[#3a3a45] text-white" : "bg-white border-gray-300 text-gray-900"
                                  }`}
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSizes = formData.sizes.filter((_, i) => i !== idx);
                                    setFormData(prev => ({ ...prev, sizes: newSizes }));
                                  }}
                                  className={`p-1.5 rounded transition-colors ${
                                    theme === "dark" ? "text-gray-500 hover:text-red-400 hover:bg-red-950/30" : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                                  }`}
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Special Flags */}
                      <div className={`sm:col-span-2 grid grid-cols-2 gap-4 border-t pt-4 mt-2 transition-colors ${
                        theme === "dark" ? "border-[#1a1a1f]" : "border-gray-200"
                      }`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="add-isTrending"
                            name="isTrending"
                            checked={formData.isTrending}
                            onChange={(e) => setFormData(prev => ({ ...prev, isTrending: e.target.checked }))}
                            className="w-4 h-4 rounded text-red-600 cursor-pointer"
                          />
                          <label htmlFor="add-isTrending" className={`text-[10px] font-bold uppercase tracking-wider cursor-pointer select-none ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}>
                            Top Trending Product
                          </label>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="add-isCollaboration"
                            name="isCollaboration"
                            checked={formData.isCollaboration}
                            onChange={(e) => setFormData(prev => ({ ...prev, isCollaboration: e.target.checked }))}
                            className="w-4 h-4 rounded text-red-600 cursor-pointer"
                          />
                          <label htmlFor="add-isCollaboration" className={`text-[10px] font-bold uppercase tracking-wider cursor-pointer select-none ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}>
                            Collaboration Product
                          </label>
                        </div>
                      </div>

                      {/* Collaboration Name */}
                      {formData.isCollaboration && (
                        <div className="sm:col-span-2 space-y-1.5 animate-fadeIn">
                          <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            Collaboration Brand Name
                          </label>
                          <input
                            type="text"
                            name="collaborationName"
                            value={formData.collaborationName}
                            onChange={handleInputChange}
                            placeholder="e.g. Hot Wheels"
                            className={`w-full px-3 py-2.5 border rounded-lg text-xs focus:outline-none focus:border-red-600 transition-colors ${
                              theme === "dark" ? "bg-[#131317] border-[#23232a] text-white" : "bg-white border-gray-300 text-gray-900"
                            }`}
                            required={formData.isCollaboration}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`p-6 border-t flex justify-end gap-3 transition-colors ${
                  theme === "dark" ? "border-[#1a1a1f] bg-[#0f0f11]" : "border-gray-200 bg-gray-50"
                }`}>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className={`px-4 py-2 border text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer ${
                      theme === "dark" ? "border-[#23232a] hover:bg-[#121215] text-gray-300" : "border-gray-300 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase rounded-lg transition-colors cursor-pointer"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT PRODUCT MODAL */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className={`border rounded-xl w-full max-w-5xl md:w-[80%] overflow-hidden shadow-2xl relative animate-slideIn my-8 transition-colors duration-200 ${
              theme === "dark" ? "bg-[#0c0c0e] border-[#1d1d22]" : "bg-white border-gray-200"
            }`}>
              {/* Header */}
              <div className={`h-16 border-b flex justify-between items-center px-6 transition-colors duration-200 ${
                theme === "dark" ? "border-[#1a1a1f] bg-[#0f0f11]" : "border-gray-200 bg-gray-50"
              }`}>
                <h3 className={`font-bold text-sm uppercase tracking-wider ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  Edit Catalog Product
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className={`text-lg cursor-pointer transition-colors ${
                    theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <FiX />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleEditSubmit} className="max-h-[80vh] overflow-y-auto">
                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column - General & Visuals */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Product Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Puma Suede Classic"
                        className={`w-full px-3 py-2.5 border rounded-lg text-xs focus:outline-none focus:border-red-600 transition-colors ${
                          theme === "dark" ? "bg-[#131317] border-[#23232a] text-white" : "bg-white border-gray-300 text-gray-900"
                        }`}
                        required
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Product Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter description details..."
                        rows="4"
                        className={`w-full px-3 py-2.5 border rounded-lg text-xs focus:outline-none focus:border-red-600 transition-colors ${
                          theme === "dark" ? "bg-[#131317] border-[#23232a] text-white" : "bg-white border-gray-300 text-gray-900"
                        }`}
                        required
                      />
                    </div>

                    {/* Image path & live preview */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          Product Image (Asset Path or Web URL)
                        </label>
                        <input
                          type="text"
                          name="img"
                          value={formData.img}
                          onChange={handleInputChange}
                          placeholder="Paste URL (https://...) or enter asset path (/Images/...)"
                          className={`w-full px-3 py-2.5 border rounded-lg text-xs focus:outline-none focus:border-red-600 transition-colors ${
                            theme === "dark" ? "bg-[#131317] border-[#23232a] text-white" : "bg-white border-gray-300 text-gray-900"
                          }`}
                          required
                        />
                        <p className={`text-[9px] ${theme === "dark" ? "text-gray-500" : "text-gray-400"} leading-normal`}>
                          Supports web URLs directly, or local assets path like `/Images/Products/cards/filename.jpeg`.
                        </p>
                      </div>

                      {/* Visual Live Preview Box */}
                      <div className="space-y-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          Image Live Preview
                        </span>
                        <div className={`h-40 w-full border border-dashed rounded-lg overflow-hidden flex items-center justify-center relative p-3 transition-colors ${
                          theme === "dark" ? "bg-[#131317]/50 border-gray-800" : "bg-gray-50 border-gray-200"
                        }`}>
                          {formData.img ? (
                            <img
                              src={formData.img}
                              alt="Product Live Preview"
                              className="object-contain max-h-full max-w-full rounded shadow-sm"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                const fallback = document.getElementById('edit-preview-fallback');
                                if (fallback) fallback.style.display = 'flex';
                              }}
                              onLoad={(e) => {
                                e.target.style.display = 'block';
                                const fallback = document.getElementById('edit-preview-fallback');
                                if (fallback) fallback.style.display = 'none';
                              }}
                            />
                          ) : null}
                          <div id="edit-preview-fallback" className="absolute inset-0 flex flex-col items-center justify-center text-center p-3" style={{ display: formData.img ? 'none' : 'flex' }}>
                            <FiBox className={`text-2xl mb-1.5 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`} />
                            <span className={`text-[10px] font-semibold uppercase tracking-wider ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                              No Image Loaded
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Pricing, Inventory, Classifications */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Base Price */}
                      <div className="space-y-1.5">
                        <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          Base Price (₹)
                        </label>
                        <input
                          type="number"
                          name="basePrice"
                          value={formData.basePrice}
                          onChange={handleInputChange}
                          placeholder="e.g. 8999"
                          min="1"
                          className={`w-full px-3 py-2.5 border rounded-lg text-xs focus:outline-none focus:border-red-600 transition-colors ${
                            theme === "dark" ? "bg-[#131317] border-[#23232a] text-white" : "bg-white border-gray-300 text-gray-900"
                          }`}
                          required
                        />
                      </div>

                      {/* Stock */}
                      <div className="space-y-1.5">
                        <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          Available Stock
                        </label>
                        <input
                          type="number"
                          name="stock"
                          value={formData.stock}
                          onChange={handleInputChange}
                          placeholder="e.g. 15"
                          min="0"
                          className={`w-full px-3 py-2.5 border rounded-lg text-xs focus:outline-none focus:border-red-600 transition-colors ${
                            theme === "dark" ? "bg-[#131317] border-[#23232a] text-white" : "bg-white border-gray-300 text-gray-900"
                          }`}
                          required
                        />
                      </div>

                      {/* Discount Type */}
                      <div className="space-y-1.5">
                        <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          Discount Method
                        </label>
                        <select
                          name="discountType"
                          value={formData.discountType}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2.5 border rounded-lg text-xs focus:outline-none focus:border-red-600 transition-colors ${
                            theme === "dark" ? "bg-[#131317] border-[#23232a] text-white" : "bg-white border-gray-300 text-gray-900"
                          }`}
                        >
                          <option value="PERCENT">PERCENTAGE (%)</option>
                          <option value="FLAT">FLAT VALUE (₹)</option>
                        </select>
                      </div>

                      {/* Discount Value */}
                      <div className="space-y-1.5">
                        <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          Discount Value
                        </label>
                        <input
                          type="number"
                          name="discountValue"
                          value={formData.discountValue}
                          onChange={handleInputChange}
                          placeholder="e.g. 15"
                          min="0"
                          className={`w-full px-3 py-2.5 border rounded-lg text-xs focus:outline-none focus:border-red-600 transition-colors ${
                            theme === "dark" ? "bg-[#131317] border-[#23232a] text-white" : "bg-white border-gray-300 text-gray-900"
                          }`}
                        />
                      </div>

                      {/* Target Gender */}
                      <div className="space-y-1.5">
                        <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          Gender classification
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2.5 border rounded-lg text-xs focus:outline-none focus:border-red-600 transition-colors ${
                            theme === "dark" ? "bg-[#131317] border-[#23232a] text-white" : "bg-white border-gray-300 text-gray-900"
                          }`}
                          required
                        >
                          <option value="unisex-adults">Unisex - Adults</option>
                          <option value="male">Male Only</option>
                          <option value="female">Female Only</option>
                          <option value="boys">Boys Only</option>
                          <option value="girls">Girls Only</option>
                          <option value="kids">Small Kids Only</option>
                          <option value="unisex-kids">Unisex - Kids</option>
                        </select>
                      </div>

                      {/* Catalog Category */}
                      <div className="space-y-1.5">
                        <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          Catalog Category
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2.5 border rounded-lg text-xs focus:outline-none focus:border-red-600 transition-colors ${
                            theme === "dark" ? "bg-[#131317] border-[#23232a] text-white" : "bg-white border-gray-300 text-gray-900"
                          }`}
                          required
                        >
                          <option value="footwear">Footwear</option>
                          <option value="apparel">Apparel</option>
                          <option value="accessories">Accessories</option>
                        </select>
                      </div>

                      {/* Colors Manager */}
                      <div className={`sm:col-span-2 space-y-3 border-t pt-4 mt-2 transition-colors ${theme === "dark" ? "border-[#1a1a1f]" : "border-gray-200"}`}>
                        <div className="flex justify-between items-center">
                          <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            Dynamic Color Variants
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                colors: [...prev.colors, { colorName: "", colorCode: "#000000" }]
                              }));
                            }}
                            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                          >
                            <FiPlus /> ADD COLOR
                          </button>
                        </div>
                        
                        {formData.colors.length === 0 ? (
                          <div className={`text-xs p-4 border border-dashed rounded-lg text-center ${
                            theme === "dark" ? "text-gray-500 border-[#23232a]" : "text-gray-400 border-gray-300"
                          }`}>
                            No color variants added. Schema default color will be used.
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {formData.colors.map((clr, idx) => (
                              <div key={idx} className={`flex items-center gap-3 p-2 rounded-lg border ${
                                theme === "dark" ? "bg-[#131317] border-[#23232a]" : "bg-gray-50 border-gray-200"
                              }`}>
                                <input
                                  type="text"
                                  placeholder="Color Name (e.g. Puma Black)"
                                  value={clr.colorName}
                                  onChange={(e) => {
                                    const newColors = [...formData.colors];
                                    newColors[idx].colorName = e.target.value;
                                    setFormData(prev => ({ ...prev, colors: newColors }));
                                  }}
                                  className={`flex-1 px-2 py-1.5 border rounded text-xs focus:outline-none focus:border-red-600 transition-colors ${
                                    theme === "dark" ? "bg-[#0c0c0e] border-[#3a3a45] text-white" : "bg-white border-gray-300 text-gray-900"
                                  }`}
                                  required
                                />
                                <div className={`flex items-center border rounded overflow-hidden focus-within:border-red-600 transition-colors ${
                                  theme === "dark" ? "border-[#3a3a45] bg-[#0c0c0e]" : "border-gray-300 bg-white"
                                }`}>
                                  <input
                                    type="color"
                                    value={clr.colorCode}
                                    onChange={(e) => {
                                      const newColors = [...formData.colors];
                                      newColors[idx].colorCode = e.target.value;
                                      setFormData(prev => ({ ...prev, colors: newColors }));
                                    }}
                                    className="w-8 h-8 border-0 bg-transparent cursor-pointer p-0.5"
                                  />
                                  <input
                                    type="text"
                                    value={clr.colorCode}
                                    onChange={(e) => {
                                      const newColors = [...formData.colors];
                                      newColors[idx].colorCode = e.target.value;
                                      setFormData(prev => ({ ...prev, colors: newColors }));
                                    }}
                                    placeholder="#000000"
                                    className={`w-20 px-2 py-1.5 text-xs focus:outline-none bg-transparent ${
                                      theme === "dark" ? "text-white" : "text-gray-900"
                                    }`}
                                    required
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newColors = formData.colors.filter((_, i) => i !== idx);
                                    setFormData(prev => ({ ...prev, colors: newColors }));
                                  }}
                                  className={`p-1.5 rounded transition-colors ${
                                    theme === "dark" ? "text-gray-500 hover:text-red-400 hover:bg-red-950/30" : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                                  }`}
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Sizes Manager */}
                      <div className={`sm:col-span-2 space-y-3 border-t pt-4 mt-2 transition-colors ${theme === "dark" ? "border-[#1a1a1f]" : "border-gray-200"}`}>
                        <div className="flex justify-between items-center">
                          <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            Dynamic Sizes Inventory
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                sizes: [...prev.sizes, { size: "", stock: 0 }]
                              }));
                            }}
                            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                          >
                            <FiPlus /> ADD SIZE
                          </button>
                        </div>
                        
                        {formData.sizes.length === 0 ? (
                          <div className={`text-xs p-4 border border-dashed rounded-lg text-center ${
                            theme === "dark" ? "text-gray-500 border-[#23232a]" : "text-gray-400 border-gray-300"
                          }`}>
                            No dynamic sizes added. Schema default sizes will be used.
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {formData.sizes.map((sz, idx) => (
                              <div key={idx} className={`flex items-center gap-3 p-2 rounded-lg border ${
                                theme === "dark" ? "bg-[#131317] border-[#23232a]" : "bg-gray-50 border-gray-200"
                              }`}>
                                <input
                                  type="text"
                                  placeholder="Size (e.g. UK 8)"
                                  value={sz.size}
                                  onChange={(e) => {
                                    const newSizes = [...formData.sizes];
                                    newSizes[idx].size = e.target.value;
                                    setFormData(prev => ({ ...prev, sizes: newSizes }));
                                  }}
                                  className={`flex-1 px-2 py-1.5 border rounded text-xs focus:outline-none focus:border-red-600 transition-colors ${
                                    theme === "dark" ? "bg-[#0c0c0e] border-[#3a3a45] text-white" : "bg-white border-gray-300 text-gray-900"
                                  }`}
                                  required
                                />
                                <input
                                  type="number"
                                  placeholder="Stock"
                                  min="0"
                                  value={sz.stock}
                                  onChange={(e) => {
                                    const newSizes = [...formData.sizes];
                                    newSizes[idx].stock = Number(e.target.value);
                                    setFormData(prev => ({ ...prev, sizes: newSizes }));
                                  }}
                                  className={`w-24 px-2 py-1.5 border rounded text-xs focus:outline-none focus:border-red-600 transition-colors ${
                                    theme === "dark" ? "bg-[#0c0c0e] border-[#3a3a45] text-white" : "bg-white border-gray-300 text-gray-900"
                                  }`}
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSizes = formData.sizes.filter((_, i) => i !== idx);
                                    setFormData(prev => ({ ...prev, sizes: newSizes }));
                                  }}
                                  className={`p-1.5 rounded transition-colors ${
                                    theme === "dark" ? "text-gray-500 hover:text-red-400 hover:bg-red-950/30" : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                                  }`}
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Special Flags */}
                      <div className={`sm:col-span-2 grid grid-cols-2 gap-4 border-t pt-4 mt-2 transition-colors ${
                        theme === "dark" ? "border-[#1a1a1f]" : "border-gray-200"
                      }`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="edit-isTrending"
                            name="isTrending"
                            checked={formData.isTrending}
                            onChange={(e) => setFormData(prev => ({ ...prev, isTrending: e.target.checked }))}
                            className="w-4 h-4 rounded text-red-600 cursor-pointer"
                          />
                          <label htmlFor="edit-isTrending" className={`text-[10px] font-bold uppercase tracking-wider cursor-pointer select-none ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}>
                            Top Trending Product
                          </label>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="edit-isCollaboration"
                            name="isCollaboration"
                            checked={formData.isCollaboration}
                            onChange={(e) => setFormData(prev => ({ ...prev, isCollaboration: e.target.checked }))}
                            className="w-4 h-4 rounded text-red-600 cursor-pointer"
                          />
                          <label htmlFor="edit-isCollaboration" className={`text-[10px] font-bold uppercase tracking-wider cursor-pointer select-none ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}>
                            Collaboration Product
                          </label>
                        </div>
                      </div>

                      {/* Collaboration Name */}
                      {formData.isCollaboration && (
                        <div className="sm:col-span-2 space-y-1.5 animate-fadeIn">
                          <label className={`text-[10px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            Collaboration Brand Name
                          </label>
                          <input
                            type="text"
                            name="collaborationName"
                            value={formData.collaborationName}
                            onChange={handleInputChange}
                            placeholder="e.g. Hot Wheels"
                            className={`w-full px-3 py-2.5 border rounded-lg text-xs focus:outline-none focus:border-red-600 transition-colors ${
                              theme === "dark" ? "bg-[#131317] border-[#23232a] text-white" : "bg-white border-gray-300 text-gray-900"
                            }`}
                            required={formData.isCollaboration}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`p-6 border-t flex justify-end gap-3 transition-colors ${
                  theme === "dark" ? "border-[#1a1a1f] bg-[#0f0f11]" : "border-gray-200 bg-gray-50"
                }`}>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className={`px-4 py-2 border text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer ${
                      theme === "dark" ? "border-[#23232a] hover:bg-[#121215] text-gray-300" : "border-gray-300 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase rounded-lg transition-colors cursor-pointer"
                  >
                    Update Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
