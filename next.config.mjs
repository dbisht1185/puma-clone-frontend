/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['cdn.visa.com','www.npci.org.in','www.rupay.co.in','images.puma.com','cdn.sanity.io','images.unsplash.com','plus.unsplash.com','via.placeholder.com','media.istockphoto.com'], // Allow external images from this domain
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
        },
        {
          protocol: 'https',
          hostname: 'plus.unsplash.com',
        },
        {
          protocol: 'https',
          hostname: 'media.istockphoto.com',
        },
        {
          protocol: 'https',
          hostname: 'via.placeholder.com',
        },
        {
          protocol: 'https',
          hostname: 'images.puma.com',
        },
      ],
    },
  };
  
  export default nextConfig;
  