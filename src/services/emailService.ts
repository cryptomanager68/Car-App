import emailjs from '@emailjs/browser';
import { Booking } from './bookingService';

// EmailJS Configuration
// To set this up:
// 1. Go to https://www.emailjs.com/
// 2. Sign up with your Gmail (galagertom352@gmail.com)
// 3. Create an email service (Gmail)
// 4. Create an email template
// 5. Get your Public Key, Service ID, and Template ID
// 6. Replace the values below

const EMAILJS_CONFIG = {
  publicKey: 'r3LaVxXXmp6-3xikk',
  serviceId: 'service_ob8qtow',
  templateId: 'template_q8frs96',
  adminEmail: 'galagertom352@gmail.com',
};

class EmailService {
  private initialized = false;

  /**
   * Initialize EmailJS
   */
  init() {
    if (this.initialized) return;
    
    try {
      emailjs.init(EMAILJS_CONFIG.publicKey);
      this.initialized = true;
      console.log('✅ EmailJS initialized');
    } catch (error) {
      console.error('❌ Failed to initialize EmailJS:', error);
    }
  }

  /**
   * Send booking notification to admin (your Gmail)
   */
  async sendBookingNotificationToAdmin(booking: Booking): Promise<void> {
    this.init();

    const emailParams = {
      to_email: EMAILJS_CONFIG.adminEmail,
      subject: `New Booking: ${booking.id}`,
      booking_id: booking.id,
      booking_date: new Date(booking.bookingDate).toLocaleString(),
      
      // Car Details
      car_name: booking.car.name,
      car_year: booking.car.year,
      car_type: booking.car.type,
      
      // Customer Details
      customer_name: `${booking.customer.firstName} ${booking.customer.lastName}`,
      customer_email: booking.customer.email,
      customer_phone: booking.customer.phone,
      
      // Rental Details
      pickup_date: new Date(booking.rental.pickupDate).toLocaleDateString(),
      return_date: new Date(booking.rental.returnDate).toLocaleDateString(),
      pickup_location: booking.rental.pickupLocation,
      return_location: booking.rental.returnLocation,
      rental_days: booking.rental.days,
      
      // Payment Details
      total_amount: `$${booking.payment.grandTotal.toLocaleString()}`,
      subtotal: `$${booking.payment.total.toLocaleString()}`,
      tax: `$${booking.payment.tax.toLocaleString()}`,
      card_last4: booking.payment.cardLast4 !== "N/A" ? booking.payment.cardLast4 : "Payment at pickup",
      
      // Add-ons
      insurance: booking.addons.insurance ? 'Yes' : 'No',
      gps: booking.addons.gps ? 'Yes' : 'No',
      child_seat: booking.addons.childSeat ? 'Yes' : 'No',
      
      // Status
      status: booking.status,
      
      // Full details as formatted text
      message: this.formatBookingDetails(booking),
    };

    try {
      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        emailParams
      );
      
      console.log('✅ Booking notification sent to admin:', response);
      return;
    } catch (error) {
      console.error('❌ Failed to send email to admin:', error);
      
      // Fallback: Use mailto link
      this.sendViaMailto(booking);
      throw error;
    }
  }

  /**
   * Send confirmation email to customer
   */
  async sendConfirmationToCustomer(booking: Booking): Promise<void> {
    this.init();

    const emailParams = {
      to_email: booking.customer.email,
      to_name: booking.customer.firstName,
      subject: `Booking Confirmation - ${booking.id}`,
      booking_id: booking.id,
      car_name: booking.car.name,
      pickup_date: new Date(booking.rental.pickupDate).toLocaleDateString(),
      return_date: new Date(booking.rental.returnDate).toLocaleDateString(),
      total_amount: `$${booking.payment.grandTotal.toLocaleString()}`,
      message: this.formatCustomerConfirmation(booking),
    };

    try {
      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        'customer_confirmation_template', // You'll need to create this template
        emailParams
      );
      
      console.log('✅ Confirmation sent to customer:', response);
    } catch (error) {
      console.error('❌ Failed to send confirmation to customer:', error);
    }
  }

  /**
   * Format booking details for email
   */
  private formatBookingDetails(booking: Booking): string {
    return `
NEW CAR RENTAL BOOKING
======================

BOOKING INFORMATION
-------------------
Booking ID: ${booking.id}
Booking Date: ${new Date(booking.bookingDate).toLocaleString()}
Status: ${booking.status.toUpperCase()}

VEHICLE DETAILS
---------------
Car: ${booking.car.name}
Year: ${booking.car.year}
Type: ${booking.car.type}

CUSTOMER INFORMATION
--------------------
Name: ${booking.customer.firstName} ${booking.customer.lastName}
Email: ${booking.customer.email}
Phone: ${booking.customer.phone}

RENTAL DETAILS
--------------
Pickup Date: ${new Date(booking.rental.pickupDate).toLocaleDateString()}
Return Date: ${new Date(booking.rental.returnDate).toLocaleDateString()}
Duration: ${booking.rental.days} day(s)
Pickup Location: ${booking.rental.pickupLocation}
Return Location: ${booking.rental.returnLocation}

ADD-ONS
-------
Insurance: ${booking.addons.insurance ? 'Yes' : 'No'}
GPS Navigation: ${booking.addons.gps ? 'Yes' : 'No'}
Child Seat: ${booking.addons.childSeat ? 'Yes' : 'No'}

PAYMENT DETAILS
---------------
Subtotal: $${booking.payment.total.toLocaleString()}
Tax (10%): $${booking.payment.tax.toLocaleString()}
Total Amount: $${booking.payment.grandTotal.toLocaleString()}
Payment Method: ${booking.payment.cardLast4 !== "N/A" ? `Card ending in ${booking.payment.cardLast4}` : "Payment at pickup"}

---
This booking was made through rentitb4ubuyit.com
    `.trim();
  }

  /**
   * Format customer confirmation message
   */
  private formatCustomerConfirmation(booking: Booking): string {
    return `
Dear ${booking.customer.firstName},

Thank you for booking with Rent It B4 U Buy It!

Your booking has been confirmed. Here are your booking details:

Booking ID: ${booking.id}
Vehicle: ${booking.car.name} (${booking.car.year})
Pickup: ${new Date(booking.rental.pickupDate).toLocaleDateString()} at ${booking.rental.pickupLocation}
Return: ${new Date(booking.rental.returnDate).toLocaleDateString()} at ${booking.rental.returnLocation}

Total Amount: $${booking.payment.grandTotal.toLocaleString()}

Please arrive at the pickup location 15 minutes before your scheduled time with:
- Valid driver's license
- Payment method (cash or card accepted)
- Proof of insurance (if not purchased through us)

If you have any questions, please contact us at galagertom352@gmail.com

Safe travels!

The Rent It B4 U Buy It Team
    `.trim();
  }

  /**
   * Fallback: Open mailto link if EmailJS fails
   */
  private sendViaMailto(booking: Booking): void {
    const subject = encodeURIComponent(`New Booking: ${booking.id}`);
    const body = encodeURIComponent(this.formatBookingDetails(booking));
    const mailtoLink = `mailto:${EMAILJS_CONFIG.adminEmail}?subject=${subject}&body=${body}`;
    
    console.log('📧 Opening mailto link as fallback...');
    window.open(mailtoLink, '_blank');
  }

  /**
   * Test email configuration
   */
  async testEmail(): Promise<boolean> {
    this.init();

    try {
      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        {
          to_email: EMAILJS_CONFIG.adminEmail,
          subject: 'Test Email from Car Rental App',
          message: 'This is a test email to verify EmailJS configuration.',
        }
      );
      
      console.log('✅ Test email sent successfully:', response);
      return true;
    } catch (error) {
      console.error('❌ Test email failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
