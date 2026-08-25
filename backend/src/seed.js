import bcrypt from 'bcryptjs';
import prisma from './config/prisma.js';

async function seed() {
  console.log('🌱 Seeding Piercing E-commerce Database...');

  // 1. Create Policy Version
  await prisma.policyVersion.create({
    data: {
      platform: 'ALL',
      policyName: 'No Return and No Refund Policy',
      version: '1.0',
      status: 'ACTIVE',
      content: `Official Piercing Jewelry Policy (Version 1.0):
1. All purchases are final. Products cannot be returned, exchanged, or refunded after order placement.
2. Due to strict body piercing hygiene, safety, and health standards, piercing jewelry and tools are non-returnable.
3. Incorrect size, color, or material selection by the customer does not qualify for an exchange or refund.
4. Exceptional cases (damaged upon arrival or fulfillment errors) may be reviewed by an admin via the support portal with photo/video proof within 48 hours of delivery.`,
    },
  });

  // 2. Create Users (Super Admin, Retail Customer, B2B Approved Customer, B2B Pending Customer)
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@brandname.com',
      passwordHash: adminPassword,
      role: 'SUPER_ADMIN',
      phone: '+91 9876543210',
    },
  });

  const retailUser = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'elena@example.com',
      passwordHash: userPassword,
      role: 'RETAIL_CUSTOMER',
      phone: '+91 9812345678',
      addresses: {
        create: {
          fullName: 'Elena Rostova',
          phone: '+91 9812345678',
          addressLine1: '402 Luxury Heights, Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400050',
          country: 'India',
          isDefault: true,
        },
      },
    },
  });

  const b2bUserApproved = await prisma.user.create({
    data: {
      name: 'Marcus Vance',
      email: 'marcus@inkandpierce.com',
      passwordHash: userPassword,
      role: 'B2B_CUSTOMER',
      b2bApprovalStatus: 'APPROVED',
      companyName: 'Ink & Needle Studios LLC',
      gstNumber: '27AAAAA0000A1Z5',
      businessType: 'Piercing Studio',
      expectedVolume: '100-500 units/month',
      phone: '+91 9765432109',
    },
  });

  await prisma.b2BApplication.create({
    data: {
      userId: b2bUserApproved.id,
      companyName: 'Ink & Needle Studios LLC',
      gstNumber: '27AAAAA0000A1Z5',
      businessType: 'Piercing Studio',
      expectedVolume: '100-500 units/month',
      status: 'APPROVED',
      adminNotes: 'Verified business registration.',
      reviewedBy: admin.id,
    },
  });

  const b2bUserPending = await prisma.user.create({
    data: {
      name: 'Sarah Connor',
      email: 'sarah@aurorapiercing.com',
      passwordHash: userPassword,
      role: 'B2B_CUSTOMER',
      b2bApprovalStatus: 'PENDING',
      companyName: 'Aurora Body Art Studio',
      gstNumber: '29BBBBB1111B2Z9',
      businessType: 'Wholesale Retailer',
      expectedVolume: '50-100 units/month',
    },
  });

  await prisma.b2BApplication.create({
    data: {
      userId: b2bUserPending.id,
      companyName: 'Aurora Body Art Studio',
      gstNumber: '29BBBBB1111B2Z9',
      businessType: 'Wholesale Retailer',
      expectedVolume: '50-100 units/month',
      status: 'PENDING',
    },
  });

  // 3. Create Categories & Subcategories
  const jewelryCategory = await prisma.category.create({
    data: {
      name: 'Piercing Jewelry',
      slug: 'piercing-jewelry',
      description: 'Fine solid gold, implant grade titanium, and sterling silver piercing jewelry.',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
      subcategories: {
        create: [
          { name: 'Nose Rings & Studs', slug: 'nose-rings', description: 'Septum, Nostril screws, clickers & hoops.' },
          { name: 'Ear Piercing', slug: 'ear-piercing', description: 'Helix, Tragus, Conch & Lobe studs.' },
          { name: 'Belly Rings', slug: 'belly-rings', description: 'Navel rings with sparkling Swarovski crystals.' },
        ],
      },
    },
    include: { subcategories: true },
  });

  const toolsCategory = await prisma.category.create({
    data: {
      name: 'Studio Tools & Equipment',
      slug: 'studio-tools',
      description: 'Professional grade sterile piercing needles, forceps, and sterilizers.',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
      subcategories: {
        create: [
          { name: 'Piercing Needles', slug: 'needles', description: 'Sterile tri-bevel surgical needles.' },
          { name: 'Forceps & Clamps', slug: 'forceps', description: 'Pennington & Sponge forceps.' },
        ],
      },
    },
    include: { subcategories: true },
  });

  const subNose = jewelryCategory.subcategories.find((s) => s.slug === 'nose-rings');
  const subEar = jewelryCategory.subcategories.find((s) => s.slug === 'ear-piercing');
  const subNeedle = toolsCategory.subcategories.find((s) => s.slug === 'needles');

  // 4. Products
  const prod1 = await prisma.product.create({
    data: {
      categoryId: jewelryCategory.id,
      subcategoryId: subNose.id,
      name: 'Aurelia 14K Gold Diamond Septum Clicker',
      slug: 'aurelia-14k-gold-diamond-septum-clicker',
      sku: 'JW-SEP-001',
      description:
        'Crafted in solid 14K Yellow Gold with brilliant natural diamonds. Features a seamless hinge mechanism for effortless clasping and maximum comfort.',
      retailPrice: 4999.0,
      salePrice: 4499.0,
      b2bPrice: 2800.0,
      stock: 50,
      moq: 5,
      visibility: 'BOTH',
      careInstructions: 'Clean gently with mild soap and warm water. Avoid chemical abrasives.',
      hygieneNotice: 'Sealed in sterile packaging. Non-returnable once seal is broken.',
      images: {
        create: [
          { imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
          { imageUrl: 'https://images.unsplash.com/photo-1611591475824-287d3a01d516?auto=format&fit=crop&w=800&q=80', displayOrder: 1 },
        ],
      },
      variants: {
        create: [
          { name: 'Size', value: '16G / 8mm', priceAdjustment: 0, stock: 25, sku: 'JW-SEP-001-16G8' },
          { name: 'Size', value: '16G / 10mm', priceAdjustment: 300, stock: 25, sku: 'JW-SEP-001-16G10' },
        ],
      },
      pricingRules: {
        create: [
          { customerType: 'B2B', minimumQuantity: 5, price: 2800.0 },
          { customerType: 'B2B', minimumQuantity: 20, price: 2400.0 },
        ],
      },
    },
  });

  const prod2 = await prisma.product.create({
    data: {
      categoryId: jewelryCategory.id,
      subcategoryId: subEar.id,
      name: 'Celeste Titanium Opal Flat Back Labret',
      slug: 'celeste-titanium-opal-flat-back-labret',
      sku: 'JW-LAB-002',
      description:
        'Implant Grade ASTM F136 Titanium flat back labret featuring a synthetic fire opal bezel setting. Ideal for tragus, helix, and nostril piercings.',
      retailPrice: 1299.0,
      salePrice: null,
      b2bPrice: 650.0,
      stock: 120,
      moq: 10,
      visibility: 'BOTH',
      careInstructions: 'Wipe with microfiber cloth. Autoclave safe.',
      hygieneNotice: 'Non-returnable & non-refundable body jewelry item.',
      images: {
        create: [
          { imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
        ],
      },
      pricingRules: {
        create: [
          { customerType: 'B2B', minimumQuantity: 10, price: 650.0 },
          { customerType: 'B2B', minimumQuantity: 50, price: 520.0 },
        ],
      },
    },
  });

  const prod3 = await prisma.product.create({
    data: {
      categoryId: toolsCategory.id,
      subcategoryId: subNeedle.id,
      name: 'Precision Pro Sterile Piercing Needles (Box of 100)',
      slug: 'precision-pro-sterile-piercing-needles-box-100',
      sku: 'TL-NDL-003',
      description:
        'EO Gas Sterilized tri-bevel laser sharp piercing needles. Designed exclusively for certified professional piercers.',
      retailPrice: 2499.0,
      salePrice: null,
      b2bPrice: 1450.0,
      stock: 45,
      moq: 2,
      visibility: 'B2B', // B2B Only product
      careInstructions: 'Single use only. Dispose in designated sharps container.',
      images: {
        create: [
          { imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80', displayOrder: 0 },
        ],
      },
    },
  });

  // 5. Coupons & Banners
  await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minimumOrderValue: 1000,
      platform: 'RETAIL',
      status: 'ACTIVE',
    },
  });

  await prisma.banner.create({
    data: {
      platform: 'RETAIL',
      title: 'ELEGANCE IN EVERY PIERCING',
      subtitle: 'Discover solid 14K gold & titanium precision craftsmanship',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80',
      link: '/catalog',
    },
  });

  console.log('✅ Seeding completed successfully!');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
