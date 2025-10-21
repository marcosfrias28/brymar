/**
 * Database seeding utilities for development
 */

import { db } from './connection';
import { users, properties, lands, blogPosts, blogCategories } from './schema/index';

export async function seedDatabase() {
    console.log('🌱 Starting database seeding...');

    try {
        // Seed blog categories first (referenced by blog posts)
        console.log('📝 Seeding blog categories...');
        await db.insert(blogCategories).values([
            {
                id: 'cat-1',
                name: 'Property News',
                slug: 'property-news',
                description: 'Latest news and updates about properties',
                color: '#3B82F6',
                isActive: true,
            },
            {
                id: 'cat-2',
                name: 'Market Insights',
                slug: 'market-insights',
                description: 'Real estate market analysis and trends',
                color: '#10B981',
                isActive: true,
            },
            {
                id: 'cat-3',
                name: 'Investment Tips',
                slug: 'investment-tips',
                description: 'Tips and advice for property investment',
                color: '#F59E0B',
                isActive: true,
            }
        ]).onConflictDoNothing();

        // Seed a test user
        console.log('👤 Seeding test user...');
        await db.insert(users).values([
            {
                id: 'user-1',
                email: 'admin@example.com',
                name: 'Admin User',
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin',
                emailVerified: new Date(),
                isActive: true,
            }
        ]).onConflictDoNothing();

        // Seed sample properties
        console.log('🏠 Seeding sample properties...');
        await db.insert(properties).values([
            {
                id: 'prop-1',
                title: 'Modern Downtown Apartment',
                description: 'Beautiful 2-bedroom apartment in the heart of downtown with stunning city views.',
                price: 250000,
                currency: 'USD',
                address: {
                    street: '123 Main St',
                    city: 'Downtown',
                    state: 'CA',
                    country: 'USA',
                    postalCode: '90210'
                },
                type: 'apartment',
                features: {
                    bedrooms: 2,
                    bathrooms: 2,
                    area: 1200,
                    parking: true,
                    balcony: true,
                    furnished: false
                },
                images: [
                    {
                        url: '/placeholder.svg',
                        alt: 'Modern apartment exterior',
                        order: 0
                    }
                ],
                status: 'published',
                featured: true,
                userId: 'user-1',
                publishedAt: new Date(),
            }
        ]).onConflictDoNothing();

        // Seed sample lands
        console.log('🌾 Seeding sample lands...');
        await db.insert(lands).values([
            {
                id: 'land-1',
                name: 'Prime Development Land',
                description: 'Excellent location for residential or commercial development.',
                area: 5000,
                price: 150000,
                currency: 'USD',
                location: 'Suburban Area, CA',
                address: {
                    street: '456 Development Ave',
                    city: 'Suburban Area',
                    state: 'CA',
                    country: 'USA',
                    postalCode: '90211'
                },
                type: 'residential',
                features: {
                    zoning: 'residential',
                    utilities: ['water', 'electricity'],
                    access: 'paved road',
                    topography: 'flat'
                },
                images: [
                    {
                        url: '/placeholder.svg',
                        alt: 'Development land overview',
                        order: 0
                    }
                ],
                status: 'available',
                userId: 'user-1',
            }
        ]).onConflictDoNothing();

        // Seed sample blog posts
        console.log('📰 Seeding sample blog posts...');
        await db.insert(blogPosts).values([
            {
                id: 'blog-1',
                title: 'Real Estate Market Trends 2024',
                content: 'The real estate market continues to evolve with new trends emerging...',
                excerpt: 'Discover the latest trends shaping the real estate market in 2024.',
                slug: 'real-estate-market-trends-2024',
                status: 'published',
                category: 'market-insights',
                tags: ['market', 'trends', '2024'],
                coverImage: {
                    url: '/placeholder.svg',
                    alt: 'Market trends chart'
                },
                authorId: 'user-1',
                publishedAt: new Date(),
                readTime: 5,
                views: 0,
            }
        ]).onConflictDoNothing();

        console.log('✅ Database seeding completed successfully!');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
}

export async function clearDatabase() {
    console.log('🧹 Clearing database...');

    try {
        // Clear in reverse order of dependencies
        await db.delete(blogPosts);
        await db.delete(blogCategories);
        await db.delete(lands);
        await db.delete(properties);
        await db.delete(users);

        console.log('✅ Database cleared successfully!');
    } catch (error) {
        console.error('❌ Error clearing database:', error);
        throw error;
    }
}

// CLI runner
if (require.main === module) {
    const command = process.argv[2];

    if (command === 'seed') {
        seedDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
    } else if (command === 'clear') {
        clearDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
    } else {
        console.log('Usage: tsx src/lib/db/seed.ts [seed|clear]');
        process.exit(1);
    }
}