import { listCategoriesTool } from './list-categories';
import { listProductsTool } from './list-products';
import { getProductDetailsTool } from './get-product-details';
import { updateProductTool } from './update-product';
import { bulkUpdateProductsTool } from './bulk-update-products';
import { searchProductsTool } from './search-products';
import { deleteProductTool } from './delete-product';
import { createProductTool } from './create-product';
import { updateAIDescriptionTool } from './update-ai-description';
import { analyzeManualTool } from './analyze-manual';
import { auditCatalogTool } from './audit-catalog';
import { bulkUpdateAIDescriptionsTool } from './bulk-update-ai-descriptions';

export const productTools = {
    list_categories: listCategoriesTool,
    list_products: listProductsTool,
    get_product_details: getProductDetailsTool,
    update_product: updateProductTool,
    bulk_update_products: bulkUpdateProductsTool,
    search_products: searchProductsTool,
    delete_product: deleteProductTool,
    create_product: createProductTool,
    update_ai_description: updateAIDescriptionTool,
    analyze_manual: analyzeManualTool,
    audit_catalog: auditCatalogTool,
    bulk_update_ai_descriptions: bulkUpdateAIDescriptionsTool,
};
