/**
 * Utilidades para manejo de productos con nueva estructura
 */

/**
 * Genera un SKU automático para productos/variants
 */
export function generateSKU(productName?: string): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const prefix = productName ? productName.substring(0, 3).toUpperCase() : 'AZK';
  return `${prefix}-${year}-${random}`;
}

/**
 * Extrae especificaciones técnicas del nombre del producto
 */
export function extractSpecsFromName(productName: string): Record<string, any> | null {
  const name = productName.toLowerCase();
  const specs: Record<string, any> = {};
  
  // Extraer tamaño (ej: "9m", "135x41")
  const sizeMatch = name.match(/(\d+(\.\d+)?)\s*m/) || name.match(/(\d+)x(\d+)/);
  if (sizeMatch) {
    if (name.includes('x')) {
      specs.size = `${sizeMatch[1]}x${sizeMatch[2]}cm`;
    } else {
      specs.size = `${sizeMatch[1]}m`;
    }
  }
  
  // Extraer año (ej: "(2024)", "2024")
  const yearMatch = name.match(/\((\d{4})\)/) || name.match(/(?:^|\s)(\d{4})(?:$|\s)/);
  if (yearMatch) {
    specs.year = parseInt(yearMatch[1]);
  }
  
  // Detectar material
  if (name.includes('carbon')) specs.material = 'Carbon';
  else if (name.includes('alumin')) specs.material = 'Aluminum';
  else if (name.includes('ripstop')) specs.material = 'Ripstop Nylon';
  else if (name.includes('pvc')) specs.material = 'PVC';
  else if (name.includes('wood')) specs.material = 'Wood';
  
  // Detectar condición
  if (name.includes('seminuev') || name.includes('segunda mano') || name.includes('usado') || name.includes('second hand')) {
    specs.condition = 'used';
  } else if (name.includes('demo') || name.includes('test')) {
    specs.condition = 'demo';
  } else if (name.includes('refurbished') || name.includes('reacondicionado')) {
    specs.condition = 'refurbished';
  }
  
  // Extraer versión (ej: "V4", "V7")
  const versionMatch = name.match(/v(\d+)/i);
  if (versionMatch) {
    if (!specs.technicalDetails) specs.technicalDetails = {};
    specs.technicalDetails.version = `V${versionMatch[1]}`;
  }
  
  // Extraer marca si está en el nombre
  const brands = ['eleveight', 'axis', 'slingshot', 'duotone', 'cabrinha', 'north', 'core', 'f-one'];
  for (const brand of brands) {
    if (name.includes(brand)) {
      specs.brand = brand.charAt(0).toUpperCase() + brand.slice(1);
      break;
    }
  }
  
  return Object.keys(specs).length > 0 ? specs : null;
}

/**
 * Crea una variant por defecto para productos simples
 */
export function createDefaultVariant(productData?: {
  price?: number;
  stock?: number;
  size?: string;
  productName?: string;
}): any {
  return {
    sku: generateSKU(productData?.productName),
    color: 'Default',
    size: productData?.size || 'Standard',
    price: productData?.price || 0,
    stock: productData?.stock || 1,
    saleInfo: {
      type: 'None',
      discountPercent: 0
    }
  };
}

/**
 * Verifica si un producto tiene problemas de estructura
 */
export function hasStructureIssues(product: any): {
  missingVariants: boolean;
  hasRootPriceStock: boolean;
  variantsWithoutSku: boolean;
} {
  return {
    missingVariants: !product.variants || product.variants.length === 0,
    hasRootPriceStock: product.price !== undefined || product.stock !== undefined,
    variantsWithoutSku: product.variants?.some((v: any) => !v.sku) || false
  };
}

/**
 * Obtiene el precio de un producto (de la primera variant)
 */
export function getProductPrice(product: any): number {
  if (!product.variants || product.variants.length === 0) {
    return 0;
  }
  return product.variants[0]?.price || 0;
}

/**
 * Obtiene el stock total de un producto (suma de todas las variants)
 */
export function getProductStock(product: any): number {
  if (!product.variants || product.variants.length === 0) {
    return 0;
  }
  return product.variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
}

/**
 * Prepara datos de producto para creación/actualización
 */
export function prepareProductData(data: any, isUpdate: boolean = false): any {
  const prepared: any = { ...data };
  
  // Asegurar que hay al menos una variant
  if (!prepared.variants || prepared.variants.length === 0) {
    prepared.variants = [createDefaultVariant({
      price: data.price,
      stock: data.stock,
      size: data.size,
      productName: data.name
    })];
  }
  
  // Asegurar que todas las variants tienen SKU
  if (prepared.variants) {
    prepared.variants = prepared.variants.map((variant: any, index: number) => ({
      ...variant,
      sku: variant.sku || `${data.productNumber || 'AZK'}-V${index + 1}`
    }));
  }
  
  // Extraer specs del nombre si no se proporcionaron
  if (data.name && (!data.size || !data.year || !data.material)) {
    const extractedSpecs = extractSpecsFromName(data.name);
    if (extractedSpecs) {
      if (!data.size && extractedSpecs.size) prepared.size = extractedSpecs.size;
      if (!data.year && extractedSpecs.year) prepared.year = extractedSpecs.year;
      if (!data.material && extractedSpecs.material) prepared.material = extractedSpecs.material;
      if (!data.condition && extractedSpecs.condition) prepared.condition = extractedSpecs.condition;
      if (extractedSpecs.technicalDetails) {
        prepared.technicalDetails = {
          ...(data.technicalDetails || {}),
          ...extractedSpecs.technicalDetails
        };
      }
    }
  }
  
  // Si es update, no incluimos price/stock en root
  if (isUpdate) {
    delete prepared.price;
    delete prepared.stock;
  }
  
  return prepared;
}