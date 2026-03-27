
import { ChevronLeft, ChevronRight } from "lucide-react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious, 
  PaginationEllipsis 
} from "@/components/ui/pagination";
import { PaginationInfo } from "@/types/interfaces";
import { useIsMobile } from "@/hooks/use-mobile";

interface PaginationControlsProps {
  paginationInfo: PaginationInfo;
  onPageChange: (page: number) => void;
}

const PaginationControls = ({ paginationInfo, onPageChange }: PaginationControlsProps) => {
  const isMobile = useIsMobile();
  
  // Function to generate visible page numbers for pagination
  const getVisiblePageNumbers = () => {
    const { page, total_pages } = paginationInfo;
    // Use fewer pages on mobile
    const delta = isMobile ? 0 : 1; // Number of pages to show before and after current page
    const pages: (number | string)[] = [];
    
    // Always add first page
    pages.push(1);
    
    // Calculate range around current page
    const rangeStart = Math.max(2, page - delta);
    const rangeEnd = Math.min(total_pages - 1, page + delta);
    
    // Add ellipsis after first page if needed
    if (rangeStart > 2) {
      pages.push('...');
    }
    
    // Add pages in range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (rangeEnd < total_pages - 1) {
      pages.push('...');
    }
    
    // Always add last page if there's more than one page
    if (total_pages > 1) {
      pages.push(total_pages);
    }
    
    return pages;
  };

  return (
    <Pagination className="py-2">
      <PaginationContent className={isMobile ? "gap-1" : "gap-1"}>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => paginationInfo.has_prev && onPageChange(paginationInfo.page - 1)}
            className={`${!paginationInfo.has_prev ? "pointer-events-none opacity-50" : "cursor-pointer"} ${
              isMobile ? "px-2 text-xs" : ""
            }`}
          >
            {isMobile ? <ChevronLeft className="h-4 w-4" /> : undefined}
          </PaginationPrevious>
        </PaginationItem>
        
        {getVisiblePageNumbers().map((pageNum, index) => (
          <PaginationItem key={index}>
            {typeof pageNum === 'string' ? (
              <PaginationEllipsis className={isMobile ? "w-6 h-6" : ""} />
            ) : (
              <PaginationLink
                isActive={paginationInfo.page === pageNum}
                onClick={() => onPageChange(Number(pageNum))}
                className={`cursor-pointer ${isMobile ? "min-w-[32px] h-8 text-sm" : ""}`}
              >
                {pageNum}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        
        <PaginationItem>
          <PaginationNext 
            onClick={() => paginationInfo.has_next && onPageChange(paginationInfo.page + 1)}
            className={`${!paginationInfo.has_next ? "pointer-events-none opacity-50" : "cursor-pointer"} ${
              isMobile ? "px-2 text-xs" : ""
            }`}
          >
            {isMobile ? <ChevronRight className="h-4 w-4" /> : undefined}
          </PaginationNext>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationControls;
