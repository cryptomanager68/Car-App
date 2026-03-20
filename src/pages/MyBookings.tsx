import { useState, useEffect } from "react";
import { bookingService, Booking } from "@/services/bookingService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, MapPin, CreditCard, Mail, Phone, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const allBookings = bookingService.getAllBookings();
    setBookings(allBookings.reverse()); // Show newest first
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground">View and manage your car rental bookings</p>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                You haven't made any bookings yet. Browse our cars and make your first booking!
              </p>
              <Button onClick={() => navigate("/")}>Browse Cars</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Booking #{booking.id}
                        <Badge
                          variant={
                            booking.status === "confirmed"
                              ? "default"
                              : booking.status === "cancelled"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Booked on {format(new Date(booking.bookingDate), "PPP")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Car Details */}
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <img
                          src={booking.car.image}
                          alt={booking.car.name}
                          className="w-32 h-24 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="font-semibold">{booking.car.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {booking.car.year} • {booking.car.type}
                          </p>
                        </div>
                      </div>

                      {/* Rental Details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Pickup:</span>
                          <span>{format(new Date(booking.rental.pickupDate), "PPP")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Return:</span>
                          <span>{format(new Date(booking.rental.returnDate), "PPP")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Location:</span>
                          <span className="capitalize">{booking.rental.pickupLocation}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Duration:</span> {booking.rental.days} day
                          {booking.rental.days > 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>

                    {/* Customer & Payment Details */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Customer Information</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {booking.customer.firstName} {booking.customer.lastName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.customer.phone}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Payment Details</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span>Card ending in {booking.payment.cardLast4}</span>
                        </div>
                        <div className="space-y-1 text-sm pt-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span>${booking.payment.total.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tax:</span>
                            <span>${booking.payment.tax.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between font-bold pt-1 border-t">
                            <span>Total Paid:</span>
                            <span>${booking.payment.grandTotal.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Add-ons */}
                      {(booking.addons.insurance || booking.addons.gps || booking.addons.childSeat) && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">Add-ons</h4>
                          <div className="flex flex-wrap gap-2">
                            {booking.addons.insurance && (
                              <Badge variant="secondary">Insurance</Badge>
                            )}
                            {booking.addons.gps && <Badge variant="secondary">GPS</Badge>}
                            {booking.addons.childSeat && (
                              <Badge variant="secondary">Child Seat</Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
