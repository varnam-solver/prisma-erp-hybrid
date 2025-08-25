import * as React from "react"
import { 
  DollarSign, 
  Package, 
  TrendingUp, 
  Users,
  AlertTriangle,
  ArrowUp,
  ArrowDown
} from "lucide-react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { StatisticCard } from "@/components/ui/statistic-card"
import { ModuleCard } from "@/components/ui/module-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Mock data
const statistics = [
  {
    title: "Today's Sales",
    value: "$12,345",
    change: "+12.5% from yesterday",
    changeType: "positive" as const,
    icon: <DollarSign className="h-4 w-4" />
  },
  {
    title: "Low Stock Items",
    value: "23",
    change: "+3 from last week",
    changeType: "negative" as const,
    icon: <AlertTriangle className="h-4 w-4" />
  },
  {
    title: "Total Products",
    value: "1,247",
    change: "+15 new items",
    changeType: "positive" as const,
    icon: <Package className="h-4 w-4" />
  },
  {
    title: "Active Customers",
    value: "892",
    change: "+5.2% this month",
    changeType: "positive" as const,
    icon: <Users className="h-4 w-4" />
  }
]

const recentSales = [
  { id: "INV-001", customer: "John Doe", amount: "$245.50", status: "Completed" },
  { id: "INV-002", customer: "Jane Smith", amount: "$89.25", status: "Pending" },
  { id: "INV-003", customer: "Mike Johnson", amount: "$156.75", status: "Completed" },
  { id: "INV-004", customer: "Sarah Wilson", amount: "$67.80", status: "Completed" },
]

const lowStockItems = [
  { name: "Paracetamol 500mg", current: 15, minimum: 50, urgency: "high" },
  { name: "Amoxicillin 250mg", current: 8, minimum: 30, urgency: "high" },
  { name: "Vitamin C Tablets", current: 25, minimum: 40, urgency: "medium" },
  { name: "Cough Syrup", current: 12, minimum: 20, urgency: "medium" },
]

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dashboard" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Section */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-primary/5 to-primary-glow/5 rounded-xl p-6 border border-primary/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-3 w-3 rounded-full bg-success animate-pulse"></div>
                  <span className="text-sm font-medium text-success">System Online</span>
                </div>
                <h1 className="text-3xl font-bold mb-2">Welcome back to <span className="text-primary">CityCare Pharmacy</span></h1>
                <p className="text-muted-foreground">
                  Complete pharmacy management at your fingertips - every module accessible instantly.
                </p>
                <div className="flex gap-3 mt-4">
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Start New Sale
                  </button>
                  <button className="border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-lg transition-colors">
                    Manage Inventory
                  </button>
                </div>
              </div>
            </div>

            {/* Core Operations */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Core Operations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ModuleCard
                  title="Inventory Management"
                  description="Manage medicines, stock levels, and product information"
                  icon={<Package className="h-6 w-6" />}
                  color="blue"
                  href="/inventory"
                />
                <ModuleCard
                  title="Sales & Billing"
                  description="Process sales, generate invoices, and manage transactions"
                  icon={<DollarSign className="h-6 w-6" />}
                  color="green"
                />
                <ModuleCard
                  title="Customer Management"
                  description="Manage customer profiles, history, and preferences"
                  icon={<Users className="h-6 w-6" />}
                  color="purple"
                />
                <ModuleCard
                  title="Stock Entry"
                  description="Add new stock, update quantities, and manage purchases"
                  icon={<ArrowUp className="h-6 w-6" />}
                  color="orange"
                />
              </div>
            </div>

            {/* Analytics & Reports */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Analytics & Reports</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ModuleCard
                  title="Reports & Analytics"
                  description="Comprehensive reports on sales, inventory, and performance"
                  icon={<TrendingUp className="h-6 w-6" />}
                  color="blue"
                />
                <ModuleCard
                  title="Inventory Reports"
                  description="Detailed inventory analysis and stock reports"
                  icon={<Package className="h-6 w-6" />}
                  color="teal"
                />
                <ModuleCard
                  title="Sales Details"
                  description="Detailed sales analysis and transaction history"
                  icon={<DollarSign className="h-6 w-6" />}
                  color="cyan"
                />
              </div>
            </div>

            {/* Quick Stats */}
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

            {/* Charts and Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sales Chart */}
              <Card className="lg:col-span-2 card-gradient hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Weekly Sales Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Chart will be implemented with a charting library</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Sales */}
              <Card className="card-gradient hover-lift">
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentSales.map((sale, index) => (
                    <div 
                      key={sale.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors animate-stagger"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div>
                        <p className="font-medium text-sm">{sale.customer}</p>
                        <p className="text-xs text-muted-foreground">{sale.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{sale.amount}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          sale.status === "Completed" 
                            ? "bg-success/10 text-success" 
                            : "bg-warning/10 text-warning"
                        }`}>
                          {sale.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Low Stock Alert */}
            <Card className="card-gradient hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="h-5 w-5" />
                  Low Stock Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {lowStockItems.map((item, index) => (
                    <div 
                      key={item.name}
                      className="p-4 rounded-lg bg-muted/30 border border-warning/20 hover:border-warning/40 transition-colors animate-stagger"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <h4 className="font-medium text-sm mb-2">{item.name}</h4>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Current: {item.current}</span>
                        <span className="text-muted-foreground">Min: {item.minimum}</span>
                      </div>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            item.urgency === "high" ? "bg-destructive" : "bg-warning"
                          }`}
                          style={{ width: `${(item.current / item.minimum) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}