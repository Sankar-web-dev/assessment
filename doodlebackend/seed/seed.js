require("dotenv").config();
const connectDB = require("../config/db");
const Category = require("../models/category.model");
const Product = require("../models/product.model");
const Coupon = require("../models/coupon.model");

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

const categories = [
    { name: "Electronics" },
    { name: "Gaming" },
];

const seed = async () => {
    await connectDB();

    await Promise.all([
        Category.deleteMany({}),
        Product.deleteMany({}),
        Coupon.deleteMany({}),
    ]);
    console.log("Cleared existing categories, products and coupons");

    const createdCategories = await Category.insertMany(categories);
    const cat = Object.fromEntries(createdCategories.map((c) => [c.name, c._id]));
    console.log(`Created ${createdCategories.length} categories`);

    const products = [
        {
            name: "Wireless Over-Ear Headphones",
            description: "Over-ear Bluetooth headphones with soft memory-foam cushions, a foldable design and up to 30 hours of battery life.",
            category: cat["Electronics"],
            brand: "VoltNex Audio",
            price: 79.99,
            comparePrice: 99.99,
            images: [img("photo-1505740420928-5e560c06d30e"), img("photo-1583394838336-acd977736f90"), img("photo-1599669454699-248893623440"), img("photo-1484704849700-f032a568e944")],
            rating: 4.5,
            reviewCount: 128,
            stock: 34,
            tags: ["bluetooth", "wireless", "headphones", "audio"],
            specifications: { "Battery life": "30 hours", "Connectivity": "Bluetooth 5.3", "Weight": "250g", "Noise cancellation": "Active" },
            isFeatured: true,
        },
        {
            name: "Smart Fitness Watch",
            description: "Fitness smartwatch with heart-rate tracking, GPS, sleep monitoring and a 10-day battery life.",
            category: cat["Electronics"],
            brand: "VoltNex Tech",
            price: 134.10,
            comparePrice: 149.00,
            images: [img("photo-1546868871-7041f2a55e12"), img("photo-1434056886845-dac89ffe9b56"), img("photo-1524592094714-0f0654e20314")],
            rating: 4.3,
            reviewCount: 212,
            stock: 18,
            tags: ["smartwatch", "fitness", "wearable"],
            specifications: { "Display": "1.4\" AMOLED", "Battery": "10 days", "Water resistance": "5ATM" },
            isFeatured: true,
        },
        {
            name: "RGB Pro Gaming Headset",
            description: "Surround-sound gaming headset with RGB lighting, noise-cancelling mic and memory-foam earcups for marathon sessions.",
            category: cat["Gaming"],
            brand: "VoltNex Gaming",
            price: 89.99,
            comparePrice: 119.99,
            images: [img("photo-1618366712010-f4ae9c647dcb"), img("photo-1599669454699-248893623440"), img("photo-1542751371-adc38448a05e")],
            rating: 4.6,
            reviewCount: 342,
            stock: 26,
            tags: ["gaming", "headset", "rgb", "audio"],
            specifications: { "Drivers": "50mm", "Mic": "Detachable noise-cancel", "Lighting": "RGB", "Connection": "USB + 3.5mm" },
            isFeatured: true,
        },
        {
            name: "Mechanical RGB Keyboard",
            description: "Hot-swappable mechanical keyboard with per-key RGB, tactile switches and an aluminum frame built for competitive play.",
            category: cat["Gaming"],
            brand: "VoltNex Gaming",
            price: 79.99,
            comparePrice: 99.99,
            images: [img("photo-1587829741301-dc798b83add3"), img("photo-1618384887929-16ec33fab9ef")],
            rating: 4.7,
            reviewCount: 528,
            stock: 40,
            tags: ["gaming", "keyboard", "mechanical", "rgb"],
            specifications: { "Switches": "Tactile hot-swap", "Lighting": "Per-key RGB", "Layout": "TKL", "Frame": "Aluminum" },
            isFeatured: true,
        },
        {
            name: "VoltX Wireless Gaming Mouse",
            description: "Ultra-light 58g wireless gaming mouse with a 26K optical sensor, 90-hour battery and zero-latency 2.4GHz connection.",
            category: cat["Gaming"],
            brand: "VoltNex Gaming",
            price: 39.99,
            comparePrice: 59.99,
            images: [img("photo-1527864550417-7fd91fc51a46"), img("photo-1615663245857-ac93bb7c39e7")],
            rating: 4.5,
            reviewCount: 861,
            stock: 55,
            tags: ["gaming", "mouse", "wireless", "esports"],
            specifications: { "Sensor": "26K DPI optical", "Weight": "58g", "Battery": "90 hours", "Polling": "1000Hz" },
        },
        {
            name: "ErgoMax Gaming Chair",
            description: "Ergonomic gaming chair with 4D armrests, lumbar support, recline to 165 degrees and premium PU leather finish.",
            category: cat["Gaming"],
            brand: "VoltNex Gaming",
            price: 149.99,
            comparePrice: 199.99,
            images: [img("photo-1598550476439-6847785fcea6"), img("photo-1592078615290-033ee584e267")],
            rating: 4.4,
            reviewCount: 96,
            stock: 12,
            tags: ["gaming", "chair", "ergonomic"],
            specifications: { "Recline": "165°", "Armrests": "4D", "Weight limit": "150kg", "Material": "PU leather" },
        },
        {
            name: "NovaX Game Console",
            description: "Next-gen 4K gaming console with 1TB ultra-fast SSD, ray tracing and a wireless pro controller included.",
            category: cat["Gaming"],
            brand: "VoltNex Gaming",
            price: 449.99,
            comparePrice: 499.99,
            images: [img("photo-1621259182978-fbf93132d53d"), img("photo-1606144042614-b2417e99c4e3"), img("photo-1486401899868-0e435ed85128")],
            rating: 4.8,
            reviewCount: 1240,
            stock: 15,
            tags: ["gaming", "console", "4k", "nextgen"],
            specifications: { "Storage": "1TB NVMe SSD", "Resolution": "4K @ 120Hz", "Controller": "Wireless pro", "Ray tracing": "Yes" },
            isFeatured: true,
        },
        {
            name: "Pro Wireless Controller",
            description: "Pro-grade wireless controller with hall-effect sticks, remappable back paddles and 40-hour battery life.",
            category: cat["Gaming"],
            brand: "VoltNex Gaming",
            price: 59.99,
            images: [img("photo-1606813907291-d86efa9b94db"), img("photo-1592840496694-26d035b52b48")],
            rating: 4.6,
            reviewCount: 410,
            stock: 48,
            tags: ["gaming", "controller", "wireless"],
            specifications: { "Sticks": "Hall-effect anti-drift", "Battery": "40 hours", "Paddles": "4 remappable" },
            isFeatured: true,
        },
        {
            name: "UltraView 27\" 165Hz Monitor",
            description: "27-inch QHD gaming monitor with 165Hz refresh, 1ms response, HDR400 and ultra-thin bezels.",
            category: cat["Gaming"],
            brand: "VoltNex Tech",
            price: 249.99,
            comparePrice: 299.99,
            images: [img("photo-1527443224154-c4a3942d3acf"), img("photo-1547394765-185e1e68f34e")],
            rating: 4.7,
            reviewCount: 233,
            stock: 20,
            tags: ["gaming", "monitor", "165hz", "qhd"],
            specifications: { "Panel": "QHD IPS", "Refresh": "165Hz", "Response": "1ms", "HDR": "HDR400" },
        },
        {
            name: "Strike 15 Gaming Laptop",
            description: "15.6-inch gaming laptop with RTX graphics, 144Hz display, 16GB RAM and RGB backlit keyboard.",
            category: cat["Gaming"],
            brand: "VoltNex Tech",
            price: 1099.99,
            comparePrice: 1299.99,
            images: [img("photo-1603302576837-37561b2e2302"), img("photo-1593640408182-31c70c8268f5")],
            rating: 4.5,
            reviewCount: 178,
            stock: 9,
            tags: ["gaming", "laptop", "rtx", "144hz"],
            specifications: { "GPU": "RTX series", "Display": "15.6\" 144Hz", "RAM": "16GB DDR5", "Storage": "512GB SSD" },
        },
        {
            name: "Bluetooth Speaker",
            description: "Portable Bluetooth speaker with 360-degree sound, IPX7 waterproofing and 20-hour battery life.",
            category: cat["Electronics"],
            brand: "VoltNex Audio",
            price: 45.00,
            images: [img("photo-1608043152269-423dbba4e7e1"), img("photo-1589003077984-894e133dabab")],
            rating: 4.4,
            reviewCount: 150,
            stock: 22,
            tags: ["speaker", "bluetooth", "audio", "portable"],
            specifications: { "Battery": "20 hours", "Waterproof": "IPX7", "Output": "20W" },
        },
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`Created ${createdProducts.length} products`);

    await Coupon.create({ code: "SAVE10", discountPercent: 10 });
    console.log("Created coupon: SAVE10 (10% off)");

    console.log("Seed completed successfully");
    process.exit(0);
};

seed().catch((error) => {
    console.error("Seed failed:", error.message);
    process.exit(1);
});
