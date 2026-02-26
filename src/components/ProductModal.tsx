import { useState, useEffect } from 'react';
import { Product } from '../types';
import { X, ShoppingCart, Star, ChevronLeft, ChevronRight } from 'lucide-react'; // Added Chevrons for better UI
import ReviewSection from './ReviewSection';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  user: any;
}

export function ProductModal({ product, onClose, onAddToCart, user }: ProductModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    setSelectedImage(0);
  }, [product]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    window.history.pushState({ modalOpen: true }, '');
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.modalOpen) onClose();
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

  const nextImage = () => setSelectedImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  const handleClose = () => {
    onClose();
    if (window.history.state?.modalOpen) window.history.go(-1);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* BACKDROP */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl transition-opacity duration-300" onClick={handleClose} />

      {/* MODAL */}
      <div className="relative z-10 max-w-6xl w-full max-h-[92vh] overflow-y-auto rounded-[2.5rem] bg-gray-900 shadow-2xl no-scrollbar scroll-smooth border border-white/5">
        
        {/* CLOSE BUTTON - Sticky for better accessibility */}
        <div className="sticky top-6 right-6 z-50 flex justify-end pr-6 pointer-events-none">
          <button
            onClick={handleClose}
            className="pointer-events-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-full transition-all active:scale-90 border border-white/10"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 md:p-12 -mt-16">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            
            {/* IMAGE SECTION */}
            <div className="relative w-full aspect-square md:aspect-auto md:h-[600px] flex items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-b from-white/5 to-transparent">
              <div
                style={{
                  backgroundImage: `url(${currentImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'blur(60px)',
                  transform: 'scale(1.5)',
                  opacity: 0.25,
                  position: 'absolute',
                  inset: 0,
                  transition: 'background-image 0.6s ease-in-out'
                }}
              />
              <img
                key={currentImage} // Forces animation on change
                src={currentImage}
                alt={product.name}
                className="relative z-10 max-h-[85%] object-contain animate-in fade-in zoom-in duration-500"
              />

              {hasMultipleImages && (
                <div className="absolute inset-0 flex items-center justify-between px-6 z-20">
                  <button onClick={prevImage} className="group bg-black/20 hover:bg-black/40 p-3 rounded-full backdrop-blur-sm transition-all border border-white/5">
                    <ChevronLeft className="text-white group-hover:-translate-x-1 transition-transform" size={32} />
                  </button>
                  <button onClick={nextImage} className="group bg-black/20 hover:bg-black/40 p-3 rounded-full backdrop-blur-sm transition-all border border-white/5">
                    <ChevronRight className="text-white group-hover:translate-x-1 transition-transform" size={32} />
                  </button>
                </div>
              )}
            </div>

            {/* PRODUCT INFO */}
            <div className="text-white lg:py-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Premium Arrival
              </div>
              
              <h2 className="text-5xl font-black mb-4 italic uppercase tracking-tighter leading-none">
                {product.name}
              </h2>
              
              <div className="flex items-center gap-3 mb-8">
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => <Star key={i} size={18} fill={i < 4 ? "currentColor" : "none"} className={i < 4 ? "" : "text-gray-600"} />)}
                </div>
                <span className="text-sm text-gray-400 font-bold tracking-wide border-l border-gray-700 pl-3">Trusted by 500+ Stylists</span>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="text-4xl font-black text-white italic">
                  ₹{product.price}
                </div>
                <div className="text-xl text-gray-500 line-through decoration-blue-500/50">
                  ₹{Math.round(product.price * 1.4)}
                </div>
                <div className="bg-green-500/10 text-green-500 text-[10px] font-black px-2 py-1 rounded">
                  40% OFF
                </div>
              </div>

              <p className="text-gray-400 mb-10 leading-relaxed text-base font-medium max-w-prose">
                {product.description || "Indulge in the finest craftsmanship. This piece from X-One Boutique combines contemporary aesthetics with timeless comfort, tailored for those who settle for nothing less than perfection."}
              </p>

              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => {
                    onAddToCart(product);
                    handleClose();
                  }}
                  className="group relative w-full bg-white text-black py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-[0.98] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <ShoppingCart size={22} className="relative z-10 group-hover:text-white transition-colors" />
                  <span className="relative z-10 group-hover:text-white transition-colors tracking-widest uppercase">Add to Bag</span>
                </button>
              </div>
            </div>
          </div>

          {/* --- REVIEW SECTION --- */}
          <div className="mt-20 border-t border-white/5 pt-12">
            <ReviewSection productId={product.id} user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}