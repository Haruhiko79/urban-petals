-- Urban Petals: replace dead / hot-link-blocked product images with
-- verified Wikimedia Commons URLs (checked HTTP 200, stable, no hotlink block).
-- Run in Supabase Dashboard > SQL Editor. Safe to run twice.

UPDATE products SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Hibiscus_petal.jpg/960px-Hibiscus_petal.jpg' WHERE id = 2;

UPDATE products SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Zamioculcas_zamiifolia_1.jpg/960px-Zamioculcas_zamiifolia_1.jpg' WHERE id = 6;

UPDATE products SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Sunflower_sky_backdrop.jpg/960px-Sunflower_sky_backdrop.jpg' WHERE id = 101;

UPDATE products SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Comestible_rose_in_the_Laquenexy_orchard_garden%2C_Moselle%2C_France_%2801%29.jpg/960px-Comestible_rose_in_the_Laquenexy_orchard_garden%2C_Moselle%2C_France_%2801%29.jpg' WHERE id = 102;

UPDATE products SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Zygopetalum_%27Dunkle_Bl%C3%BCte%27.jpg/960px-Zygopetalum_%27Dunkle_Bl%C3%BCte%27.jpg' WHERE id = 103;

UPDATE products SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Red_and_white_tulip_at_Myddelton_House%2C_Enfield%2C_London.jpg/960px-Red_and_white_tulip_at_Myddelton_House%2C_Enfield%2C_London.jpg' WHERE id = 105;

UPDATE products SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Geranium_wallichianum_%27Crystal_Lake%27_06.JPG/960px-Geranium_wallichianum_%27Crystal_Lake%27_06.JPG' WHERE id = 106;

UPDATE products SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Metal_watering_can.jpg/960px-Metal_watering_can.jpg' WHERE id = 201;

UPDATE products SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Langenlois_Weinweg_Installation_Weingartenschere-8276.jpg/960px-Langenlois_Weinweg_Installation_Weingartenschere-8276.jpg' WHERE id = 202;

UPDATE products SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Trowel_Plant_%28PSF%29.png/960px-Trowel_Plant_%28PSF%29.png' WHERE id = 203;

UPDATE products SET image = 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Spades_And_Forks_Ready_For_Gardening._RHS_Wisley_Garden_Surrey_UK.jpg' WHERE id = 204;

UPDATE products SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Gardena_light-duty_rake_and_hoe_detail.jpg/960px-Gardena_light-duty_rake_and_hoe_detail.jpg' WHERE id = 205;

UPDATE products SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Garden_fork.JPG/960px-Garden_fork.JPG' WHERE id = 206;

UPDATE products SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Plectranthus_verticillatus_in_a_ceramic_pot.jpg/960px-Plectranthus_verticillatus_in_a_ceramic_pot.jpg' WHERE id = 302;

UPDATE products SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Balcony_in_Stockholm_2020.jpg/960px-Balcony_in_Stockholm_2020.jpg' WHERE id = 304;

UPDATE products SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Hanging_terracotta_flower_pots_with_succulents_Arta_Mallorca.jpg/960px-Hanging_terracotta_flower_pots_with_succulents_Arta_Mallorca.jpg' WHERE id = 305;

UPDATE products SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Terracotta_amphora_%28jar%29_MET_DP114675.jpg/960px-Terracotta_amphora_%28jar%29_MET_DP114675.jpg' WHERE id = 306;

UPDATE products SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Richmond_Community_Garden_-_compost_bins%2C_Richmond%2C_Christchurch%2C_New_Zealand.jpg/960px-Richmond_Community_Garden_-_compost_bins%2C_Richmond%2C_Christchurch%2C_New_Zealand.jpg' WHERE id = 401;

UPDATE products SET image = 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Kasviravinne.jpg' WHERE id = 402;

UPDATE products SET image = 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Fertilizer.jpg' WHERE id = 403;

UPDATE products SET image = 'https://upload.wikimedia.org/wikipedia/commons/5/5d/CGW_TerraCycle2_%2814106012050%29.jpg' WHERE id = 405;

UPDATE products SET image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Moscow_State_University_phosphorite_2025-02_1739112720.tif/lossy-page1-960px-Moscow_State_University_phosphorite_2025-02_1739112720.tif.jpg' WHERE id = 406;

-- Verify: all rows should show wikimedia URLs and every name present.
SELECT id, name, image FROM products ORDER BY id;
