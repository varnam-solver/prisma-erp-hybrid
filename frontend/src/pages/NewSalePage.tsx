import React, { useState, useRef, useEffect, useCallback } from "react"
import { ArrowLeft, Search, Plus, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { AnimatedButton } from "@/components/ui/animated-button"
import apiClient from "@/api/axiosConfig"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

// --- Interface Definitions ---
interface ApiMedicine {
  medicineId: string;
  brandName: string;
  manufacturer: string | null;
  composition: string;
  gstRate: number;
  batches: {
    batchId: string;
    batchNumber: string;
    expiryDate: string;
    pricePerUnit: number;
    stockInUnits: number;
    unitsPerPack: number;
  }[];
}

interface ApiCustomer {
    id: string;
    name: string;
    phone: string | null;
    address: string | null;
}

interface CartItem {
  id: string; 
  medicineId: string;
  batchId: string;
  name: string;
  batch: string;
  quantity: number;
  price: number;
  total: number;
}

export default function NewSalePage() {
  const navigate = useNavigate();

  // --- Refs for Focus Management ---
  const customerNameRef = useRef<HTMLInputElement>(null);
  const phoneNumberRef = useRef<HTMLInputElement>(null);
  const doctorNameRef = useRef<HTMLInputElement>(null);
  const prescriptionNumberRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLTextAreaElement>(null);
  const medicineSearchRef = useRef<HTMLInputElement>(null);
  const batchSelectRef = useRef<HTMLSelectElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);

  // --- State for Customer Info ---
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerSearchResults, setCustomerSearchResults] = useState<ApiCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<ApiCustomer | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [prescriptionNumber, setPrescriptionNumber] = useState("");
  const [address, setAddress] = useState("");

  // --- State for Medicine Search & Selection ---
  const [medicineSearch, setMedicineSearch] = useState("");
  const [medicineResults, setMedicineResults] = useState<ApiMedicine[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<ApiMedicine | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [isLoading, setIsLoading] = useState(false);
  
  // --- State for Keyboard Navigation ---
  const [activeIndex, setActiveIndex] = useState(-1);

  // --- State for the Sales Cart ---
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Set initial focus on the customer name input
  useEffect(() => {
    customerNameRef.current?.focus();
  }, []);

  // --- useEffect for real-time customer search ---
  useEffect(() => {
    if (customerSearch.trim().length < 2) {
      setCustomerSearchResults([]);
      return;
    }
    const fetchAndFilterCustomers = async () => {
      try {
        const response = await apiClient.get(`/customers`);
        const filtered = response.data.filter((cust: ApiCustomer) => 
            cust.name.toLowerCase().includes(customerSearch.toLowerCase())
        );
        setCustomerSearchResults(filtered.length > 0 ? filtered : []);
      } catch (err) {
        console.error("Failed to search customers", err);
      }
    };
    const delayDebounceFn = setTimeout(() => fetchAndFilterCustomers(), 300);
    return () => clearTimeout(delayDebounceFn);
  }, [customerSearch]);

  const handleSelectCustomer = (customer: ApiCustomer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
    setPhoneNumber(customer.phone || "");
    setAddress(customer.address || "");
    setCustomerSearchResults([]);
    medicineSearchRef.current?.focus();
  };

  // --- useEffect for real-time medicine search ---
  useEffect(() => {
    if (medicineSearch.trim().length < 1) {
      setMedicineResults([]);
      return;
    }
    const search = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get(`/medicines/search?q=${medicineSearch}`);
        setMedicineResults(response.data);
        setActiveIndex(-1);
      } catch (err) {
        console.error('Failed to fetch medicines', err);
      }
      setIsLoading(false);
    };
    const delayDebounceFn = setTimeout(search, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [medicineSearch]);

  const handleSelectMedicine = (medicine: ApiMedicine) => {
    setSelectedMedicine(medicine);
    setMedicineSearch(medicine.brandName);
    setMedicineResults([]);
    setTimeout(() => batchSelectRef.current?.focus(), 0);
  };
  
  const addToCart = (e?: React.MouseEvent | React.FormEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!selectedMedicine || !selectedBatchId || !quantity) return;
    const batch = selectedMedicine.batches.find(b => b.batchId === selectedBatchId);
    if (!batch) return;
    const quantityNum = parseInt(quantity);
    if (quantityNum > batch.stockInUnits) {
      alert(`Error: Only ${batch.stockInUnits} units available.`);
      return;
    }
    const newItem: CartItem = {
      id: `${selectedMedicine.medicineId}-${batch.batchId}`,
      medicineId: selectedMedicine.medicineId, batchId: batch.batchId,
      name: selectedMedicine.brandName, batch: batch.batchNumber,
      quantity: quantityNum, price: batch.pricePerUnit,
      total: quantityNum * batch.pricePerUnit
    };
    const existingItemIndex = cartItems.findIndex(item => item.id === newItem.id);
    if (existingItemIndex > -1) {
      const updatedCart = [...cartItems];
      updatedCart[existingItemIndex].quantity += newItem.quantity;
      updatedCart[existingItemIndex].total += newItem.total;
      setCartItems(updatedCart);
    } else {
      setCartItems(prev => [...prev, newItem]);
    }
    setMedicineSearch(""); setSelectedMedicine(null); setSelectedBatchId(""); setQuantity("1");
    medicineSearchRef.current?.focus();
  };
  
  const generateInvoice = useCallback(async (e?: React.MouseEvent | React.FormEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (cartItems.length === 0 || (!selectedCustomer && !customerSearch)) {
      alert("Please add a customer and items to the cart.");
      return;
    }
    let customerIdToUse = selectedCustomer?.id;
    if (!customerIdToUse && customerSearch) {
      try {
        const response = await apiClient.post('/customers', { name: customerSearch, phone: phoneNumber, address });
        customerIdToUse = response.data.id;
      } catch (err) {
        alert('Failed to create new customer.'); return;
      }
    }
    const saleData = {
      customer_id: customerIdToUse,
      items: cartItems.map(item => ({ medicine_id: item.medicineId, quantity_in_units: item.quantity }))
    };
    try {
      const response = await apiClient.post('/sales', saleData);
      alert(`Invoice generated! Sale ID: ${response.data.id}`);
      setCustomerSearch(""); setSelectedCustomer(null); setPhoneNumber(""); setAddress("");
      setDoctorName(""); setPrescriptionNumber("");
      setCartItems([]);
      customerNameRef.current?.focus();
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.error || 'Failed to generate invoice'}`);
    }
  }, [cartItems, customerSearch, phoneNumber, address, selectedCustomer]);

  const handleMedicineSearchKeyDown = (e: React.KeyboardEvent) => {
    if (medicineResults.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev < medicineResults.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' && activeIndex > -1) {
        e.preventDefault();
        handleSelectMedicine(medicineResults[activeIndex]);
      }
    }
  };

  useEffect(() => {
    const handleAltEnter = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'Enter') {
        e.preventDefault();
        generateInvoice();
      }
    };
    window.addEventListener('keydown', handleAltEnter);
    return () => window.removeEventListener('keydown', handleAltEnter);
  }, [generateInvoice]);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const grandTotal = cartItems.reduce((sum, item) => sum + item.total, 0);

  const selectedBatch = selectedMedicine?.batches.find(b => b.batchId === selectedBatchId);
  const strips = selectedBatch && selectedBatch.unitsPerPack > 0 ? (parseInt(quantity) / selectedBatch.unitsPerPack) : 0;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="New Sale" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Customer Information */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    ref={customerNameRef}
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') phoneNumberRef.current?.focus(); }}
                    placeholder="Enter customer name *"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  />
                  {customerSearchResults.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-card border rounded-md shadow-lg">
                      {customerSearchResults.map(cust => (
                        <div key={cust.id} onClick={() => handleSelectCustomer(cust)} className="p-2 hover:bg-muted cursor-pointer">
                          {cust.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input ref={phoneNumberRef} type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') doctorNameRef.current?.focus(); }} placeholder="Enter phone number" className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" />
                <input ref={doctorNameRef} type="text" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') prescriptionNumberRef.current?.focus(); }} placeholder="Enter doctor name" className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" />
                <input ref={prescriptionNumberRef} type="text" value={prescriptionNumber} onChange={(e) => setPrescriptionNumber(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addressRef.current?.focus(); }} placeholder="Enter prescription number" className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" />
                <textarea ref={addressRef} value={address} onChange={(e) => setAddress(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); medicineSearchRef.current?.focus(); } }} placeholder="Enter customer address" rows={1} className="md:col-span-2 w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none" />
              </div>
            </div>

            {/* Add Medicine to Cart */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="text-lg font-semibold mb-4">Add Medicine to Cart</h2>
              <form onSubmit={(e) => { e.preventDefault(); addToCart(e); }}>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="relative md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Medicine Name <span className="text-destructive">*</span></label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input ref={medicineSearchRef} type="text" value={medicineSearch} onChange={(e) => setMedicineSearch(e.target.value)} onKeyDown={handleMedicineSearchKeyDown} placeholder="Search by generic drug name..." className="w-full h-10 pl-10 pr-3 rounded-md border border-input bg-background text-sm" />
                    {isLoading && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />}
                  </div>
                  {medicineResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {medicineResults.map((med, index) => (
                        <div key={med.medicineId} onClick={() => handleSelectMedicine(med)} className={`p-3 cursor-pointer ${activeIndex === index ? 'bg-muted' : 'hover:bg-muted'}`}>
                          <p className="font-semibold">{med.brandName}</p>
                          <p className="text-xs text-muted-foreground">{med.composition}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Batch Number <span className="text-destructive">*</span></label>
                  <select ref={batchSelectRef} value={selectedBatchId} onChange={(e) => setSelectedBatchId(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') quantityRef.current?.focus(); }} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" disabled={!selectedMedicine}>
                    <option value="">Select batch</option>
                    {selectedMedicine?.batches.map(batch => (
                      <option key={batch.batchId} value={batch.batchId}>{batch.batchNumber} (Stock: {batch.stockInUnits})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Quantity <span className="text-destructive">*</span></label>
                  <input 
                    ref={quantityRef} 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => setQuantity(e.target.value)} 
                    onKeyDown={(e) => { 
                      if (e.key === 'Enter') { 
                        e.preventDefault(); 
                        addToCart();
                      } 
                    }} 
                    min="1" 
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" 
                  />
                  {strips > 0 && <p className="text-xs text-muted-foreground mt-1">{strips.toFixed(1)} strips</p>}
                </div>
                <div className="md:col-start-5">
                  <button 
                    type="submit"
                    className="w-full h-10 bg-primary text-primary-foreground rounded-md flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!selectedMedicine || !selectedBatchId || !quantity}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add to Cart
                  </button>
                </div>
              </div>
              </form>
            </div>

            {/* Sales Summary */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="text-lg font-semibold mb-4">Sales Summary</h2>
              {cartItems.length > 0 ? (
                <div className="mb-4 space-y-2 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Batch: {item.batch} | Qty: {item.quantity} | Price: ₹{item.price.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{item.total.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (<p className="text-muted-foreground text-center py-8">Cart is empty</p>)}
              <div className="flex justify-between items-center mb-4 border-t pt-4 mt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Items:</p>
                  <p className="text-2xl font-bold">{totalItems}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Grand Total:</p>
                  <p className="text-2xl font-bold">₹{grandTotal.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={(e) => { e?.preventDefault(); e?.stopPropagation(); setCartItems([]); }} 
                  className="flex-1 h-10 border border-input rounded-md hover:bg-muted"
                >
                  Clear All
                </button>
                <button 
                  type="button" 
                  onClick={generateInvoice} 
                  className="flex-1 h-10 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={cartItems.length === 0 || (!selectedCustomer && !customerSearch)}
                >
                  Generate Invoice
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}