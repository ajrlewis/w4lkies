
import { format } from "date-fns";
import { EnhancedBooking } from "@/types/interfaces";

// Helper function to generate mock data for development/testing
export const generateMockBookings = (page: number): EnhancedBooking[] => {
  const mockData: EnhancedBooking[] = [];
  const baseDate = new Date('2025-05-01');
  
  // Create 10 mock items per page
  for (let i = 0; i < 10; i++) {
    const offset = ((page - 1) * 10) + i;
    const date = new Date(baseDate);
    date.setDate(date.getDate() - offset);
    
    mockData.push({
      id: `${1000 + offset}`, // Keep this as string for UI display
      user_name: i % 2 === 0 ? "Sara" : "Sophia",
      customer_name: ["Billy", "Hugo", "Indy", "Jeff", "Olly"][i % 5],
      service_name: `Dog Walking - ${i % 2 === 0 ? '30' : '60'} min`,
      date: format(date, 'yyyy-MM-dd'),
      time: `${8 + (i % 8)}:${i % 2 === 0 ? '00' : '30'}`,
      price: 25 + (i * 5),
      extra_services: i % 3 === 0 ? ["Treat Time", "Photo Updates"] : []
    });
  }
  
  return mockData;
};
