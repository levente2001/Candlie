const pageMap = {
  Home: '/',
  Products: '/products',
  ProductDetail: '/product',
  About: '/about',
  Candlie: '/candlie',
  Contact: '/contact',
  Cart: '/cart',
  Checkout: '/checkout',

  AdminDashboard: '/admin',
  AdminProducts: '/admin/products',
  AdminOrders: '/admin/orders',
  AdminShipping: '/admin/shipping',
  CheckoutSuccess: '/checkout/success',
  AdminContentEditor: '/admin/content',
};

export function createPageUrl(page) {
  if (!page) return '/';

  // Support input like 'ProductDetail?id=123'
  const [name, query] = page.split('?');
  const base = pageMap[name] || (name.startsWith('/') ? name : `/${name.toLowerCase()}`);
  return query ? `${base}?${query}` : base;
}
