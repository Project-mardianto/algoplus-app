
import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const sliderImages = [
  {
    src: "https://danone.co.id/wp-content/uploads/2024/09/waters-banner.jpg",
    alt: "Mengenal SLHS Wajib Dimiliki SPPG",
  },
  {
    src: "https://img.lovepik.com/background/20211022/large/lovepik-ice-cubes-background-image_401934609.jpg",
    alt: "Es Kristal",
  },
];

export function ImageSlider() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleDotClick = (index: number) => {
    api?.scrollTo(index);
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 py-6">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {sliderImages.map((image, index) => (
            <CarouselItem key={index}>
              <div className="aspect-video overflow-hidden rounded-lg">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`h-2 w-2 rounded-full ${current === index ? 'bg-gray-700' : 'bg-gray-300'}`}
          />
        ))}
      </div>
    </div>
  );
}
