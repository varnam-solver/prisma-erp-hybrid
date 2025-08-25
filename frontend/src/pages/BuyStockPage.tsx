import React, { useState, useEffect } from "react"
import { Plus, Minus, Save, Search, Loader2 } from "lucide-react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import apiClient from "@/api/axiosConfig"

// --- Interface Definitions ---
interface ApiSupplier {
    id: string;
    name: string;
}

interface ApiMedicine {
    medicineId: string;
    brandName: string;
}

interface PurchaseItem {
    id: string; // Unique ID for React key
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
    const [suppliers, setSuppliers] = useState<ApiSupplier[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState("");
    const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
    
    const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([
        { id: Date.now().toString(), medicineId: "", medicineName: "", batchNumber: "", expiryDate: "", quantityInPacks: 1, packPurchasePrice: 0, packMrp: 0, total: 0 }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [medicineResults, setMedicineResults] = useState<ApiMedicine[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeSearchRow, setActiveSearchRow] = useState<string | null>(null);

    // Fetch suppliers on component mount
    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await apiClient.get('/suppliers');
                setSuppliers(response.data);
            } catch (error) {
                console.error("Failed to fetch suppliers", error);
            }
        };
        fetchSuppliers();
    }, []);

    // Medicine search effect
    useEffect(() => {
        if (!activeSearchRow || searchTerm.trim().length < 2) {
            setMedicineResults([]);
            return;
        }
        const searchMedicines = async () => {
            setIsLoading(true);
            try {
                // Using the same search endpoint from the sales page
                const response = await apiClient.get(`/medicines/search?q=${searchTerm}`);
                // We might need to adapt the search result if it's different for purchases
                const purchaseMedicineResults = response.data.map((med: any) => ({
                    medicineId: med.medicineId,
                    brandName: med.brandName,
                }));
                setMedicineResults(purchaseMedicineResults);
            } catch (error) {
                console.error("Failed to search medicines", error);
            }
            setIsLoading(false);
        };
        const debounceTimer = setTimeout(searchMedicines, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm, activeSearchRow]);


    const addNewItem = () => {
        const newItem: PurchaseItem = {
            id: Date.now().toString(), medicineId: "", medicineName: "", batchNumber: "", expiryDate: "", quantityInPacks: 1, packPurchasePrice: 0, packMrp: 0, total: 0
        };
        setPurchaseItems([...purchaseItems, newItem]);
    };

    const removeItem = (id: string) => {
        if (purchaseItems.length > 1) {
            setPurchaseItems(purchaseItems.filter(item => item.id !== id));
        }
    };

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
    
    const handleMedicineSelect = (itemId: string, medicine: ApiMedicine) => {
        updateItem(itemId, 'medicineId', medicine.medicineId);
        updateItem(itemId, 'medicineName', medicine.brandName);
        setMedicineResults([]);
        setActiveSearchRow(null);
    };

    const grandTotal = purchaseItems.reduce((sum, item) => sum + item.total, 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedSupplier || purchaseItems.some(item => !item.medicineId || item.quantityInPacks <= 0 || !item.batchNumber || !item.expiryDate)) {
            alert("Please select a supplier and fill in all required item fields (Medicine, Batch No, Expiry, Packs).");
            return;
        }

        const purchaseData = {
            supplier_id: selectedSupplier,
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
            // Reset form
            setSelectedSupplier("");
            setPurchaseItems([{ id: Date.now().toString(), medicineId: "", medicineName: "", batchNumber: "", expiryDate: "", quantityInPacks: 1, packPurchasePrice: 0, packMrp: 0, total: 0 }]);
        } catch (error) {
            console.error("Failed to create purchase order", error);
            alert("Failed to create purchase order.");
        }
    };

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Buy Stock - New Purchase Order" />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Card>
                                <CardHeader><CardTitle>Purchase Order Details</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Supplier *</label>
                                        <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                                            <SelectTrigger><SelectValue placeholder="Select a supplier" /></SelectTrigger>
                                            <SelectContent>
                                                {suppliers.map(supplier => (
                                                    <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Order Date</label>
                                        <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} required />
                                    </div>
                                </CardContent>
                            </Card>

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
                                                        placeholder="Search medicine..."
                                                        value={activeSearchRow === item.id ? searchTerm : item.medicineName}
                                                        onFocus={() => {
                                                            setActiveSearchRow(item.id);
                                                            setSearchTerm(item.medicineName);
                                                        }}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        required
                                                    />
                                                     {isLoading && activeSearchRow === item.id && <Loader2 className="absolute right-2 top-2 h-5 w-5 animate-spin" />}
                                                     {medicineResults.length > 0 && activeSearchRow === item.id && (
                                                        <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                                            {medicineResults.map((med) => (
                                                                <div key={med.medicineId} onClick={() => handleMedicineSelect(item.id, med)} className="p-2 cursor-pointer hover:bg-muted">
                                                                    <p className="font-semibold">{med.brandName}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="col-span-2"><Input placeholder="Batch No." value={item.batchNumber} onChange={(e) => updateItem(item.id, 'batchNumber', e.target.value)} required /></div>
                                                <div className="col-span-2"><Input type="date" value={item.expiryDate} onChange={(e) => updateItem(item.id, 'expiryDate', e.target.value)} required /></div>
                                                <div className="col-span-1"><Input type="number" min="1" value={item.quantityInPacks} onChange={(e) => updateItem(item.id, 'quantityInPacks', parseInt(e.target.value) || 0)} required /></div>
                                                <div className="col-span-1"><Input type="number" step="0.01" min="0" value={item.packPurchasePrice} onChange={(e) => updateItem(item.id, 'packPurchasePrice', parseFloat(e.target.value) || 0)} required /></div>
                                                <div className="col-span-1"><Input type="number" step="0.01" min="0" value={item.packMrp} onChange={(e) => updateItem(item.id, 'packMrp', parseFloat(e.target.value) || 0)} required /></div>
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
                                <Button type="submit" size="lg" className="gap-2"><Save className="h-4 w-4" /> Create Purchase Order</Button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    )
}
