import { Car } from "@/data/cars";
import { emailService } from "./emailService";

export interface BookingData {
  // Personal Details
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // Rental Details
  pickupDate: Date | undefined;
  returnDate: Date | undefined;
  pickupLocation: string;
  returnLocation: string;
  // Payment
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  // Extras
  insurance: boolean;
  gps: boolean;
  childSeat: boolean;
}

export interface Booking {
  id: string;
  bookingDate: Date;
  car: {
    id: string;
    name: string;
    year: number;
    image: string;
    type: string;
  };
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  rental: {
    pickupDate: Date;
    returnDate: Date;
    pickupLocation: string;
    returnLocation: string;
    days: number;
  };
  addons: {
    insurance: boolean;
    gps: boolean;
    childSeat: boolean;
  };
  payment: {
    total: number;
    tax: number;
    grandTotal: number;
    cardLast4: string;
  };
  status: "confirmed" | "pending" | "cancelled";
}

class BookingService {
  private readonly STORAGE_KEY = "car_bookings";
  private readonly API_ENDPOINT = "http://localhost:3000/api/bookings";

  /**
   * Submit a booking to the backend
   */
  async submitBooking(car: Car, bookingData: BookingData, total: number): Promise<Booking> {
    const bookingId = this.generateBookingId();
    const days = this.calculateDays(bookingData.pickupDate!, bookingData.returnDate!);
    const tax = total * 0.1;
    const grandTotal = total + tax;

    const booking: Booking = {
      id: bookingId,
      bookingDate: new Date(),
      car: {
        id: car.id,
        name: car.name,
        year: car.year,
        image: car.image,
        type: car.type,
      },
      customer: {
        firstName: bookingData.firstName,
        lastName: bookingData.lastName,
        email: bookingData.email,
        phone: bookingData.phone,
      },
      rental: {
        pickupDate: bookingData.pickupDate!,
        returnDate: bookingData.returnDate!,
        pickupLocation: bookingData.pickupLocation,
        returnLocation: bookingData.returnLocation,
        days,
      },
      addons: {
        insurance: bookingData.insurance,
        gps: bookingData.gps,
        childSeat: bookingData.childSeat,
      },
      payment: {
        total,
        tax,
        grandTotal,
        cardLast4: bookingData.cardNumber ? bookingData.cardNumber.slice(-4) : "N/A",
      },
      status: "confirmed",
    };

    // Simulate API call
    await this.sendToBackend(booking);

    // Save to local storage as backup
    this.saveToLocalStorage(booking);

    // Send emails
    try {
      // Send notification to admin (your Gmail)
      await emailService.sendBookingNotificationToAdmin(booking);
      
      // Send confirmation to customer
      await emailService.sendConfirmationToCustomer(booking);
    } catch (emailError) {
      console.error("Email sending failed, but booking was saved:", emailError);
      // Don't throw error - booking is still valid even if email fails
    }

    return booking;
  }

  /**
   * Simulate sending data to backend API
   */
  private async sendToBackend(booking: Booking): Promise<void> {
    try {
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      });
      if (!response.ok) throw new Error(`Backend error: ${response.status}`);
      console.log("📤 Booking sent to backend:", booking.id);
    } catch (error) {
      console.error("Backend unavailable, booking saved locally only:", error);
    }
  }

  /**
   * Save booking to local storage
   */
  private saveToLocalStorage(booking: Booking): void {
    try {
      const bookings = this.getAllBookings();
      bookings.push(booking);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookings));
      console.log("💾 Booking saved to local storage:", booking.id);
    } catch (error) {
      console.error("Failed to save to local storage:", error);
    }
  }

  /**
   * Get all bookings from local storage
   */
  getAllBookings(): Booking[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      
      const bookings = JSON.parse(data);
      // Convert date strings back to Date objects
      return bookings.map((b: any) => ({
        ...b,
        bookingDate: new Date(b.bookingDate),
        rental: {
          ...b.rental,
          pickupDate: new Date(b.rental.pickupDate),
          returnDate: new Date(b.rental.returnDate),
        },
      }));
    } catch (error) {
      console.error("Failed to load bookings:", error);
      return [];
    }
  }

  /**
   * Get a specific booking by ID
   */
  getBookingById(id: string): Booking | null {
    const bookings = this.getAllBookings();
    return bookings.find((b) => b.id === id) || null;
  }

  /**
   * Generate a unique booking ID
   */
  private generateBookingId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `BK${timestamp}${random}`.toUpperCase();
  }

  /**
   * Calculate number of days between two dates
   */
  private calculateDays(startDate: Date, endDate: Date): number {
    const diff = endDate.getTime() - startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string): Promise<void> {
    const bookings = this.getAllBookings();
    const index = bookings.findIndex((b) => b.id === bookingId);
    
    if (index !== -1) {
      bookings[index].status = "cancelled";
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookings));
      console.log("❌ Booking cancelled:", bookingId);
    }
  }

  /**
   * Clear all bookings (for testing)
   */
  clearAllBookings(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log("🗑️ All bookings cleared");
  }
}

export const bookingService = new BookingService();
