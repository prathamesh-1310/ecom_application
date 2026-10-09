import prisma from './config/prisma.js';

async function seedBanners() {
  console.log('🌱 Seeding sample banners...');

  // Clear existing banners
  await prisma.banner.deleteMany({});

  const sampleBanners = [
    {
      title: 'Aurelia 14K Gold Collection',
      subtitle: 'Handcrafted Solid 14K Gold & Biocompatible ASTM F136 Titanium Piercings',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1920&q=80',
      link: '/catalog',
      visibility: 'BOTH',
      platform: 'BOTH',
      displayOrder: 1,
      status: 'ACTIVE',
    },
    {
      title: 'Autumn Piercing & Body Jewelry Festival',
      subtitle: 'Exclusive Designer Nose Rings, Septums & Ear Clickers — Up to 30% Off',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1920&q=80',
      link: '/catalog',
      visibility: 'BOTH',
      platform: 'BOTH',
      displayOrder: 2,
      status: 'ACTIVE',
    },
    {
      title: 'Wholesale Studio Supplies & Volume Discounts',
      subtitle: 'Direct B2B Wholesale Tiers & Bulk Ordering for Verified Piercing Studios',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1920&q=80',
      link: '/b2b/catalog',
      visibility: 'BOTH',
      platform: 'BOTH',
      displayOrder: 3,
      status: 'ACTIVE',
    },
  ];

  for (const b of sampleBanners) {
    await prisma.banner.create({ data: b });
  }

  console.log('✅ Successfully seeded 3 sample banners!');
}

seedBanners()
  .catch((err) => {
    console.error('❌ Error seeding banners:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
