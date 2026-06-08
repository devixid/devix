import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  resolvePaymentProviderId,
  isPaymentProviderConfigured,
} from "@/lib/payment";
import { isStripeConfigured } from "@/lib/stripe";
import { isLemonSqueezyConfigured } from "@/lib/lemonsqueezy";
import { resolveProductAmount, formatMinor } from "@/lib/money";
import { EmbeddedProductCheckout } from "@/components/molecules/EmbeddedProductCheckout";
import { LemonOverlayCheckout } from "@/components/molecules/LemonOverlayCheckout";

export const metadata = {
  title: "Checkout — Devix Store",
  robots: { index: false, follow: false },
};

type CheckoutPageProps = {
  searchParams: Promise<{ product?: string }>;
};

export default async function StoreCheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const { product: slug } = await searchParams;
  const providerId = await resolvePaymentProviderId();
  const providerReady = isPaymentProviderConfigured(providerId);

  const product =
    slug && providerReady
      ? await prisma.product.findUnique({ where: { slug } })
      : null;

  const stripeEmbeddedReady =
    providerId === "stripe" &&
    Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

  const lemonReady =
    providerId === "lemonsqueezy" &&
    isLemonSqueezyConfigured() &&
    Boolean(product?.lemonSqueezyVariantId);

  return (
    <div className="grain-overlay min-h-screen bg-white px-6 pt-[120px] pb-32">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-syne mb-8 text-center text-3xl font-bold tracking-tight text-zinc-900">
          Secure Checkout
        </h1>

        {!providerReady ? (
          <p className="text-center text-zinc-600">
            Payments are not configured yet. Please contact support or try again
            later.
          </p>
        ) : !product || !product.isVisible ? (
          <div className="text-center text-zinc-600">
            <p>This product is unavailable.</p>
            <Link
              href="/store"
              className="mt-6 inline-block border border-black bg-black px-6 py-3 text-sm font-medium tracking-widest text-white uppercase transition-colors hover:bg-white hover:text-black"
            >
              Back to store
            </Link>
          </div>
        ) : providerId === "stripe" && !stripeEmbeddedReady ? (
          <p className="text-center text-zinc-600">
            Embedded checkout is not configured. Please use the standard
            checkout from the store.
          </p>
        ) : providerId === "lemonsqueezy" && !lemonReady ? (
          <p className="text-center text-zinc-600">
            This product is not configured for Lemon Squeezy checkout yet.
          </p>
        ) : (
          (() => {
            const { amountMinor, currency } = resolveProductAmount(product);
            const priceLabel = formatMinor(amountMinor, currency);

            if (providerId === "lemonsqueezy") {
              return (
                <LemonOverlayCheckout
                  productId={product.id}
                  productName={product.name}
                  priceLabel={priceLabel}
                />
              );
            }

            if (providerId === "stripe" && isStripeConfigured()) {
              return (
                <EmbeddedProductCheckout
                  productId={product.id}
                  productName={product.name}
                  priceLabel={priceLabel}
                />
              );
            }

            return (
              <p className="text-center text-zinc-600">
                Checkout is unavailable for the active payment provider.
              </p>
            );
          })()
        )}
      </div>
    </div>
  );
}
