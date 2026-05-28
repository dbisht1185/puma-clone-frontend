"use client";
import { useState, useEffect, useMemo } from "react";
import { debounce } from "@/utils/debounce";
import { useRouter } from "next/navigation";
import { RxCross2 } from "react-icons/rx";
import SearchIcon from "@mui/icons-material/Search";
import Link from "next/link";
import { productsApi } from "@/mocks/products";
import { CardDatas } from "@/constant/Products/Cards";

const SearchBox = ({ handleSearch }) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Dynamic State for default view
  const [recentProducts, setRecentProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);

  // Fetch initial data (Recently Viewed from localstorage + Trending from API)
  useEffect(() => {
    // 1. Get Recently Viewed from LocalStorage
    try {
      const stored = localStorage.getItem("recentlyViewed");
      if (stored) {
        setRecentProducts(JSON.parse(stored).slice(0, 4)); // Show top 4
      }
    } catch (e) {
      console.error("Error reading recently viewed from localStorage", e);
    }

    // 2. Fetch Trending Searches (Trending Products)
    const fetchTrending = async () => {
      try {
        const res = await productsApi.getProducts({ trending: true });
        if (res?.data?.status === "SUCCESS") {
          // Get distinct search terms (we can just use the product names or categories)
          // Here we just display top 5 trending products as quick search pills
          setTrendingProducts(res.data.data.slice(0, 5));
        }
      } catch (e) {
        console.error("Error fetching trending products", e);
      } finally {
        setIsLoadingTrending(false);
      }
    };
    
    fetchTrending();
  }, []);

  const handleSearchDebounced = useMemo(
    () => debounce((value) => setDebouncedQuery(value), 500),
    []
  );

  const handleQueryChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    handleSearchDebounced(value);
  };

  // Effect triggers only when debouncedQuery changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const fetchSearchResults = async () => {
      setIsLoading(true);
      try {
        const res = await productsApi.getProducts({ search: debouncedQuery, q: debouncedQuery });
        if (res && res.data && res.data.status === "SUCCESS" && res.data.data?.length > 0) {
          setResults(res.data.data);
        } else {
          // Fallback to client-side filtering of static CardDatas if database has no matches
          const normalizedQuery = debouncedQuery.toLowerCase();
          const filteredStatic = CardDatas.filter(
            (p) =>
              p.name?.toLowerCase().includes(normalizedQuery) ||
              p.description?.toLowerCase().includes(normalizedQuery)
          );
          setResults(filteredStatic);
        }
      } catch (error) {
        console.error("Search API error:", error);
        // Graceful fallback to static card data filter on API/Network failure
        const normalizedQuery = debouncedQuery.toLowerCase();
        const filteredStatic = CardDatas.filter(
          (p) =>
            p.name?.toLowerCase().includes(normalizedQuery) ||
            p.description?.toLowerCase().includes(normalizedQuery)
        );
        setResults(filteredStatic);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [debouncedQuery]);

  // Handle enter key to search all products
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/products/all?q=${encodeURIComponent(query.trim())}`);
        handleSearch(); // Close search drawer
      }
    }
  };

  // Handle click on search icon
  const handleIconSearch = () => {
    if (query.trim()) {
      router.push(`/products/all?q=${encodeURIComponent(query.trim())}`);
      handleSearch(); // Close search drawer
    }
  };

  return (
    <div className="text-black w-full h-[95vh] flex flex-col bg-white">
      {/* Header Search Bar Area */}
      <div className="w-full h-24 flex items-center gap-5 bg-[#F6F7F8] px-6 md:px-10 border-b border-gray-200">
        <div className="w-full md:h-14 h-12 relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            autoFocus
            placeholder="SEARCH PUMA.COM"
            className="border border-gray-300 w-full h-full md:px-6 px-4 bg-white text-lg focus:outline-none focus:border-black transition-colors rounded-none placeholder:text-gray-400 pr-24 shadow-inner"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setDebouncedQuery("");
              }}
              aria-label="Clear search"
              className="absolute p-2 md:right-14 right-12 h-10 w-10 hover:bg-gray-100 hover:rounded-full cursor-pointer flex items-center justify-center transition-all text-gray-500 hover:text-black z-10"
            >
              <RxCross2 size={22} />
            </button>
          )}
          <button
            onClick={handleIconSearch}
            aria-label="Search"
            className="absolute p-2 md:right-3 right-2 h-10 w-10 hover:bg-gray-100 hover:rounded-full cursor-pointer flex items-center justify-center transition-all z-10"
          >
            <SearchIcon
              className="text-gray-700 hover:text-black"
              sx={{
                fontSize: {
                  xs: "22px",
                  sm: "25px",
                  md: "28px",
                  lg: "30px",
                },
              }}
            />
          </button>
        </div>

        <button
          onClick={handleSearch}
          aria-label="Close search"
          className="w-10 h-10 flex items-center justify-center bg-[#F6F7F8] hover:rounded-full hover:bg-gray-200 transition-all cursor-pointer group"
        >
          <RxCross2
            className="md:text-[40px] text-[30px] text-gray-700 cursor-pointer p-1.5 transition-transform duration-300 group-hover:rotate-90"
          />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full overflow-y-auto px-6 md:px-10 py-8 bg-white">
        {/* Loading progress bar */}
        {isLoading && (
          <div className="w-full h-1 bg-gray-100 overflow-hidden relative mb-6">
            <div className="absolute top-0 left-0 h-full bg-red-600 animate-pulse w-full"></div>
          </div>
        )}

        {/* Dynamic Results vs Default Suggestions */}
        {query.trim() === "" ? (
          <div className="w-full grid lg:grid-cols-3 grid-cols-1 gap-12 animate-fadeIn">
            {/* Trending searches */}
            <div className="flex flex-col">
              <h1 className="text-lg font-bold mb-6 tracking-wider text-gray-900 border-b-2 border-black pb-2 inline-block w-fit">
                {"Trending Searches".toUpperCase()}
              </h1>
              
              <div className="flex flex-wrap gap-3">
                {isLoadingTrending ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="h-10 w-24 bg-gray-100 rounded-full animate-pulse"></div>
                  ))
                ) : trendingProducts.length > 0 ? (
                  trendingProducts.map((product, index) => (
                    <Link
                      key={product._id || index}
                      href={`/productdetails/${product.slug || product.productId}`}
                      onClick={handleSearch}
                      className="px-4 py-2 bg-[#F6F7F8] hover:bg-black hover:text-white text-sm font-semibold text-gray-700 rounded-full transition-colors duration-300 border border-transparent cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <SearchIcon sx={{ fontSize: 16 }} />
                      <span className="truncate max-w-[150px]">{product.name.split(' ')[0]} {product.name.split(' ')[1] || ''}</span>
                    </Link>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm italic">Check back later for trends</div>
                )}
              </div>
            </div>

            {/* Recently viewed */}
            <div className="flex flex-col col-span-1 lg:col-span-2">
              <h1 className="text-lg font-bold mb-6 tracking-wider text-gray-900 border-b-2 border-black pb-2 inline-block w-fit">
                {"Recently Viewed".toUpperCase()}
              </h1>

              {recentProducts.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {recentProducts.map((item, index) => (
                    <div
                      key={index}
                      className="group flex flex-col gap-2 p-3 rounded-lg hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200 cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <div className="w-full aspect-square overflow-hidden rounded bg-gray-100 relative">
                        <img
                          src={item.img}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex flex-col justify-between flex-1 mt-1">
                        <h2 className="text-xs font-bold text-gray-800 group-hover:text-red-600 line-clamp-2 leading-tight">
                          {item.name}
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                          {item.offerPrice ? (
                            <>
                              <span className="text-red-600 font-bold text-sm">
                                {item.offerPrice}
                              </span>
                              <span className="line-through text-gray-400 text-xs">
                                {item.price || item.actualPrice}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-900 font-bold text-sm">
                              {item.price || item.actualPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full h-32 flex items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded text-gray-500 text-sm">
                  You haven't viewed any products recently.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Search Results Section */
          <div className="w-full min-h-[50vh] flex flex-col animate-fadeIn">
            {/* Header / Summary */}
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 tracking-wider">
                SEARCH RESULTS FOR "{query.toUpperCase()}"
              </h2>
              <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {results.length} {results.length === 1 ? "Product" : "Products"} Found
              </span>
            </div>

            {/* Results Grid */}
            {results.length > 0 ? (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {results.slice(0, 8).map((product) => (
                    <Link
                      key={product._id || product.productId}
                      href={`/productdetails/${product.slug || product.productId}`}
                      onClick={handleSearch}
                      className="group flex flex-col bg-white border border-gray-100 rounded hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                    >
                      {/* Image Container */}
                      <div className="aspect-square w-full bg-gray-50 overflow-hidden relative">
                        <img
                          src={product.img}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {product.discountValue > 0 && (
                          <div className="absolute top-2 left-2 bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 tracking-wider uppercase">
                            SAVE {product.discountValue}%
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
                            {product.gender || "UNISEX"}
                          </p>
                          <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
                            {product.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          {product.offerPrice ? (
                            <>
                              <span className="text-red-600 font-bold text-sm">
                                {product.offerPrice}
                              </span>
                              <span className="line-through text-gray-400 text-xs">
                                {product.price}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-900 font-bold text-sm">
                              {product.price}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* View All Search Results Button */}
                <div className="w-full flex justify-center mt-6">
                  <Link
                    href={`/products/all?q=${encodeURIComponent(query.trim())}`}
                    onClick={handleSearch}
                    className="px-8 py-3 bg-black hover:bg-red-600 text-white font-bold text-sm tracking-wider uppercase transition-all duration-300 hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5 text-center min-w-[200px]"
                  >
                    View All {results.length} Results
                  </Link>
                </div>
              </div>
            ) : (
              /* No Results State */
              !isLoading && (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400 text-4xl">
                    🔍
                  </div>
                  <h3 className="text-xl font-bold text-gray-850 mb-2">NO PRODUCTS FOUND</h3>
                  <p className="text-gray-500 max-w-md px-6">
                    We couldn't find any products matching "{query}". Try checking your spelling or using more general terms like "shoes" or "running".
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBox;
