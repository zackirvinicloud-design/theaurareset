export const PRODUCT_NAME = "The Gut Brain Journal";
export const PRODUCT_PRICE = "$39.97";
export const PRODUCT_ORIGINAL_PRICE = "$79";
export const PRODUCT_PROMISE =
  "A guided 21-day cleanse command center that tells you what to do today, what to buy before you start, what feels normal, and where to get help when you get stuck.";
export const PRODUCT_PRIMARY_CTA = "Start 3-Day Free Trial";

const RAW_WHOP_CHECKOUT_URL = import.meta.env.VITE_WHOP_CHECKOUT_URL?.trim() ?? "";

export const getWhopCheckoutUrl = () => {
  return RAW_WHOP_CHECKOUT_URL.length > 0 ? RAW_WHOP_CHECKOUT_URL : null;
};

export const hasWhopCheckoutUrl = () => Boolean(getWhopCheckoutUrl());
