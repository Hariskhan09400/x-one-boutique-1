import { useState, useEffect } from 'react';
import { Product } from '../types';
import { X, ShoppingCart } from 'lucide-react';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  /* Reset image when product changes */
  useEffect(() => {
    setSelectedImage(0);
  }, [product]);

  /* Handle history safely */
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    // Push dummy state
    window.history.pushState({ modalOpen: true }, '');

    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.modalOpen) {
        onClose();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onClose]);

  const images = product.images || [];
  const currentImage = images[selectedImage] || '';
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleClose = () => {
    onClose();

    // Go back ONLY if modal state exists
    if (window.history.state?.modalOpen) {
      window.history.go(-1);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">

      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* MODAL */}
      <div className="relative z-10 max-w-6xl w-full rounded-3xl bg-gray-900 p-6 shadow-2xl">

        {/* CLOSE BUTTON */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2 rounded-full"
        >
          <X size={22} />
        </button>

        <div className="grid md:grid-cols-2 gap-10 items-center">

          {/* IMAGE SECTION */}
          <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden rounded-3xl">

            <div
              style={{
                backgroundImage: `url(${currentImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(45px)',
                transform: 'scale(1.3)',
                opacity: 0.4,
                position: 'absolute',
                inset: 0,
                transition: 'all 0.5s ease'
              }}
            />

            <img
              src={currentImage}
              alt={product.name}
              className="relative z-10 max-h-[90%] object-contain transition-all duration-500"
            />

            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-6xl text-white hover:scale-110 transition z-20"
                >
                  ‹
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-6xl text-white hover:scale-110 transition z-20"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* PRODUCT INFO */}
          <div className="text-white">
            <h2 className="text-3xl font-bold mb-3">
              {product.name}
            </h2>

            <div className="text-2xl font-bold mb-4 text-blue-400">
              ₹{product.price}
            </div>

            <p className="text-gray-300 mb-6">
              {product.description}
            </p>

            <button
              onClick={() => {
                onAddToCart(product);
                handleClose();
              }}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition"
            >
              <ShoppingCart size={20} />
              Add to Cart
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
