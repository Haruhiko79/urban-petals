import type { Product } from './shop.service';

// Existing collection for browsing until an API is configured; no live stock is implied.
export const CATALOG_PREVIEW: Product[] = [
  {
    "id": 1,
    "name": "Snake Plants",
    "group": "Plants",
    "category": "Snakeplants",
    "price": 200,
    "image": "https://images.squarespace-cdn.com/content/v1/54fbb611e4b0d7c1e151d22a/1610074066643-OP8HDJUWUH8T5MHN879K/Snake+Plant.jpg?format=1000w",
    "description": "Low-maintenance snake plants perfect for indoor gardening.",
    "badge": "Bestseller",
    "stock": null
  },
  {
    "id": 2,
    "name": "Hibiscus Plants",
    "group": "Plants",
    "category": "Hibiscus",
    "price": 280,
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREXS1FeaFL7uOvUUCQ9WJoyFE2nkzPuC5McyqvNCTxZuKp0RZ66GmICkPm8yy6U_NPgILAfNrDLJAheH8QAvogL_3OnHBRjRgg-Rv1LQ&s=10",
    "description": "Beautiful hibiscus plants for your garden.",
    "stock": null
  },
  {
    "id": 3,
    "name": "Cactus Plants",
    "group": "Plants",
    "category": "Cacti",
    "price": 280,
    "image": "https://gardenerspath.com/wp-content/uploads/2024/11/How-to-Water-Cactus-Feature.jpg",
    "description": "Beautiful cactus plants for your garden.",
    "stock": null
  },
  {
    "id": 4,
    "name": "Aloe Vera Plants",
    "group": "Plants",
    "category": "Aloe Vera",
    "price": 750,
    "image": "https://www.southernliving.com/thmb/DC8ytSO5e9padoHAnGZdmodAaGc=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-912168376-0098b123b88f4c62a68b249130b480e9.jpg",
    "description": "Medicinal aloe vera plants for your garden.",
    "stock": null
  },
  {
    "id": 5,
    "name": "Pothos Plants",
    "group": "Plants",
    "category": "Pothos",
    "price": 850,
    "image": "https://nouveauraw.com/wp-content/uploads/2020/01/Pothos-Golden-Pothos-plant-800-great-coloring.png",
    "description": "Easy-growing trailing foliage for bright indoor spaces.",
    "stock": null
  },
  {
    "id": 6,
    "name": "ZZ Plant",
    "group": "Plants",
    "category": "ZZ Plant",
    "price": 1000.0,
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkWLlqAoE9sg87Rc68HkvRIOSBEpg8AySW5r1g3w7Clw3cyYDHdFLd57mOAjMf4RLUZDyNvF-OQ1sYKadXqJkY6ovwSsoBYLQNBrBDAA&s=10",
    "description": "Drought-tolerant ZZ plant perfect for low-light conditions.",
    "stock": null
  },
  {
    "id": 101,
    "name": "Sunflower",
    "group": "Flowers",
    "category": "SunFlower",
    "price": 200,
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSE6WZSsX_ECcU_QDQGknng3Ray79YGGYDVxvR8XKay6CDSEzniELYQ7xTyHFylXQvN8Vg9CbYa3OhOyiZ-0yp_kGvN8RukOxrwZi2KLUHYJw&s=10",
    "description": "A beautiful sunflower.",
    "stock": null
  },
  {
    "id": 102,
    "name": "Roses",
    "group": "Flowers",
    "category": "Roses",
    "price": 280,
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrOiG_CkbYfVzbVhn6CgQBbWAQJUUCxFLoK3dVuMvtByEeqvdTeVnm5JMZm-hGsELQejm61UKkE23xxxXm77S4f4ssoaWZTJhkp5uUKCE&s=10",
    "description": "Classic red roses.",
    "stock": null
  },
  {
    "id": 103,
    "name": "Orchids",
    "group": "Flowers",
    "category": "Orchids",
    "price": 280,
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeQwBNasvdy9N0TGOck7e0yOLjWUO1Lf79T0BYLu0y3S2eAHOVyasSbfQEqZGzk4LhhLsxj26FBQdz6_izfWC5kGW2PbhG5HGvklMcPE8&s=10",
    "description": "Elegant orchids.",
    "stock": null
  },
  {
    "id": 104,
    "name": "Daisies",
    "group": "Flowers",
    "category": "Daisies",
    "price": 750,
    "image": "https://gardenerspath.com/wp-content/uploads/2025/04/How-to-Grow-and-Care-for-Shasta-Daisies-Hero.jpg",
    "description": "Colorful daisies.",
    "stock": null
  },
  {
    "id": 105,
    "name": "Tulips",
    "group": "Flowers",
    "category": "Tulips",
    "price": 850,
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToPl1sPSiYYeRdtmBCI6E22YsgwyAgir7GQxnZERFXAwG0E6z36AquX0k2dJLsG8JtOnjZ1Q3f4CyJNows1T4O__MwnEw6ibAt2n6uQXI&s=10",
    "description": "Stunning tulips.",
    "stock": null
  },
  {
    "id": 106,
    "name": "Geranium",
    "group": "Flowers",
    "category": "Geranium",
    "price": 1000.0,
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSikKxFUpb1fZP3eD1OJ64irsEe2CMi6FwPp9mydhh4f0yyTcjtpInXMCAlf6UdCl5yGLEIdL7GihGvAkMsMXV2smiJ4Iz70-MPoXoJUQ&s=10",
    "description": "Vibrant geraniums.",
    "stock": null
  },
  {
    "id": 201,
    "name": "Watering Can",
    "group": "Tools",
    "category": "Watering Cans",
    "price": 200,
    "image": "https://i5.walmartimages.com/asr/d52679e9-d9f9-472d-a646-fe1bef8054c8.3eb5b3d1d84272db66dae65f9e8489b6.jpeg",
    "description": "Premium watering can with ergonomic handle and precision spout.",
    "stock": null
  },
  {
    "id": 202,
    "name": "Shears",
    "group": "Tools",
    "category": "Shears",
    "price": 280,
    "image": "https://ikrorwxhqlrrli5q.ldycdn.com/cloud/lpBpqKlmlmSRnjrnqjopip/gt2074.jpg",
    "description": "Professional-grade pruning shears with stainless steel blades.",
    "stock": null
  },
  {
    "id": 203,
    "name": "Hand Trowel",
    "group": "Tools",
    "category": "Hand Trowels",
    "price": 300,
    "image": "https://m.media-amazon.com/images/I/613nbx+ByoL._AC_SL1500_.jpg",
    "description": "Durable hand trowel perfect for digging and planting.",
    "stock": null
  },
  {
    "id": 204,
    "name": "Shovel",
    "group": "Tools",
    "category": "Shovels",
    "price": 750,
    "image": "https://tse3.mm.bing.net/th/id/OIP.rxbu9BWALeMZolXKtf_h-gHaGG?rs=1&pid=ImgDetMain&o=7&rm=3",
    "description": "Heavy-duty shovel with reinforced handle.",
    "stock": null
  },
  {
    "id": 205,
    "name": "Rakes",
    "group": "Tools",
    "category": "Rakes",
    "price": 850,
    "image": "https://tse1.mm.bing.net/th/id/OIP.G68v1b-wmIoBlENwV-EH4gHaE8?w=1500&h=1000&rs=1&pid=ImgDetMain&o=7&rm=3",
    "description": "Professional garden rake with wide head.",
    "stock": null
  },
  {
    "id": 206,
    "name": "Garden Fork",
    "group": "Tools",
    "category": "Garden Fork",
    "price": 1000.0,
    "image": "https://tse3.mm.bing.net/th/id/OIP.Wl8SM-yoZI7vJVMcsc0T-gHaHa?w=600&h=600&rs=1&pid=ImgDetMain&o=7&rm=3",
    "description": "Sturdy garden fork ideal for turning soil.",
    "stock": null
  },
  {
    "id": 301,
    "name": "Potted Sensation plant",
    "group": "Pots",
    "category": "Ceramic",
    "price": 350,
    "image": "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=700&q=80",
    "description": "Our decorative ceramic planter with wooden stand. Perfect for showing off your plants.",
    "stock": null
  },
  {
    "id": 302,
    "name": "Elevated Planter with Wooden Stand",
    "group": "Pots",
    "category": "Ceramic",
    "price": 380,
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTofD-bJpZhJOVb1NphYroeiLqPSwloDa8nsA&s",
    "description": "Our decorative ceramic planter with wooden stand. Perfect for showing off your plants.",
    "stock": null
  },
  {
    "id": 303,
    "name": "Venetian Tall Fiberglass Planter",
    "group": "Pots",
    "category": "Fiberglass",
    "price": 550,
    "image": "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=700&q=80",
    "description": "Our decorative ceramic planter with wooden stand. Perfect for showing off your plants.",
    "stock": null
  },
  {
    "id": 304,
    "name": "Ribbed Tall Fiberglass Planters",
    "group": "Pots",
    "category": "Fiberglass",
    "price": 690,
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQP9c3vVN_0qwFQ88518lWBtnOjjj8DSM4ndQ&s",
    "description": "Our decorative ceramic planter with wooden stand. Perfect for showing off your plants.",
    "stock": null
  },
  {
    "id": 305,
    "name": "Terracotta Pots",
    "group": "Pots",
    "category": "Terracotta",
    "price": 450,
    "image": "https://www.livemoor.co.uk/cdn/shop/files/1_d8b4cad6-6255-4e13-ab27-999c6abc6a0c.jpg?v=1718832910",
    "description": "Our decorative ceramic planter with wooden stand. Perfect for showing off your plants.",
    "stock": null
  },
  {
    "id": 306,
    "name": "Terraneo Zonarati Terracotta Pot",
    "group": "Pots",
    "category": "Terracotta",
    "price": 1200,
    "image": "https://www.architecturalplants.com/wp-content/uploads/2024/08/WhatsApp-Image-2024-08-09-at-14-15-53_ab998084.jpg",
    "description": "Our decorative ceramic planter with wooden stand. Perfect for showing off your plants.",
    "stock": null
  },
  {
    "id": 401,
    "name": "Compost",
    "group": "Fertilizers",
    "category": "Organic",
    "price": 350,
    "image": "https://5.imimg.com/data5/CM/QR/KC/SELLER-8167092/organic-compost-fertilizer-500x500.jpg",
    "description": "Nutrient-rich organic compost, ideal for enriching soil and boosting plant health naturally.",
    "stock": null
  },
  {
    "id": 402,
    "name": "Liquid Fertilizer",
    "group": "Fertilizers",
    "category": "Liquid",
    "price": 380,
    "image": "https://tiimg.tistatic.com/fp/1/008/434/liquid-bio-fertilizer-for-fast-crop-growing-use-075.jpg",
    "description": "Fast-absorbing liquid fertilizer for quick nutrient uptake and vibrant foliage.",
    "stock": null
  },
  {
    "id": 403,
    "name": "Granular Fertilizer",
    "group": "Fertilizers",
    "category": "Granular",
    "price": 550,
    "image": "https://www.hhfertilizer.com/images/goods/7_2024031109485899411.jpg",
    "description": "Slow-release granular formula provides steady nutrients for up to 3 months.",
    "stock": null
  },
  {
    "id": 404,
    "name": "Organic Fertilizer",
    "group": "Fertilizers",
    "category": "Organic",
    "price": 690,
    "image": "https://img.freepik.com/premium-photo/organic-fertilizer-isolated-white-background_1313004-201.jpg",
    "description": "Certified organic blend of natural ingredients for sustainable gardening.",
    "stock": null
  },
  {
    "id": 405,
    "name": "Plant Booster",
    "group": "Fertilizers",
    "category": "Liquid",
    "price": 450,
    "image": "https://www.gardeningera.com/wp-content/uploads/2024/05/Gardening-Era-1.png",
    "description": "Energizing plant booster with essential micronutrients for stronger roots and blooms.",
    "stock": null
  },
  {
    "id": 406,
    "name": "Rock Phosphate",
    "group": "Fertilizers",
    "category": "Soil Enhancers",
    "price": 1200,
    "image": "https://5.imimg.com/data5/SELLER/Default/2023/4/300299368/TE/WR/AX/186880872/download-1-jpeg-500x500.jpeg",
    "description": "Natural rock phosphate powder, excellent long-term phosphorus source.",
    "stock": null
  }
];
