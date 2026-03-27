import { format, parseISO, eachMonthOfInterval, subMonths } from "date-fns";
import { AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface Expense {
  expense_id: number;
  date: string;
  price: number;
  description: string;
  category: string;
}

interface ExpenseAggregateChartProps {
  expenses: Expense[];
}

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const formatShortCurrency = (value: number) => {
  if (value >= 1000) {
    return `£${(value / 1000).toFixed(1)}k`;
  }
  return `£${Math.round(value)}`;
};

const ExpenseAggregateChart = ({ expenses }: ExpenseAggregateChartProps) => {
  const generateMonthlyData = () => {
    if (!expenses.length) {
      return [];
    }

    const endDate = new Date();
    const startDate = subMonths(endDate, 11);
    const months = eachMonthOfInterval({ start: startDate, end: endDate });

    return months.map((month) => {
      const monthKey = format(month, "yyyy-MM");
      const monthName = format(month, "MMM yyyy");

      const monthExpenses = expenses.filter((expense) => {
        const expenseMonth = format(parseISO(expense.date), "yyyy-MM");
        return expenseMonth === monthKey;
      });

      const monthTotal = monthExpenses.reduce((sum, expense) => sum + expense.price, 0);

      return {
        month: monthName,
        shortMonth: format(month, "MMM"),
        total: monthTotal,
      };
    });
  };

  const generateCategoryData = () => {
    const categoryTotals: Record<string, number> = {};

    expenses.forEach((expense) => {
      const key = expense.category?.trim() || "other";
      categoryTotals[key] = (categoryTotals[key] || 0) + expense.price;
    });

    return Object.entries(categoryTotals)
      .map(([category, total]) => ({
        category,
        shortCategory: category.length > 12 ? `${category.slice(0, 12)}…` : category,
        total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  };

  const monthlyData = generateMonthlyData();
  const categoryData = generateCategoryData();

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.price, 0);
  const expenseCount = expenses.length;
  const averageExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;
  const thisMonthExpenses = expenses
    .filter((expense) => format(parseISO(expense.date), "yyyy-MM") === format(new Date(), "yyyy-MM"))
    .reduce((sum, expense) => sum + expense.price, 0);

  const chartConfig = {
    total: {
      label: "Expenses",
      color: "#f97316",
    },
    category: {
      label: "By Category",
      color: "#3f8f78",
    },
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
          <h3 className="mb-2 text-sm font-medium text-primary">Total Expenses</h3>
          <p className="text-3xl font-bold text-foreground">{currencyFormatter.format(totalExpenses)}</p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
          <h3 className="mb-2 text-sm font-medium text-secondary">This Month</h3>
          <p className="text-3xl font-bold text-foreground">{currencyFormatter.format(thisMonthExpenses)}</p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
          <h3 className="mb-2 text-sm font-medium text-accent">Total Entries</h3>
          <p className="text-3xl font-bold text-foreground">{expenseCount.toLocaleString("en-GB")}</p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">Average Expense</h3>
          <p className="text-3xl font-bold text-foreground">{currencyFormatter.format(averageExpense)}</p>
        </div>
      </div>

      <div className="space-y-8 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm md:p-8">
          <h3 className="mb-4 text-lg font-semibold text-foreground md:mb-6 md:text-xl">Monthly Trend</h3>
          <p className="mb-4 text-sm text-muted-foreground md:mb-6">Total spend by month</p>
          {monthlyData.length > 0 ? (
            <div className="h-[250px] md:h-[300px]">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <AreaChart data={monthlyData}>
                  <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="shortMonth"
                    tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                    tickFormatter={(value) => formatShortCurrency(Number(value))}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        hideIndicator
                        className="border-border/80 bg-background/95 text-foreground shadow-xl backdrop-blur"
                        labelClassName="text-foreground"
                        formatter={(value) => [currencyFormatter.format(Number(value)), ""]}
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
              No expense data available
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm md:p-8">
          <h3 className="mb-4 text-lg font-semibold text-foreground md:mb-6 md:text-xl">Category Breakdown</h3>
          <p className="mb-4 text-sm text-muted-foreground md:mb-6">Top categories by total spend</p>
          {categoryData.length > 0 ? (
            <div className="h-[250px] md:h-[300px]">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart data={categoryData}>
                  <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="shortCategory"
                    tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                    tickFormatter={(value) => formatShortCurrency(Number(value))}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        hideIndicator
                        className="border-border/80 bg-background/95 text-foreground shadow-xl backdrop-blur"
                        labelClassName="text-foreground"
                        formatter={(value) => [currencyFormatter.format(Number(value)), ""]}
                        labelFormatter={(label, payload) => {
                          if (payload && payload[0]) {
                            return payload[0].payload.category;
                          }
                          return label;
                        }}
                      />
                    }
                  />
                  <Bar
                    dataKey="total"
                    fill="currentColor"
                    radius={[4, 4, 0, 0]}
                    className="text-[#3f8f78] dark:text-[#86d0b7]"
                  />
                </BarChart>
              </ChartContainer>
            </div>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-muted-foreground md:h-[300px]">
              No expense data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseAggregateChart;
