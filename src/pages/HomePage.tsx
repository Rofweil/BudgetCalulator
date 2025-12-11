import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, set, update, remove } from 'firebase/database';
import { database } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';
import * as XLSX from 'xlsx';
import { 
  Home, 
  LogOut, 
  DollarSign, 
  TrendingDown, 
  Wallet, 
  Calendar, 
  BarChart3, 
  RotateCcw, 
  FileSpreadsheet,
  PiggyBank,
  Plus
} from 'lucide-react';

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [quickInput, setQuickInput] = useState('');
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalCommit, setTotalCommit] = useState(0);
  const [remainingNet, setRemainingNet] = useState(0);
  const [daysLeft, setDaysLeft] = useState(0);
  const [dailyBudget, setDailyBudget] = useState(0);
  const [partTimeEarned, setPartTimeEarned] = useState(0);
  const [budgetData, setBudgetData] = useState<Array<{ date: string; budget: number; used: string }>>([]);

  const formatLocalDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const two = (n: number) => Number(n).toFixed(2);

  const loadIncomeData = async () => {
    if (!user) return { salary: 0, additional: 0, partTimeEarned: 0, totalIncome: 0, totalCommit: 0 };

    const [salSnap, addSnap, commitSnap, dailySnap] = await Promise.all([
      get(ref(database, `users/${user}/salary`)),
      get(ref(database, `users/${user}/additionalIncome`)),
      get(ref(database, `users/${user}/commitments`)),
      get(ref(database, `users/${user}/partTimeDaily/records`)),
    ]);

    const salary = Number(salSnap.exists() ? salSnap.val() : 0);
    const additional = Number(addSnap.exists() ? addSnap.val() : 0);

    let partTime = 0;
    if (dailySnap.exists()) {
      Object.values(dailySnap.val()).forEach((v: any) => {
        const n = Number(v || 0);
        if (!isNaN(n)) partTime += n;
      });
    }

    const commits = commitSnap.exists() ? commitSnap.val() : {};
    let commit = 0;

    const mainKeys = ['rent', 'vehicleLoan', 'telco', 'electric', 'water', 'shopee', 'motorcycle'];
    mainKeys.forEach((k) => (commit += Number(commits[k] || 0)));

    if (commits.other) {
      const list = Array.isArray(commits.other) ? commits.other : Object.values(commits.other);
      list.forEach((o: any) => (commit += Number(o.amount || 0)));
    }

    return {
      salary,
      additional,
      partTimeEarned: partTime,
      totalIncome: salary + additional + partTime,
      totalCommit: commit,
    };
  };

  const updateDashboard = async () => {
    if (!dateFrom || !dateTo || !user) return;

    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);

    const { totalIncome: income, totalCommit: commit, partTimeEarned: pt } = await loadIncomeData();
    const net = income - commit;
    const totalDays = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 86400000) + 1);
    const base = net / totalDays;

    const usedSnap = await get(ref(database, `users/${user}/homeBudget`));
    let usedTotal = 0;
    if (usedSnap.exists()) {
      Object.values(usedSnap.val()).forEach((v: any) => (usedTotal += Number(v || 0)));
    }

    const remaining = income - commit - usedTotal;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dLeft = Math.max(0, Math.ceil((to.getTime() - today.getTime()) / 86400000));

    setTotalIncome(income);
    setTotalCommit(commit);
    setRemainingNet(remaining);
    setDailyBudget(base);
    setPartTimeEarned(pt);
    setDaysLeft(dLeft);

    // Generate table
    const used = usedSnap.exists() ? usedSnap.val() : {};
    const todayStr = formatLocalDate(today);
    let leftover = 0;
    const rows: Array<{ date: string; budget: number; used: string }> = [];

    let current = new Date(from);
    while (current <= to) {
      const ds = formatLocalDate(current);
      let show = base;

      if (ds < todayStr) {
        show = 0;
      } else if (ds === todayStr) {
        show = base + leftover;
      }

      const val = used[ds] !== undefined ? used[ds] : '';
      rows.push({ date: ds, budget: show, used: val });

      if (ds < todayStr) {
        leftover += base - Number(used[ds] || 0);
      }

      current.setDate(current.getDate() + 1);
    }

    setBudgetData(rows);
  };

  const loadSavedDates = async () => {
    if (!user) return;
    const snap = await get(ref(database, `users/${user}/homeDates`));
    if (snap.exists()) {
      const d = snap.val();
      if (d.from) setDateFrom(d.from);
      if (d.to) setDateTo(d.to);
    }
  };

  useEffect(() => {
    loadSavedDates();
  }, [user]);

  useEffect(() => {
    updateDashboard();
  }, [dateFrom, dateTo]);

  const handleSaveDates = async () => {
    if (!user) return;
    await update(ref(database, `users/${user}/homeDates`), { from: dateFrom, to: dateTo });
    toast.success('Dates saved');
    await updateDashboard();
  };

  const handleSaveToday = async () => {
    if (!user) return;
    const add = Number(quickInput);
    if (isNaN(add) || add <= 0) return;

    const today = formatLocalDate(new Date());
    const snap = await get(ref(database, `users/${user}/homeBudget/${today}`));
    const existing = snap.exists() ? Number(snap.val()) : 0;

    await set(ref(database, `users/${user}/homeBudget/${today}`), existing + add);
    setQuickInput('');
    toast.success('Spending saved');
    await updateDashboard();
  };

  const handleUsedBudgetChange = async (date: string, value: string) => {
    if (!user) return;
    const node = ref(database, `users/${user}/homeBudget/${date}`);
    if (value === '' || value === null) {
      await remove(node);
    } else {
      const n = Number(value);
      if (!isNaN(n)) await set(node, n);
    }
    await updateDashboard();
  };

  const handleResetHome = async () => {
    if (!user) return;
    if (!confirm('Reset Home data?')) return;
    await remove(ref(database, `users/${user}/homeBudget`));
    await remove(ref(database, `users/${user}/homeDates`));
    window.location.reload();
  };

  const handleResetAll = async () => {
    if (!user) return;
    if (!confirm('RESET ALL USER DATA?')) return;
    await remove(ref(database, `users/${user}`));
    toast.success('All data cleared');
    window.location.reload();
  };

  const generateReport = async () => {
    if (!user) return;

    const [salarySnap, addSnap, commitSnap, ptSnap, homeDatesSnap, homeBudgetSnap] = await Promise.all([
      get(ref(database, `users/${user}/salary`)),
      get(ref(database, `users/${user}/additionalIncome`)),
      get(ref(database, `users/${user}/commitments`)),
      get(ref(database, `users/${user}/partTimeDaily/records`)),
      get(ref(database, `users/${user}/homeDates`)),
      get(ref(database, `users/${user}/homeBudget`)),
    ]);

    const salary = Number(salarySnap.exists() ? salarySnap.val() : 0);
    const additionalIncome = Number(addSnap.exists() ? addSnap.val() : 0);

    let ptData: any[] = [];
    let ptTotal = 0;
    if (ptSnap.exists()) {
      for (const [d, amt] of Object.entries(ptSnap.val())) {
        const n = Number(amt || 0);
        if (!isNaN(n)) {
          ptData.push({ Date: d, Earned: n });
          ptTotal += n;
        }
      }
    }

    const commitments = commitSnap.exists() ? commitSnap.val() : {};
    const commitKeys = ['rent', 'vehicleLoan', 'telco', 'electric', 'water', 'shopee', 'motorcycle'];

    let commitList: any[] = [];
    let commitTotal = 0;

    commitKeys.forEach((k) => {
      const val = Number(commitments[k] || 0);
      if (!isNaN(val) && val !== 0) {
        commitList.push({ Type: k, Amount: val });
        commitTotal += val;
      }
    });

    if (commitments.other) {
      const others = Array.isArray(commitments.other) ? commitments.other : Object.values(commitments.other);
      others.forEach((o: any) => {
        const n = Number(o.amount || 0);
        if (!isNaN(n)) {
          commitList.push({ Type: o.title || 'Other', Amount: n });
          commitTotal += n;
        }
      });
    }

    const fromDate = homeDatesSnap.exists() ? homeDatesSnap.val().from : '';
    const toDate = homeDatesSnap.exists() ? homeDatesSnap.val().to : '';

    let homeDailyList: any[] = [];
    let totalUsed = 0;

    if (homeBudgetSnap.exists()) {
      for (const [d, amt] of Object.entries(homeBudgetSnap.val())) {
        const n = Number(amt || 0);
        if (!isNaN(n)) {
          homeDailyList.push({ Date: d, Used: n });
          totalUsed += n;
        }
      }
    }

    const totalInc = salary + additionalIncome + ptTotal;
    const remaining = totalInc - commitTotal - totalUsed;

    const overviewData = [
      { Field: 'User', Value: user },
      { Field: 'Generated On', Value: new Date().toLocaleString() },
      { Field: 'Period', Value: `${fromDate || '—'} to ${toDate || '—'}` },
      {},
      { Field: 'Main Salary', Value: salary },
      { Field: 'Additional Income', Value: additionalIncome },
      { Field: 'Part-Time Earned', Value: ptTotal },
      { Field: 'Total Income', Value: totalInc },
      {},
      { Field: 'Commitments Total', Value: commitTotal },
      { Field: 'Total Spending', Value: totalUsed },
      { Field: 'Remaining Balance', Value: remaining },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(overviewData), 'Overview');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(commitList), 'Commitments');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ptData), 'PartTime');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(homeDailyList), 'DailySpending');

    const filename = `Spendli_Report_${fromDate || 'noDate'}_to_${toDate || 'noDate'}.xlsx`;
    XLSX.writeFile(wb, filename);

    toast.success('Report generated!');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-emerald-900">Spendli</h1>
              <p className="text-sm text-emerald-600">Welcome, {user}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/salary-input')}
            className="flex items-center gap-2 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-emerald-100"
          >
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm text-gray-700">Input Data</span>
          </button>

          <button
            onClick={generateReport}
            className="flex items-center gap-2 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-blue-100"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-700">Export Report</span>
          </button>

          <button
            onClick={handleResetHome}
            className="flex items-center gap-2 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-amber-100"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm text-gray-700">Reset Home</span>
          </button>

          <button
            onClick={handleResetAll}
            className="flex items-center gap-2 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-red-100"
          >
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-700">Reset All</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-100">Total Income</span>
              <Wallet className="w-5 h-5 text-emerald-200" />
            </div>
            <p className="text-3xl font-semibold">RM {two(totalIncome)}</p>
            <p className="text-sm text-emerald-100 mt-1">Salary + Part-time + Additional</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-100">Total Commitments</span>
              <TrendingDown className="w-5 h-5 text-red-200" />
            </div>
            <p className="text-3xl font-semibold">RM {two(totalCommit)}</p>
            <p className="text-sm text-red-100 mt-1">Monthly fixed expenses</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-100">Remaining Balance</span>
              <BarChart3 className="w-5 h-5 text-blue-200" />
            </div>
            <p className="text-3xl font-semibold">RM {two(remainingNet)}</p>
            <p className="text-sm text-blue-100 mt-1">After commitments & spending</p>
          </div>
        </div>

        {/* Date Range & Quick Input */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
          <h3 className="text-emerald-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Budget Period
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-emerald-700 mb-2">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-emerald-700 mb-2">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSaveDates}
                className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Save Dates
              </button>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-emerald-700">Days Remaining</p>
              <p className="text-2xl text-emerald-900">{daysLeft}</p>
            </div>
            <div>
              <p className="text-sm text-emerald-700">Daily Budget</p>
              <p className="text-2xl text-emerald-900">RM {two(dailyBudget)}</p>
            </div>
            <div>
              <p className="text-sm text-emerald-700">Part-time Earned</p>
              <p className="text-2xl text-emerald-900">RM {two(partTimeEarned)}</p>
            </div>
          </div>
        </div>

        {/* Quick Spending Input */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
          <h3 className="text-emerald-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Today&apos;s Spending
          </h3>
          <div className="flex gap-3">
            <input
              type="number"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Enter amount to add to today's spending"
              className="flex-1 px-4 py-3 rounded-lg border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none"
            />
            <button
              onClick={handleSaveToday}
              className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Add Spending
            </button>
          </div>
        </div>

        {/* Budget Table */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
          <h3 className="text-emerald-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Daily Budget Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-emerald-50">
                  <th className="px-4 py-3 text-left text-emerald-900 rounded-tl-lg">Date</th>
                  <th className="px-4 py-3 text-right text-emerald-900">Daily Budget</th>
                  <th className="px-4 py-3 text-right text-emerald-900 rounded-tr-lg">Budget Used</th>
                </tr>
              </thead>
              <tbody>
                {budgetData.map((row, index) => (
                  <tr
                    key={row.date}
                    className={`border-t border-emerald-100 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-emerald-50/30'
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-700">{row.date}</td>
                    <td className="px-4 py-3 text-right text-gray-700">RM {two(row.budget)}</td>
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number"
                        value={row.used}
                        onChange={(e) => handleUsedBudgetChange(row.date, e.target.value)}
                        className="w-28 px-3 py-1.5 text-right rounded-lg border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
