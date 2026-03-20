import { Car } from "@/data/cars";
import { Button } from "@/components/ui/button";
import { X, Fuel, Gauge, Settings2, Star, Zap } from "lucide-react";

interface ComparisonPanelProps {
  cars: Car[];
  onRemove: (carId: string) => void;
  onClose: () => void;
}

export function ComparisonPanel({ cars, onRemove, onClose }: ComparisonPanelProps) {
  if (cars.length === 0) return null;

  const specs = [
    { label: "Price", render: (c: Car) => `$${c.price.toLocaleString()}` },
    { label: "Year", render: (c: Car) => c.year.toString() },
    { label: "Engine", render: (c: Car) => c.engine },
    { label: "Horsepower", render: (c: Car) => `${c.horsepower}hp`, icon: Zap },
    { label: "Mileage", render: (c: Car) => `${c.mileage}k mi`, icon: Gauge },
    { label: "Fuel", render: (c: Car) => c.fuel, icon: Fuel },
    { label: "Transmission", render: (c: Car) => c.transmission, icon: Settings2 },
    { label: "Rating", render: (c: Car) => `${c.rating} (${c.reviews})`, icon: Star },
    { label: "Seats", render: (c: Car) => c.seats.toString() },
  ];

  return (
    <div className="bg-card rounded-xl card-shadow overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-display font-semibold text-card-foreground">Compare ({cars.length})</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 overflow-x-auto">
        {/* Car headers */}
        <div className="flex gap-4 mb-4">
          <div className="w-28 shrink-0" />
          {cars.map((car) => (
            <div key={car.id} className="flex-1 min-w-[140px] text-center">
              <div className="relative">
                <img src={car.image} alt={car.name} className="w-full aspect-[4/3] object-cover rounded-lg" />
                <button
                  onClick={() => onRemove(car.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
              <p className="mt-2 font-display font-semibold text-sm text-card-foreground">{car.name}</p>
              <p className="text-xs text-muted-foreground">{car.year}</p>
            </div>
          ))}
        </div>

        {/* Specs rows */}
        <div className="space-y-0">
          {specs.map((spec, i) => (
            <div
              key={spec.label}
              className={`flex gap-4 py-2.5 ${i % 2 === 0 ? "bg-muted/50" : ""} rounded px-2`}
            >
              <div className="w-28 shrink-0 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                {spec.icon && <spec.icon className="h-3 w-3" />}
                {spec.label}
              </div>
              {cars.map((car) => (
                <div key={car.id} className="flex-1 min-w-[140px] text-center text-sm text-card-foreground">
                  {spec.render(car)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
