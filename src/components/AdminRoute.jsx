import { Navigate } from "react-router-dom";
import { useSimulation } from "../context/SimulationContext";

export default function AdminRoute({ children }) {
  const { isAdmin } = useSimulation();

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
