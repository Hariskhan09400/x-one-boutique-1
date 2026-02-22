export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number   // 👈 ye add karo
  images: string[];
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
}