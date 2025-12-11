import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, set } from 'firebase/database';
import { database } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';
import { 
  Home as HomeIcon, 
  DollarSign, 
  ArrowLeft, 
  Plus, 
  X,
  PiggyBank,
  Wallet,
  Car,
  Smartphone,
  Zap,
  Droplet,
  ShoppingCart,
  Bike
} from 'lucide-react';

interface OtherCommitment {
  title: string;
  amount: string;
}

export default function CommitmentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rent, setRent] = useState('');
  const [vehicleLoan, setVehicleLoan] = useState('');
  const [telco, setTelco] = useState('');
  const [electric, setElectric] = useState('');
  const [water, setWater] = useState('');
  const [shopee, setShopee] = useState('');
  const [others, setOthers] = useState<OtherCommitment[]>([]);

  const commitKeys = ['rent', 'vehicleLoan', 'telco', 'electric', 'water', 'shopee'];

  const loadData = async () => {
    if (!user) return;

    try {
      const snap = await get(ref(database, `users/${user}/commitments`));
      if (!snap.exists()) return;

      const data = snap.val();
      if (data.rent !== undefined && data.rent !== null && data.rent !== '') setRent(String(parseFloat(data.rent)));
      if (data.vehicleLoan !== undefined && data.vehicleLoan !== null && data.vehicleLoan !== '') setVehicleLoan(String(parseFloat(data.vehicleLoan)));
      if (data.telco !== undefined && data.telco !== null && data.telco !== '') setTelco(String(parseFloat(data.telco)));
      if (data.electric !== undefined && data.electric !== null && data.electric !== '') setElectric(String(parseFloat(data.electric)));
      if (data.water !== undefined && data.water !== null && data.water !== '') setWater(String(parseFloat(data.water)));
      if (data.shopee !== undefined && data.shopee !== null && data.shopee !== '') setShopee(String(parseFloat(data.shopee)));

      if (data.other) {
        const list = Array.isArray(data.other) ? data.other : Object.values(data.other);
        setOthers(list.map((o: any) => ({ title: o.title || '', amount: o.amount || '' })));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const calculateTotal = () => {
    let totalCents = 0;

    const values = [rent, vehicleLoan, telco, electric, water, shopee];
    values.forEach((v) => {
      const num = parseFloat(v);
      if (!isNaN(num)) totalCents += Math.round(num * 100);
    });

    others.forEach((o) => {
      const num = parseFloat(o.amount);
      if (!isNaN(num)) totalCents += Math.round(num * 100);
    });

    return (totalCents / 100).toFixed(2);
  };

  const handleAddOther = () => {
    setOthers([...others, { title: '', amount: '' }]);
  };

  const handleRemoveOther = (index: number) => {
    setOthers(others.filter((_, i) => i !== index));
  };

  const handleOtherChange = (index: number, field: 'title' | 'amount', value: string) => {
    const updated = [...others];
    updated[index][field] = value;
    setOthers(updated);
  };

  const handleSave = async () => {
    if (!user) return;

    const data: any = {
      rent: rent === '' || rent === null ? '' : Number(parseFloat(rent)),
      vehicleLoan: vehicleLoan === '' || vehicleLoan === null ? '' : Number(parseFloat(vehicleLoan)),
      telco: telco === '' || telco === null ? '' : Number(parseFloat(telco)),
      electric: electric === '' || electric === null ? '' : Number(parseFloat(electric)),
      water: water === '' || water === null ? '' : Number(parseFloat(water)),
      shopee: shopee === '' || shopee === null ? '' : Number(parseFloat(shopee)),
      other: others.map((o) => ({ title: o.title.trim(), amount: o.amount || '' })),
    };

    try {
      await set(ref(database, `users/${user}/commitments`), data);
      toast.success('Saved!');
    } catch (e) {
      console.error(e);
      toast.error('Save failed');
    }
  };

  const commitmentFields = [
    { icon: HomeIcon, label: 'Rent', value: rent, setter: setRent, color: 'emerald' },
    { icon: Car, label: 'Vehicle Loan', value: vehicleLoan, setter: setVehicleLoan, color: 'blue' },
    { icon: Smartphone, label: 'Telco', value: telco, setter: setTelco, color: 'purple' },
    { icon: Zap, label: 'Electricity', value: electric, setter: setElectric, color: 'amber' },
    { icon: Droplet, label: 'Water', value: water, setter: setWater, color: 'cyan' },
    { icon: ShoppingCart, label: 'Shopee', value: shopee, setter: setShopee, color: 'orange' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-emerald-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-emerald-900">Commitments</h1>
              <p className="text-sm text-emerald-600">Manage your monthly expenses</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
          {/* Total Banner */}
          <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm mb-1">Total Monthly Commitments</p>
                <p className="text-4xl font-semibold">RM {calculateTotal()}</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <DollarSign className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Commitment Fields */}
          <div className="p-6 space-y-4">
            <h3 className="text-emerald-900 mb-4">Fixed Monthly Expenses</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {commitmentFields.map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.label}>
                    <label className="flex items-center gap-2 text-gray-700 mb-2">
                      <Icon className={`w-4 h-4 text-${field.color}-600`} />
                      {field.label}
                    </label>
                    <input
                      type="number"
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors bg-emerald-50/30"
                    />
                  </div>
                );
              })}
            </div>

            {/* Other Commitments */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-emerald-900">Other Commitments</h3>
                <button
                  onClick={handleAddOther}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Other
                </button>
              </div>

              <div className="space-y-3">
                {others.map((other, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <input
                      type="text"
                      placeholder="Description (e.g., Netflix)"
                      value={other.title}
                      onChange={(e) => handleOtherChange(index, 'title', e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors bg-emerald-50/30"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      value={other.amount}
                      onChange={(e) => handleOtherChange(index, 'amount', e.target.value)}
                      className="w-32 px-4 py-2.5 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors bg-emerald-50/30"
                    />
                    <button
                      onClick={() => handleRemoveOther(index)}
                      className="p-2.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              {others.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No other commitments added yet</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-emerald-100">
              <button
                onClick={() => navigate('/home')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
              >
                <HomeIcon className="w-4 h-4" />
                Home
              </button>
              <button
                onClick={handleSave}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors shadow-lg"
              >
                Save
              </button>
              <button
                onClick={() => navigate('/salary-input')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
