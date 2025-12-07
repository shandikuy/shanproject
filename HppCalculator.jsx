import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Calculator, Save, FolderOpen, 
  RotateCcw, DollarSign, Package, Zap, PieChart, 
  ArrowRight, CheckCircle, TrendingUp 
} from 'lucide-react';

const HppCalculatorPro = () => {
  // --- STATE MANAGEMENT ---

  const [recipeName, setRecipeName] = useState('Resep Baru');
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState([]);

  // 1. Bahan Baku
  const [materials, setMaterials] = useState([
    { id: 1, name: '', price: 0, unit: 'gram', content: 1000, usage: 0, cost: 0 }
  ]);

  // 2. Biaya Operasional
  const [operations, setOperations] = useState([
    { id: 1, type: '', price: 0, unit: 'jam', content: 1, usage: 0, cost: 0 }
  ]);

  // 3. Data Produksi
  const [production, setProduction] = useState({
    yield: 0, 
    margin: 30 
  });

  // 4. Target Harga (Untuk Reverse calc)
  const [marketPrice, setMarketPrice] = useState(0);

  // --- INITIAL LOAD ---
  useEffect(() => {
    const saved = localStorage.getItem('hpp_recipes');
    if (saved) {
      setSavedRecipes(JSON.parse(saved));
    }
  }, []);

  // --- CALCULATIONS ---

  const formatIDR = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  };

  const calculateRowCost = (price, content, usage) => {
    if (!content || content === 0) return 0;
    return (price / content) * usage;
  };

  const updateMaterial = (id, field, value) => {
    const newMaterials = materials.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        updatedItem.cost = calculateRowCost(updatedItem.price, updatedItem.content, updatedItem.usage);
        return updatedItem;
      }
      return item;
    });
    setMaterials(newMaterials);
  };

  const updateOperation = (id, field, value) => {
    const newOperations = operations.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        updatedItem.cost = calculateRowCost(updatedItem.price, updatedItem.content, updatedItem.usage);
        return updatedItem;
      }
      return item;
    });
    setOperations(newOperations);
  };

  // Row Management
  const addMaterialRow = () => setMaterials([...materials, { id: Date.now(), name: '', price: 0, unit: 'gram', content: 1000, usage: 0, cost: 0 }]);
  const removeMaterialRow = (id) => materials.length > 1 && setMaterials(materials.filter(item => item.id !== id));
  
  const addOperationRow = () => setOperations([...operations, { id: Date.now(), type: '', price: 0, unit: 'jam', content: 1, usage: 0, cost: 0 }]);
  const removeOperationRow = (id) => operations.length > 1 && setOperations(operations.filter(item => item.id !== id));

  // --- TOTALS & LOGIC ---
  const totalMaterialCost = materials.reduce((acc, curr) => acc + curr.cost, 0);
  const totalOpCost = operations.reduce((acc, curr) => acc + curr.cost, 0);
  const totalProductionCost = totalMaterialCost + totalOpCost;
  
  const hppPerUnit = production.yield > 0 ? totalProductionCost / production.yield : 0;
  const profitAmount = hppPerUnit * (production.margin / 100);
  const sellingPriceRaw = hppPerUnit + profitAmount;

  // Smart Rounding (Bulatkan ke atas ke kelipatan 500 terdekat jika diatas 1000, atau 100 jika dibawah)
  const roundUpPrice = (price) => {
    if (price < 1000) return Math.ceil(price / 100) * 100;
    return Math.ceil(price / 500) * 500;
  };
  const smartPrice = roundUpPrice(sellingPriceRaw);

  // Reverse Calculation (Real Margin based on Market Price)
  const realMargin = marketPrice > 0 && hppPerUnit > 0 
    ? ((marketPrice - hppPerUnit) / hppPerUnit) * 100 
    : 0;

  // --- STORAGE HANDLERS ---
  const saveRecipe = () => {
    if (!recipeName) return alert("Beri nama resep dulu!");
    const newRecipe = {
      id: Date.now(),
      name: recipeName,
      materials,
      operations,
      production
    };
    
    const updatedRecipes = [...savedRecipes, newRecipe];
    setSavedRecipes(updatedRecipes);
    localStorage.setItem('hpp_recipes', JSON.stringify(updatedRecipes));
    alert('Resep berhasil disimpan!');
  };

  const loadRecipe = (recipe) => {
    setRecipeName(recipe.name);
    setMaterials(recipe.materials);
    setOperations(recipe.operations);
    setProduction(recipe.production);
    setShowLoadModal(false);
  };

  const deleteRecipe = (id) => {
    const updated = savedRecipes.filter(r => r.id !== id);
    setSavedRecipes(updated);
    localStorage.setItem('hpp_recipes', JSON.stringify(updated));
  };

  const resetForm = () => {
    if(window.confirm("Reset semua data?")) {
      setRecipeName('Resep Baru');
      setMaterials([{ id: 1, name: '', price: 0, unit: 'gram', content: 1000, usage: 0, cost: 0 }]);
      setOperations([{ id: 1, type: '', price: 0, unit: 'jam', content: 1, usage: 0, cost: 0 }]);
      setProduction({ yield: 0, margin: 30 });
      setMarketPrice(0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 pb-20">
      
      {/* HEADER */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 shadow-lg sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-lg">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">HPP Master Pro</h1>
              <p className="text-xs text-blue-200">Sahabat UMKM</p>
            </div>
          </div>
          
          <div className="flex items-center bg-white/10 rounded-full p-1 pl-4 w-full md:w-auto">
            <input 
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              className="bg-transparent border-none outline-none text-white placeholder-blue-200 text-sm w-full md:w-48"
              placeholder="Nama Resep..."
            />
            <div className="flex gap-1 ml-2">
              <button onClick={() => setShowLoadModal(true)} className="p-2 hover:bg-white/20 rounded-full transition" title="Buka Resep">
                <FolderOpen className="w-4 h-4" />
              </button>
              <button onClick={saveRecipe} className="p-2 hover:bg-white/20 rounded-full transition" title="Simpan Resep">
                <Save className="w-4 h-4" />
              </button>
              <button onClick={resetForm} className="p-2 hover:bg-white/20 rounded-full transition" title="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* LOAD MODAL */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold">Resep Tersimpan</h3>
              <button onClick={() => setShowLoadModal(false)} className="text-slate-400 hover:text-red-500">Tutup</button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
              {savedRecipes.length === 0 ? (
                <p className="text-center text-slate-500 py-4">Belum ada resep tersimpan.</p>
              ) : (
                savedRecipes.map(recipe => (
                  <div key={recipe.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-blue-50 transition cursor-pointer group">
                    <div onClick={() => loadRecipe(recipe)} className="flex-1">
                      <p className="font-bold text-slate-700">{recipe.name}</p>
                      <p className="text-xs text-slate-500">{new Date(recipe.id).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => deleteRecipe(recipe.id)} className="p-2 text-slate-300 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto p-4 space-y-6 mt-4">

        {/* VISUAL SUMMARY (CHART LIKE) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                   <PieChart className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Komposisi Biaya</span>
                </div>
                <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${totalProductionCost === 0 ? 0 : (totalMaterialCost/totalProductionCost)*100}%` }}></div>
                    <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${totalProductionCost === 0 ? 0 : (totalOpCost/totalProductionCost)*100}%` }}></div>
                </div>
                <div className="flex justify-between text-xs mt-2 font-medium">
                    <span className="text-blue-600 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Bahan ({totalProductionCost > 0 ? Math.round((totalMaterialCost/totalProductionCost)*100) : 0}%)</span>
                    <span className="text-amber-600 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Ops ({totalProductionCost > 0 ? Math.round((totalOpCost/totalProductionCost)*100) : 0}%)</span>
                </div>
            </div>

            <div className="md:col-span-2 bg-indigo-600 rounded-xl shadow-lg p-4 text-white flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
                <div className="absolute -right-10 -top-10 bg-white/10 w-40 h-40 rounded-full blur-2xl"></div>
                <div className="z-10">
                    <p className="text-indigo-200 text-xs font-bold uppercase mb-1">Total Biaya Produksi</p>
                    <h2 className="text-3xl font-bold">{formatIDR(totalProductionCost)}</h2>
                </div>
                <div className="z-10 mt-4 md:mt-0 text-right">
                    <p className="text-indigo-200 text-xs font-bold uppercase mb-1">Estimasi HPP / Pcs</p>
                    <div className="flex items-baseline gap-2 justify-end">
                      <span className="text-sm">untuk {production.yield} pcs = </span>
                      <h2 className="text-2xl font-bold bg-white/20 px-3 py-1 rounded-lg">{formatIDR(hppPerUnit)}</h2>
                    </div>
                </div>
            </div>
        </div>

        {/* INPUT SECTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* BAHAN BAKU */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
                <div className="p-4 border-b bg-blue-50/50 flex justify-between items-center">
                    <h2 className="font-bold text-blue-800 flex items-center gap-2"><Package className="w-4 h-4"/> Bahan Baku</h2>
                    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">{formatIDR(totalMaterialCost)}</span>
                </div>
                <div className="p-4 space-y-3 flex-1">
                    {materials.map((item, idx) => (
                        <div key={item.id} className="text-sm border-b border-slate-100 pb-3 last:border-0 relative">
                             <div className="flex justify-between mb-1">
                                <input 
                                    placeholder="Nama Bahan" 
                                    className="font-medium text-slate-700 w-full outline-none placeholder:font-normal"
                                    value={item.name}
                                    onChange={(e) => updateMaterial(item.id, 'name', e.target.value)}
                                />
                                <button onClick={() => removeMaterialRow(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-3 h-3"/></button>
                             </div>
                             <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="text-[10px] text-slate-400 block">Harga Beli</label>
                                    <input type="number" className="w-full bg-slate-50 rounded p-1" value={item.price || ''} onChange={(e)=>updateMaterial(item.id, 'price', parseFloat(e.target.value)||0)} />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-400 block">Isi ({item.unit})</label>
                                    <div className="flex">
                                        <input type="number" className="w-full bg-slate-50 rounded-l p-1" value={item.content || ''} onChange={(e)=>updateMaterial(item.id, 'content', parseFloat(e.target.value)||0)} />
                                        <select className="bg-slate-200 text-[10px] rounded-r px-1" value={item.unit} onChange={(e)=>updateMaterial(item.id, 'unit', e.target.value)}>
                                            <option value="gram">gr</option><option value="kg">kg</option><option value="ml">ml</option><option value="liter">ltr</option><option value="pcs">pcs</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-400 block">Pakai</label>
                                    <input type="number" className="w-full bg-yellow-50 border border-yellow-100 rounded p-1 font-semibold" value={item.usage || ''} onChange={(e)=>updateMaterial(item.id, 'usage', parseFloat(e.target.value)||0)} />
                                </div>
                             </div>
                        </div>
                    ))}
                    <button onClick={addMaterialRow} className="w-full py-2 border border-dashed border-blue-300 text-blue-500 text-xs rounded-lg hover:bg-blue-50">+ Tambah Bahan</button>
                </div>
            </div>

            {/* OPERASIONAL */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
                <div className="p-4 border-b bg-amber-50/50 flex justify-between items-center">
                    <h2 className="font-bold text-amber-800 flex items-center gap-2"><Zap className="w-4 h-4"/> Operasional</h2>
                    <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded">{formatIDR(totalOpCost)}</span>
                </div>
                 <div className="p-4 space-y-3 flex-1">
                    {operations.map((item, idx) => (
                        <div key={item.id} className="text-sm border-b border-slate-100 pb-3 last:border-0 relative">
                             <div className="flex justify-between mb-1">
                                <input 
                                    placeholder="Jenis (Gas, Listrik, Gaji)" 
                                    className="font-medium text-slate-700 w-full outline-none placeholder:font-normal"
                                    value={item.type}
                                    onChange={(e) => updateOperation(item.id, 'type', e.target.value)}
                                />
                                <button onClick={() => removeOperationRow(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-3 h-3"/></button>
                             </div>
                             <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="text-[10px] text-slate-400 block">Biaya</label>
                                    <input type="number" className="w-full bg-slate-50 rounded p-1" value={item.price || ''} onChange={(e)=>updateOperation(item.id, 'price', parseFloat(e.target.value)||0)} />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-400 block">Total Isi</label>
                                    <div className="flex">
                                        <input type="number" className="w-full bg-slate-50 rounded-l p-1" value={item.content || ''} onChange={(e)=>updateOperation(item.id, 'content', parseFloat(e.target.value)||0)} />
                                        <select className="bg-slate-200 text-[10px] rounded-r px-1" value={item.unit} onChange={(e)=>updateOperation(item.id, 'unit', e.target.value)}>
                                            <option value="jam">jam</option><option value="hari">hari</option><option value="bulan">bln</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-400 block">Pakai</label>
                                    <input type="number" className="w-full bg-yellow-50 border border-yellow-100 rounded p-1 font-semibold" value={item.usage || ''} onChange={(e)=>updateOperation(item.id, 'usage', parseFloat(e.target.value)||0)} />
                                </div>
                             </div>
                        </div>
                    ))}
                    <button onClick={addOperationRow} className="w-full py-2 border border-dashed border-amber-300 text-amber-500 text-xs rounded-lg hover:bg-amber-50">+ Tambah Operasional</button>
                </div>
            </div>

        </div>

        {/* ANALYTICS CARD */}
        <section className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden">
             <div className="bg-slate-800 text-white p-3 flex justify-between items-center">
                 <h2 className="font-bold flex items-center gap-2"><TrendingUp className="w-4 h-4"/> Strategi Harga</h2>
             </div>
             
             <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                
                {/* Calculator Forward: HPP -> Harga Jual */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-500 uppercase">1. Tentukan Margin</h3>
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <label className="text-xs text-slate-500">Jumlah Produk Jadi</label>
                            <input type="number" className="w-full border p-2 rounded text-center font-bold" value={production.yield||''} onChange={(e)=>setProduction({...production, yield: parseFloat(e.target.value)||0})} />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-slate-500">Margin (%)</label>
                            <input type="number" className="w-full border p-2 rounded text-center font-bold text-indigo-600" value={production.margin} onChange={(e)=>setProduction({...production, margin: parseFloat(e.target.value)||0})} />
                        </div>
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                        <p className="text-xs text-indigo-800 mb-1">Harga Jual Matematis</p>
                        <p className="text-xl font-bold text-indigo-900 line-through decoration-red-400 decoration-2 opacity-60">{formatIDR(sellingPriceRaw)}</p>
                        
                        <div className="mt-3 pt-3 border-t border-indigo-200">
                             <p className="text-xs text-indigo-800 mb-1 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Saran Harga Jual (Smart Rounding)</p>
                             <p className="text-3xl font-extrabold text-indigo-600">{formatIDR(smartPrice)}</p>
                             <p className="text-[10px] text-indigo-400 mt-1">*Dibulatkan agar mudah kembalian</p>
                        </div>
                    </div>
                </div>

                {/* Calculator Backward: Harga Jual -> Margin */}
                <div className="space-y-4 pt-4 md:pt-0">
                    <h3 className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">2. Cek Laba (Reverse) <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full">Simulasi</span></h3>
                    <p className="text-xs text-slate-400">Jika Anda dipaksa menjual dengan harga pasar, berapa untungnya?</p>
                    
                    <div>
                        <label className="text-xs text-slate-500 font-bold">Harga Jual di Pasaran (Pesaing)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">Rp</span>
                            <input 
                                type="number" 
                                className="w-full pl-10 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="Misal: 3000"
                                value={marketPrice || ''}
                                onChange={(e) => setMarketPrice(parseFloat(e.target.value)||0)}
                            />
                        </div>
                    </div>

                    {marketPrice > 0 && (
                        <div className={`p-4 rounded-xl border ${realMargin > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-600">Margin Anda:</span>
                                <span className={`text-2xl font-bold ${realMargin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {realMargin.toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-slate-500">Profit Tunai:</span>
                                <span className={`text-sm font-bold ${realMargin > 0 ? 'text-green-700' : 'text-red-700'}`}>
                                    {formatIDR(marketPrice - hppPerUnit)} / pcs
                                </span>
                            </div>
                        </div>
                    )}
                </div>

             </div>
        </section>

      </main>
    </div>
  );
};

export default HppCalculatorPro;

