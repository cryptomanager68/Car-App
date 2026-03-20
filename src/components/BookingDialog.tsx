import { useState } from "react";
import { Car } from "@/data/cars";
import { bookingService, BookingData } from "@/services/bookingService";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Check, CreditCard, User, MapPin, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingDialogProps {
  car: Car | null;
  open: boolean;
  onClose: () => void;
}

type BookingStep = "details" | "dates" | "review";

export function BookingDialog({ car, open, onClose }: BookingDialogProps) {
  const [step, setStep] = useState<BookingStep>("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [bookingData, setBookingData] = useState<BookingData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    pickupDate: undefined,
    returnDate: undefined,
    pickupLocation: "",
    returnLocation: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    insurance: false,
    gps: false,
    childSeat: false,
  });

  if (!car) return null;

  const calculateDays = () => {
    if (!bookingData.pickupDate || !bookingData.returnDate) return 0;
    const diff = bookingData.returnDate.getTime() - bookingData.pickupDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const days = calculateDays();
    const basePrice = car.price * days;
    const insuranceCost = bookingData.insurance ? 25 * days : 0;
    const gpsCost = bookingData.gps ? 10 * days : 0;
    const childSeatCost = bookingData.childSeat ? 5 * days : 0;
    return basePrice + insuranceCost + gpsCost + childSeatCost;
  };

  const handleNext = async () => {
    if (step === "details") setStep("dates");
    else if (step === "dates") setStep("review");
    else if (step === "review") {
      // Process booking after review
      setIsSubmitting(true);
      try {
        const booking = await bookingService.submitBooking(car, bookingData, calculateTotal());
        toast({
          title: "Booking Confirmed!",
          description: `Your booking ID is ${booking.id}. Check your email for details.`,
          duration: 5000,
        });
        handleClose();
      } catch (error) {
        console.error("Booking failed:", error);
        toast({
          title: "Booking Failed",
          description: error instanceof Error ? error.message : "Failed to process booking. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step === "dates") setStep("details");
    else if (step === "review") setStep("dates");
  };

  const handleClose = () => {
    setStep("details");
    setIsSubmitting(false);
    setBookingData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      pickupDate: undefined,
      returnDate: undefined,
      pickupLocation: "",
      returnLocation: "",
      cardNumber: "",
      cardName: "",
      expiryDate: "",
      cvv: "",
      insurance: false,
      gps: false,
      childSeat: false,
    });
    onClose();
  };

  const isStepValid = () => {
    if (step === "details") {
      return bookingData.firstName && bookingData.lastName && bookingData.email && bookingData.phone;
    }
    if (step === "dates") {
      return bookingData.pickupDate && bookingData.returnDate && bookingData.pickupLocation && bookingData.returnLocation;
    }
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {`Book ${car.name}`}
          </DialogTitle>
          <DialogDescription>
            {step === "details" && "Enter your personal information"}
            {step === "dates" && "Select your rental dates and locations"}
            {step === "review" && "Review your booking details and total cost"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
            {["details", "dates", "review"].map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                    step === s
                      ? "bg-primary text-primary-foreground"
                      : ["details", "dates", "review"].indexOf(step) > i
                      ? "bg-success text-success-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {["details", "dates", "review"].indexOf(step) > i ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                {i < 2 && (
                  <div
                    className={cn(
                      "flex-1 h-1 mx-2",
                      ["details", "dates", "review"].indexOf(step) > i ? "bg-success" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          {step === "details" && (
            <PersonalDetailsStep bookingData={bookingData} setBookingData={setBookingData} />
          )}
          {step === "dates" && (
            <RentalDatesStep bookingData={bookingData} setBookingData={setBookingData} car={car} />
          )}
          {step === "review" && (
            <ReviewStep car={car} bookingData={bookingData} total={calculateTotal()} />
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <>
            <Button variant="outline" onClick={step === "details" ? handleClose : handleBack} disabled={isSubmitting}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              {step === "details" ? "Cancel" : "Back"}
            </Button>
            <Button onClick={handleNext} disabled={!isStepValid() || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {step === "review" ? "Confirm Booking" : "Next"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PersonalDetailsStep({
  bookingData,
  setBookingData,
}: {
  bookingData: BookingData;
  setBookingData: (data: BookingData) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <User className="h-4 w-4" />
        Personal Information
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={bookingData.firstName}
            onChange={(e) => setBookingData({ ...bookingData, firstName: e.target.value })}
            placeholder="John"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={bookingData.lastName}
            onChange={(e) => setBookingData({ ...bookingData, lastName: e.target.value })}
            placeholder="Doe"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={bookingData.email}
          onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
          placeholder="john.doe@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          type="tel"
          value={bookingData.phone}
          onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
          placeholder="+1 (555) 123-4567"
        />
      </div>
    </div>
  );
}

function RentalDatesStep({
  bookingData,
  setBookingData,
  car,
}: {
  bookingData: BookingData;
  setBookingData: (data: BookingData) => void;
  car: Car;
}) {
  const days = bookingData.pickupDate && bookingData.returnDate
    ? Math.ceil((bookingData.returnDate.getTime() - bookingData.pickupDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <CalendarIcon className="h-4 w-4" />
        Rental Period
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Pickup Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {bookingData.pickupDate ? format(bookingData.pickupDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={bookingData.pickupDate}
                onSelect={(date) => setBookingData({ ...bookingData, pickupDate: date })}
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>Return Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {bookingData.returnDate ? format(bookingData.returnDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={bookingData.returnDate}
                onSelect={(date) => setBookingData({ ...bookingData, returnDate: date })}
                disabled={(date) => !bookingData.pickupDate || date <= bookingData.pickupDate}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {days > 0 && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm">
            <span className="font-semibold">{days} day{days > 1 ? "s" : ""}</span> rental
            <span className="text-muted-foreground"> • ${car.price.toLocaleString()} per day</span>
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm font-semibold mt-6">
        <MapPin className="h-4 w-4" />
        Locations
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pickupLocation">Pickup Location *</Label>
          <Select
            value={bookingData.pickupLocation}
            onValueChange={(value) => setBookingData({ ...bookingData, pickupLocation: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select pickup location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="downtown">Downtown Office</SelectItem>
              <SelectItem value="airport">Airport Terminal</SelectItem>
              <SelectItem value="north">North Branch</SelectItem>
              <SelectItem value="south">South Branch</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="returnLocation">Return Location *</Label>
          <Select
            value={bookingData.returnLocation}
            onValueChange={(value) => setBookingData({ ...bookingData, returnLocation: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select return location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="downtown">Downtown Office</SelectItem>
              <SelectItem value="airport">Airport Terminal</SelectItem>
              <SelectItem value="north">North Branch</SelectItem>
              <SelectItem value="south">South Branch</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm font-semibold mt-6">
        <Check className="h-4 w-4" />
        Add-ons
      </div>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="insurance"
            checked={bookingData.insurance}
            onCheckedChange={(checked) => setBookingData({ ...bookingData, insurance: checked as boolean })}
          />
          <label htmlFor="insurance" className="text-sm cursor-pointer flex-1">
            Full Insurance Coverage <span className="text-muted-foreground">(+$25/day)</span>
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="gps"
            checked={bookingData.gps}
            onCheckedChange={(checked) => setBookingData({ ...bookingData, gps: checked as boolean })}
          />
          <label htmlFor="gps" className="text-sm cursor-pointer flex-1">
            GPS Navigation <span className="text-muted-foreground">(+$10/day)</span>
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="childSeat"
            checked={bookingData.childSeat}
            onCheckedChange={(checked) => setBookingData({ ...bookingData, childSeat: checked as boolean })}
          />
          <label htmlFor="childSeat" className="text-sm cursor-pointer flex-1">
            Child Safety Seat <span className="text-muted-foreground">(+$5/day)</span>
          </label>
        </div>
      </div>
    </div>
  );
}

function ReviewStep({
  car,
  bookingData,
  total,
}: {
  car: Car;
  bookingData: BookingData;
  total: number;
}) {
  const days = bookingData.pickupDate && bookingData.returnDate
    ? Math.ceil((bookingData.returnDate.getTime() - bookingData.pickupDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Check className="h-4 w-4" />
        Review Your Booking
      </div>

      {/* Car Details */}
      <div className="p-4 bg-muted rounded-lg space-y-3">
        <h4 className="font-semibold text-sm">Vehicle</h4>
        <div className="flex gap-3">
          <img src={car.image} alt={car.name} className="w-20 h-20 object-cover rounded-lg" />
          <div>
            <p className="font-semibold">{car.name}</p>
            <p className="text-sm text-muted-foreground">{car.year} • {car.type}</p>
            <p className="text-sm text-muted-foreground">{car.engine}</p>
          </div>
        </div>
      </div>

      {/* Customer Details */}
      <div className="p-4 bg-muted rounded-lg space-y-2">
        <h4 className="font-semibold text-sm">Customer Information</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Name:</span>
            <p className="font-medium">{bookingData.firstName} {bookingData.lastName}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Email:</span>
            <p className="font-medium">{bookingData.email}</p>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Phone:</span>
            <p className="font-medium">{bookingData.phone}</p>
          </div>
        </div>
      </div>

      {/* Rental Details */}
      <div className="p-4 bg-muted rounded-lg space-y-2">
        <h4 className="font-semibold text-sm">Rental Details</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pickup Date:</span>
            <span className="font-medium">
              {bookingData.pickupDate && format(bookingData.pickupDate, "PPP")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Return Date:</span>
            <span className="font-medium">
              {bookingData.returnDate && format(bookingData.returnDate, "PPP")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duration:</span>
            <span className="font-medium">{days} day{days > 1 ? "s" : ""}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pickup Location:</span>
            <span className="font-medium capitalize">{bookingData.pickupLocation}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Return Location:</span>
            <span className="font-medium capitalize">{bookingData.returnLocation}</span>
          </div>
        </div>
      </div>

      {/* Add-ons */}
      {(bookingData.insurance || bookingData.gps || bookingData.childSeat) && (
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <h4 className="font-semibold text-sm">Add-ons</h4>
          <div className="space-y-1 text-sm">
            {bookingData.insurance && (
              <div className="flex justify-between">
                <span>Full Insurance Coverage</span>
                <span>+$25/day</span>
              </div>
            )}
            {bookingData.gps && (
              <div className="flex justify-between">
                <span>GPS Navigation</span>
                <span>+$10/day</span>
              </div>
            )}
            {bookingData.childSeat && (
              <div className="flex justify-between">
                <span>Child Safety Seat</span>
                <span>+$5/day</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Total Cost */}
      <div className="p-4 bg-primary/10 rounded-lg space-y-2">
        <h4 className="font-semibold text-sm">Payment Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Base Rate ({days} days × ${car.price.toLocaleString()})</span>
            <span>${(car.price * days).toLocaleString()}</span>
          </div>
          {bookingData.insurance && (
            <div className="flex justify-between">
              <span>Insurance ({days} days × $25)</span>
              <span>${(25 * days).toLocaleString()}</span>
            </div>
          )}
          {bookingData.gps && (
            <div className="flex justify-between">
              <span>GPS ({days} days × $10)</span>
              <span>${(10 * days).toLocaleString()}</span>
            </div>
          )}
          {bookingData.childSeat && (
            <div className="flex justify-between">
              <span>Child Seat ({days} days × $5)</span>
              <span>${(5 * days).toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t">
            <span>Subtotal</span>
            <span>${total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (10%)</span>
            <span>${(total * 0.1).toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total Amount</span>
            <span>${(total * 1.1).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
        <p>💳 Payment will be collected at pickup location</p>
        <p className="mt-1">📧 Confirmation will be sent to {bookingData.email}</p>
      </div>
    </div>
  );
}

