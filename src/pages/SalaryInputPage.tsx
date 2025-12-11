import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, set } from 'firebase/database';
import { database } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';
import { DollarSign, TrendingUp, Plus, Home, ArrowRight, Calendar, PiggyBank } from 'lucide-react';

export default function SalaryInputPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [salary, setSalary] = useState('');
  const [additionalIncome, setAdditionalIncome] = useState('');
  const [partTimeTotal, setPartTimeTotal] = useState(0);

  const loadPartTimeTotal = async () => {
    if (!user) return 0;

    try {
      const snap = await get(ref(database, `users/${user}/partTimeDaily/records`));
      if (!snap.exists()) return 0;

      const records = snap.val();
      let total = 0;

      Object.values(records).forEach((v: any) => {
        if (v !== '' && !isNaN(Number(v))) total += Number(v);
      });

      return total;
    } catch (e) {
      console.error('Part-time daily load failed:', e);
      return 0;
    }
  };

  const loadData = async () => {
    if (!user) return;

    try {
      const [salSnap, addSnap] = await Promise.all([
        get(ref(database, `users/${user}/salary`)),
        get(ref(database, `users/${user}/additionalIncome`)),
      ]);

      if (salSnap.exists()) setSalary(String(salSnap.val()));
      if (addSnap.exists()) setAdditionalIncome(String(addSnap.val()));

      const pt = await loadPartTimeTotal();
      setPartTimeTotal(pt);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    const partVal = await loadPartTimeTotal();

    try {
      await set(ref(database, `users/${user}/salary`), salary === '' ? null : Number(salary));
      await set(ref(database, `users/${user}/additionalIncome`), additionalIncome === '' ? 0 : Number(additionalIncome));
      await set(ref(database, `users/${user}/partTime`), partVal);

      toast.success('Saved!');
      const pt = await loadPartTimeTotal();
      setPartTimeTotal(pt);
    } catch (e) {
      console.error(e);
      toast.error('Save failed');
    }
  };

  const main = Number(salary || 0);
  const add = Number(additionalIncome || 0);
  const total = main + partTimeTotal + add;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-emerald-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-emerald-900">Income Setup</h1>
              <p className="text-sm text-emerald-600">Configure your income sources</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-white mb-1">Budget Saver</h2>
                <p className="text-emerald-100 text-sm">Track all your income sources</p>
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-6 space-y-6">
            {/* Main Salary */}
            <div>
              <label className="flex items-center gap-2 text-emerald-900 mb-3">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Main Salary
              </label>
              <input
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="Enter your monthly salary"
                className="w-full px-4 py-3 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors bg-emerald-50/30"
              />
            </div>

            {/* Part-Time Earned */}
            <div>
              <label className="flex items-center gap-2 text-emerald-900 mb-3">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Part-Time Earned (Auto from Daily)
              </label>
              <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-blue-900">RM {partTimeTotal.toFixed(2)}</span>
                  <button
                    onClick={() => navigate('/part-time-daily')}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Calendar className="w-4 h-4" />
                    Manage Daily
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Income */}
            <div>
              <label className="flex items-center gap-2 text-emerald-900 mb-3">
                <Plus className="w-4 h-4 text-purple-600" />
                Additional Income
              </label>
              <input
                type="number"
                value={additionalIncome}
                onChange={(e) => setAdditionalIncome(e.target.value)}
                placeholder="Enter additional income (bonuses, etc.)"
                className="w-full px-4 py-3 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors bg-emerald-50/30"
              />
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-6 text-white space-y-2">
              <h3 className="text-white mb-3">Income Breakdown</h3>
              <div className="space-y-2 text-emerald-50">
                <div className="flex justify-between">
                  <span>Main Salary:</span>
                  <span>RM {main.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Part-Time Earned:</span>
                  <span>RM {partTimeTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Additional Income:</span>
                  <span>RM {add.toFixed(2)}</span>
                </div>
                <div className="border-t border-emerald-300/30 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg">Total Income:</span>
                    <span className="text-2xl font-semibold">RM {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              <button
                onClick={() => navigate('/home')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
              <button
                onClick={handleSave}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors shadow-lg"
              >
                Save
              </button>
              <button
                onClick={() => navigate('/commitment')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/part-time-daily')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Part-Time
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
