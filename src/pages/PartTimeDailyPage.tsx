import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, set, update } from 'firebase/database';
import { database } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';
import { 
  Home as HomeIcon, 
  Calendar, 
  Target, 
  TrendingUp, 
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PiggyBank
} from 'lucide-react';

interface DayRow {
  date: string;
  dailyGoal: string;
  earned: number;
  isPast: boolean;
  isToday: boolean;
  isFuture: boolean;
  baseDaily: number;
}

export default function PartTimeDailyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [showDailyGoal, setShowDailyGoal] = useState(false);
  const [totalEarned, setTotalEarned] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [tableData, setTableData] = useState<DayRow[]>([]);

  const formatDateLocal = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const two = (n: number) => Number(n || 0).toFixed(2);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const snap = await get(ref(database, `users/${user}/partTimeDaily/settings`));
      if (!snap.exists()) return;

      const s = snap.val();
      if (s.from) setDateFrom(s.from);
      if (s.to) setDateTo(s.to);
      if (s.goal !== undefined) setGoalAmount(String(s.goal));
      setShowDailyGoal(!!s.showDaily);
    } catch (err) {
      console.error(err);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    try {
      await update(ref(database, `users/${user}/partTimeDaily/settings`), {
        from: dateFrom,
        to: dateTo,
        goal: goalAmount,
        showDaily: showDailyGoal,
      });
      await loadTable();
      toast.success('Settings saved');
    } catch (err) {
      console.error(err);
    }
  };

  const updateSummary = async () => {
    if (!user) return;

    try {
      const snap = await get(ref(database, `users/${user}/partTimeDaily/records`));
      const records = snap.exists() ? snap.val() : {};
      let total = 0;

      for (const v of Object.values(records)) {
        if (v !== '' && !isNaN(Number(v))) total += Number(v);
      }

      const goal = Number(goalAmount || 0);
      setTotalEarned(total);
      setRemaining(goal - total);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTable = async () => {
    if (!user) return;

    try {
      if (!dateFrom || !dateTo) {
        setTableData([]);
        await updateSummary();
        return;
      }

      const from = new Date(dateFrom);
      const to = new Date(dateTo);
      from.setHours(0, 0, 0, 0);
      to.setHours(0, 0, 0, 0);

      const totalGoal = Number(goalAmount || 0);
      const snap = await get(ref(database, `users/${user}/partTimeDaily/records`));
      const saved = snap.exists() ? snap.val() : {};

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = formatDateLocal(today);

      const days: string[] = [];
      let current = new Date(from);
      while (current <= to) {
        days.push(formatDateLocal(current));
        current.setDate(current.getDate() + 1);
      }

      let remainingGoal = totalGoal;
      let remainingToday: number | null = null;

      const rows: DayRow[] = [];

      for (let i = 0; i < days.length; i++) {
        const ds = days[i];
        const rowDate = new Date(ds);
        rowDate.setHours(0, 0, 0, 0);

        const isPast = ds < todayStr;
        const isToday = ds === todayStr;
        const isFuture = ds > todayStr;

        const earnedToday = saved[ds] === '' || saved[ds] === undefined ? 0 : Number(saved[ds]);

        let daysLeft: number;

        if (isPast) {
          daysLeft = Math.floor((to.getTime() - rowDate.getTime()) / 86400000) + 1;
        } else if (isToday) {
          daysLeft = Math.floor((to.getTime() - today.getTime()) / 86400000) + 1;
          remainingToday = remainingGoal;
        } else {
          if (remainingToday === null) remainingToday = remainingGoal;
          daysLeft = Math.floor((to.getTime() - today.getTime()) / 86400000);
          if (daysLeft < 1) daysLeft = 1;
        }

        let baseDaily: number;
        let dailyGoal: number;

        if (isFuture) {
          baseDaily = remainingToday! / daysLeft;
          dailyGoal = baseDaily;
        } else {
          baseDaily = remainingGoal / daysLeft;
          dailyGoal = baseDaily - earnedToday;
          if (dailyGoal < 0) dailyGoal = 0;
        }

        let cellDailyGoal = showDailyGoal ? two(dailyGoal) : isPast ? two(dailyGoal) : '-';

        rows.push({
          date: ds,
          dailyGoal: cellDailyGoal,
          earned: earnedToday,
          isPast,
          isToday,
          isFuture,
          baseDaily,
        });

        remainingGoal = Math.max(0, totalGoal - (totalGoal - remainingGoal + earnedToday));
      }

      setTableData(rows);
      await updateSummary();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [user]);

  useEffect(() => {
    loadTable();
  }, [dateFrom, dateTo, goalAmount, showDailyGoal]);

  const handleEarnedChange = async (date: string, value: string) => {
    if (!user) return;

    await set(ref(database, `users/${user}/partTimeDaily/records/${date}`), value === '' ? '' : Number(value));
    await loadTable();
  };

  const handleSaveAll = async () => {
    if (!user) return;

    try {
      const payload: any = {};
      tableData.forEach((row) => {
        payload[row.date] = row.earned === 0 ? '' : row.earned;
      });

      await set(ref(database, `users/${user}/partTimeDaily/records`), payload);
      await loadTable();
      toast.success('Saved all');
    } catch (err) {
      console.error(err);
    }
  };

  const getRowClass = (row: DayRow) => {
    if (row.isPast) {
      return row.earned >= row.baseDaily ? 'bg-emerald-50 border-l-4 border-emerald-500' : 'bg-red-50 border-l-4 border-red-500';
    } else if (row.isToday) {
      return 'bg-amber-50 border-l-4 border-amber-500';
    }
    return 'bg-white';
  };

  const progressPercentage = goalAmount ? Math.min(100, (totalEarned / Number(goalAmount)) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-emerald-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-emerald-900">Part-Time Daily</h1>
              <p className="text-sm text-emerald-600">Track your daily earnings</p>
            </div>
          </div>
          <p className="text-emerald-700">Logged in as: <span className="font-semibold">{user}</span></p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 py-6 space-y-6">
        {/* Settings Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-white mb-1">Earnings Configuration</h2>
                <p className="text-purple-100 text-sm">Set your earning period and goals</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="flex items-center gap-2 text-emerald-900 mb-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  From Date
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-emerald-900 mb-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  To Date
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-emerald-900 mb-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  Goal Amount (RM)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Enter target"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDailyGoal}
                  onChange={(e) => setShowDailyGoal(e.target.checked)}
                  className="w-5 h-5 rounded border-emerald-300 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-gray-700">Show Daily Goal for future dates</span>
              </label>
              <button
                onClick={saveSettings}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors shadow-lg"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>

        {/* Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Earned</span>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl text-emerald-900 mb-1">RM {two(totalEarned)}</p>
            <div className="w-full bg-emerald-100 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Goal Amount</span>
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl text-purple-900">RM {two(Number(goalAmount || 0))}</p>
            <p className="text-sm text-purple-600 mt-1">{progressPercentage.toFixed(1)}% completed</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Remaining</span>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl text-blue-900">RM {two(remaining)}</p>
            <p className="text-sm text-blue-600 mt-1">Keep pushing!</p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">How it works:</p>
              <p>Past days are <span className="text-emerald-600 font-semibold">green</span> if you met the daily goal, <span className="text-red-600 font-semibold">red</span> if you didn't. Today is <span className="text-amber-600 font-semibold">amber</span>. Future days can be edited.</p>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
          <div className="p-6">
            <h3 className="text-emerald-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Daily Breakdown
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-emerald-50">
                    <th className="px-4 py-3 text-left text-emerald-900 rounded-tl-lg">Date</th>
                    <th className="px-4 py-3 text-right text-emerald-900">Daily Goal</th>
                    <th className="px-4 py-3 text-right text-emerald-900 rounded-tr-lg">Earned (RM)</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr
                      key={row.date}
                      className={`border-t border-emerald-100 ${getRowClass(row)}`}
                    >
                      <td className="px-4 py-3 text-gray-700 flex items-center gap-2">
                        {row.isPast && (
                          row.earned >= row.baseDaily ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )
                        )}
                        {row.isToday && <AlertCircle className="w-4 h-4 text-amber-600" />}
                        {row.date}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {row.dailyGoal}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={row.earned === 0 ? '' : two(row.earned)}
                          onChange={(e) => handleEarnedChange(row.date, e.target.value)}
                          readOnly={row.isPast}
                          className={`w-32 px-3 py-1.5 text-right rounded-lg border-2 ${
                            row.isPast
                              ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                              : 'border-emerald-200 focus:border-emerald-500 focus:outline-none'
                          }`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-6 bg-emerald-50 border-t border-emerald-100 flex gap-3">
            <button
              onClick={handleSaveAll}
              className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors shadow-lg"
            >
              Save All Changes
            </button>
            <button
              onClick={() => navigate('/home')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
            >
              <HomeIcon className="w-5 h-5" />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
