import * as React from "react"
import { Calendar, Download, TrendingUp, PieChart, BarChart3, DollarSign } from "lucide-react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { StatisticCard } from "@/components/ui/statistic-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for reports
const reportData = {
  salesData: [
    { period: "Jan 2024", sales: 45000, growth: 12 },
    { period: "Feb 2024", sales: 52000, growth: 15.5 },
    { period: "Mar 2024", sales: 48000, growth: -7.7 },
    { period: "Apr 2024", sales: 61000, growth: 27.1 },
    { period: "May 2024", sales: 58000, growth: -4.9 },
    { period: "Jun 2024", sales: 67000, growth: 15.5 }
  ],
  topSellingMedicines: [
    { name: "Paracetamol 500mg", units: 1250, revenue: 15625 },
    { name: "Vitamin C 1000mg", units: 980, revenue: 8575 },
    { name: "Amoxicillin 250mg", units: 756, revenue: 18522 },
    { name: "Cough Syrup 200ml", units: 432, revenue: 6588 },
    { name: "Ibuprofen 400mg", units: 298, revenue: 5656 }
  ],
  categoryBreakdown: [
    { category: "Analgesics", percentage: 35, value: 23450 },
    { category: "Antibiotics", percentage: 22, value: 14740 },
    { category: "Vitamins", percentage: 18, value: 12060 },
    { category: "Respiratory", percentage: 15, value: 10050 },
    { category: "Others", percentage: 10, value: 6700 }
  ]
}

const statistics = [
  {
    title: "Total Revenue",
    value: "$67,000",
    change: "+15.5% from last month",
    changeType: "positive" as const,
    icon: <DollarSign className="h-4 w-4" />
  },
  {
    title: "Total Orders",
    value: "2,847",
    change: "+8.2% from last month",
    changeType: "positive" as const,
    icon: <TrendingUp className="h-4 w-4" />
  },
  {
    title: "Average Order Value",
    value: "$23.54",
    change: "+3.1% from last month",
    changeType: "positive" as const,
    icon: <BarChart3 className="h-4 w-4" />
  },
  {
    title: "Customer Retention",
    value: "89.5%",
    change: "-2.3% from last month",
    changeType: "negative" as const,
    icon: <PieChart className="h-4 w-4" />
  }
]

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = React.useState("last-6-months")
  const [selectedReport, setSelectedReport] = React.useState("sales-overview")

  const exportReport = () => {
    console.log("Exporting report:", { period: selectedPeriod, type: selectedReport })
    alert("Report exported successfully!")
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Reports Dashboard" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between animate-fade-in">
              <div className="flex gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Report Type</label>
                  <Select value={selectedReport} onValueChange={setSelectedReport}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales-overview">Sales Overview</SelectItem>
                      <SelectItem value="inventory-report">Inventory Report</SelectItem>
                      <SelectItem value="customer-analytics">Customer Analytics</SelectItem>
                      <SelectItem value="profit-loss">Profit & Loss</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Time Period</label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last-week">Last Week</SelectItem>
                      <SelectItem value="last-month">Last Month</SelectItem>
                      <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                      <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                      <SelectItem value="last-year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <AnimatedButton
                variant="gradient"
                onClick={exportReport}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export Report
              </AnimatedButton>
            </div>

            {/* Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statistics.map((stat, index) => (
                <StatisticCard
                  key={stat.title}
                  title={stat.title}
                  value={stat.value}
                  change={stat.change}
                  changeType={stat.changeType}
                  icon={stat.icon}
                  delay={index * 100}
                  className="animate-stagger"
                />
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Trend Chart */}
              <Card className="card-gradient hover-lift animate-slide-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Sales Trend (Last 6 Months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg mb-4">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">Interactive chart will be implemented</p>
                    </div>
                  </div>
                  
                  {/* Sales data table */}
                  <div className="space-y-2">
                    {reportData.salesData.map((item, index) => (
                      <div 
                        key={item.period}
                        className="flex justify-between items-center p-2 rounded bg-muted/20 animate-stagger"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <span className="text-sm font-medium">{item.period}</span>
                        <div className="text-right">
                          <span className="font-semibold">${item.sales.toLocaleString()}</span>
                          <span className={`ml-2 text-xs ${
                            item.growth > 0 ? 'text-success' : 'text-destructive'
                          }`}>
                            {item.growth > 0 ? '+' : ''}{item.growth}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <Card className="card-gradient hover-lift animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-primary" />
                    Sales by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg mb-4">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">Pie chart will be implemented</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {reportData.categoryBreakdown.map((item, index) => (
                      <div 
                        key={item.category}
                        className="animate-stagger"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{item.category}</span>
                          <span>{item.percentage}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          ${item.value.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Selling Medicines */}
            <Card className="card-gradient hover-lift animate-fade-in">
              <CardHeader>
                <CardTitle>Top Selling Medicines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium text-muted-foreground">Medicine</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">Units Sold</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">Revenue</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.topSellingMedicines.map((medicine, index) => (
                        <tr 
                          key={medicine.name}
                          className="border-b hover:bg-muted/30 transition-colors animate-stagger"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <td className="p-3 font-medium">{medicine.name}</td>
                          <td className="p-3 text-right">{medicine.units.toLocaleString()}</td>
                          <td className="p-3 text-right font-semibold">
                            ${medicine.revenue.toLocaleString()}
                          </td>
                          <td className="p-3 text-right">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-success/10 text-success">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              +{Math.floor(Math.random() * 20 + 5)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}