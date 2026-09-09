import { getProducts, getSettings, getTrainings, type Product, type Training } from "../db/repository";
import { trainingBelongsTo, trainingCategories, type TrainingCategoryKey } from "./training-categories";
import { getSiteOrigin } from "./site-url";

export type WhatsAppCatalogItem = {
  id: string;
  type: "TRAINING" | "PRODUCT";
  category: string;
  name: string;
  slug: string;
  description: string;
  details: string;
  price: string;
  checkoutProvider: string;
  acquisitionUrl: string;
};

export type WhatsAppCatalog = {
  websiteUrl: string;
  catalogUrl: string;
  currentCampaign: WhatsAppCatalogItem | null;
  categories: Record<TrainingCategoryKey, WhatsAppCatalogItem[]>;
  products: WhatsAppCatalogItem[];
  allItems: WhatsAppCatalogItem[];
};

function money(cents: number, currency: string) {
  return new Intl.NumberFormat("es-BO", { style: "currency", currency }).format(cents / 100);
}

function categoryFor(training: Training): TrainingCategoryKey {
  return trainingCategories.find((category) => trainingBelongsTo(training, category.key))?.key || "cursos";
}

function trainingItem(training: Training, origin: string): WhatsAppCatalogItem {
  const category = categoryFor(training);
  return {
    id: training.id,
    type: "TRAINING",
    category,
    name: training.name,
    slug: training.slug,
    description: training.shortDescription,
    details: training.fullDescription,
    price: training.priceCents > 0 ? money(training.priceCents, training.currency) : "Precio no registrado; debe confirmarse en la página de adquisición o con el equipo.",
    checkoutProvider: training.checkoutProvider,
    acquisitionUrl: `${origin}/checkout/entrenamiento/${training.slug}`,
  };
}

function productItem(product: Product, origin: string): WhatsAppCatalogItem {
  return {
    id: product.id,
    type: "PRODUCT",
    category: "productos",
    name: product.name,
    slug: product.slug,
    description: product.description,
    details: product.dashboardContent || "",
    price: product.priceCents > 0 ? money(product.priceCents, product.currency) : product.priceLabel,
    checkoutProvider: product.checkoutProvider,
    acquisitionUrl: `${origin}/checkout/producto/${product.slug}`,
  };
}

export async function getWhatsAppCatalog(): Promise<WhatsAppCatalog> {
  const [trainings, products, settings, origin] = await Promise.all([getTrainings(), getProducts(), getSettings(), getSiteOrigin()]);
  const trainingItems = trainings.map((training) => trainingItem(training, origin));
  const productItems = products.map((product) => productItem(product, origin));
  const categories = Object.fromEntries(trainingCategories.map((category) => [category.key, trainingItems.filter((item) => item.category === category.key)])) as Record<TrainingCategoryKey, WhatsAppCatalogItem[]>;
  const campaignSlug = settings.whatsappCurrentCampaignSlug?.trim() || "";
  const allItems = [...trainingItems, ...productItems];
  const catalogPath = settings.whatsappCatalogPath?.trim().startsWith("/") ? settings.whatsappCatalogPath.trim() : "/entrenamientos";
  return {
    websiteUrl: origin,
    catalogUrl: `${origin}${catalogPath}`,
    currentCampaign: allItems.find((item) => item.slug === campaignSlug) || null,
    categories,
    products: productItems,
    allItems,
  };
}

function searchable(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function detectCatalogInterest(message: string, catalog: WhatsAppCatalog) {
  const normalized = searchable(message);
  const direct = catalog.allItems.find((item) => {
    const name = searchable(item.name).replace(/[^a-z0-9]+/g, " ").trim();
    const slug = searchable(item.slug).replace(/-/g, " ");
    return (name.length >= 5 && normalized.includes(name)) || (slug.length >= 5 && normalized.includes(slug));
  });
  if (direct) return direct.name;
  if (/super\s*cerebro/.test(normalized)) return catalog.currentCampaign?.name || "Super Cerebro";
  return null;
}

export function catalogContext(catalog: WhatsAppCatalog) {
  const categoryText = trainingCategories.map((category) => {
    const items = catalog.categories[category.key];
    const rows = items.length ? items.map((item) => [
      `- ${item.name}`,
      `  Descripción confirmada: ${item.description}`,
      item.details ? `  Detalle confirmado: ${item.details}` : "",
      `  Precio confirmado: ${item.price}`,
      `  Método configurado: ${item.checkoutProvider}`,
      `  Enlace de información y adquisición: ${item.acquisitionUrl}`,
    ].filter(Boolean).join("\n")).join("\n") : "- No hay elementos publicados en esta categoría.";
    return `${category.label.toUpperCase()}\n${rows}`;
  }).join("\n\n");
  const products = catalog.products.length ? catalog.products.map((item) => `- ${item.name}\n  Descripción confirmada: ${item.description}\n  Precio confirmado: ${item.price}\n  Enlace: ${item.acquisitionUrl}`).join("\n") : "- No hay productos publicados.";
  const campaign = catalog.currentCampaign
    ? `${catalog.currentCampaign.name}\nDescripción: ${catalog.currentCampaign.description}\nPrecio: ${catalog.currentCampaign.price}\nEnlace: ${catalog.currentCampaign.acquisitionUrl}`
    : "No hay campaña destacada configurada.";
  return `INFORMACIÓN DINÁMICA CONFIRMADA DEL SISTEMA\nSitio: ${catalog.websiteUrl}\nCatálogo completo: ${catalog.catalogUrl}\n\nCAMPAÑA DESTACADA ACTUAL\n${campaign}\n\nCATÁLOGO DE ENTRENAMIENTOS\n${categoryText}\n\nOTROS PRODUCTOS\n${products}`;
}
