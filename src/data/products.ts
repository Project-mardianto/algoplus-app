import { Product } from '@/types/product';

export const products: Product[] = [
  {
    id: '1',
    name: 'Air Murni RO',
    type: 'Natural Mineral',
    price: 25000,
    image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&q=80',
    description: 'Air mineral alami murni dari mata air pegunungan',
    unit: 'galon'
  },
  {
    id: '2',
    name: 'Es Kristal 5kg',
    type: 'Reverse Osmosis',
    price: 20000,
    image: 'https://mesra.luberta.com/wp-content/uploads/sites/46/2016/01/Mesin-Pembuat-Ice-Tube.jpg',
    description: 'Air murni canggih melalui proses RO',
    unit: 'bungkus'
  },
  {
    id: '3',
    name: 'Es Kristal 10kg',
    type: 'pH 8.5+',
    price: 30000,
    image: 'https://mesra.luberta.com/wp-content/uploads/sites/46/2016/01/Mesin-Pembuat-Ice-Tube.jpg',
    description: 'Air alkali pH tinggi untuk hidrasi yang lebih baik',
    unit: 'bungkus'
  },
  {
    id: '4',
    name: 'Es Kristal 20kg',
    type: 'O2 Enhanced',
    price: 28000,
    image: 'https://mesra.luberta.com/wp-content/uploads/sites/46/2016/01/Mesin-Pembuat-Ice-Tube.jpg',
    description: 'Air yang diperkaya oksigen untuk vitalitas yang lebih baik',
    unit: 'bungkus'
  }
];
