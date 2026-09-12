// scripts/seed.js
import { connectDatabase, disconnectDatabase } from '../src/config/db.js';
import { logger } from '../src/utils/logger.js';
import { Product } from '../src/modules/products/product.model.js';
import { Sale } from '../src/modules/sales/sale.model.js';
import { User } from '../src/modules/auth/user.model.js';

const PRODUCTS = [
    { name: 'Wireless Mouse', sku: 'WM-1001', category: 'electronics', price: 890000, cost: 500000, stock: 42, tags: ['mouse', 'wireless'] },
    { name: 'Mechanical Keyboard', sku: 'MK-2001', category: 'electronics', price: 2500000, cost: 1600000, stock: 3, tags: ['keyboard', 'mechanical'] },
    { name: 'USB-C Hub', sku: 'UC-3001', category: 'electronics', price: 1200000, cost: 700000, stock: 12, tags: ['usb', 'hub'] },
    { name: 'Noise Cancelling Headphones', sku: 'NC-4001', category: 'audio', price: 4800000, cost: 3200000, stock: 8, tags: ['headphones', 'anc'] },
    { name: 'Bluetooth Speaker', sku: 'BS-5001', category: 'audio', price: 1500000, cost: 900000, stock: 2, tags: ['speaker', 'bluetooth'] },
    { name: 'Webcam 1080p', sku: 'WC-6001', category: 'electronics', price: 1700000, cost: 1000000, stock: 25, tags: ['webcam'] },
    { name: 'Laptop Stand', sku: 'LS-7001', category: 'accessories', price: 950000, cost: 450000, stock: 60, tags: ['laptop', 'stand'] },
    { name: 'Desk Lamp LED', sku: 'DL-8001', category: 'accessories', price: 700000, cost: 350000, stock: 4, tags: ['lamp', 'led'] },
    { name: 'Notebook A5', sku: 'NB-9001', category: 'stationery', price: 150000, cost: 60000, stock: 200, tags: ['notebook'] },
    { name: 'Pen Set Premium', sku: 'PS-1002', category: 'stationery', price: 450000, cost: 200000, stock: 90, tags: ['pen'] },
];

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedUsers() {
    await User.deleteMany({});
    const admin = await User.create({
        email: 'admin@example.com',
        password: 'admin12345',
        name: 'Admin',
        role: 'admin',
    });
    const user = await User.create({
        email: 'user@example.com',
        password: 'user12345',
        name: 'Test User',
        role: 'user',
    });
    logger.info(`👤 Users seeded: ${admin.email} / ${user.email}`);
    return { admin, user };
}

async function seedProducts() {
    await Product.deleteMany({});
    const inserted = await Product.insertMany(PRODUCTS);
    logger.info(`📦 Products seeded: ${inserted.length}`);
    return inserted;
}

async function seedSales(products) {
    await Sale.deleteMany({});

    const sales = [];
    const now = new Date();
    const statuses = ['paid', 'paid', 'paid', 'shipped', 'delivered'];

    for (let i = 0; i < 60; i += 1) {
        const daysAgo = randomBetween(0, 45);
        const soldAt = new Date(now);
        soldAt.setDate(soldAt.getDate() - daysAgo);

        const itemCount = randomBetween(1, 3);
        const items = [];
        let totalAmount = 0;

        const picked = new Set();
        while (picked.size < itemCount) {
            picked.add(products[randomBetween(0, products.length - 1)]);
        }

        for (const p of picked) {
            const quantity = randomBetween(1, 4);
            const unitPrice = p.price;
            const total = quantity * unitPrice;
            totalAmount += total;

            items.push({
                product: p._id,
                productName: p.name,
                quantity,
                unitPrice,
                total,
            });
        }

        const discount = Math.random() < 0.2 ? Math.round(totalAmount * 0.05) : 0;
        const finalAmount = totalAmount - discount;

        sales.push({
            orderNumber: `ORD-${Date.now()}-${i}`,
            customer: { name: `Customer ${i + 1}` },
            items,
            totalAmount,
            discount,
            finalAmount,
            status: statuses[randomBetween(0, statuses.length - 1)],
            soldAt,
        });
    }

    await Sale.insertMany(sales);
    logger.info(`💰 Sales seeded: ${sales.length}`);
}

async function run() {
    try {
        await connectDatabase();

        logger.info('🌱 Seeding database...');
        const { admin, user } = await seedUsers();
        const products = await seedProducts();
        await seedSales(products);

        logger.info('\n✅ Seed complete!\n');
        logger.info('Admin login: admin@example.com / admin12345');
        logger.info('User login:  user@example.com  / user12345\n');

        await disconnectDatabase();
        process.exit(0);
    } catch (err) {
        logger.error(`Seed failed: ${err.message}`);
        await disconnectDatabase();
        process.exit(1);
    }
}

run();