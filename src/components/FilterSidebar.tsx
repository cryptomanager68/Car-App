import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";

export interface Filters {
  search: string;
  priceRange: [number, number];
  yearRange: [number, number];
  fuelTypes: string[];
  transmissions: string[];
  types: string[];
  sortBy: string;
}

const defaultFilters: Filters = {
  search: "",
  priceRange: [0, 400000],
  yearRange: [2020, 2024],
  fuelTypes: [],
  transmissions: [],
  types: [],
  sortBy: "price-asc",
};

interface FilterSidebarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  resultCount: number;
}

const fuelOptions = ["Petrol", "Diesel", "Electric", "Hybrid"];
const transmissionOptions = ["Automatic", "Manual"];
const typeOptions = ["Sedan", "SUV", "Hatchback", "Sports", "Truck"];

const sectionLabel = "text-[10px] font-bold tracking-[0.18em] uppercase mb-2 block";

export function FilterSidebar({ filters, onChange, resultCount }: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const update = (partial: Partial<Filters>) => onChange({ ...filters, ...partial });
  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

  return (
    <aside
      className={`relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 max-h-[calc(100vh-120px)] ${isOpen ? "w-72" : "w-14"}`}
      style={{
        background: "linear-gradient(160deg, rgba(15,23,42,0.88) 0%, rgba(23,37,84,0.88) 60%, rgba(15,23,42,0.88) 100%)",
        backdropFilter: "blur(24px)",
        boxShadow: "0 8px 40px rgba(37,99,235,0.18), inset 0 1px 0 rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
        style={{ background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)" }}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        {isOpen && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}
            >
              <SlidersHorizontal className="h-3 w-3 text-white" />
            </div>
            <span className="font-bold text-sm text-white/90 tracking-wide">Filters</span>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 text-white/40 hover:text-white/90"
          style={{ background: "rgba(255,255,255,0.06)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(59,130,246,0.2)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
        >
          {isOpen ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="p-4 space-y-5 overflow-y-auto flex-1 scrollbar-thin">

          {/* Search */}
          <div>
            <Label className={`${sectionLabel} text-blue-400/70`}>Search</Label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-400/60 group-focus-within:text-blue-400 transition-colors z-10" />
              <Input
                placeholder="Search cars..."
                value={filters.search}
                onChange={(e) => update({ search: e.target.value })}
                className="pl-9 h-9 text-sm border-0 text-white/80 placeholder:text-white/25 focus-visible:ring-1 focus-visible:ring-blue-500/50"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(255,255,255,0.07)",
                }}
              />
            </div>
          </div>

          {/* Price Range */}
          <div>
            <Label className={`${sectionLabel} text-purple-400/70`}>Price Range</Label>
            <div className="px-1">
              <Slider
                min={0}
                max={400000}
                step={5000}
                value={filters.priceRange}
                onValueChange={(v) => update({ priceRange: v as [number, number] })}
                className="[&_[role=slider]]:bg-gradient-to-br [&_[role=slider]]:from-blue-400 [&_[role=slider]]:to-purple-500 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg"
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md text-blue-300"
                style={{ background: "rgba(59,130,246,0.15)" }}>
                ${filters.priceRange[0].toLocaleString()}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md text-purple-300"
                style={{ background: "rgba(139,92,246,0.15)" }}>
                ${filters.priceRange[1].toLocaleString()}
              </span>
            </div>
          </div>

          {/* Sort */}
          <div>
            <Label className={`${sectionLabel} text-cyan-400/70`}>Sort By</Label>
            <Select value={filters.sortBy} onValueChange={(v) => update({ sortBy: v })}>
              <SelectTrigger
                className="h-9 text-sm border-0 text-white/80 focus:ring-1 focus:ring-blue-500/50"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(255,255,255,0.07)",
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="year-desc">Newest First</SelectItem>
                <SelectItem value="rating-desc">Best Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fuel Type */}
          <div>
            <Label className={`${sectionLabel} text-emerald-400/70`}>Fuel Type</Label>
            <div className="space-y-1.5">
              {fuelOptions.map((fuel) => (
                <label key={fuel}
                  className="flex items-center gap-2.5 cursor-pointer px-2.5 py-1.5 rounded-lg transition-all duration-150 group/item"
                  style={{ background: filters.fuelTypes.includes(fuel) ? "rgba(59,130,246,0.15)" : "transparent" }}
                  onMouseEnter={e => { if (!filters.fuelTypes.includes(fuel)) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={e => { if (!filters.fuelTypes.includes(fuel)) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <Checkbox
                    checked={filters.fuelTypes.includes(fuel)}
                    onCheckedChange={() => update({ fuelTypes: toggleArrayItem(filters.fuelTypes, fuel) })}
                    className="border-white/20 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <span className="text-sm text-white/70 group-hover/item:text-white/90 transition-colors">{fuel}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Transmission */}
          <div>
            <Label className={`${sectionLabel} text-orange-400/70`}>Transmission</Label>
            <div className="space-y-1.5">
              {transmissionOptions.map((t) => (
                <label key={t}
                  className="flex items-center gap-2.5 cursor-pointer px-2.5 py-1.5 rounded-lg transition-all duration-150"
                  style={{ background: filters.transmissions.includes(t) ? "rgba(139,92,246,0.15)" : "transparent" }}
                  onMouseEnter={e => { if (!filters.transmissions.includes(t)) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={e => { if (!filters.transmissions.includes(t)) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <Checkbox
                    checked={filters.transmissions.includes(t)}
                    onCheckedChange={() => update({ transmissions: toggleArrayItem(filters.transmissions, t) })}
                    className="border-white/20 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                  />
                  <span className="text-sm text-white/70 hover:text-white/90 transition-colors">{t}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Vehicle Type */}
          <div>
            <Label className={`${sectionLabel} text-pink-400/70`}>Vehicle Type</Label>
            <div className="flex flex-wrap gap-1.5">
              {typeOptions.map((type) => (
                <button
                  key={type}
                  onClick={() => update({ types: toggleArrayItem(filters.types, type) })}
                  className="text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-200"
                  style={filters.types.includes(type) ? {
                    background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                    color: "#fff",
                    boxShadow: "0 2px 12px rgba(59,130,246,0.4)",
                  } : {
                    background: "rgba(255,255,255,0.07)",
                    color: "rgba(255,255,255,0.6)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  onMouseEnter={e => { if (!filters.types.includes(type)) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.9)"; } }}
                  onMouseLeave={e => { if (!filters.types.includes(type)) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)"; } }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Results + Reset */}
          <div className="pt-4 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40">Results</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-blue-300"
                style={{ background: "rgba(59,130,246,0.2)" }}>
                {resultCount} vehicles
              </span>
            </div>
            <button
              onClick={() => onChange(defaultFilters)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-white/60 hover:text-white/90"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.12)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.3)"; (e.currentTarget as HTMLElement).style.color = "#f87171"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)"; }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

export { defaultFilters };
