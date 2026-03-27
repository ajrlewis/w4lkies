
import { Invoice } from "@/types/interfaces";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, BarChart, Bar, CartesianGrid } from "recharts";
import { format, parseISO, eachMonthOfInterval, subMonths } from "date-fns";

interface InvoiceAggregateChartProps {
  invoices: Invoice[];
}

const InvoiceAggregateChart = ({ invoices }: InvoiceAggregateChartProps) => {
  // Generate chart data based on invoice.date_start
  const generateChartData = () => {
    if (!invoices.length) return [];

    // Get the date range (last 12 months)
    const endDate = new Date();
    const startDate = subMonths(endDate, 11);
    
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    
    const chartData = months.map(month => {
      const monthKey = format(month, 'yyyy-MM');
      const monthName = format(month, 'MMM yyyy');
      
      // Filter invoices by date_start instead of date_issued
      const monthInvoices = invoices.filter(invoice => {
        const invoiceMonth = format(parseISO(invoice.date_start), 'yyyy-MM');
        return invoiceMonth === monthKey;
      });

      const monthTotal = monthInvoices.reduce((sum, invoice) => sum + invoice.price_total, 0);

      return {
        month: monthName,
        shortMonth: format(month, 'MMM'),
        total: monthTotal,
        count: monthInvoices.length
      };
    });

    return chartData;
  };

  const chartData = generateChartData();
  
  // Calculate summary statistics
  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.price_total, 0);
  const totalInvoices = invoices.length;
  const averageInvoice = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

  // Calculate date range for display
  const getDateRange = () => {
    if (invoices.length === 0) return null;
    
    const sortedInvoices = invoices.slice().sort((a, b) => 
      new Date(a.date_issued).getTime() - new Date(b.date_issued).getTime()
    );
    
    const firstInvoice = sortedInvoices[0];
    const lastInvoice = sortedInvoices[sortedInvoices.length - 1];
    
    const firstDate = format(parseISO(firstInvoice.date_issued), 'MMM yyyy');
    const lastDate = format(parseISO(lastInvoice.date_issued), 'MMM yyyy');
    
    return firstDate === lastDate ? firstDate : `${firstDate} - ${lastDate}`;
  };

  const dateRange = getDateRange();

  const chartConfig = {
    total: {
      label: "Revenue",
      color: "#f97316",
    },
    count: {
      label: "Invoices",
      color: "#3f8f78",
    },
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
          <h3 className="mb-2 text-sm font-medium text-primary">Total Revenue</h3>
          <p className="text-3xl font-bold text-foreground">£{totalRevenue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          {dateRange && (
            <p className="mt-1 text-xs text-muted-foreground">{dateRange}</p>
          )}
        </div>
        
        <div className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
          <h3 className="mb-2 text-sm font-medium text-secondary">Total Invoices</h3>
          <p className="text-3xl font-bold text-foreground">{totalInvoices.toLocaleString('en-GB')}</p>
        </div>
        
        <div className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
          <h3 className="mb-2 text-sm font-medium text-accent">Average Invoice</h3>
          <p className="text-3xl font-bold text-foreground">£{averageInvoice.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Enhanced Charts */}
      <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8">
        {/* Revenue Area Chart */}
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm md:p-8">
          <h3 className="mb-4 text-lg font-semibold text-foreground md:mb-6 md:text-xl">Revenue Trend</h3>
          <p className="mb-4 text-sm text-muted-foreground md:mb-6">Monthly revenue based on service period start date</p>
          {chartData.length > 0 ? (
            <div className="h-[250px] md:h-[300px]">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <AreaChart data={chartData}>
                  <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
                  <XAxis 
                    dataKey="shortMonth" 
                    tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                    tickFormatter={(value) => `£${Number(value).toLocaleString('en-GB')}`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ChartTooltip 
                    content={
                      <ChartTooltipContent 
                        hideIndicator
                        className="border-border/80 bg-background/95 text-foreground shadow-xl backdrop-blur"
                        labelClassName="text-foreground"
                        formatter={(value) => [
                          `£${Number(value).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                          ""
                        ]}
                        labelFormatter={(label, payload) => {
                          if (payload && payload[0]) {
                            return payload[0].payload.month;
                          }
                          return label;
                        }}
                      />
                    }
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="currentColor"
                    strokeWidth={3}
                    fill="currentColor"
                    fillOpacity={0.22}
                    className="text-[#f97316] dark:text-[#fb923c]"
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-muted-foreground md:h-[300px]">
              No invoice data available
            </div>
          )}
        </div>

        {/* Invoice Count Bar Chart */}
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm md:p-8">
          <h3 className="mb-4 text-lg font-semibold text-foreground md:mb-6 md:text-xl">Invoice Volume</h3>
          <p className="mb-4 text-sm text-muted-foreground md:mb-6">Number of invoices per month</p>
          {chartData.length > 0 ? (
            <div className="h-[250px] md:h-[300px]">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart data={chartData}>
                  <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
                  <XAxis 
                    dataKey="shortMonth" 
                    tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ChartTooltip 
                    content={
                      <ChartTooltipContent 
                        hideIndicator
                        className="border-border/80 bg-background/95 text-foreground shadow-xl backdrop-blur"
                        labelClassName="text-foreground"
                        formatter={(value) => [
                          `${Number(value).toLocaleString('en-GB')} invoices`,
                          ""
                        ]}
                        labelFormatter={(label, payload) => {
                          if (payload && payload[0]) {
                            return payload[0].payload.month;
                          }
                          return label;
                        }}
                      />
                    }
                  />
                  <Bar 
                    dataKey="count" 
                    fill="currentColor"
                    radius={[4, 4, 0, 0]}
                    className="text-[#3f8f78] dark:text-[#86d0b7]"
                  />
                </BarChart>
              </ChartContainer>
            </div>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-muted-foreground md:h-[300px]">
              No invoice data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceAggregateChart;
