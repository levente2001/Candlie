import { fetchAllSiteContent } from '@/api/siteContent';

const EMAIL_KEYS = {
  orderConfirmSubject: 'emails.order_confirm.subject',
  orderConfirmBody: 'emails.order_confirm.body',
  statusSubject: 'emails.status.subject',
  statusBody: 'emails.status.body',
  statusTrigger: 'emails.status.trigger',
};

const STATUS_LABELS = {
  pending: 'Fuggoben',
  processing: 'Feldolgozas',
  shipped: 'Szallitva',
  delivered: 'Kezbesitve',
  cancelled: 'Torolve',
  payment_pending: 'Fizetesre var',
  paid: 'Fizetve',
};

const DEFAULTS = {
  [EMAIL_KEYS.orderConfirmSubject]: 'Rendeles visszaigazolas - {{order_id}}',
  [EMAIL_KEYS.orderConfirmBody]:
    'Szia {{customer_name}}!\\n\\nKoszonjuk a rendelesedet.\\nRendeles azonosito: {{order_id}}\\nStatusz: {{order_status_label}}\\nVegosszeg: {{total_amount}} Ft\\n\\nTetel(ek):\\n{{items_summary}}\\n\\nUdvozlettel,\\nCandlie',
  [EMAIL_KEYS.statusSubject]: 'Rendeles statusz frissites - {{order_id}}',
  [EMAIL_KEYS.statusBody]:
    'Szia {{customer_name}}!\\n\\nA rendelesed statusza frissult.\\nRendeles azonosito: {{order_id}}\\nUj statusz: {{order_status_label}}\\n\\nUdvozlettel,\\nCandlie',
  [EMAIL_KEYS.statusTrigger]: 'processing',
};

function getEnv() {
  return {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
    orderTemplateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID_ORDER,
    statusTemplateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID_STATUS,
  };
}

function formatItems(items = []) {
  if (!Array.isArray(items) || items.length === 0) return '-';
  return items
    .map((item) => {
      const name = item?.product_name || item?.name || 'Termek';
      const size = item?.size ? ` (${item.size})` : '';
      const qty = Number(item?.quantity || 0);
      return `- ${name}${size} x ${qty}`;
    })
    .join('\n');
}

function interpolate(template, vars) {
  return String(template || '').replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key) => {
    const value = vars[key];
    return value == null ? '' : String(value);
  });
}

function buildVars(order, statusOverride) {
  const status = statusOverride || order?.status || '';
  return {
    customer_name: order?.customer_name || 'Vasarlo',
    customer_email: order?.customer_email || '',
    order_id: order?.id || '',
    order_status: status,
    order_status_label: STATUS_LABELS[status] || status,
    total_amount: Number(order?.total_amount || 0).toLocaleString('hu-HU'),
    shipping_address: order?.shipping_address || '',
    billing_address: order?.billing_address || '',
    payment_method: order?.payment_method || '',
    items_summary: formatItems(order?.items || []),
  };
}

async function loadEmailContent() {
  const all = await fetchAllSiteContent();
  return {
    orderConfirmSubject: all?.[EMAIL_KEYS.orderConfirmSubject] || DEFAULTS[EMAIL_KEYS.orderConfirmSubject],
    orderConfirmBody: all?.[EMAIL_KEYS.orderConfirmBody] || DEFAULTS[EMAIL_KEYS.orderConfirmBody],
    statusSubject: all?.[EMAIL_KEYS.statusSubject] || DEFAULTS[EMAIL_KEYS.statusSubject],
    statusBody: all?.[EMAIL_KEYS.statusBody] || DEFAULTS[EMAIL_KEYS.statusBody],
    statusTrigger: all?.[EMAIL_KEYS.statusTrigger] || DEFAULTS[EMAIL_KEYS.statusTrigger],
  };
}

async function sendWithEmailJs({ toEmail, subject, message, templateId, extra = {} }) {
  const { serviceId, publicKey } = getEnv();

  if (!serviceId || !publicKey || !templateId) {
    return { ok: false, skipped: true, reason: 'missing_keys' };
  }
  if (!toEmail) {
    return { ok: false, skipped: true, reason: 'missing_recipient' };
  }

  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        to_email: toEmail,
        subject,
        message,
        ...extra,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`EmailJS hiba (${res.status}): ${text.slice(0, 200)}`);
  }

  return { ok: true };
}

export const EMAIL_CONTENT_KEYS = EMAIL_KEYS;

export async function sendOrderConfirmationEmail(order) {
  const { orderTemplateId } = getEnv();
  const content = await loadEmailContent();
  const vars = buildVars(order);

  const subject = interpolate(content.orderConfirmSubject, vars);
  const message = interpolate(content.orderConfirmBody, vars);

  return sendWithEmailJs({
    toEmail: vars.customer_email,
    subject,
    message,
    templateId: orderTemplateId,
    extra: vars,
  });
}

export async function sendStatusUpdateEmail(order, newStatus) {
  const { statusTemplateId } = getEnv();
  const content = await loadEmailContent();

  if (String(content.statusTrigger || '') !== String(newStatus || '')) {
    return { ok: false, skipped: true, reason: 'status_not_trigger' };
  }

  const vars = buildVars(order, newStatus);
  const subject = interpolate(content.statusSubject, vars);
  const message = interpolate(content.statusBody, vars);

  return sendWithEmailJs({
    toEmail: vars.customer_email,
    subject,
    message,
    templateId: statusTemplateId,
    extra: vars,
  });
}
