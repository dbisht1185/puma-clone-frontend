const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'productdetails', '[details]', 'page.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Fix the mangled block:
const mangledSpot = `    } else if (product?.color && !selectedColor) {
      setSelectedColor({ colorName: product.color, colorCode: product.colorCode || "#000000" });
    }
    if (qty > maxStock) {`;

const restoredBlock = `    } else if (product?.color && !selectedColor) {
      setSelectedColor({ colorName: product.color, colorCode: product.colorCode || "#000000" });
    }
  }, [product, selectedColor]);

  const productId = product?.productId || product?.slug;
  const inWishlist = productId ? isInWishlist(productId) : false;
  const isOutOfStock = (product?.stock || 0) === 0;
  
  // Available sizes dynamically pulled from database, falling back to static
  const sizes = product?.sizes || [];

  const basePrice = product?.basePrice || parsePrice(product?.price || 0);
  const discountType = product?.discountType || (product?.offerPrice ? "PERCENT" : null);
  const discountValue = product?.discountValue || (product?.offerPrice ? 20 : 0);
  
  const { unitPrice, discountAmount } = calculatePrice({
    basePrice,
    discountType,
    discountValue,
    quantity: selectedQty,
  });

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
  };

  const images = product?.images && product.images.length > 0 ? product.images : (product?.img ? [product.img] : []);

  const handleSelect = (qty) => {
    const selectedSizeData = sizes.find((s) => s.size === selectedSize);
    const maxStock = selectedSizeData?.stock || product?.stock || 10;
    
    if (qty > maxStock) {`;

if (content.includes(mangledSpot)) {
    content = content.replace(mangledSpot, restoredBlock);
    console.log("Restored missing block successfully.");
} else {
    console.log("Mangled spot not found. Maybe already restored?");
}

// 2. Fix the useQuery block to make sure it's perfect
const oldUseQueryBlock = `  const { data: product, isLoading: dbLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      try {
        const res = await productsApi.getProductByIdOrSlug(slug);
        if (res?.data?.status === "SUCCESS" && res?.data?.data) {
          return res.data.data;
        }
      } catch (err) {}
      // Fallback to CardDatas if backend fails or doesn't exist
      return CardDatas.find((item) => item.slug === slug || item.productId === slug) || null;
    },
    initialData: () => {
      return CardDatas.find((item) => item.slug === slug || item.productId === slug);
    },
    staleTime: Infinity,
  });

  const isLoading = dbLoading && !product;`;

// Wait, the current file HAS oldUseQueryBlock! Because I used replace chunk. Let's make sure it's there.
if (!content.includes('const isLoading = dbLoading && !product;')) {
    console.log("MISSING isLoading DEFINITION. Let's add it.");
    // This shouldn't happen, but just in case.
}

fs.writeFileSync(filePath, content);
console.log("Done fixing page.jsx");
