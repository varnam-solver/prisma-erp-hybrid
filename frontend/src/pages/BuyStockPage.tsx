import React, { useState, useRef, useEffect } from "react";
import { Search, Plus, Loader2, Save, Minus } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import apiClient from "@/api/axiosConfig";

// --- Modal for adding new medicine ---
function AddMedicineModal({ open, onClose, onCreated, initialName }: {
  open: boolean;
  onClose: () => void;
  onCreated: (medicine: any) => void;
  initialName: string;
}) {
  const [form, setForm] = useState({
    name: initialName,
    manufacturer: "",
    form: "",
    gst_rate: "5",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(f => ({ ...f, name: initialName }));
  }, [initialName, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await apiClient.post("/medicines", {
        name: form.name,
        manufacturer: form.manufacturer,
        form: form.form,
        gst_rate: Number(form.gst_rate),
      });
      onCreated(resp.data);
      onClose();
    } catch (err) {
      alert("Failed to create medicine.");
    }
    setLoading(false);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-4">
        <h2 className="text-lg font-semibold">Add New Medicine</h2>
        <Input name="name" value={form.name} onChange={handleChange} placeholder="Brand Name *" required autoFocus />
        <Input name="manufacturer" value={form.manufacturer} onChange={handleChange} placeholder="Manufacturer" />
        <Input name="form" value={form.form} onChange={handleChange} placeholder="Form (e.g. Tablet, Syrup)" />
        <Input name="gst_rate" value={form.gst_rate} onChange={handleChange} placeholder="GST Rate (%)" type="number" min="0" step="0.01" />
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Add"}</Button>
        </div>
      </form>
    </div>
  );
}

// --- Types ---
interface ApiSupplier {
  id: string;
  name: string;
}
interface ApiMedicine {
  medicineId: string;
  brandName: string;
  manufacturer?: string;
  form?: string;
  gstRate?: number;
}
interface PurchaseItem {
  id: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  expiryDate: string;
  quantityInPacks: number;
  packPurchasePrice: number;
  packMrp: number;
  total: number;
}

