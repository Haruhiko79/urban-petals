-- ==============================================================================
-- Urban Petals — Product Catalog Seed
-- Run this in the Supabase SQL Editor (after Supabase_sql.sql schema setup).
-- Idempotent: re-running updates existing rows by item_code.
-- ==============================================================================

INSERT INTO public.products (id, item_code, name, "group", category, quantity, stock, price, image, description, badge, is_active)
VALUES
  -- ===== PLANTS (1-6) =====
  (1,  '#A001', 'Snake Plants', 'Plants', 'Snakeplants', 40, 40, 200.00,  'https://images.squarespace-cdn.com/content/v1/54fbb611e4b0d7c1e151d22a/1610074066643-OP8HDJUWUH8T5MHN879K/Snake+Plant.jpg?format=1000w', 'Low-maintenance snake plants perfect for indoor gardening.', 'Bestseller', true),
  (2,  '#A002', 'Hibiscus Plants', 'Plants', 'Hibiscus', 35, 35, 280.00,  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREXS1FeaFL7uOvUUCQ9WJoyFE2nkzPuC5McyqvNCTxZuKp0RZ66GmICkPm8yy6U_NPgILAfNrDLJAheH8QAvogL_3OnHBRjRgg-Rv1LQ&s=10', 'Beautiful hibiscus plants for your garden.', NULL, true),
  (3,  '#A003', 'Cactus Plants', 'Plants', 'Cacti', 30, 30, 280.00,  'https://gardenerspath.com/wp-content/uploads/2024/11/How-to-Water-Cactus-Feature.jpg', 'Beautiful cactus plants for your garden.', NULL, true),
  (4,  '#A004', 'Aloe Vera Plants', 'Plants', 'Aloe Vera', 25, 25, 750.00,  'https://www.southernliving.com/thmb/DC8ytSO5e9padoHAnGZdmodAaGc=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-912168376-0098b123b88f4c62a68b249130b480e9.jpg', 'Medicinal aloe vera plants for your garden.', NULL, true),
  (5,  '#A005', 'Pothos Plants', 'Plants', 'Pothos', 45, 45, 850.00,  'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=900&q=80', 'Easy-growing trailing foliage for bright indoor spaces.', NULL, true),
  (6,  '#A006', 'ZZ Plant', 'Plants', 'ZZ Plant', 20, 20, 1000.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkWLlqAoE9sg87Rc68HkvRIOSBEpg8AySW5r1g3w7Clw3cyYDHdFLd57mOAjMf4RLUZDyNvF-OQ1sYKadXqJkY6ovwSsoBYLQNBrBDAA&s=10', 'Drought-tolerant ZZ plant perfect for low-light conditions.', NULL, true),

  -- ===== FLOWERS (101-106) =====
  (101, '#F001', 'Sunflower', 'Flowers', 'SunFlower', 38, 38, 200.00,  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSE6WZSsX_ECcU_QDQGknng3Ray79YGGYDVxvR8XKay6CDSEzniELYQ7xTyHFylXQvN8Vg9CbYa3OhOyiZ-0yp_kGvN8RukOxrwZi2KLUHYJw&s=10', 'A beautiful sunflower.', NULL, true),
  (102, '#F002', 'Roses', 'Flowers', 'Roses', 30, 30, 280.00,  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrOiG_CkbYfVzbVhn6CgQBbWAQJUUCxFLoK3dVuMvtByEeqvdTeVnm5JMZm-hGsELQejm61UKkE23xxxXm77S4f4ssoaWZTJhkp5uUKCE&s=10', 'Classic red roses.', NULL, true),
  (103, '#F003', 'Orchids', 'Flowers', 'Orchids', 22, 22, 280.00,  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeQwBNasvdy9N0TGOck7e0yOLjWUO1Lf79T0BYLu0y3S2eAHOVyasSbfQEqZGzk4LhhLsxj26FBQdz6_izfWC5kGW2PbhG5HGvklMcPE8&s=10', 'Elegant orchids.', NULL, true),
  (104, '#F004', 'Daisies', 'Flowers', 'Daisies', 50, 50, 750.00,  'https://gardenerspath.com/wp-content/uploads/2025/04/How-to-Grow-and-Care-for-Shasta-Daisies-Hero.jpg', 'Colorful daisies.', NULL, true),
  (105, '#F005', 'Tulips', 'Flowers', 'Tulips', 42, 42, 850.00,  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToPl1sPSiYYeRdtmBCI6E22YsgwyAgir7GQxnZERFXAwG0E6z36AquX0k2dJLsG8JtOnjZ1Q3f4CyJNows1T4O__MwnEw6ibAt2n6uQXI&s=10', 'Stunning tulips.', NULL, true),
  (106, '#F006', 'Geranium', 'Flowers', 'Geranium', 26, 26, 1000.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSikKxFUpb1fZP3eD1OJ64irsEe2CMi6FwPp9mydhh4f0yyTcjtpInXMCAlf6UdCl5yGLEIdL7GihGvAkMsMXV2smiJ4Iz70-MPoXoJUQ&s=10', 'Vibrant geraniums.', NULL, true),

  -- ===== TOOLS (201-206) =====
  (201, '#T001', 'Watering Can', 'Tools', 'Watering Cans', 24, 24, 200.00, 'https://i5.walmartimages.com/asr/d52679e9-d9f9-472d-a646-fe1bef8054c8.3eb5b3d1d84272db66dae65f9e8489b6.jpeg', 'Premium watering can with ergonomic handle and precision spout.', NULL, true),
  (202, '#T002', 'Shears', 'Tools', 'Shears', 18, 18, 280.00, 'https://ikrorwxhqlrrli5q.ldycdn.com/cloud/lpBpqKlmlmSRnjrnqjopip/gt2074.jpg', 'Professional-grade pruning shears with stainless steel blades.', NULL, true),
  (203, '#T003', 'Hand Trowel', 'Tools', 'Hand Trowels', 32, 32, 300.00, 'https://m.media-amazon.com/images/I/613nbx+ByoL._AC_SL1500_.jpg', 'Durable hand trowel perfect for digging and planting.', NULL, true),
  (204, '#T004', 'Shovel', 'Tools', 'Shovels', 15, 15, 750.00, 'https://tse3.mm.bing.net/th/id/OIP.rxbu9BWALeMZolXKtf_h-gHaGG?rs=1&pid=ImgDetMain&o=7&rm=3', 'Heavy-duty shovel with reinforced handle.', NULL, true),
  (205, '#T005', 'Rakes', 'Tools', 'Rakes', 12, 12, 850.00, 'https://tse1.mm.bing.net/th/id/OIP.G68v1b-wmIoBlENwV-EH4gHaE8?w=1500&h=1000&rs=1&pid=ImgDetMain&o=7&rm=3', 'Professional garden rake with wide head.', NULL, true),
  (206, '#T006', 'Garden Fork', 'Tools', 'Garden Fork', 10, 10, 1000.00, 'https://tse3.mm.bing.net/th/id/OIP.Wl8SM-yoZI7vJVMcsc0T-gHaHa?w=600&h=600&rs=1&pid=ImgDetMain&o=7&rm=3', 'Sturdy garden fork ideal for turning soil.', NULL, true),

  -- ===== POTS (301-306) =====
  (301, '#P001', 'Potted Sensation Plant', 'Pots', 'Ceramic', 20, 20, 350.00,  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=700&q=80', 'Decorative ceramic planter with wooden stand. Perfect for showing off your plants.', 'New', true),
  (302, '#P002', 'Elevated Planter with Wooden Stand', 'Pots', 'Ceramic', 16, 16, 380.00,  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTofD-bJpZhJOVb1NphYroeiLqPSwloDa8nsA&s', 'Decorative ceramic planter with wooden stand. Perfect for showing off your plants.', NULL, true),
  (303, '#P003', 'Venetian Tall Fiberglass Planter', 'Pots', 'Fiberglass', 12, 12, 550.00,  'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=700&q=80', 'Decorative ceramic planter with wooden stand. Perfect for showing off your plants.', NULL, true),
  (304, '#P004', 'Ribbed Tall Fiberglass Planters', 'Pots', 'Fiberglass', 10, 10, 690.00,  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQP9c3vVN_0qwFQ88518lWBtnOjjj8DSM4ndQ&s', 'Decorative ceramic planter with wooden stand. Perfect for showing off your plants.', NULL, true),
  (305, '#P005', 'Terracotta Pots', 'Pots', 'Terracotta', 34, 34, 450.00,  'https://www.livemoor.co.uk/cdn/shop/files/1_d8b4cad6-6255-4e13-ab27-999c6abc6a0c.jpg?v=1718832910', 'Decorative ceramic planter with wooden stand. Perfect for showing off your plants.', NULL, true),
  (306, '#P006', 'Terraneo Zonarati Terracotta Pot', 'Pots', 'Terracotta', 8, 8, 1200.00, 'https://www.architecturalplants.com/wp-content/uploads/2024/08/WhatsApp-Image-2024-08-09-at-14-15-53_ab998084.jpg', 'Decorative ceramic planter with wooden stand. Perfect for showing off your plants.', NULL, true),

  -- ===== FERTILIZERS (401-406) =====
  (401, '#B001', 'Compost', 'Fertilizers', 'Organic', 40, 40, 350.00,  'https://5.imimg.com/data5/CM/QR/KC/SELLER-8167092/organic-compost-fertilizer-500x500.jpg', 'Nutrient-rich organic compost, ideal for enriching soil and boosting plant health naturally.', NULL, true),
  (402, '#B002', 'Liquid Fertilizer', 'Fertilizers', 'Liquid', 28, 28, 380.00,  'https://tiimg.tistatic.com/fp/1/008/434/liquid-bio-fertilizer-for-fast-crop-growing-use-075.jpg', 'Fast-absorbing liquid fertilizer for quick nutrient uptake and vibrant foliage.', NULL, true),
  (403, '#B003', 'Granular Fertilizer', 'Fertilizers', 'Granular', 25, 25, 550.00,  'https://www.hhfertilizer.com/images/goods/7_2024031109485899411.jpg', 'Slow-release granular formula provides steady nutrients for up to 3 months.', NULL, true),
  (404, '#B004', 'Organic Fertilizer', 'Fertilizers', 'Organic', 30, 30, 690.00,  'https://img.freepik.com/premium-photo/organic-fertilizer-isolated-white-background_1313004-201.jpg', 'Certified organic blend of natural ingredients for sustainable gardening.', NULL, true),
  (405, '#B005', 'Plant Booster', 'Fertilizers', 'Liquid', 22, 22, 450.00,  'https://www.gardeningera.com/wp-content/uploads/2024/05/Gardening-Era-1.png', 'Energizing plant booster with essential micronutrients for stronger roots and blooms.', NULL, true),
  (406, '#B006', 'Rock Phosphate', 'Fertilizers', 'Soil Enhancers', 14, 14, 1200.00, 'https://5.imimg.com/data5/SELLER/Default/2023/4/300299368/TE/WR/AX/186880872/download-1-jpeg-500x500.jpeg', 'Natural rock phosphate powder, excellent long-term phosphorus source.', NULL, true)

ON CONFLICT (item_code) DO UPDATE SET
  name        = EXCLUDED.name,
  "group"     = EXCLUDED."group",
  category    = EXCLUDED.category,
  quantity    = EXCLUDED.quantity,
  stock       = EXCLUDED.stock,
  price       = EXCLUDED.price,
  image       = EXCLUDED.image,
  description = EXCLUDED.description,
  badge       = EXCLUDED.badge,
  is_active   = EXCLUDED.is_active,
  updated_at  = now();
