import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ref, get } from "firebase/database";
import { database, sha256hex } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { LogIn, PiggyBank } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { login, user, loading } = useAuth();

  // 🔁 If already logged in, redirect to home
  useEffect(() => {
    if (!loading && user) {
      navigate("/home", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleLogin = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);

      const trimmedUsername = username.trim();

      if (!trimmedUsername || !password) {
        toast.error("Please fill in both fields");
        return;
      }

      const userRef = ref(database, `users/${trimmedUsername}`);
      const snap = await get(userRef);

      if (!snap.exists()) {
        toast.error("User not found");
        return;
      }

      const data = snap.val();
      const hashedPassword = await sha256hex(password);

      if (hashedPassword !== data.password) {
        toast.error("Incorrect password");
        return;
      }

      // ✅ Save login
      login(trimmedUsername);

      toast.success("Login successful!");
      navigate("/home", { replace: true });
    } catch (error) {
      console.error(error);
      toast.error("Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  // ⏳ While restoring session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Checking session...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1691302174364-1958bc3d3ff8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 via-emerald-800/85 to-green-900/90" />

      <div className="relative z-10 bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-4">
            <PiggyBank className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-emerald-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Log in to manage your budget</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-emerald-900 mb-2">Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              disabled={submitting}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors bg-white disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-emerald-900 mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              disabled={submitting}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors bg-white disabled:opacity-60"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={submitting}
            className="w-full py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {submitting ? (
              "Logging in..."
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Login
              </>
            )}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
