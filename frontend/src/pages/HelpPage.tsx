import * as React from "react"
import { Send, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { AnimatedInput } from "@/components/ui/animated-input"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// Mock data for existing tickets
const existingTickets = [
  {
    id: "TICK-001",
    subject: "Unable to process refunds",
    priority: "High",
    status: "Open",
    createdAt: "2024-01-15",
    category: "Technical Issue"
  },
  {
    id: "TICK-002", 
    subject: "Request for additional user access",
    priority: "Medium",
    status: "In Progress",
    createdAt: "2024-01-12",
    category: "Account & Permissions"
  },
  {
    id: "TICK-003",
    subject: "How to generate monthly reports?",
    priority: "Low",
    status: "Resolved",
    createdAt: "2024-01-10",
    category: "General Question"
  }
]

export default function HelpPage() {
  const [formData, setFormData] = React.useState({
    subject: "",
    category: "",
    priority: "",
    description: ""
  })
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showSuccess, setShowSuccess] = React.useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.subject || !formData.category || !formData.priority || !formData.description) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log("Submitting ticket:", formData)
    
    setIsSubmitting(false)
    setShowSuccess(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({ subject: "", category: "", priority: "", description: "" })
      setShowSuccess(false)
    }, 3000)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "text-destructive bg-destructive/10"
      case "Medium": return "text-warning bg-warning/10"
      case "Low": return "text-success bg-success/10"
      default: return "text-muted-foreground bg-muted/10"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "text-destructive bg-destructive/10"
      case "In Progress": return "text-warning bg-warning/10"
      case "Resolved": return "text-success bg-success/10"
      default: return "text-muted-foreground bg-muted/10"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Open": return <AlertCircle className="h-4 w-4" />
      case "In Progress": return <Clock className="h-4 w-4" />
      case "Resolved": return <CheckCircle className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Help & Support" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* New Ticket Form */}
              <Card className="card-gradient animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-primary" />
                    Submit Support Ticket
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {showSuccess ? (
                    <div className="text-center py-8 animate-scale-in">
                      <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-success mb-2">
                        Ticket Submitted Successfully!
                      </h3>
                      <p className="text-muted-foreground">
                        We've received your support request and will get back to you within 24 hours.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <AnimatedInput
                        label="Subject *"
                        placeholder="Brief description of your issue"
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        required
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Category *</label>
                          <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technical">Technical Issue</SelectItem>
                              <SelectItem value="account">Account & Permissions</SelectItem>
                              <SelectItem value="billing">Billing & Payments</SelectItem>
                              <SelectItem value="general">General Question</SelectItem>
                              <SelectItem value="feature">Feature Request</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Priority *</label>
                          <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Description *</label>
                        <Textarea
                          placeholder="Please provide detailed information about your issue..."
                          value={formData.description}
                          onChange={(e) => handleInputChange("description", e.target.value)}
                          rows={4}
                          className="min-h-24 resize-none transition-all duration-300 focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>

                      <AnimatedButton
                        type="submit"
                        variant="gradient"
                        size="lg"
                        className="w-full gap-2"
                        loading={isSubmitting}
                      >
                        <Send className="h-4 w-4" />
                        {isSubmitting ? "Submitting..." : "Submit Ticket"}
                      </AnimatedButton>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Existing Tickets */}
              <Card className="card-gradient animate-slide-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Your Recent Tickets
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {existingTickets.map((ticket, index) => (
                    <div 
                      key={ticket.id}
                      className="p-4 border rounded-lg hover:bg-muted/30 transition-all duration-300 hover-lift animate-stagger"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-sm mb-1">{ticket.subject}</h4>
                          <p className="text-xs text-muted-foreground">
                            Ticket ID: {ticket.id} • Created: {ticket.createdAt}
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(ticket.status)}`}>
                            {getStatusIcon(ticket.status)}
                            {ticket.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Category: {ticket.category}
                      </div>
                    </div>
                  ))}

                  {existingTickets.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No tickets found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <Card className="card-gradient animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="animate-stagger" style={{ animationDelay: "0.1s" }}>
                      <h4 className="font-semibold mb-2">How do I add new medicines to inventory?</h4>
                      <p className="text-sm text-muted-foreground">
                        Navigate to Inventory → Add Medicine and fill in the required details including name, category, pricing, and stock quantities.
                      </p>
                    </div>

                    <div className="animate-stagger" style={{ animationDelay: "0.2s" }}>
                      <h4 className="font-semibold mb-2">How can I process a refund?</h4>
                      <p className="text-sm text-muted-foreground">
                        Go to Sales → Transaction History, find the original sale, and click the "Refund" button. Enter the refund amount and reason.
                      </p>
                    </div>

                    <div className="animate-stagger" style={{ animationDelay: "0.3s" }}>
                      <h4 className="font-semibold mb-2">Where can I view low stock alerts?</h4>
                      <p className="text-sm text-muted-foreground">
                        Low stock items are displayed on the Dashboard and you can set custom thresholds in Settings → Inventory Alerts.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="animate-stagger" style={{ animationDelay: "0.4s" }}>
                      <h4 className="font-semibold mb-2">How do I generate reports?</h4>
                      <p className="text-sm text-muted-foreground">
                        Visit Reports → Select your desired report type and date range, then click "Generate Report" to view or export the data.
                      </p>
                    </div>

                    <div className="animate-stagger" style={{ animationDelay: "0.5s" }}>
                      <h4 className="font-semibold mb-2">Can I backup my data?</h4>
                      <p className="text-sm text-muted-foreground">
                        Yes, go to Settings → Data Management to schedule automatic backups or create manual backups of your pharmacy data.
                      </p>
                    </div>

                    <div className="animate-stagger" style={{ animationDelay: "0.6s" }}>
                      <h4 className="font-semibold mb-2">How do I manage user permissions?</h4>
                      <p className="text-sm text-muted-foreground">
                        Admin users can manage permissions in Settings → User Management. Assign roles and specific permissions to each team member.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
