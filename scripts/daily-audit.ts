import { dealValidator } from '../src/lib/ai/tools/validator';

import { db } from '../src/lib/db';

async function main() {
  console.log('Starting Daily Deal Audit...');
  
  // Fetch products created in the last 24 hours
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const products = await db.vettedProduct.findMany({
    where: {
      createdAt: {
        gte: yesterday,
      },
    },
  });
  
  console.log(`Found ${products.length} products to audit.`);

  for (const product of products) {
    try {
      console.log(`Validating product ${product.id}: ${product.url}`);
      
      const result = await dealValidator.execute?.({ url: product.url }, { toolCallId: 'audit', messages: [] });
      
      if (result && 'price' in result && !('error' in result)) {
         const currentPrice = parseFloat(result.price.replace(/[^0-9.]/g, '')) || 0;
         
         // Update product with new verification data
         await db.vettedProduct.update({
           where: { id: product.id },
           data: {
             price: currentPrice,
             verificationScore: result.verified ? 100 : 0,
             // We could also record price history here
           }
         });
         
         // Record price history
         await db.priceTimeline.create({
           data: {
             vettedProductId: product.id,
             price: currentPrice,
           }
         });
         
         console.log(`Updated product ${product.id}. New price: ${currentPrice}`);
      } else {
        console.warn(`Validation failed for ${product.id}:`, result);
      }
      
    } catch (error) {
      console.error(`Failed to validate product ${product.id}:`, error);
    }
  }
  
  console.log('Audit complete.');
}

main().catch(console.error);
