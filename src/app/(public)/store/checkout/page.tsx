import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isStripeConfigured } from "@/lib/stripe";
import { resolveProductAmount, formatMinor } from "@/lib/money";
import { EmbeddedProductCheckout } from "@/components/molecules/EmbeddedProductCheckout";

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

  const publishableConfigured = Boolean(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  );

  const product =
    slug && isStripeConfigured()
      ? await prisma.product.findUnique({ where: { slug } })
      : null;

  return (
    <div className="grain-overlay min-h-screen bg-white px-6 pt-[120px] pb-32">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-syne mb-8 text-center text-3xl font-bold tracking-tight text-zinc-900">
          Secure Checkout
        </h1>

        {!product || !product.isVisible ? (
          <div className="text-center text-zinc-600">
            <p>This product is unavailable.</p>
            <Link
              href="/store"
              className="mt-6 inline-block border border-black bg-black px-6 py-3 text-sm font-medium tracking-widest text-white uppercase transition-colors hover:bg-white hover:text-black"
            >
              Back to store
            </Link>
          </div>
        ) : !publishableConfigured ? (
          <p className="text-center text-zinc-600">
            Embedded checkout is not configured. Please use the standard
            checkout from the store.
          </p>
        ) : (
          (() => {
            const { amountMinor, currency } = resolveProductAmount(product);
            return (
              <EmbeddedProductCheckout
                productId={product.id}
                productName={product.name}
                priceLabel={formatMinor(amountMinor, currency)}
              />
            );
          })()
        )}
      </div>
    </div>
  );
}
