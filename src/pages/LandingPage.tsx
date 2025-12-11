import { Link } from 'react-router-dom';
import { PiggyBank, TrendingUp, Calendar, FileText, Target, Wallet } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Background with gradient overlay */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1691302174364-1958bc3d3ff8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaWdneSUyMGJhbmslMjBzYXZpbmdzfGVufDF8fHx8MTc2NTM4ODIwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 via-emerald-800/85 to-green-900/90" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-400 rounded-full flex items-center justify-center">
            <PiggyBank className="w-6 h-6 text-emerald-900" />
          </div>
          <span className="text-white text-2xl font-semibold">Spendli</span>
        </div>
        <Link
          to="/login"
          className="text-white px-6 py-2.5 rounded-lg bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all duration-200 border border-white/30"
        >
          Login
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex flex-col justify-center items-center px-5 text-center py-20">
        <div className="mb-6 inline-flex items-center gap-2 bg-emerald-400/20 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-300/30">
          <Target className="w-4 h-4 text-emerald-200" />
          <span className="text-emerald-50 text-sm">Smart Budget Management</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl leading-tight mb-6 max-w-4xl text-white">
          Take Control of Your Money
          <br />
          <span className="text-emerald-300">One Day at a Time</span>
        </h1>
        
        <p className="text-xl max-w-2xl mb-10 text-emerald-50/90">
          Spendli helps you stay on track with your income, part-time earnings, commitments,
          and daily spending — all in one beautifully simple dashboard.
        </p>

        <div className="flex gap-4 mt-2 flex-wrap justify-center">
          <Link
            to="/signup"
            className="px-8 py-4 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
          >
            <Wallet className="w-5 h-5" />
            Get Started Free
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl hover:bg-white/20 transition-all duration-200"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 bg-gradient-to-b from-white to-emerald-50 py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl text-emerald-900 mb-4">Why Choose Spendli?</h2>
            <p className="text-lg text-emerald-700">Everything you need to manage your finances effectively</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 border-t-4 border-emerald-500">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-emerald-900 mb-3">Daily Budgeting</h3>
              <p className="text-gray-600">Automatically calculates your daily spending limit based on your income and commitments.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 border-t-4 border-blue-500">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-emerald-900 mb-3">Part-Time Tracking</h3>
              <p className="text-gray-600">Record your daily part-time earnings and watch your monthly total grow automatically.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 border-t-4 border-amber-500">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-emerald-900 mb-3">Commitment Planner</h3>
              <p className="text-gray-600">Rent, vehicle loans, bills, subscriptions — keep everything neatly organized in one place.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 border-t-4 border-purple-500">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-emerald-900 mb-3">Excel Reports</h3>
              <p className="text-gray-600">Generate comprehensive financial reports in Excel format for detailed analysis.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 border-t-4 border-pink-500">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-emerald-900 mb-3">Goal Setting</h3>
              <p className="text-gray-600">Set financial goals and track your progress with smart daily targets.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 border-t-4 border-green-500">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <PiggyBank className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-emerald-900 mb-3">Simple & Fast</h3>
              <p className="text-gray-600">Clean UI, mobile-friendly, lightweight, and easy for anyone to use.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 bg-gradient-to-r from-emerald-600 to-green-600 py-16 px-5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl text-white mb-4">Ready to Save Smarter?</h2>
          <p className="text-xl text-emerald-50 mb-8">Join Spendli today and take the first step towards financial freedom.</p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <PiggyBank className="w-5 h-5" />
            Start Saving Now
          </Link>
        </div>
      </section>
    </div>
  );
}