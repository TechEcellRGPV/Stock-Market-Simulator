import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SimulationProvider } from "./context/SimulationContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Trade from "./pages/Trade";
import Company from "./pages/Company";
import Leaderboard from "./pages/Leaderboard";
import Admin from "./pages/Admin/Admin";

function App() {
  return (
    <SimulationProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trade" element={<Trade />} />
          <Route path="/companies" element={<Company />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Router>
    </SimulationProvider>
  );
}

export default App;
