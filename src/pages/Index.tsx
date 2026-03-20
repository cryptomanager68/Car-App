import { useState, useMemo } from "react";
import { cars, Car } from "@/data/cars";
import { Header } from "@/components/Header";
import { FilterSidebar, Filters, defaultFilters } from "@/components/FilterSidebar";
import { CarCard } from "@/components/CarCard";
import { ComparisonPanel } from "@/components/ComparisonPanel";
import { CarDetailSheet } from "@/components/CarDetailSheet";
import { Button } from "@/components/ui/button";
import { GitCompareArrows, X } from "lucide-react";

const Index = () => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [detailCar, setDetailCar] = useState<Car | null>(null);

  const filteredCars = useMemo(() => {
    let result = cars.filter((car) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!car.name.toLowerCase().includes(q) && !car.type.toLowerCase().includes(q) && !car.fuel.toLowerCase().includes(q)) return false;
      }
      if (car.price < filters.priceRange[0] || car.price > filters.priceRange[1]) return false;
      if (car.year < filters.yearRange[0] || car.year > filters.yearRange[1]) return false;
      if (filters.fuelTypes.length > 0 && !filters.fuelTypes.includes(car.fuel)) return false;
      if (filters.transmissions.length > 0 && !filters.transmissions.includes(car.transmission)) return false;
      if (filters.types.length > 0 && !filters.types.includes(car.type)) return false;
      return true;
    });

    switch (filters.sortBy) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "year-desc": result.sort((a, b) => b.year - a.year); break;
      case "rating-desc": result.sort((a, b) => b.rating - a.rating); break;
    }
    return result;
  }, [filters]);

  const toggleFavorite = (carId: string) => {
    setFavorites((prev) => prev.includes(carId) ? prev.filter((id) => id !== carId) : [...prev, carId]);
  };

  const toggleCompare = (carId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(carId)) return prev.filter((id) => id !== carId);
      if (prev.length >= 3) return prev;
      return [...prev, carId];
    });
  };

  const favoriteCars = cars.filter((c) => favorites.includes(c.id));
  const compareCars = cars.filter((c) => compareIds.includes(c.id));

  return (
    <div className="min-h-screen">
      <Header
        favorites={favoriteCars}
        onRemoveFavorite={toggleFavorite}
        searchValue={filters.search}
        onSearchChange={(search) => setFilters((f) => ({ ...f, search }))}
      />

      <div className="flex gap-6 p-6 max-w-[1600px] mx-auto">
        {/* Filter Sidebar */}
        <FilterSidebar filters={filters} onChange={setFilters} resultCount={filteredCars.length} />

        {/* Main Content */}
        <main className="flex-1 space-y-6">
          {/* Compare bar */}
          {compareIds.length > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent">
              <span className="text-sm text-accent-foreground font-medium">
                {compareIds.length} vehicle{compareIds.length > 1 ? "s" : ""} selected for comparison
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCompareIds([])}
                  className="gap-1"
                >
                  <X className="h-3.5 w-3.5" /> Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowComparison(true)}
                  disabled={compareIds.length < 2}
                  className="gap-1"
                >
                  <GitCompareArrows className="h-3.5 w-3.5" /> Compare
                </Button>
              </div>
            </div>
          )}

          {/* Comparison Panel */}
          {showComparison && (
            <ComparisonPanel
              cars={compareCars}
              onRemove={toggleCompare}
              onClose={() => setShowComparison(false)}
            />
          )}

          {/* Car Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredCars.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                onViewDetails={setDetailCar}
                onToggleFavorite={toggleFavorite}
                onToggleCompare={toggleCompare}
                isFavorite={favorites.includes(car.id)}
                isComparing={compareIds.includes(car.id)}
              />
            ))}
          </div>

          {filteredCars.length === 0 && (
            <div className="text-center py-20 space-y-2">
              <p className="text-lg font-display font-semibold text-foreground">No vehicles found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </div>
          )}
        </main>
      </div>

      {/* Detail Sheet */}
      <CarDetailSheet car={detailCar} open={!!detailCar} onClose={() => setDetailCar(null)} />
    </div>
  );
};

export default Index;
