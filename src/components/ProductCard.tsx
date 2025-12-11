
import { Product } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface ProductCardProps {
  product: Product;
  quantity: number;
  onQuantityChange: (product: Product, quantity: number) => void;
}

export default function ProductCard({ product, quantity, onQuantityChange }: ProductCardProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleIncrement = () => {
    onQuantityChange(product, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      onQuantityChange(product, quantity - 1);
    }
  };

  if (isDesktop) {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
        <div className="h-48 w-full bg-gray-100 flex items-center justify-center">
          <img src={product.image} alt={product.name} className="h-full w-full object-contain" />
        </div>
        <CardContent className="p-4 flex flex-col flex-grow">
          <div className="flex-grow">
            <h3 className="font-bold text-lg text-gray-900 mb-1">{product.name}</h3>
            <p className="text-sm text-gray-600 mb-3">
              {product.description}
            </p>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div>
              <p className="text-2xl font-bold text-card-foreground">
                Rp {product.price.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-gray-500">per {product.unit || 'gallon'}</p>
            </div>
            {quantity === 0 ? (
              <Button
                onClick={handleIncrement}
                className="hover:bg-orange-700 text-white px-6 bg-[#ea580c]"
              >
                Add
              </Button>
            ) : (
              <div className="flex items-center gap-2 bg-black-50 rounded-lg p-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleDecrement}
                  className="h-8 w-8 rounded-md hover:bg-black-100"
                >
                  <Minus className="h-4 w-4 text-black-600" />
                </Button>
                <span className="font-bold text-black-600 w-8 text-center">
                  {quantity}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleIncrement}
                  className="h-8 w-8 rounded-md hover:bg-black-100"
                >
                  <Plus className="h-4 w-4 text-black-600" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
      <div className="flex items-center">
        <img src={product.image} alt={product.name} className="h-20 w-20 object-contain mr-4" />
        <div>
          <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
          <p className="text-sm text-gray-600">{product.description}</p>
          <p className="text-lg font-bold">Rp{product.price.toLocaleString("id-ID")}</p>
          <p className="text-xs text-gray-500">per {product.unit || 'gallon'}</p>
        </div>
      </div>
      {quantity === 0 ? (
        <Button
          onClick={handleIncrement}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
        >
          Add
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={handleDecrement} className="h-8 w-8 rounded-md hover:bg-gray-100">
            <Minus className="h-4 w-4 text-gray-600" />
          </Button>
          <span className="font-bold text-gray-600 w-8 text-center">{quantity}</span>
          <Button size="icon" variant="ghost" onClick={handleIncrement} className="h-8 w-8 rounded-md hover:bg-gray-100">
            <Plus className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
      )}
    </div>
  );
}
