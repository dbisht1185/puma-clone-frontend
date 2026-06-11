const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'productdetails', '[details]', 'page.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. decodeURIComponent
content = content.replace(
    'const slug = params.details;',
    'const slug = decodeURIComponent(params.details);'
);

// 2. update useQuery
const oldQuery = `  const { data: product = {
    productId: slug,
    slug: slug,
    name: "Easy Rider Leather Unisex Sneakers",
    price: "₹8,999",
    offerPrice: "₹7,199",
    description: "",
    img: "/Images/Products/cards/Easy-Rider-Leather-Unisex-Sneakers2.jpeg",
    basePrice: 8999,
    discountType: "PERCENT",
    discountValue: 20,
    stock: 10,
  }, isLoading: dbLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const res = await productsApi.getProductByIdOrSlug(slug);
      return res.data?.status === "SUCCESS" ? res.data.data : null;
    },
    initialData: () => {
      return CardDatas.find((item) => item.slug === slug || item.productId === slug);
    },
  });`;

const newQuery = `  const { data: product, isLoading: dbLoading } = useQuery({
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

if (content.includes(oldQuery)) {
    content = content.replace(oldQuery, newQuery);
} else {
    console.error("COULD NOT FIND oldQuery");
}

// 3. Fallback for sizes and images
const oldSizes = `  // Available sizes dynamically pulled from database, falling back to static
  const sizes = product?.sizes && product.sizes.length > 0 ? product.sizes : [
    { size: "UK 5", stock: 3 },
    { size: "UK 6", stock: 5 },
    { size: "UK 11", stock: 2 },
    { size: "UK 12", stock: 0 },
    { size: "UK 13", stock: 1 },
  ];`;
if (content.includes(oldSizes)) {
    content = content.replace(oldSizes, `  // Available sizes dynamically pulled from database, falling back to static\n  const sizes = product?.sizes || [];`);
} else {
    console.error("COULD NOT FIND oldSizes");
}

const oldImages = `  const images = product?.images && product.images.length > 0 ? product.images : [
    product?.img || "/Images/Products/cards/Easy-Rider-Leather-Unisex-Sneakers2.jpeg",
    "/Images/Products/cards/Easy-Rider-Leather-Unisex-Sneakers (6).jpeg",
    "/Images/Products/cards/Easy-Rider-Mesh-Unisex-Sneakers.jpeg",
  ];`;
if (content.includes(oldImages)) {
    content = content.replace(oldImages, `  const images = product?.images && product.images.length > 0 ? product.images : (product?.img ? [product.img] : []);`);
} else {
    console.error("COULD NOT FIND oldImages");
}

// 4. Update Photos component
content = content.replace(
    '<Photos />',
    '<Photos images={images} />'
);

// 5. Add loading and error state rendering
const returnStatementIndex = content.indexOf('  return (');

const notFoundAndLoading = `
  if (isLoading) {
    return (
      <div className="w-full lg:px-10 px-3 py-10 flex flex-col gap-5 min-h-[60vh] justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black"></div>
        <div className="text-xl font-bold mt-4">Loading Product Details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full lg:px-10 px-3 py-10 flex flex-col gap-5 min-h-[60vh] justify-center items-center text-center">
        <h1 className="text-4xl font-bold text-gray-800">Product Not Found</h1>
        <p className="text-lg text-gray-600 mt-2">The product you are looking for does not exist or has been removed.</p>
        <Link href="/" className="mt-6 px-6 py-3 bg-black text-white font-bold rounded-sm hover:bg-gray-800 transition-colors">
          RETURN TO HOME
        </Link>
      </div>
    );
  }

`;

if (!content.includes('if (isLoading) {')) {
    content = content.slice(0, returnStatementIndex) + notFoundAndLoading + content.slice(returnStatementIndex);
}

fs.writeFileSync(filePath, content);
console.log('Successfully refactored page.jsx exactly.');
