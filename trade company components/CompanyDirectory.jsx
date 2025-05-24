import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "./Select";
import { Input } from "./Input";
import { Card, CardContent } from "./Card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "./Table";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Search,
  Leaf,
  Filter
} from "lucide-react";

const companies = [
  { name: "Better Healthcare", ticker: "BHLT", sector: "Healthcare", esg: 8.1, price: "$87.15", change: "+1.8%", marketCap: "$15.7B" },
  { name: "Circular Economy Inc", ticker: "CEI", sector: "Consumer Goods", esg: 9.3, price: "$86.25", change: "-1.1%", marketCap: "$4.8B" },
  { name: "Clean Energy Storage", ticker: "CBST", sector: "Energy", esg: 7.5, price: "$128.75", change: "+2.5%", marketCap: "$31.2B" },
  { name: "Clean Water Solutions", ticker: "CWS", sector: "Utilities", esg: 8.6, price: "$65.20", change: "+2.1%", marketCap: "$9.8B" },
  { name: "Eco Materials", ticker: "EMAT", sector: "Materials", esg: 8.3, price: "$53.60", change: "+1.2%", marketCap: "$7.1B" },
  { name: "Eco Tourism", ticker: "ETRM", sector: "Tourism", esg: 7.7, price: "$87.30", change: "+0.2%", marketCap: "$6.9B" },
  { name: "Electric Transport", ticker: "ETRN", sector: "Transportation", esg: 9.0, price: "$92.80", change: "+2.0%", marketCap: "$27.4B" }
];

const getChangeClass = (change) => {
  const value = parseFloat(change);
  if (value >= 2) return "text-green-600 font-semibold";
  if (value > 0) return "text-green-500";
  if (value <= -2) return "text-red-800 font-semibold";
  return "text-red-500";
};

export default function CompaniesDirectory() {
  const [sector, setSector] = useState("all");
  const [esg, setEsg] = useState("all-scores");

  const filteredCompanies = companies.filter((company) => {
    const sectorMatch = sector === "all" || company.sector === sector;
    const esgMatch =
      esg === "all-scores" ||
      (esg === "above-8" && company.esg > 8) ||
      (esg === "above-7" && company.esg > 7);
    return sectorMatch && esgMatch;
  });

  return (
    <div className="min-h-screen p-6 space-y-6 bg-gradient-to-br from-white to-[#F2EFBB]">
      <motion.h1
        className="text-3xl font-bold text-[#618943] text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Companies Directory
      </motion.h1>

      {/* Filters */}
      <Card className="bg-[#F9F7DC] border border-[#9EBC63] shadow-md rounded-2xl">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9EBC63] w-4 h-4" />
              <Input
                placeholder="Search companies..."
                className="pl-10 w-full border border-[#C5D86D] text-[#385723] placeholder-[#618943]"
                aria-label="Search companies"
              />
            </div>

            <div className="flex flex-wrap md:flex-nowrap gap-4 w-full md:w-auto">
              {/* Sector */}
              <div className="relative w-40">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#385723] w-4 h-4 z-10" />
                <Select value={sector} onValueChange={setSector}>
                  <SelectTrigger className="pl-9 w-full bg-[#C5D86D] text-[#618943]">
                    <SelectValue placeholder="All Sectors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sectors</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Energy">Energy</SelectItem>
                    <SelectItem value="Materials">Materials</SelectItem>
                    <SelectItem value="Consumer Goods">Consumer Goods</SelectItem>
                    <SelectItem value="Tourism">Tourism</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ESG */}
              <div className="relative w-40">
                <Leaf className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#385723] w-4 h-4 z-10" />
                <Select value={esg} onValueChange={setEsg}>
                  <SelectTrigger className="pl-9 w-full bg-[#C5D86D] text-[#618943]">
                    <SelectValue placeholder="ESG: All Scores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-scores">All Scores</SelectItem>
                    <SelectItem value="above-8">Above 8</SelectItem>
                    <SelectItem value="above-7">Above 7</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Table */}
      <Card className="bg-[#F9F7DC] border border-[#9EBC63] shadow-md rounded-2xl">
        <CardContent className="space-y-4">
          <motion.div
            className="overflow-x-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Table className="rounded-xl overflow-hidden">
              <TableHeader className="bg-[#c7d9b5] text-[#385723]">
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>ESG</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Day %</TableHead>
                  <TableHead>Market Cap</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredCompanies.map((company) => (
                    <motion.tr
                      key={company.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <Building2 className="h-4 w-4 text-[#9EBC63]" />
                          <span className="truncate font-semibold">{company.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{company.ticker}</TableCell>
                      <TableCell>{company.sector}</TableCell>
                      <TableCell>
                        <motion.span
                          className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                            company.esg >= 8.5
                              ? "text-green-800 bg-green-200"
                              : company.esg >= 7
                              ? "text-green-700 bg-green-100"
                              : "text-green-600 bg-green-50"
                          }`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4 }}
                        >
                          {company.esg.toFixed(1)}
                        </motion.span>
                      </TableCell>
                      <TableCell className="font-semibold">{company.price}</TableCell>
                      <TableCell className={getChangeClass(company.change)}>
                        {parseFloat(company.change) > 0 ? (
                          <TrendingUp className="inline w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="inline w-4 h-4 mr-1" />
                        )}
                        {company.change}
                      </TableCell>
                      <TableCell className="font-semibold">{company.marketCap}</TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
