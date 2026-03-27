import { format, parseISO } from "date-fns";
import { UpcomingBooking, EnhancedBooking, GroupedBooking } from "@/types/interfaces";

export const mapBookingToEnhanced = (booking: UpcomingBooking): EnhancedBooking => {
  const [datePart] = booking.date.split('T');
  const [timePart] = booking.time.split('.');
  const timeValue = timePart.length === 5 ? `${timePart}:00` : timePart;
  
  console.log("Mapping booking with ID:", booking.booking_id);
  
  return {
    id: `${booking.customer.customer_id}-${booking.service.service_id}-${datePart}-${timePart}`,
    user_name: booking.user.username,
    user_id: booking.user.user_id,
    customer_name: booking.customer.name,
    customer_id: booking.customer.customer_id,
    service_name: booking.service.name,
    date: datePart,
    time: timePart.substring(0, 5), // Format time as HH:MM
    time_value: timeValue,
    price: booking.service.price,
    booking_id: booking.booking_id // Store the actual booking ID for deletion
  };
};

export const groupBookingsByDate = (bookings: EnhancedBooking[]): GroupedBooking[] => {
  // Group bookings by date
  const bookingsByDate: { [key: string]: EnhancedBooking[] } = {};
  bookings.forEach(booking => {
    if (!bookingsByDate[booking.date]) {
      bookingsByDate[booking.date] = [];
    }
    bookingsByDate[booking.date].push(booking);
  });
  
  // Merge bookings with the same user, customer, date and time
  Object.keys(bookingsByDate).forEach(date => {
    const bookingsForDate = bookingsByDate[date];
    
    // Create a map to track bookings with the same user, customer, and time
    const bookingMap: { [key: string]: EnhancedBooking } = {};
    
    bookingsForDate.forEach(booking => {
      // Create a unique key for each user+customer+time combination.
      const bookingKey = `${booking.user_id}_${booking.customer_id}_${booking.time}`;
      
      if (bookingMap[bookingKey]) {
        // If we already have a booking with this key, merge the services
        const existingBooking = bookingMap[bookingKey];
        
        // If we don't already have extra_services, create the array with just the new service
        if (!existingBooking.extra_services) {
          existingBooking.extra_services = [booking.service_name];
        } else {
          // Add this booking's service to the extra_services array
          existingBooking.extra_services.push(booking.service_name);
        }
        
        // Add the price
        existingBooking.price = (existingBooking.price || 0) + (booking.price || 0);
        
        // Store all booking IDs for deletion
        if (!existingBooking.booking_ids) {
          existingBooking.booking_ids = [existingBooking.booking_id!];
        }
        existingBooking.booking_ids.push(booking.booking_id!);
        
        console.log("Merged booking IDs:", existingBooking.booking_ids);
        
        // Keep the original service name (the first one)
        // existingBooking.service_name stays the same
      } else {
        // If this is the first booking with this key, add it to our map
        bookingMap[bookingKey] = { 
          ...booking,
          booking_ids: [booking.booking_id!] // Initialize with the first booking ID
        };
        console.log("Created new booking group with ID:", booking.booking_id);
      }
    });
    
    // Convert the map back to an array
    bookingsByDate[date] = Object.values(bookingMap);
  });
  
  // Sort bookings within each date group by time
  Object.keys(bookingsByDate).forEach(date => {
    bookingsByDate[date].sort((a, b) => a.time.localeCompare(b.time));
  });
  
  console.log("Grouped and merged bookings by date:", Object.keys(bookingsByDate));
  
  // Convert to grouped format with total price
  const grouped = Object.entries(bookingsByDate).map(([date, bookings]) => {
    // Calculate total price for the day
    const totalPrice = bookings.reduce((sum, booking) => sum + (booking.price || 0), 0);
    
    return {
      date,
      formattedDate: format(parseISO(date), "EEEE, MMMM d, yyyy"),
      bookings,
      totalPrice: `£${totalPrice.toFixed(2)}`
    };
  });
  
  // Sort dates chronologically
  grouped.sort((a, b) => a.date.localeCompare(b.date));
  
  console.log("Final grouped bookings:", grouped.length);
  return grouped;
};
