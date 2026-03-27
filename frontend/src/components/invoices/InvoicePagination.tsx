
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface InvoicePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const InvoicePagination = ({ currentPage, totalPages, onPageChange }: InvoicePaginationProps) => {
  const isMobile = useIsMobile();
  
  const getVisiblePages = () => {
    // Use fewer pages on mobile
    const delta = isMobile ? 1 : 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages();

  return (
    <div className={`flex items-center ${isMobile ? "gap-1 flex-wrap justify-center" : "gap-1"}`}>
      <Button
        variant="outline"
        size={isMobile ? "sm" : "sm"}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center gap-1 ${isMobile ? "px-2" : ""}`}
      >
        <ChevronLeft className="h-4 w-4" />
        {!isMobile && "Previous"}
      </Button>

      <div className={`flex items-center ${isMobile ? "gap-1" : "gap-1"}`}>
        {visiblePages.map((page, index) => (
          <div key={index}>
            {page === '...' ? (
              <span className={`text-sm text-muted-foreground ${isMobile ? "px-1 py-2" : "px-3 py-2"}`}>...</span>
            ) : (
              <Button
                variant={currentPage === page ? "default" : "outline"}
                size={isMobile ? "sm" : "sm"}
                onClick={() => onPageChange(page as number)}
                className={isMobile ? "min-w-[32px] px-2" : "min-w-[32px]"}
              >
                {page}
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size={isMobile ? "sm" : "sm"}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center gap-1 ${isMobile ? "px-2" : ""}`}
      >
        {!isMobile && "Next"}
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default InvoicePagination;
