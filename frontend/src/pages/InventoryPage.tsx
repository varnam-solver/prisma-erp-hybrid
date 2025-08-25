import * as React from "react"
import { Plus, Filter, Download } from "lucide-react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { SearchBar } from "@/components/ui/search-bar"
import { AnimatedButton } from "@/components/ui/animated-button"
import { ItemCard } from "@/components/ui/item-card"

// Mock data
const medicines = [
  {
    id: 1,
    title: "Paracetamol 500mg",
    subtitle: "Pain Relief",
    description: "Effective pain and fever relief tablets. Safe for adults and children over 12 years.",
    price: "$12.99",
    status: "low-stock" as const,
    category: "Analgesics",
    image: "/api/placeholder/300/200"
  },
  {
    id: 2,
    title: "Amoxicillin 250mg",
    subtitle: "Antibiotic",
    description: "Broad-spectrum antibiotic for bacterial infections. Prescription required.",
    price: "$24.50",
    status: "in-stock" as const,
    category: "Antibiotics",
    image: "/api/placeholder/300/200"
  },
  {
    id: 3,
    title: "Vitamin C 1000mg",
    subtitle: "Immune Support",
    description: "High-strength vitamin C tablets for immune system support and antioxidant protection.",
    price: "$8.75",
    status: "in-stock" as const,
    category: "Vitamins",
    image: "/api/placeholder/300/200"
  },
  {
    id: 4,
    title: "Cough Syrup 200ml",
    subtitle: "Respiratory Care",
    description: "Soothing cough syrup for dry and productive coughs. Natural honey flavor.",
    price: "$15.25",
    status: "low-stock" as const,
    category: "Respiratory",
    image: "/api/placeholder/300/200"
  },
  {
    id: 5,
    title: "Ibuprofen 400mg",
    subtitle: "Anti-inflammatory",
    description: "Non-steroidal anti-inflammatory drug for pain, inflammation and fever relief.",
    price: "$18.99",
    status: "out-of-stock" as const,
    category: "Anti-inflammatory",
    image: "/api/placeholder/300/200"
  },
  {
    id: 6,
    title: "Multivitamin Complex",
    subtitle: "Daily Nutrition",
    description: "Complete daily multivitamin with essential vitamins and minerals for overall health.",
    price: "$22.50",
    status: "in-stock" as const,
    category: "Vitamins",
    image: "/api/placeholder/300/200"
  }
]

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filteredMedicines, setFilteredMedicines] = React.useState(medicines)

  React.useEffect(() => {
    const filtered = medicines.filter(medicine =>
      medicine.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredMedicines(filtered)
  }, [searchQuery])

  const handleEdit = (id: number) => {
    console.log("Edit medicine:", id)
    // Implementation would go here
  }

  const handleDelete = (id: number) => {
    console.log("Delete medicine:", id)
    // Implementation would go here
  }

  const handleView = (id: number) => {
    console.log("View medicine:", id)
    // Implementation would go here
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Inventory Management" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 max-w-md">
                <SearchBar
                  placeholder="Search medicines, categories..."
                  value={searchQuery}
                  onSearch={setSearchQuery}
                />
              </div>
              
              <div className="flex gap-2">
                <AnimatedButton variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </AnimatedButton>
                
                <AnimatedButton variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </AnimatedButton>
                
                <AnimatedButton variant="gradient" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Medicine
                </AnimatedButton>
              </div>
            </div>

            {/* Statistics Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-card rounded-lg p-4 border hover-lift">
                <div className="text-2xl font-bold text-primary">{medicines.length}</div>
                <div className="text-sm text-muted-foreground">Total Items</div>
              </div>
              <div className="bg-card rounded-lg p-4 border hover-lift">
                <div className="text-2xl font-bold text-success">
                  {medicines.filter(m => m.status === "in-stock").length}
                </div>
                <div className="text-sm text-muted-foreground">In Stock</div>
              </div>
              <div className="bg-card rounded-lg p-4 border hover-lift">
                <div className="text-2xl font-bold text-warning">
                  {medicines.filter(m => m.status === "low-stock").length}
                </div>
                <div className="text-sm text-muted-foreground">Low Stock</div>
              </div>
              <div className="bg-card rounded-lg p-4 border hover-lift">
                <div className="text-2xl font-bold text-destructive">
                  {medicines.filter(m => m.status === "out-of-stock").length}
                </div>
                <div className="text-sm text-muted-foreground">Out of Stock</div>
              </div>
            </div>

            {/* Medicine Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMedicines.map((medicine, index) => (
                <ItemCard
                  key={medicine.id}
                  title={medicine.title}
                  subtitle={medicine.subtitle}
                  description={medicine.description}
                  price={medicine.price}
                  status={medicine.status}
                  category={medicine.category}
                  image={medicine.image}
                  onEdit={() => handleEdit(medicine.id)}
                  onDelete={() => handleDelete(medicine.id)}
                  onView={() => handleView(medicine.id)}
                  delay={index * 100}
                  className="animate-stagger"
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredMedicines.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold mb-2">No medicines found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <AnimatedButton variant="outline" onClick={() => setSearchQuery("")}>
                  Clear Search
                </AnimatedButton>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}