# Product details + Google Drive images

Copy into `src/app/` (replace shop.service.ts when asked):

    src/app/
      product-details/   (3 files)
      drive-image.util.ts   (NEW)
      shop.service.ts       (UPDATED: converts Drive links)
      app.routes.ts         (must contain the product/:id route)

## How to use Drive images
1. Upload the product photo to Google Drive.
2. Right-click > Share > General access > "Anyone with the link" (Viewer).
3. Copy link and paste it into the product's `image` column (Supabase `products` table)
   or the `image` field in `catalog-preview.ts`.
4. Done: product cards and the details page convert the link automatically.
