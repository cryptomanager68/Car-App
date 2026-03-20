import { Car } from "@/data/cars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Fuel, Gauge, Settings2, Star, Heart, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef } from "react";

interface CarCardProps {
  car: Car;
  onViewDetails: (car: Car) => void;
  onToggleFavorite: (carId: string) => void;
  onToggleCompare: (carId: string) => void;
  isFavorite: boolean;
  isComparing: boolean;
}

export function CarCard({ car, onViewDetails, onToggleFavorite, onToggleCompare, isFavorite, isComparing }: CarCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -12;
    const rotateY = ((x - cx) / cx) * 12;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04,1.04,1.04)`;
    // Shine overlay
    const shine = card.querySelector<HTMLDivElement>(".card-shine");
    if (shine) {
      const px = (x / rect.width) * 100;
      const py = (y / rect.height) * 100;
      shine.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.18) 0%, transparent 65%)`;
      shine.style.opacity = "1";
    }
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
    const shine = card.querySelector<HTMLDivElement>(".card-shine");
    if (shine) shine.style.opacity = "0";
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="car-card-hover group relative rounded-xl bg-card overflow-hidden card-shadow hover:card-shadow-hover"
      style={{ transition: "transform 0.15s ease, box-shadow 0.3s ease", willChange: "transform" }}
    >
      {/* Shine overlay */}
      <div className="card-shine pointer-events-none absolute inset-0 z-10 rounded-xl opacity-0 transition-opacity duration-300" />

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={car.image}
          alt={car.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {car.available ? (
            <Badge className="bg-success text-success-foreground border-0 text-xs">Available</Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">Unavailable</Badge>
          )}
          {car.price > 100000 && (
            <Badge className="bg-primary text-primary-foreground border-0 text-xs">Premium</Badge>
          )}
        </div>
        {/* Favorite */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(car.id); }}
          className={cn(
            "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all",
            isFavorite
              ? "bg-destructive/90 text-destructive-foreground"
              : "bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-destructive"
          )}
        >
          <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-display font-semibold text-card-foreground">{car.name}</h3>
          <p className="text-sm text-muted-foreground">
            {car.engine} · {car.horsepower}hp · {car.year}
          </p>
        </div>

        {/* Specs row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Gauge className="h-3.5 w-3.5" />
            {car.mileage}k mi
          </span>
          <span className="flex items-center gap-1">
            <Fuel className="h-3.5 w-3.5" />
            {car.fuel}
          </span>
          <span className="flex items-center gap-1">
            <Settings2 className="h-3.5 w-3.5" />
            {car.transmission}
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
          <span className="text-sm font-medium text-card-foreground">{car.rating}</span>
          <span className="text-xs text-muted-foreground">({car.reviews})</span>
        </div>

        {/* Price + Actions */}
        <div className="flex flex-col gap-3 pt-2 border-t border-border">
          <span className="text-lg font-bold font-display text-card-foreground">
            ${car.price.toLocaleString()}
          </span>
          <div className="flex gap-2 w-full">
            <Button
              variant={isComparing ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleCompare(car.id)}
              className="text-xs flex-1"
            >
              {isComparing ? "Comparing" : "Compare"}
            </Button>
            <Button size="sm" onClick={() => onViewDetails(car)} className="text-xs gap-1 flex-1">
              Details <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
