import { useState } from 'react';
import { motion } from 'framer-motion';

export default function TradeForm() {
  const [companyName, setCompanyName] = useState('');
  const [tradeAction, setTradeAction] = useState('Buy');
  const [shares, setShares] = useState(1);
  const [pricePerShare, setPricePerShare] = useState('');
  const [amount, setAmount] = useState('');
  const [ecgScore, setEcgScore] = useState(50);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!companyName.trim()) {
      alert('Please enter a valid company name.');
      return;
    }

    if (shares < 1) {
      alert('Shares must be at least 1.');
      return;
    }

    if (pricePerShare <= 0 || amount <= 0) {
      alert('Price and Amount must be greater than 0.');
      return;
    }

    if (!agreed) {
      alert('You must agree to the terms and conditions.');
      return;
    }

    const tradeData = {
      companyName,
      tradeAction,
      shares,
      pricePerShare,
      amount,
      ecgScore,
      agreed,
    };

    console.log('Trade submitted:', tradeData);

    setCompanyName('');
    setTradeAction('Buy');
    setShares(1);
    setPricePerShare('');
    setAmount('');
    setEcgScore(50);
    setAgreed(false);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg space-y-6 border border-green-100 text-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <label className="block font-medium text-[#618943] mb-1 flex items-center gap-2">
           Company Name
        </label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full border border-green-200 rounded-md px-4 py-2 bg-green-50/20 focus:outline-none focus:ring-2 focus:ring-[#618943]"
          required
        />
      </div>

      <div>
        <label className="block font-medium text-[#618943] mb-1">
          Trade Type
        </label>
        <div className="flex space-x-10 text-[#618943]">
          <label className="flex items-center">
            
            <input
              type="radio"
              value="Buy"
              checked={tradeAction === 'Buy'}
              onChange={() => setTradeAction('Buy')}
              className="mr-1 accent-[#618943]"
            />
            Buy
          </label>
          <label className="flex items-center">
            
            <input
              type="radio"
              value="Sell"
              checked={tradeAction === 'Sell'}
              onChange={() => setTradeAction('Sell')}
              className="mr-1 accent-[#618943]"
            />
            Sell
          </label>
        </div>
      </div>

      <div>
        <label className="block font-medium text-[#618943] mb-1 flex items-center gap-2">
           Number of Shares
        </label>
        <input
          type="number"
          value={shares}
          onChange={(e) => setShares(Number(e.target.value))}
          min={1}
          className="w-full border border-green-200 rounded-md px-4 py-2 bg-green-50/20 focus:outline-none focus:ring-2 focus:ring-[#618943]"
          required
        />
      </div>

      <div>
        <label className="block font-medium text-[#618943] mb-1 flex items-center gap-2">
           Price per Share (USD)
        </label>
        <input
          type="number"
          value={pricePerShare}
          onChange={(e) => setPricePerShare(e.target.value)}
          min={0.01}
          step="0.01"
          className="w-full border border-green-200 rounded-md px-4 py-2 bg-green-50/20 focus:outline-none focus:ring-2 focus:ring-[#618943]"
          required
        />
      </div>

      <div>
        <label className="block font-medium text-[#618943] mb-1 flex items-center gap-2">
           Total Amount (USD)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={0.01}
          step="0.01"
          className="w-full border border-green-200 rounded-md px-4 py-2 bg-green-50/20 focus:outline-none focus:ring-2 focus:ring-[#618943]"
          required
        />
      </div>

      <div>
        <label className="block font-medium text-[#618943] mb-2">
          ECG Score: <span className="font-bold">{ecgScore}</span>
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={ecgScore}
          onChange={(e) => setEcgScore(Number(e.target.value))}
          className="w-full h-2 rounded-lg bg-gray-200 accent-[#618943]"
          style={{
            background: `linear-gradient(to right, #618943 ${ecgScore}%, #e5e7eb ${ecgScore}%)`,
          }}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0 - Poor</span>
          <span>50 - Average</span>
          <span>100 - Excellent</span>
        </div>
      </div>

      <div className="flex items-start mt-2">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 mr-2 accent-[#618943] border-green-400"
        />
        <label className="text-[#618943] font-medium">
          I agree to the{' '}
          <a href="#" className="underline text-[#618943]">
            Terms and Conditions
          </a>
        </label>
      </div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex justify-center"
      >
        <button
          type="submit"
          className="px-6 py-2 rounded-full text-white font-semibold shadow-lg transition-all"
          style={{
            background: 'linear-gradient(to right, #82AA57, #618943)',
            boxShadow: '0 6px 20px -5px #618943bb',
          }}
        >
          Submit Trade
        </button>
      </motion.div>
    </motion.form>
  );
}