export const KIRIUS_CAP_SLUG = "gorro-gimnasio-del-cerebro";

export function productDetailPath(slug: string) {
  return slug === KIRIUS_CAP_SLUG ? `/productos/${slug}` : null;
}

export function productCatalogActionPath(slug: string) {
  return productDetailPath(slug) || `/checkout/producto/${slug}`;
}
