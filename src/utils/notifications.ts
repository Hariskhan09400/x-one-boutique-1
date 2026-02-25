import toast from 'react-hot-toast';

export const showOrderSuccessToast = (paymentId: string) => {
  // 1. WhatsApp-style notification sound
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
  audio.play().catch(err => console.log("Sound play error:", err));

  // 2. Custom Premium Gold Toast
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-in fade-in zoom-in duration-300' : 'animate-out fade-out zoom-out duration-300'
      } max-w-sm w-full bg-[#0f0f0f] border-2 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)] rounded-2xl pointer-events-auto flex overflow-hidden`}
    >                                                                       //yeh sab code app.tsx se direk hogaya hai abb isksa mtlb nahi hai 
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xs">X1</span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-0.5">
              From X-One Boutique
            </p>
            <p className="text-sm font-bold text-white leading-snug">
              Order Placed! Payment Successful. 🛍️
            </p>
            <p className="mt-1 text-[10px] text-gray-400 font-medium">
              Your style is being packed with love!
            </p>
            <div className="mt-2">
              <span className="text-[8px] font-mono text-amber-500/70 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase">
                ID: {paymentId.substring(0, 12)}...
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex border-l border-white/5">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full px-4 flex items-center justify-center text-xs font-black uppercase text-amber-500 hover:bg-amber-500/10 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  ), { 
    duration: 6000, 
    position: 'top-right' 
  });
};