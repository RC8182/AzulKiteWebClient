/**
 * Utilidades para manejo de medios (imágenes, archivos)
 */

const UPLOADS_BASE_URL = '/uploads';

export function getMediaUrl(url: string | null) {
  if (!url) return null;
  
  // Si ya es una URL completa
  if (url.startsWith('http') || url.startsWith('//')) {
    return url;
  }
  
  // Si es una ruta relativa
  if (url.startsWith('/')) {
    return url;
  }
  
  // Asumir que está en uploads
  return `${UPLOADS_BASE_URL}/${url}`;
}

export function getProductImageUrl(productSlug: string, imageName: string) {
  return `${UPLOADS_BASE_URL}/products/${productSlug}/${imageName}`;
}

export function getCategoryImageUrl(categorySlug: string, imageName: string) {
  return `${UPLOADS_BASE_URL}/categories/${categorySlug}/${imageName}`;
}

export function optimizeImageUrl(url: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
} = {}) {
  // En producción, usar servicio de optimización de imágenes
  // Por ahora, devolver la URL original
  return url;
}

export async function uploadMedia(file: File, options: {
  productId?: string;
  categoryId?: string;
  type?: 'product' | 'category' | 'general';
} = {}) {
  const formData = new FormData();
  formData.append('file', file);
  
  if (options.productId) {
    formData.append('productId', options.productId);
  }
  
  if (options.categoryId) {
    formData.append('categoryId', options.categoryId);
  }
  
  if (options.type) {
    formData.append('type', options.type);
  }
  
  const response = await fetch('/api/media/upload', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload media');
  }
  
  return response.json();
}