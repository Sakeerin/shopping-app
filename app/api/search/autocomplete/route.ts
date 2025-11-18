import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// ============================================================================
// T133: SEARCH AUTOCOMPLETE API (Phase 6 - User Story 3)
// ============================================================================

/**
 * GET /api/search/autocomplete
 * Returns autocomplete suggestions for products and categories
 * Query params: q (search query)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    // Validate query
    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Search for matching products (limit to 5 for autocomplete)
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: true,
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 5,
    });

    // Search for matching categories (limit to 3 for autocomplete)
    const categories = await prisma.category.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { displayOrder: 'asc' },
      take: 3,
    });

    // Transform data
    const productResults = products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      image: product.images[0] || null,
    }));

    const categoryResults = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
    }));

    return NextResponse.json({
      products: productResults,
      categories: categoryResults,
    });
  } catch (error) {
    console.error('Autocomplete API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch autocomplete results' },
      { status: 500 }
    );
  }
}
