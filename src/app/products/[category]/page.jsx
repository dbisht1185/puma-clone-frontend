"use client";

import * as React from "react";
import { VscSettings } from "react-icons/vsc";
import { RiArrowDownSLine } from "react-icons/ri";
import { BiGridAlt } from "react-icons/bi";
import { TfiLayoutGrid4Alt } from "react-icons/tfi";
import { Drawer, useMediaQuery } from "@mui/material";
import { RxCross2 } from "react-icons/rx";
import FilterAccordian from "@/components/Products/FilterAccordian";
import Cards from "@/components/Products/Cards";
import { MdKeyboardArrowLeft } from "react-icons/md";
import Link from "next/link";
import Desription from "@/components/Products/Desription";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { CardDatas } from "@/constant/Products/Cards";
import { useMemo, useState, useCallback, useEffect } from "react";
import { debounce } from "@/utils/debounce";
import { parsePrice } from "@/utils/price";
import { productsApi } from "@/mocks/products";
import { useQuery } from "@tanstack/react-query";

const Page = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [sortOption, setSortOption] = React.useState(searchParams.get("sort") || "");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState({
    categories: searchParams.get("categories")?.split(",").filter(Boolean) || [],
    sizes: searchParams.get("sizes")?.split(",").filter(Boolean) || [],
    colors: searchParams.get("colors")?.split(",").filter(Boolean) || [],
    priceRange: [parseInt(searchParams.get("minPrice")) || 0, parseInt(searchParams.get("maxPrice")) || 45999],
    discount: searchParams.get("discount")?.split(",").filter(Boolean) || [],
    gender: searchParams.get("gender")?.split(",").filter(Boolean) || [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [displayCount, setDisplayCount] = useState(20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const getApiParamsFromRoute = (categoryParam) => {
    if (!categoryParam || categoryParam === 'all') return {};
    const cat = categoryParam.toLowerCase();
    
    // Map route params to correct API filters
    if (['men', 'women', 'kids'].includes(cat)) {
      return { gender: cat };
    } else if (['footwear', 'apparel', 'accessories', 'sports'].includes(cat)) {
      return { category: cat };
    } else if (cat === 'collaborations') {
      return { collaboration: 'true' };
    } else if (cat === 'new') {
      return { sort: 'newest' };
    }
    return { category: cat }; // fallback
  };

  // Base query for category/search to compute facet counts
  const { data: categoryProducts = [], isLoading: dbLoading } = useQuery({
    queryKey: ["products", params.category, searchQuery],
    queryFn: async () => {
      const routeParams = getApiParamsFromRoute(params.category);
      const res = await productsApi.getProducts({
        ...routeParams,
        search: searchQuery || undefined,
      });
      return res.data?.status === "SUCCESS" ? res.data.data : [];
    },
    initialData: [],
  });

  // Dynamic query that sends all filters to the backend
  const { data: filteredProducts = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ["filteredProducts", params.category, searchQuery, filters, sortOption],
    queryFn: async () => {
      const routeParams = getApiParamsFromRoute(params.category);
      
      const apiParams = {
        ...routeParams,
        search: searchQuery || undefined,
        sort: sortOption || undefined,
        colors: filters.colors.length > 0 ? filters.colors.join(',') : undefined,
        sizes: filters.sizes.length > 0 ? filters.sizes.join(',') : undefined,
        discount: filters.discount.length > 0 ? filters.discount.join(',') : undefined,
      };

      // If explicit gender filters are selected, they override the route param
      if (filters.gender.length > 0) {
        apiParams.gender = filters.gender.join(',');
      }
      
      // If explicit category filters are selected, they override the route param
      if (filters.categories && filters.categories.length > 0) {
        apiParams.category = filters.categories.join(',');
      }

      if (filters.priceRange[0] > 0 || filters.priceRange[1] < 45999) {
        apiParams.minPrice = filters.priceRange[0];
        apiParams.maxPrice = filters.priceRange[1];
      }

      const res = await productsApi.getProducts(apiParams);
      return res.data?.status === "SUCCESS" ? res.data.data : [];
    },
  });



  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };
  const isSmallScreen = useMediaQuery("(max-width: 500px)");

  // Update URL when filters/sort/search change
  const updateURL = useCallback((updates) => {
    const urlParams = new URLSearchParams(searchParams.toString());
    
    if (updates.searchQuery !== undefined) {
      if (updates.searchQuery) urlParams.set("q", updates.searchQuery);
      else urlParams.delete("q");
    }
    
    if (updates.sortOption !== undefined) {
      if (updates.sortOption) urlParams.set("sort", updates.sortOption);
      else urlParams.delete("sort");
    }
    
    router.push(`/products/${params.category}?${urlParams.toString()}`, { scroll: false });
  }, [searchParams, router, params.category]);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((query) => updateURL({ searchQuery: query }), 300),
    [updateURL]
  );

  // Update URL with filter params
  const updateFiltersURL = useCallback((newFilters) => {
    const urlParams = new URLSearchParams(searchParams.toString());
    
    if (newFilters.categories.length > 0) {
      urlParams.set("categories", newFilters.categories.join(","));
    } else {
      urlParams.delete("categories");
    }
    
    if (newFilters.sizes.length > 0) {
      urlParams.set("sizes", newFilters.sizes.join(","));
    } else {
      urlParams.delete("sizes");
    }
    
    if (newFilters.colors.length > 0) {
      urlParams.set("colors", newFilters.colors.join(","));
    } else {
      urlParams.delete("colors");
    }
    
    if (newFilters.discount.length > 0) {
      urlParams.set("discount", newFilters.discount.join(","));
    } else {
      urlParams.delete("discount");
    }
    
    if (newFilters.gender.length > 0) {
      urlParams.set("gender", newFilters.gender.join(","));
    } else {
      urlParams.delete("gender");
    }
    
    if (newFilters.priceRange[0] > 0 || newFilters.priceRange[1] < 45999) {
      urlParams.set("minPrice", newFilters.priceRange[0].toString());
      urlParams.set("maxPrice", newFilters.priceRange[1].toString());
    } else {
      urlParams.delete("minPrice");
      urlParams.delete("maxPrice");
    }
    
    router.push(`/products/${params.category}?${urlParams.toString()}`, { scroll: false });
  }, [searchParams, router, params.category]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    updateFiltersURL(newFilters);
  }, [updateFiltersURL]);

  // Calculate all filter counts based on current filtered products (before applying that specific filter)
  const filterCounts = useMemo(() => {
    // Start with products filtered by search and category (already done by the categoryProducts query)
    let baseFiltered = [...categoryProducts];

    // Apply price filter (if not default)
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 45999) {
      baseFiltered = baseFiltered.filter((item) => {
        const price = parsePrice(item.offerPrice || item.price);
        return price >= filters.priceRange[0] && price <= filters.priceRange[1];
      });
    }

    // Apply other active filters (except the one being counted)
    // For gender counts, exclude gender filter
    let genderFiltered = baseFiltered.filter((item) => {
      if (filters.colors.length > 0) {
        const itemName = item.name?.toLowerCase() || "";
        const matchesColor = filters.colors.some((color) => {
          const colorMap = {
            black: ["black", "navy"],
            white: ["white"],
            gray: ["gray", "grey"],
            blue: ["blue"],
            red: ["red"],
            green: ["green"],
            yellow: ["yellow"],
            orange: ["orange"],
            purple: ["purple"],
            brown: ["brown", "tan"],
            pink: ["pink"],
            "multi-colored": ["multi"],
          };
          const keywords = colorMap[color] || [color];
          return keywords.some((keyword) => itemName.includes(keyword));
        });
        if (!matchesColor) return false;
      }

      if (filters.discount.length > 0) {
        if (!item.offerPrice) return false;
        const basePrice = parsePrice(item.price);
        const offerPrice = parsePrice(item.offerPrice);
        const discountPercent = ((basePrice - offerPrice) / basePrice) * 100;
        const matchesDiscount = filters.discount.some((discountFilter) => {
          if (discountFilter === "15") return discountPercent >= 15 && discountPercent < 20;
          if (discountFilter === "less-than-20") return discountPercent < 20;
          if (discountFilter === "20-29") return discountPercent >= 20 && discountPercent < 30;
          if (discountFilter === "30-39") return discountPercent >= 30 && discountPercent < 40;
          return false;
        });
        if (!matchesDiscount) return false;
      }

      return true;
    });

    // For color counts, exclude color filter
    let colorFiltered = baseFiltered.filter((item) => {
      if (filters.gender.length > 0) {
        const itemGender = item.gender || "unisex-adults";
        const matchesGender = filters.gender.some((selectedGender) => {
          if (selectedGender === "boys") return itemGender === "boys" || itemGender === "unisex-kids";
          if (selectedGender === "female") return itemGender === "female" || itemGender === "women";
          if (selectedGender === "male") return itemGender === "male" || itemGender === "men";
          if (selectedGender === "unisex") return itemGender === "unisex" || itemGender === "unisex-adults";
          if (selectedGender === "unisex-adults") return itemGender === "unisex-adults";
          if (selectedGender === "unisex-kids") return itemGender === "unisex-kids";
          return itemGender === selectedGender;
        });
        if (!matchesGender) return false;
      }

      if (filters.discount.length > 0) {
        if (!item.offerPrice) return false;
        const basePrice = parsePrice(item.price);
        const offerPrice = parsePrice(item.offerPrice);
        const discountPercent = ((basePrice - offerPrice) / basePrice) * 100;
        const matchesDiscount = filters.discount.some((discountFilter) => {
          if (discountFilter === "15") return discountPercent >= 15 && discountPercent < 20;
          if (discountFilter === "less-than-20") return discountPercent < 20;
          if (discountFilter === "20-29") return discountPercent >= 20 && discountPercent < 30;
          if (discountFilter === "30-39") return discountPercent >= 30 && discountPercent < 40;
          return false;
        });
        if (!matchesDiscount) return false;
      }

      return true;
    });

    // For discount counts, exclude discount filter
    let discountFiltered = baseFiltered.filter((item) => {
      if (filters.gender.length > 0) {
        const itemGender = item.gender || "unisex-adults";
        const matchesGender = filters.gender.some((selectedGender) => {
          if (selectedGender === "boys") return itemGender === "boys" || itemGender === "unisex-kids";
          if (selectedGender === "female") return itemGender === "female" || itemGender === "women";
          if (selectedGender === "male") return itemGender === "male" || itemGender === "men";
          if (selectedGender === "unisex") return itemGender === "unisex" || itemGender === "unisex-adults";
          if (selectedGender === "unisex-adults") return itemGender === "unisex-adults";
          if (selectedGender === "unisex-kids") return itemGender === "unisex-kids";
          return itemGender === selectedGender;
        });
        if (!matchesGender) return false;
      }

      if (filters.colors.length > 0) {
        const itemName = item.name?.toLowerCase() || "";
        const matchesColor = filters.colors.some((color) => {
          const colorMap = {
            black: ["black", "navy"],
            white: ["white"],
            gray: ["gray", "grey"],
            blue: ["blue"],
            red: ["red"],
            green: ["green"],
            yellow: ["yellow"],
            orange: ["orange"],
            purple: ["purple"],
            brown: ["brown", "tan"],
            pink: ["pink"],
            "multi-colored": ["multi"],
          };
          const keywords = colorMap[color] || [color];
          return keywords.some((keyword) => itemName.includes(keyword));
        });
        if (!matchesColor) return false;
      }

      return true;
    });

    // Gender counts (using genderFiltered - excludes color and discount filters)
    const genderCounts = {
      boys: 0,
      female: 0,
      male: 0,
      unisex: 0,
      "unisex-adults": 0,
      "unisex-kids": 0,
    };

    genderFiltered.forEach((item) => {
      const gender = item.gender || "unisex-adults";
      if (gender === "boys" || gender === "unisex-kids") {
        genderCounts.boys++;
        if (gender === "unisex-kids") genderCounts["unisex-kids"]++;
      }
      if (gender === "female" || gender === "women") genderCounts.female++;
      if (gender === "male" || gender === "men") genderCounts.male++;
      if (gender === "unisex" || gender === "unisex-adults") {
        genderCounts.unisex++;
        if (gender === "unisex-adults") genderCounts["unisex-adults"]++;
      }
    });

    // Color counts (using colorFiltered - excludes gender and discount filters)
    const colorCounts = {
      black: 0,
      gray: 0,
      brown: 0,
      blue: 0,
      green: 0,
      orange: 0,
      tan: 0,
      yellow: 0,
      red: 0,
      purple: 0,
      pink: 0,
      white: 0,
      "multi-colored": 0,
    };

    colorFiltered.forEach((item) => {
      const itemName = item.name?.toLowerCase() || "";
      const colorMap = {
        black: ["black", "navy"],
        white: ["white"],
        gray: ["gray", "grey"],
        blue: ["blue"],
        red: ["red"],
        green: ["green"],
        yellow: ["yellow"],
        orange: ["orange"],
        purple: ["purple"],
        brown: ["brown", "tan"],
        pink: ["pink"],
        "multi-colored": ["multi"],
      };

      Object.keys(colorMap).forEach((color) => {
        const keywords = colorMap[color];
        if (keywords.some((keyword) => itemName.includes(keyword))) {
          colorCounts[color]++;
        }
      });
    });

    // Discount counts (using discountFiltered - excludes gender and color filters)
    const discountCounts = {
      "15": 0,
      "less-than-20": 0,
      "20-29": 0,
      "30-39": 0,
    };

    discountFiltered.forEach((item) => {
      if (!item.offerPrice) return;
      const basePrice = parsePrice(item.price);
      const offerPrice = parsePrice(item.offerPrice);
      const discountPercent = ((basePrice - offerPrice) / basePrice) * 100;

      if (discountPercent >= 15 && discountPercent < 20) discountCounts["15"]++;
      if (discountPercent < 20) discountCounts["less-than-20"]++;
      if (discountPercent >= 20 && discountPercent < 30) discountCounts["20-29"]++;
      if (discountPercent >= 30 && discountPercent < 40) discountCounts["30-39"]++;
    });

    // Category counts (all products are footwear for now)
    const categoryCounts = {
      footwear: baseFiltered.length,
      apparel: 0,
      accessories: 0,
    };

    // Size counts (we don't have size data in products, so return empty or default)
    const sizeCounts = {};

    return {
      gender: genderCounts,
      color: colorCounts,
      discount: discountCounts,
      category: categoryCounts,
      size: sizeCounts,
    };
  }, [filters.priceRange, filters.colors, filters.discount, filters.gender, categoryProducts]);

  // Handle search input
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortOption(value);
    updateURL({ sortOption: value });
  };

  // Format category name for display
  const getCategoryDisplayName = (category) => {
    if (!category) return "ALL PRODUCTS";
    
    const categoryMap = {
      men: "MEN",
      women: "WOMEN",
      kids: "KIDS",
      sports: "SPORTS",
      motorsports: "MOTORSPORTS",
      collaborations: "COLLABORATIONS",
      outlet: "OUTLET",
      new: "NEW ARRIVALS",
      all: "ALL PRODUCTS"
    };
    
    const normalizedCategory = category.toLowerCase();
    return categoryMap[normalizedCategory] || category.toUpperCase();
  };

  const categoryDisplayName = getCategoryDisplayName(params.category);

  // Get products to display (for infinite scroll)
  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, displayCount);
  }, [filteredProducts, displayCount]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(20);
  }, [searchQuery, filters, sortOption]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      // Check if user has scrolled near the bottom
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500 &&
        !isLoadingMore &&
        displayedProducts.length < filteredProducts.length
      ) {
        setIsLoadingMore(true);
        // Simulate loading delay for better UX
        setTimeout(() => {
          setDisplayCount((prev) => Math.min(prev + 20, filteredProducts.length));
          setIsLoadingMore(false);
        }, 300);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoadingMore, displayedProducts.length, filteredProducts.length]);

  return (
    <div className="w-full flex flex-col md:px-10 px-3 py-8 gap-5 relative">
      <div className="flex items-center md:gap-5 gap-0 text-sm">
        <Link href="/" className="block md:hidden text-center cursor-pointer">
          <MdKeyboardArrowLeft size={30} />
        </Link>
        <Link href="/" className="cursor-pointer">
        <ul>
          <li className="text-[18px] font-bold">Home</li>
        </ul>
        </Link>
        
        <span className="text-gray-400 text-[20px] hidden md:block">•</span>
        <ol className="hidden md:block">
          <li className="text-[17px]">{categoryDisplayName}</li>
        </ol>
      </div>

      <div className="w-full">
        <div className="text-[35px] font-bold">{categoryDisplayName}</div>
      </div>

      {/* Search Bar */}
      <div className="w-full">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full border border-gray-300 px-4 py-3 text-[16px] rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
          aria-label="Search products"
        />
      </div>

      <div className="relative">
        <div className="border-b absolute md:left-[-40px] left-[-8px] md:right-[-40px] right-[-8px] top-0 text-[#B2B2B2]"></div>
      </div>

      <div className="flex w-full justify-between items-center">
        <div className="px-5 py-2 flex gap-2 items-center border-[#B2B2B2] hover:border-black cursor-pointer border">
          <button onClick={toggleDrawer(true)} className="text-[16px] font-bold cursor-pointer">
            FILTERS
          </button>
          <Drawer
            open={open}
            onClose={toggleDrawer(false)}
            PaperProps={{
              sx: { width: isSmallScreen ? "100vw" : "450px" },
            }}
          >
            <div className="p-5 flex flex-col w-full gap-5">
              <div className="w-full flex justify-between items-center">
                <div className="text-[20px] font-bold">Products Filters</div>
                <div className="w-10 h-10 flex items-center justify-center hover:rounded-full hover:bg-[#c2c2c2]">
                  <RxCross2
                    onClick={toggleDrawer(false)}
                    className="md:text-[45px] text-[35px] cursor-pointer p-2"
                  />
                </div>
              </div>
              <div className="relative">
                <div className="border-b absolute left-[-20px] right-[-20px] top-0 text-[#B2B2B2]"></div>
              </div>
              <div className="w-full">
                <FilterAccordian 
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  filterCounts={filterCounts}
                />
              </div>
              <div>
                <button 
                  onClick={toggleDrawer(false)}
                  className="w-full h-15 bg-black text-white text-[20px] cursor-pointer hover:bg-gray-800 transition-colors font-bold py-3 rounded">
                  SHOW {filteredProducts.length} {filteredProducts.length === 1 ? "PRODUCT" : "PRODUCTS"}
                </button>
              </div>
            </div>
          </Drawer>
          <div className="cursor-pointer">
            <VscSettings className="text-[25px]" />
          </div>
        </div>

        <div className="relative border inline-block">
          <select
            value={sortOption}
            onChange={handleSortChange}
            className="px-2 py-2 border border-[#B2B2B2] hover:border-black text-[16px] font-bold cursor-pointer appearance-none w-auto min-w-[200px] bg-white"
            aria-label="Sort products"
          >
            <option value="" disabled>
              SORT BY
            </option>
            <option value="discount-high-low">Discount High To Low</option>
            <option value="best-matches">Best Matches</option>
            <option value="top-sellers">Top Sellers</option>
            <option value="price-low-high">Price Low To High</option>
            <option value="price-high-low">Price High To Low</option>
            <option value="newest">Newest</option>
          </select>
          <RiArrowDownSLine className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[25px]" />
        </div>
      </div>

      <div className="relative">
        <div className="border-b absolute md:left-[-40px] left-[-8px] md:right-[-40px] right-[-8px] top-0 text-[#B2B2B2]"></div>
      </div>

      <div className="w-full flex justify-between items-center">
        <div className="text-[18px] md:text-[20px] font-bold text-gray-900">
          {filteredProducts.length === 0 ? (
            <span className="text-gray-500">No Products Found</span>
          ) : (
            <span>
              {filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"}
            </span>
          )}
        </div>
        <div className="flex gap-3 items-center">
          <div className="cursor-pointer hover:opacity-70 transition-opacity">
            <BiGridAlt className="text-[25px]" />
          </div>
          <div className="cursor-pointer hover:opacity-70 transition-opacity">
            <TfiLayoutGrid4Alt className="text-[22px]" />
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-20 px-4">
          <div className="max-w-md text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              No Products Found
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              {searchQuery
                ? `We couldn't find any products matching "${searchQuery}". Try adjusting your search or filters.`
                : "We couldn't find any products matching your criteria. Try adjusting your filters or browse other categories."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilters({
                      categories: [],
                      sizes: [],
                      colors: [],
                      priceRange: [0, 45999],
                      discount: [],
                    });
                    router.push(`/products/${params.category}`);
                  }}
                  className="px-6 py-3 bg-black text-white font-bold rounded hover:bg-gray-800 transition-colors cursor-pointer">
                  Clear Search
                </button>
              )}
              <Link
                href="/products/all"
                className="px-6 py-3 border-2 border-black text-black font-bold rounded hover:bg-gray-100 transition-colors cursor-pointer text-center">
                Browse All Products
              </Link>
            </div>
          </div>
        </div>
            ) : (
              <div>
                <Cards filteredProducts={displayedProducts} />
                {isLoadingMore && (
                  <div className="flex justify-center items-center py-8">
                    <div className="text-gray-500 text-lg">Loading more products...</div>
                  </div>
                )}
                {displayedProducts.length >= filteredProducts.length && filteredProducts.length > 20 && (
                  <div className="flex justify-center items-center py-8">
                    <div className="text-gray-500 text-lg">You've reached the end</div>
                  </div>
                )}
              </div>
            )}
      <div>
        <Desription/>
      </div>
    </div>
  );
};

export default Page;