export default function BuyStockPage() {
  // Supplier
  const [supplierSearch, setSupplierSearch] = useState("");
  const [supplierResults, setSupplierResults] = useState<ApiSupplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<ApiSupplier | null>(null);

  // Purchase Items
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([
    { id: Date.now().toString(), medicineId: "", medicineName: "", batchNumber: "", expiryDate: "", quantityInPacks: 1, packPurchasePrice: 0, packMrp: 0, total: 0 }
  ]);
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);

  // Medicine search
  const [searchTerm, setSearchTerm] = useState('');
  const [medicineResults, setMedicineResults] = useState<ApiMedicine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSearchRow, setActiveSearchRow] = useState<string | null>(null);
  const [selectedMedicineIndex, setSelectedMedicineIndex] = useState<number>(-1);

  // Modal for new medicine
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [pendingMedicineRow, setPendingMedicineRow] = useState<string | null>(null);

  // Refs for keyboard navigation
  const itemRefs = useRef<Record<string, { [key: string]: HTMLInputElement | null }>>({});

  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const resp = await apiClient.get("/suppliers");
        setSupplierResults(resp.data);
      } catch {}
    };
    fetchSuppliers();
  }, []);

  // Filter suppliers
  useEffect(() => {
    if (supplierSearch.trim() === "") {
      setSupplierResults([]);
      return;
    }
    const fetchSuppliers = async () => {
      try {
        const resp = await apiClient.get("/suppliers");
        const filtered = resp.data.filter((s: ApiSupplier) =>
          s.name.toLowerCase().includes(supplierSearch.toLowerCase())
        );
        setSupplierResults(filtered);
      } catch {}
    };
    const timer = setTimeout(fetchSuppliers, 200);
    return () => clearTimeout(timer);
  }, [supplierSearch]);

  // Medicine search
  useEffect(() => {
    if (!activeSearchRow || searchTerm.trim().length < 2) {
      setMedicineResults([]);
      setSelectedMedicineIndex(-1);
      return;
    }
    const searchMedicines = async () => {
      setIsLoading(true);
      try {
        const resp = await apiClient.get(`/medicines/search?q=${searchTerm}`);
        setMedicineResults(resp.data.map((med: any) => ({
          medicineId: med.medicineId,
          brandName: med.brandName,
        })));
        setSelectedMedicineIndex(-1);
      } catch {}
      setIsLoading(false);
    };
    const timer = setTimeout(searchMedicines, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, activeSearchRow]);

  // Add new item row
  const addNewItem = () => {
    const newItem: PurchaseItem = {
      id: Date.now().toString(), medicineId: "", medicineName: "", batchNumber: "", expiryDate: "", quantityInPacks: 1, packPurchasePrice: 0, packMrp: 0, total: 0
    };
    setPurchaseItems([...purchaseItems, newItem]);
    setTimeout(() => {
      const newRowRefs = itemRefs.current[newItem.id];
      if (newRowRefs && newRowRefs.medicineName) {
        newRowRefs.medicineName.focus();
      }
    }, 0);
  };

  // Remove item row
  const removeItem = (id: string) => {
    if (purchaseItems.length > 1) {
      setPurchaseItems(purchaseItems.filter(item => item.id !== id));
    }
  };

  // Update item field
  const updateItem = (id: string, field: keyof PurchaseItem, value: string | number) => {
    setPurchaseItems(items =>
      items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantityInPacks' || field === 'packPurchasePrice') {
            updatedItem.total = (Number(updatedItem.quantityInPacks) || 0) * (Number(updatedItem.packPurchasePrice) || 0);
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  // Select medicine from search
  const handleMedicineSelect = (itemId: string, medicine: ApiMedicine) => {
    updateItem(itemId, 'medicineId', medicine.medicineId);
    updateItem(itemId, 'medicineName', medicine.brandName);
    setMedicineResults([]);
    setActiveSearchRow(null);
    setSelectedMedicineIndex(-1);
    itemRefs.current[itemId]?.batchNumber?.focus();
  };

  // Keyboard navigation for medicine search
  const handleMedicineKeyDown = (e: React.KeyboardEvent, itemId: string) => {
    if (medicineResults.length > 0 && activeSearchRow === itemId) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMedicineIndex(prev => prev < medicineResults.length - 1 ? prev + 1 : 0);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMedicineIndex(prev => prev > 0 ? prev - 1 : medicineResults.length - 1);
      } else if (e.key === 'Enter' && selectedMedicineIndex >= 0) {
        e.preventDefault();
        handleMedicineSelect(itemId, medicineResults[selectedMedicineIndex]);
        return;
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setMedicineResults([]);
        setActiveSearchRow(null);
        setSelectedMedicineIndex(-1);
        return;
      }
    }
    if (e.key === 'Enter' && (medicineResults.length === 0 || selectedMedicineIndex < 0)) {
      if (searchTerm.trim().length > 1) {
        setShowAddMedicine(true);
        setPendingMedicineRow(itemId);
      } else {
        handleKeyDown(e, itemId, 'medicineName');
      }
    }
  };

  // Keyboard navigation for fields
  const handleKeyDown = (e: React.KeyboardEvent, itemId: string, currentField: keyof PurchaseItem) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const fields: (keyof PurchaseItem)[] = ['medicineName', 'batchNumber', 'expiryDate', 'quantityInPacks', 'packPurchasePrice', 'packMrp'];
      const currentIndex = fields.indexOf(currentField);
      if (currentIndex < fields.length - 1) {
        const nextField = fields[currentIndex + 1];
        itemRefs.current[itemId]?.[nextField]?.focus();
      } else {
        addNewItem();
      }
    }
  };

  // Handle new medicine creation
  const handleMedicineCreated = (medicine: any) => {
    if (pendingMedicineRow) {
      updateItem(pendingMedicineRow, "medicineId", medicine.id);
      updateItem(pendingMedicineRow, "medicineName", medicine.name);
      setShowAddMedicine(false);
      setPendingMedicineRow(null);
      setTimeout(() => itemRefs.current[pendingMedicineRow!]?.batchNumber?.focus(), 0);
    }
  };

  // Supplier select
  const handleSupplierSelect = (supplier: ApiSupplier) => {
    setSelectedSupplier(supplier);
    setSupplierSearch(supplier.name);
    setSupplierResults([]);
  };

  // Grand total
  const grandTotal = purchaseItems.reduce((sum, item) => sum + item.total, 0);

  // Submit handler
  const handleSubmit = async () => {
    if (purchaseItems.some(item => !item.medicineId || item.quantityInPacks <= 0 || !item.batchNumber || !item.expiryDate)) {
      alert("Please fill in all required item fields (Medicine, Batch No, Expiry, Packs).");
      return;
    }
    let supplierIdToUse = selectedSupplier?.id;
    if (!supplierIdToUse) {
      if (supplierSearch.trim() === '') {
        alert("Please select or enter a supplier name.");
        return;
      }
      try {
        const response = await apiClient.post('/suppliers', { name: supplierSearch });
        supplierIdToUse = response.data.id;
      } catch {
        alert('Failed to create new supplier. Please try again.');
        return;
      }
    }
    const purchaseData = {
      supplier_id: supplierIdToUse,
      items: purchaseItems.map(item => ({
        medicine_id: item.medicineId,
        batch_number: item.batchNumber,
        expiry_date: item.expiryDate,
        quantity_in_packs: Number(item.quantityInPacks),
        pack_purchase_price: Number(item.packPurchasePrice),
        pack_mrp: Number(item.packMrp),
      })),
    };
    try {
      await apiClient.post('/purchases', purchaseData);
      alert("Purchase order created successfully!");
      setSelectedSupplier(null);
      setSupplierSearch("");
      setPurchaseItems([{ id: Date.now().toString(), medicineId: "", medicineName: "", batchNumber: "", expiryDate: "", quantityInPacks: 1, packPurchasePrice: 0, packMrp: 0, total: 0 }]);
    } catch {
      alert("Failed to create purchase order.");
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Buy Stock - New Purchase" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Supplier Information */}
            <Card>
              <CardHeader>
                <CardTitle>Supplier Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Input
                      type="text"
                      value={supplierSearch}
                      onChange={(e) => {
                        setSupplierSearch(e.target.value);
                        setSelectedSupplier(null);
                      }}
                      placeholder="Enter supplier name *"
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    />
                    {supplierResults.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-card border rounded-md shadow-lg">
                        {supplierResults.map(sup => (
                          <div key={sup.id} onClick={() => handleSupplierSelect(sup)} className="p-2 hover:bg-muted cursor-pointer">
                            {sup.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <Input type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)} required />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Purchase Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Purchase Items</span>
                  <Button type="button" variant="outline" size="sm" onClick={addNewItem} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Item
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-2 pb-2 border-b text-sm font-medium text-muted-foreground">
                    <div className="col-span-3">Medicine Name *</div>
                    <div className="col-span-2">Batch No. *</div>
                    <div className="col-span-2">Expiry *</div>
                    <div className="col-span-1">Packs *</div>
                    <div className="col-span-1">Price/Pack *</div>
                    <div className="col-span-1">MRP/Pack *</div>
                    <div className="col-span-1">Total</div>
                    <div className="col-span-1"></div>
                  </div>
                  {purchaseItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-3 relative">
                        <Input
                          ref={el => {
                            if (!itemRefs.current[item.id]) itemRefs.current[item.id] = {};
                            itemRefs.current[item.id].medicineName = el;
                          }}
                          placeholder="Search medicine..."
                          value={activeSearchRow === item.id ? searchTerm : item.medicineName}
                          onFocus={() => {
                            setActiveSearchRow(item.id);
                            setSearchTerm(item.medicineName);
                            setSelectedMedicineIndex(-1);
                          }}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyDown={(e) => handleMedicineKeyDown(e, item.id)}
                          onBlur={() => {
                            setTimeout(() => {
                              if (activeSearchRow === item.id) {
                                setMedicineResults([]);
                                setActiveSearchRow(null);
                                setSelectedMedicineIndex(-1);
                              }
                            }, 150);
                          }}
                          required
                        />
                        {isLoading && activeSearchRow === item.id && <Loader2 className="absolute right-2 top-2 h-5 w-5 animate-spin" />}
                        {medicineResults.length > 0 && activeSearchRow === item.id && (
                          <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {medicineResults.map((med, index) => (
                              <div
                                key={med.medicineId}
                                onClick={() => handleMedicineSelect(item.id, med)}
                                className={`p-2 cursor-pointer ${
                                  index === selectedMedicineIndex
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted'
                                }`}
                              >
                                <p className="font-semibold">{med.brandName}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {/* Show add new medicine button if not found */}
                        {medicineResults.length === 0 && searchTerm.trim().length > 1 && activeSearchRow === item.id && (
                          <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg">
                            <Button
                              type="button"
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => {
                                setShowAddMedicine(true);
                                setPendingMedicineRow(item.id);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" /> Add new medicine: <span className="font-semibold ml-1">{searchTerm}</span>
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="col-span-2">
                        <Input
                          ref={el => { if (!itemRefs.current[item.id]) itemRefs.current[item.id] = {}; itemRefs.current[item.id].batchNumber = el; }}
                          placeholder="Batch No."
                          value={item.batchNumber}
                          onChange={(e) => updateItem(item.id, 'batchNumber', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, item.id, 'batchNumber')}
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          ref={el => { if (!itemRefs.current[item.id]) itemRefs.current[item.id] = {}; itemRefs.current[item.id].expiryDate = el; }}
                          type="date"
                          value={item.expiryDate}
                          onChange={(e) => updateItem(item.id, 'expiryDate', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, item.id, 'expiryDate')}
                          required
                        />
                      </div>
                      <div className="col-span-1">
                        <Input
                          ref={el => { if (!itemRefs.current[item.id]) itemRefs.current[item.id] = {}; itemRefs.current[item.id].quantityInPacks = el; }}
                          type="number"
                          min="1"
                          value={item.quantityInPacks}
                          onChange={(e) => updateItem(item.id, 'quantityInPacks', parseInt(e.target.value) || 0)}
                          onKeyDown={(e) => handleKeyDown(e, item.id, 'quantityInPacks')}
                          required
                        />
                      </div>
                      <div className="col-span-1">
                        <Input
                          ref={el => { if (!itemRefs.current[item.id]) itemRefs.current[item.id] = {}; itemRefs.current[item.id].packPurchasePrice = el; }}
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.packPurchasePrice}
                          onChange={(e) => updateItem(item.id, 'packPurchasePrice', parseFloat(e.target.value) || 0)}
                          onKeyDown={(e) => handleKeyDown(e, item.id, 'packPurchasePrice')}
                          required
                        />
                      </div>
                      <div className="col-span-1">
                        <Input
                          ref={el => { if (!itemRefs.current[item.id]) itemRefs.current[item.id] = {}; itemRefs.current[item.id].packMrp = el; }}
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.packMrp}
                          onChange={(e) => updateItem(item.id, 'packMrp', parseFloat(e.target.value) || 0)}
                          onKeyDown={(e) => handleKeyDown(e, item.id, 'packMrp')}
                          required
                        />
                      </div>
                      <div className="col-span-1 flex items-center h-10 px-3 bg-muted/50 rounded-md font-medium text-sm">₹{item.total.toFixed(2)}</div>
                      <div className="col-span-1">
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(item.id)} disabled={purchaseItems.length === 1} className="h-8 w-8 p-0 text-destructive">
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 mt-6">
                  <div className="flex justify-end">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground mb-1">Grand Total</div>
                      <div className="text-2xl font-bold text-primary">₹{grandTotal.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" size="lg" onClick={() => window.history.back()}>Cancel</Button>
              <AnimatedButton type="button" onClick={handleSubmit} size="lg" className="gap-2">
                <Save className="h-4 w-4" /> Create Purchase Order
              </AnimatedButton>
            </div>
          </div>
        </main>
      </div>
      <AddMedicineModal
        open={showAddMedicine}
        onClose={() => { setShowAddMedicine(false); setPendingMedicineRow(null); }}
        onCreated={handleMedicineCreated}
        initialName={searchTerm}
      />
    </div>
  );
}
