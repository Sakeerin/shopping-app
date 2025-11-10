import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  });
  console.log('✓ Created admin user:', admin.email);

  // Create customer user
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      name: 'John Doe',
      password: customerPassword,
      role: UserRole.CUSTOMER,
      emailVerified: new Date(),
    },
  });
  console.log('✓ Created customer user:', customer.email);

  // Create categories
  const categories = [
    {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and accessories',
      displayOrder: 1,
    },
    {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Apparel and fashion items',
      displayOrder: 2,
    },
    {
      name: 'Books',
      slug: 'books',
      description: 'Books and publications',
      displayOrder: 3,
    },
    {
      name: 'Home & Garden',
      slug: 'home-garden',
      description: 'Home improvement and garden supplies',
      displayOrder: 4,
    },
    {
      name: 'Sports',
      slug: 'sports',
      description: 'Sports equipment and accessories',
      displayOrder: 5,
    },
  ];

  const createdCategories = await Promise.all(
    categories.map((category) =>
      prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: category,
      })
    )
  );
  console.log(`✓ Created ${createdCategories.length} categories`);

  // Get category IDs
  const electronicsCategory = createdCategories.find((c) => c.slug === 'electronics')!;
  const clothingCategory = createdCategories.find((c) => c.slug === 'clothing')!;
  const booksCategory = createdCategories.find((c) => c.slug === 'books')!;
  const sportsCategory = createdCategories.find((c) => c.slug === 'sports')!;

  // Create sample products
  const products = [
    {
      name: 'Wireless Headphones',
      slug: 'wireless-headphones',
      description:
        'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
      price: 149.99,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      ],
      categoryId: electronicsCategory.id,
      stock: 50,
      isFeatured: true,
      metaTitle: 'Premium Wireless Headphones | Shop Now',
      metaDescription:
        'Experience superior sound quality with our premium wireless headphones',
    },
    {
      name: 'Smart Watch',
      slug: 'smart-watch',
      description:
        'Feature-rich smartwatch with health tracking, notifications, and water resistance.',
      price: 299.99,
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
      ],
      categoryId: electronicsCategory.id,
      stock: 30,
      isFeatured: true,
    },
    {
      name: 'Classic T-Shirt',
      slug: 'classic-t-shirt',
      description:
        'Comfortable cotton t-shirt available in multiple colors. Perfect for everyday wear.',
      price: 24.99,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      ],
      categoryId: clothingCategory.id,
      stock: 100,
    },
    {
      name: 'Running Shoes',
      slug: 'running-shoes',
      description:
        'Lightweight running shoes with superior cushioning and breathable mesh upper.',
      price: 89.99,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      ],
      categoryId: sportsCategory.id,
      stock: 45,
      isFeatured: true,
    },
    {
      name: 'JavaScript: The Good Parts',
      slug: 'javascript-good-parts',
      description:
        'Essential guide to JavaScript programming language and its best practices.',
      price: 29.99,
      images: [
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
      ],
      categoryId: booksCategory.id,
      stock: 20,
    },
  ];

  const createdProducts = await Promise.all(
    products.map((product) =>
      prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: product,
      })
    )
  );
  console.log(`✓ Created ${createdProducts.length} products`);

  // Create sample promo code
  await prisma.promoCode.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minPurchase: 50,
      usageLimit: 100,
      perUserLimit: 1,
      isActive: true,
      startDate: new Date(),
    },
  });
  console.log('✓ Created promo code: WELCOME10');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
