
import { Card, CardContent } from "@/components/ui/card";
import { PaginationInfo as PaginationInfoType } from "@/types/interfaces";
import { useIsMobile } from "@/hooks/use-mobile";
import PaginationControls from "./PaginationControls";

interface PaginationInfoProps {
  paginationInfo: PaginationInfoType;
  onPageChange: (page: number) => void;
}

const PaginationInfo = ({ paginationInfo, onPageChange }: PaginationInfoProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className="mb-6" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      <CardContent className={isMobile ? "pt-4 pb-4" : "pt-6"}>
        <div className={`flex ${isMobile ? "flex-col gap-3" : "flex-col sm:flex-row justify-between items-start sm:items-center gap-4"}`}>
          <div className={`text-sm ${isMobile ? "text-center" : ""}`} style={{ color: 'var(--text-secondary)' }}>
            Showing {paginationInfo.total_items > 0 ? ((paginationInfo.page - 1) * paginationInfo.page_size) + 1 : 0} to{" "}
            {Math.min(paginationInfo.page * paginationInfo.page_size, paginationInfo.total_items)} of{" "}
            {paginationInfo.total_items} bookings
          </div>
          <div className={isMobile ? "flex justify-center w-full" : ""}>
            <PaginationControls 
              paginationInfo={paginationInfo}
              onPageChange={onPageChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaginationInfo;
