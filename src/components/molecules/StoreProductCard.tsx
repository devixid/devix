"use client";

import { useState } from "react";
import Image from "next/image";
import { Product } from "@prisma/client";
import { CheckoutModal } from "./CheckoutModal";

interface StoreProductCardProps {
  product: Product;
  index?: number;
  priority?: boolean;
}

export function StoreProductCard({ product, priority = false }: StoreProductCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden border border-zinc-200 bg-white transition-all hover:shadow-lg">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200">
          {product.previewUrl ? (
            <Image
              src={product.previewUrl}
              alt={product.name}
              fill
              priority={priority}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-zinc-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-syne text-xl font-bold text-zinc-900 line-clamp-2">
              {product.name}
            </h3>
            <span className="shrink-0 bg-zinc-100 px-3 py-1 text-sm font-semibold text-zinc-900">
              ${product.price.toFixed(2)}
            </span>
          </div>
          
          <p className="mt-3 line-clamp-3 text-sm text-zinc-600">
            {product.description}
          </p>

          <div className="mt-auto pt-6">
            <button
              onClick={() => setIsOpen(true)}
              className="w-full border border-black bg-black px-6 py-3 text-sm font-medium tracking-widest text-white uppercase transition-colors hover:bg-white hover:text-black"
            >
              Get Template
            </button>
          </div>
        </div>
      </div>

      <CheckoutModal 
        isOpen={isOpen} 
        onOpenChange={setIsOpen} 
        product={product} 
      />
    </>
  );
}
