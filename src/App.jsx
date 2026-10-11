import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SimulationProvider } from "./context/SimulationContext";

// Route-level code splitting via React.lazy for optimized bundle loading, INP, and LCP
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Trade = lazy(() => import("./pages/Trade"));
const Company = lazy(() => import("./pages/Company"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Admin = lazy(() => import("./pages/Admin/Admin"));

/**
 * High-performance lightweight telemetry fallback rendered during route transitions.
 */
function RouteLoadingFallback() {
  return (
    <div className="min-h-screen bg-[#0A0D12] flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#E10600] border-t-transparent animate-spin" />
        <span className="text-xs uppercase font-mono tracking-widest text-slate-400">Loading Telemetry...</span>
      </div>
    </div>
  );
}

function App() {
  return (
    <SimulationProvider>
      <Router>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trade" element={<Trade />} />
            <Route path="/companies" element={<Company />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Suspense>
      </Router>
    </SimulationProvider>
  );
}

export default App;
