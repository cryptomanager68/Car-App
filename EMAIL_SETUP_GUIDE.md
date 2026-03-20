# Email Setup Guide for Car Rental Booking System

This guide will help you set up EmailJS to receive booking notifications at **galagertom352@gmail.com**.

## Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" and create an account using your Gmail: **galagertom352@gmail.com**
3. Verify your email address

## Step 2: Add Email Service (Gmail)

1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Select **Gmail**
4. Click **Connect Account** and authorize with your Gmail
5. Give it a name like "Car Rental Notifications"
6. Copy the **Service ID** (e.g., `service_abc123`)

## Step 3: Create Email Template for Admin Notifications

1. Go to **Email Templates** in the dashboard
2. Click **Create New Template**
3. Name it "Admin Booking Notification"
4. Use this template content:

```
Subject: New Booking: {{booking_id}}

NEW CAR RENTAL BOOKING
======================

BOOKING INFORMATION
-------------------
Booking ID: {{booking_id}}
Booking Date: {{booking_date}}
Status: {{status}}

VEHICLE DETAILS
---------------
Car: {{car_name}}
Year: {{car_year}}
Type: {{car_type}}

CUSTOMER INFORMATION
--------------------
Name: {{customer_name}}
Email: {{customer_email}}
Phone: {{customer_phone}}

RENTAL DETAILS
--------------
Pickup Date: {{pickup_date}}
Return Date: {{return_date}}
Duration: {{rental_days}} day(s)
Pickup Location: {{pickup_location}}
Return Location: {{return_location}}

ADD-ONS
-------
Insurance: {{insurance}}
GPS Navigation: {{gps}}
Child Seat: {{child_seat}}

PAYMENT DETAILS
---------------
Subtotal: {{subtotal}}
Tax (10%): {{tax}}
Total Amount: {{total_amount}}
Payment Method: Card ending in {{card_last4}}

---
Full Details:
{{message}}
```

4. Set **To Email** to: `{{to_email}}`
5. Copy the **Template ID** (e.g., `template_xyz789`)

## Step 4: Create Email Template for Customer Confirmation (Optional)

1. Create another template named "Customer Confirmation"
2. Use this template:

```
Subject: Booking Confirmation - {{booking_id}}

Dear {{to_name}},

Thank you for booking with Rent It B4 U Buy It!

Your booking has been confirmed:

Booking ID: {{booking_id}}
Vehicle: {{car_name}}
Pickup: {{pickup_date}}
Return: {{return_date}}
Total: {{total_amount}}

{{message}}

Best regards,
Rent It B4 U Buy It Team
```

3. Copy this Template ID as well

## Step 5: Get Your Public Key

1. Go to **Account** → **General**
2. Find your **Public Key** (e.g., `user_abc123xyz`)
3. Copy it

## Step 6: Update the Code

Open `src/services/emailService.ts` and update these values:

```typescript
const EMAILJS_CONFIG = {
  publicKey: 'YOUR_PUBLIC_KEY',      // Paste your Public Key here
  serviceId: 'YOUR_SERVICE_ID',      // Paste your Service ID here
  templateId: 'YOUR_TEMPLATE_ID',    // Paste your Template ID here
  adminEmail: 'galagertom352@gmail.com',
};
```

## Step 7: Test the Setup

1. Save the file
2. Restart your dev server: `npm run dev`
3. Make a test booking through the website
4. Check your Gmail inbox for the booking notification

## Troubleshooting

### Emails not arriving?

1. **Check Spam Folder**: EmailJS emails might go to spam initially
2. **Verify Service**: Make sure Gmail service is connected in EmailJS dashboard
3. **Check Console**: Open browser console (F12) to see any error messages
4. **Test Email**: The service includes a test function - check console logs

### Rate Limits

- EmailJS free tier: 200 emails/month
- If you need more, upgrade to a paid plan

### Alternative: Mailto Fallback

If EmailJS fails, the system will automatically open your default email client with pre-filled booking details.

## Email Content

Each booking will send you an email with:
- Booking ID and date
- Complete car details
- Customer information (name, email, phone)
- Rental dates and locations
- Selected add-ons (insurance, GPS, child seat)
- Payment details and total amount

## Security Notes

- Never commit your EmailJS keys to public repositories
- Consider using environment variables for production
- EmailJS is secure and doesn't expose your Gmail password
- You can revoke access anytime from your Google Account settings

## Support

If you need help:
- EmailJS Documentation: https://www.emailjs.com/docs/
- EmailJS Support: support@emailjs.com

---

**Important**: After setup, every booking made on your website will automatically send a detailed email to **galagertom352@gmail.com**!
