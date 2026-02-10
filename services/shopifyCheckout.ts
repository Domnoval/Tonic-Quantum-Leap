import { CartItem } from '../types';

const SHOPIFY_DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN || 'tonic-thought-studios-2.myshopify.com';
const STOREFRONT_ACCESS_TOKEN = import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN || '';

const CHECKOUT_CREATE_MUTATION = `
  mutation checkoutCreate($input: CheckoutCreateInput!) {
    checkoutCreate(input: $input) {
      checkout {
        id
        webUrl
      }
      checkoutUserErrors {
        code
        field
        message
      }
    }
  }
`;

/**
 * Creates a Shopify checkout from cart items and returns the checkout URL.
 * User gets redirected to Shopify's hosted checkout page to complete payment.
 */
export const createCheckout = async (cartItems: CartItem[]): Promise<string | null> => {
  if (!STOREFRONT_ACCESS_TOKEN) {
    console.error('Shopify Storefront token not configured');
    return null;
  }

  // Build line items from cart using variant IDs
  const lineItems = cartItems.map(item => ({
    variantId: item.variantId || item.id,
    quantity: item.quantity,
  }));

  try {
    const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query: CHECKOUT_CREATE_MUTATION,
        variables: {
          input: { lineItems },
        },
      }),
    });

    const json = await response.json();
    
    if (json.errors) {
      console.error('Shopify checkout errors:', json.errors);
      return null;
    }

    const checkout = json.data?.checkoutCreate?.checkout;
    const errors = json.data?.checkoutCreate?.checkoutUserErrors;

    if (errors?.length > 0) {
      console.error('Checkout user errors:', errors);
      return null;
    }

    return checkout?.webUrl || null;
  } catch (error) {
    console.error('Failed to create checkout:', error);
    return null;
  }
};
