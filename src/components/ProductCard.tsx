import React, { useState } from "react";
import { Product } from "../types";
import { ShoppingCart, X } from "lucide-react";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [open, setOpen] = useState(false);

  const handleVideoClick = (
    e: React.MouseEvent<HTMLVideoElement>
  ) => {
    const video = e.currentTarget;
    video.paused ? video.play() : video.pause();
  };

  const discount =
    product.originalPrice &&
    Math.round(
      ((product.originalPrice - product.price) /
        product.originalPrice) *
        100
    );

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden shadow-lg relative
        transition-all duration-500 hover:shadow-2xl hover:-translate-y-1
        bg-white text-black
        dark:bg-gradient-to-b dark:from-blue-950 dark:to-black dark:text-white"
      >
        {/* IMAGE / VIDEO */}
        <div className="relative w-full overflow-hidden">
          <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar">

            {product.video ? (
              <video
                src={product.video}
                className="w-full h-72 object-cover snap-start flex-shrink-0 cursor-pointer"
                onClick={handleVideoClick}
                muted
              />
            ) : (
              product.images?.map((img, index) => (
                <Link key={index} to={`/product/${product.id}`}>
                  <img
                    src={img}
                    alt={product.name}
                    className="w-full h-72 object-cover snap-start flex-shrink-0 cursor-pointer"
                  />
                </Link>
              ))
            )}

          </div>

          {/* Category Badge */}
          <div className="absolute top-3 left-3 px-3 py-1.5 
          bg-black/70 backdrop-blur-md 
          rounded-full text-xs font-semibold text-white">
            {product.category}
          </div>

          {/* Discount Badge */}
          {discount && (
            <div className="absolute top-3 right-3 px-3 py-1.5 
            bg-red-600 text-white text-xs font-bold 
            rounded-full shadow-md">
              {discount}% OFF
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="p-4">
          <h3 className="font-bold text-lg mb-1">
            {product.name}
          </h3>

          <p className="text-sm mb-3 
          text-gray-600 dark:text-gray-400">
            {product.description}
          </p>

          {/* PRICE + BUTTON */}
          <div className="flex items-center justify-between">

            <div className="flex flex-col">
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
              <span className="text-2xl font-black text-red-600 dark:text-red-400">
                ₹{product.price}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="flex items-center gap-2 
              bg-gradient-to-r from-blue-500 to-cyan-500 
              text-white px-4 py-2 rounded-xl font-bold 
              active:scale-95 hover:scale-105 transition-all duration-200 shadow-md"
            >
              <ShoppingCart size={18} />
              Add
            </button>

          </div>
        </div>
      </div>

      {/* FULL SCREEN MODAL */}
      {open && !product.video && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-6 right-6 text-white hover:text-red-400"
          >
            <X size={32} />
          </button>

          <div className="w-full max-w-4xl overflow-hidden">
            <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar">
              {product.images?.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={product.name}
                  className="w-full max-h-[85vh] object-contain snap-start flex-shrink-0"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}