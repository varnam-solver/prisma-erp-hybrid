import React, { useState, useEffect, useRef } from "react"
import { Plus, Minus, Save, Search, Loader2 } from "lucide-react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

export default function NewPurchasePage() {
    const [allSuppliers, setAllSuppliers] = useState<ApiSupplier[]>([]);
    const [supplierSearch, setSupplierSearch] = useState("");
    const [supplierResults, setSupplierResults] = useState<ApiSupplier[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<ApiSupplier | null>(null);
    
    const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
    
    const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([
        { id: Date.now().toString(), medicineId: "", medicineName: "", batchNumber: "", expiryDate: "", quantityInPacks: 1, packPurchasePrice: 0, packMrp: 0, total: 0 }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [medicineResults, setMedicineResults] = useState<ApiMedicine[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeSearchRow, setActiveSearchRow] = useState<string | null>(null);
    
    // New states for keyboard navigation
    const [selectedMedicineIndex, setSelectedMedicineIndex] = useState<number>(-1);

    // Refs for focus management
    const itemRefs = useRef<Record<string, { [key: string]: HTMLInputElement | null }>>({});

    // Fetch all suppliers on component mount
    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await apiClient.get('/suppliers');
                setAllSuppliers(response.data);
            } catch (error) {
                console.error("Failed to fetch suppliers", error);
            }
        };
        fetchSuppliers();
    }, []);

    // Filter suppliers based on search
    useEffect(() => {
        if (supplierSearch.trim() === '') {
            setSupplierResults([]);
            return;
        }
        const filtered = allSuppliers.filter(s => 
            s.name.toLowerCase().includes(supplierSearch.toLowerCase())
        );
        setSupplierResults(filtered);
    }, [supplierSearch, allSuppliers]);

    // Medicine search effect
    useEffect(() => {
        if (!activeSearchRow || searchTerm.trim().length < 2) {
            setMedicineResults([]);
            setSelectedMedicineIndex(-1);
            return;
        }
        const searchMedicines = async () => {
            setIsLoading(true);
            try {
                const response = await apiClient.get(`/medicines/search?q=${searchTerm}`);
                const purchaseMedicineResults = response.data.map((med: any) => ({
                    medicineId: med.medicineId,
                    brandName: med.brandName,
                }));
                setMedicineResults(purchaseMedicineResults);
                setSelectedMedicineIndex(-1); // Reset selection when new results come
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
        setTimeout(() => {
            const newRowRefs = itemRefs.current[newItem.id];
            if (newRowRefs && newRowRefs.medicineName) {
                newRowRefs.medicineName.focus();
            }
        }, 0);
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
        setSelectedMedicineIndex(-1);
        itemRefs.current[itemId]?.batchNumber?.focus();
    };
    
    const handleSupplierSelect = (supplier: ApiSupplier) => {
        setSelectedSupplier(supplier);
        setSupplierSearch(supplier.name);
        setSupplierResults([]);
    };

    const handleMedicineKeyDown = (e: React.KeyboardEvent, itemId: string) => {
        if (medicineResults.length > 0 && activeSearchRow === itemId) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedMedicineIndex(prev => 
                    prev < medicineResults.length - 1 ? prev + 1 : 0
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedMedicineIndex(prev => 
                    prev > 0 ? prev - 1 : medicineResults.length - 1
                );
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
            handleKeyDown(e, itemId, 'medicineName');
        }
    };

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

    const grandTotal = purchaseItems.reduce((sum, item) => sum + item.total, 0);

    const handleSubmit = async () => {
        // --- THIS IS THE CORRECTED LOGIC ---
        // 1. Validate items first, as it's a common error.
        if (purchaseItems.some(item => !item.medicineId || item.quantityInPacks <= 0 || !item.batchNumber || !item.expiryDate)) {
            alert("Please fill in all required item fields (Medicine, Batch No, Expiry, Packs).");
            return;
        }
    
        let supplierIdToUse = selectedSupplier?.id;
    
        // 2. If no supplier was selected from the list, check if a new one was typed.
        if (!supplierIdToUse) {
            if (supplierSearch.trim() === '') {
                alert("Please select or enter a supplier name.");
                return; // Exit if no supplier is selected or typed.
            }
            // This is a new supplier, so we create it first.
            try {
                const response = await apiClient.post('/suppliers', { name: supplierSearch });
                supplierIdToUse = response.data.id; // Get the new ID from the response.
            } catch (err) {
                alert('Failed to create new supplier. Please try again.');
                return; // Exit if creation fails.
            }
        }
    
        // 3. Now we are guaranteed to have a valid supplierIdToUse.
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
            // Reset the form for the next purchase
            setSelectedSupplier(null);
            setSupplierSearch("");
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
                        <div className="space-y-6">
                            <Card>
                                <CardHeader><CardTitle>Purchase Order Details</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <label className="text-sm font-medium mb-2 block">Supplier *</label>
                                        <Input
                                            placeholder="Search or enter new supplier..."
                                            value={supplierSearch}
                                            onChange={(e) => {
                                                setSupplierSearch(e.target.value);
                                                setSelectedSupplier(null);
                                            }}
                                        />
                                        {supplierResults.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                                {supplierResults.map(s => (
                                                    <div key={s.id} onClick={() => handleSupplierSelect(s)} className="p-2 cursor-pointer hover:bg-muted">
                                                        {s.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
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
                                                </div>
                                                <div className="col-span-2"><Input ref={el => { if (!itemRefs.current[item.id]) itemRefs.current[item.id] = {}; itemRefs.current[item.id].batchNumber = el; }} placeholder="Batch No." value={item.batchNumber} onChange={(e) => updateItem(item.id, 'batchNumber', e.target.value)} onKeyDown={(e) => handleKeyDown(e, item.id, 'batchNumber')} required /></div>
                                                <div className="col-span-2"><Input ref={el => { if (!itemRefs.current[item.id]) itemRefs.current[item.id] = {}; itemRefs.current[item.id].expiryDate = el; }} type="date" value={item.expiryDate} onChange={(e) => updateItem(item.id, 'expiryDate', e.target.value)} onKeyDown={(e) => handleKeyDown(e, item.id, 'expiryDate')} required /></div>
                                                <div className="col-span-1"><Input ref={el => { if (!itemRefs.current[item.id]) itemRefs.current[item.id] = {}; itemRefs.current[item.id].quantityInPacks = el; }} type="number" min="1" value={item.quantityInPacks} onChange={(e) => updateItem(item.id, 'quantityInPacks', parseInt(e.target.value) || 0)} onKeyDown={(e) => handleKeyDown(e, item.id, 'quantityInPacks')} required /></div>
                                                <div className="col-span-1"><Input ref={el => { if (!itemRefs.current[item.id]) itemRefs.current[item.id] = {}; itemRefs.current[item.id].packPurchasePrice = el; }} type="number" step="0.01" min="0" value={item.packPurchasePrice} onChange={(e) => updateItem(item.id, 'packPurchasePrice', parseFloat(e.target.value) || 0)} onKeyDown={(e) => handleKeyDown(e, item.id, 'packPurchasePrice')} required /></div>
                                                <div className="col-span-1"><Input ref={el => { if (!itemRefs.current[item.id]) itemRefs.current[item.id] = {}; itemRefs.current[item.id].packMrp = el; }} type="number" step="0.01" min="0" value={item.packMrp} onChange={(e) => updateItem(item.id, 'packMrp', parseFloat(e.target.value) || 0)} onKeyDown={(e) => handleKeyDown(e, item.id, 'packMrp')} required /></div>
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
                                <Button type="button" onClick={handleSubmit} size="lg" className="gap-2"><Save className="h-4 w-4" /> Create Purchase Order</Button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
