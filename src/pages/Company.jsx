import CompaniesDirectory from '../../trade company components/CompanyDirectory';
import { useSEO } from "../hooks/useSEO";

/**
 * @file Company.jsx
 * @description Company Directory & Equity Catalog Page for Imprenditore 5.0.
 * Browse all 17 equities across Powertrain, Aerodynamics, Telemetry, Sustainable Fuels,
 * and Logistics sectors.
 *
 * @returns {JSX.Element} Interactive directory with sector filters and stock cards
 */
function Company() {
  useSEO({
    title: "Market Directory & 17 Equities",
    description: "Browse 17 equities for Imprenditore 5.0. Analyze day highs, day lows, volatility, and stock profiles."
  });

  return (
    <div>
      <CompaniesDirectory />
    </div>
  );
}

export default Company;
