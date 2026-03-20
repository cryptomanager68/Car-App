import { Car } from "@/data/cars";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Star, MapPin, Fuel, Gauge, Settings2, Users, Zap, Calendar, X,
  ShieldCheck, TrendingUp, ThumbsUp, ThumbsDown, Timer, Wind,
  Briefcase, Wrench, Monitor, ChevronDown, ChevronUp
} from "lucide-react";
import { useState } from "react";
import { BookingDialog } from "./BookingDialog";

interface CarDetailSheetProps {
  car: Car | null;
  open: boolean;
  onClose: () => void;
}

export function CarDetailSheet({ car, open, onClose }: CarDetailSheetProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    specs: true,
    review: false,
    safety: false,
    market: false,
    infotainment: false,
  });

  if (!car) return null;

  const toggleSection = (key: string) =>
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const safetyPercent = (car.safetyRating / 5) * 100;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[420px] sm:w-[520px] overflow-y-auto p-0">
        {/* Hero Image */}
        <div className="relative">
          <img src={car.image} alt={car.name} className="w-full aspect-video object-cover" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-3 left-3 flex gap-2">
            {car.available ? (
              <Badge className="bg-success text-success-foreground border-0">Available</Badge>
            ) : (
              <Badge variant="secondary">Unavailable</Badge>
            )}
            <Badge variant="secondary" className="bg-card/80 backdrop-blur-sm border-0">
              {car.type}
            </Badge>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <SheetHeader className="space-y-1 p-0">
            <SheetTitle className="font-display text-xl">{car.name} – {car.year}</SheetTitle>
            <SheetDescription className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {car.location}
              </span>
              <span className="flex items-center gap-1">
                <Timer className="h-3.5 w-3.5" /> 0-60: {car.acceleration}
              </span>
              <span className="flex items-center gap-1">
                <Wind className="h-3.5 w-3.5" /> {car.topSpeed} mph
              </span>
            </SheetDescription>
          </SheetHeader>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-4 w-4 ${s <= Math.floor(car.rating) ? "fill-warning text-warning" : "text-muted"}`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{car.rating}</span>
            <span className="text-xs text-muted-foreground">({car.reviews} reviews)</span>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{car.description}</p>

          {/* Pros & Cons */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-card-foreground uppercase tracking-wider flex items-center gap-1">
                <ThumbsUp className="h-3.5 w-3.5 text-success" /> Pros
              </h4>
              {car.pros.map((p) => (
                <p key={p} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-success mt-0.5">✓</span> {p}
                </p>
              ))}
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-card-foreground uppercase tracking-wider flex items-center gap-1">
                <ThumbsDown className="h-3.5 w-3.5 text-destructive" /> Cons
              </h4>
              {car.cons.map((c) => (
                <p key={c} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-destructive mt-0.5">✗</span> {c}
                </p>
              ))}
            </div>
          </div>

          <Separator />

          {/* Collapsible: Specs Grid */}
          <CollapsibleSection
            title="Specifications"
            icon={<Settings2 className="h-4 w-4 text-primary" />}
            expanded={expandedSections.specs}
            onToggle={() => toggleSection("specs")}
          >
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Zap, label: "Engine", value: car.engine },
                { icon: Gauge, label: "Horsepower", value: `${car.horsepower}hp` },
                { icon: Fuel, label: "Fuel", value: car.fuel },
                { icon: Settings2, label: "Trans.", value: car.transmission },
                { icon: Users, label: "Seats", value: car.seats.toString() },
                { icon: Gauge, label: "Mileage", value: `${car.mileage}k mi` },
                { icon: Fuel, label: "MPG City", value: `${car.mpg.city}` },
                { icon: Fuel, label: "MPG Hwy", value: `${car.mpg.highway}` },
                { icon: Briefcase, label: "Trunk", value: car.trunkCapacity },
                { icon: Wrench, label: "Warranty", value: car.warranty.split(",")[0] },
              ].map((spec) => (
                <div key={spec.label} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
                  <spec.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{spec.label}</p>
                    <p className="text-xs font-medium text-card-foreground truncate">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          <Separator />

          {/* Expert Review */}
          <CollapsibleSection
            title="Expert Review"
            icon={<Star className="h-4 w-4 text-warning" />}
            expanded={expandedSections.review}
            onToggle={() => toggleSection("review")}
          >
            <p className="text-sm text-muted-foreground leading-relaxed">{car.expertReview}</p>
          </CollapsibleSection>

          <Separator />

          {/* Safety */}
          <CollapsibleSection
            title="Safety Rating"
            icon={<ShieldCheck className="h-4 w-4 text-success" />}
            expanded={expandedSections.safety}
            onToggle={() => toggleSection("safety")}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Progress value={safetyPercent} className="flex-1 h-2" />
                <span className="text-sm font-bold text-card-foreground">{car.safetyRating}/5</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {car.safetyFeatures.map((f) => (
                  <Badge key={f} variant="secondary" className="text-[10px]">{f}</Badge>
                ))}
              </div>
            </div>
          </CollapsibleSection>

          <Separator />

          {/* Market Value */}
          <CollapsibleSection
            title="Market Insights"
            icon={<TrendingUp className="h-4 w-4 text-primary" />}
            expanded={expandedSections.market}
            onToggle={() => toggleSection("market")}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Below Market</span>
                <span className="text-xs text-muted-foreground">Above Market</span>
              </div>
              <div className="relative h-2 rounded-full bg-muted">
                <div
                  className="absolute h-full rounded-full bg-primary/30"
                  style={{
                    left: `${((car.marketValue.low - car.marketValue.low) / (car.marketValue.high - car.marketValue.low)) * 100}%`,
                    right: `${100 - ((car.marketValue.high - car.marketValue.low) / (car.marketValue.high - car.marketValue.low)) * 100}%`,
                  }}
                />
                <div
                  className="absolute w-3 h-3 rounded-full bg-primary border-2 border-card -top-0.5"
                  style={{
                    left: `${((car.price - car.marketValue.low) / (car.marketValue.high - car.marketValue.low)) * 100}%`,
                    transform: "translateX(-50%)",
                  }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground uppercase">Low</p>
                  <p className="text-xs font-semibold text-card-foreground">${car.marketValue.low.toLocaleString()}</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <p className="text-[10px] text-muted-foreground uppercase">Average</p>
                  <p className="text-xs font-semibold text-primary">${car.marketValue.average.toLocaleString()}</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground uppercase">High</p>
                  <p className="text-xs font-semibold text-card-foreground">${car.marketValue.high.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <Separator />

          {/* Infotainment */}
          <CollapsibleSection
            title="Infotainment & Tech"
            icon={<Monitor className="h-4 w-4 text-accent-foreground" />}
            expanded={expandedSections.infotainment}
            onToggle={() => toggleSection("infotainment")}
          >
            <div className="flex flex-wrap gap-1.5">
              {car.infotainment.map((f) => (
                <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
              ))}
            </div>
          </CollapsibleSection>

          <Separator />

          {/* Features */}
          <div>
            <h4 className="text-sm font-semibold mb-2 text-card-foreground">Features</h4>
            <div className="flex flex-wrap gap-2">
              {car.features.map((f) => (
                <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Booking */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-card-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Book This Vehicle
            </h4>
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger>
                <SelectValue placeholder="Select rental period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1day">1 Day</SelectItem>
                <SelectItem value="3days">3 Days</SelectItem>
                <SelectItem value="1week">1 Week</SelectItem>
                <SelectItem value="2weeks">2 Weeks</SelectItem>
                <SelectItem value="1month">1 Month</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Price</span>
              <span className="text-lg font-bold font-display text-card-foreground">${car.price.toLocaleString()}</span>
            </div>

            <Button className="w-full" size="lg" disabled={!car.available} onClick={() => setBookingDialogOpen(true)}>
              {car.available ? "Book Now" : "Not Available"}
            </Button>
          </div>
        </div>
      </SheetContent>

      <BookingDialog car={car} open={bookingDialogOpen} onClose={() => setBookingDialogOpen(false)} />
    </Sheet>
  );
}

function CollapsibleSection({
  title,
  icon,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left"
      >
        <h4 className="text-sm font-semibold text-card-foreground flex items-center gap-2">
          {icon} {title}
        </h4>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {expanded && <div className="mt-3">{children}</div>}
    </div>
  );
}
