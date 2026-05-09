import React, { useState } from 'react';

const EMPTY_FORM = {
  company: '',
  shares: '',
  buyDate: '',
  buyRate: '',
  buyPrice: '',
  buyCommission: '',
  sellDate: '',
  sellRate: '',
  sellPrice: '',
  sellCommission: '',
};

function calculate(form, defaultCurrency) {
  const shares       = Number(form.shares);
  const buyRate      = Number(form.buyRate);
  const buyPrice     = Number(form.buyPrice);
  const buyComm      = Number(form.buyCommission);
  const sellRate     = Number(form.sellRate);
  const sellPrice    = Number(form.sellPrice);
  const sellComm     = Number(form.sellCommission);

  const investedStock  = shares * buyPrice;
  const investedEUR    = investedStock * buyRate;

  const sellStock      = shares * sellPrice;
  const sellEUR        = sellStock * sellRate;

  const commSellEUR    = sellComm * sellRate;

  const grossProfit    = sellEUR - investedEUR;

  // % WITHOUT commission
  const pctWithoutComm = (grossProfit / investedEUR) * 100;

  // % WITH commission — sell commission converted and subtracted from proceeds
  const pctWithComm    = ((sellEUR - commSellEUR - investedEUR) / investedEUR) * 100;

  // Bulgarian NAP: 10% normative expense deduction, then 10% tax
  const taxableIncome  = grossProfit * 0.9;
  const tax            = taxableIncome * 0.1;
  const netProfit      = grossProfit - tax;

  // % WITH taxes (clean)
  const pctWithTaxes   = (netProfit / investedEUR) * 100;

  return {
    company:       form.company,
    shares,
    buyDate:       form.buyDate,
    sellDate:      form.sellDate,
    investedStock: investedStock.toFixed(2),
    investedEUR:   investedEUR.toFixed(2),
    sellStock:     sellStock.toFixed(2),
    sellEUR:       sellEUR.toFixed(2),
    grossProfit:   grossProfit.toFixed(2),
    pctWithoutComm: pctWithoutComm.toFixed(2),
    pctWithComm:   pctWithComm.toFixed(2),
    pctWithTaxes:  pctWithTaxes.toFixed(2),
    taxableIncome: taxableIncome.toFixed(2),
    tax:           tax.toFixed(2),
    netProfit:     netProfit.toFixed(2),
    isProfit:      grossProfit >= 0,
    defaultCurrency,
  };
}

const TaxCalculator = ({ data }) => {
  const defaultCurrency = data?.settings?.[0]?.defaultCurrency ?? 'EUR';

  const [form, setForm]       = useState(EMPTY_FORM);
  const [entries, setEntries] = useState([]);
  const [error, setError]     = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleAdd() {
    // Basic validation
    const required = ['company','shares','buyDate','buyRate','buyPrice','buyCommission','sellDate','sellRate','sellPrice','sellCommission'];
    for (const key of required) {
      if (form[key] === '' || form[key] === null) {
        setError(`Please fill in all fields (missing: ${key})`);
        return;
      }
    }
    setError('');
    const result = calculate(form, defaultCurrency);
    setEntries(prev => [...prev, result]);
    setForm(EMPTY_FORM);
  }

  function handleDelete(index) {
    setEntries(prev => prev.filter((_, i) => i !== index));
  }

  const totalTax     = entries.reduce((sum, e) => sum + Number(e.tax), 0);
  const totalNet     = entries.reduce((sum, e) => sum + Number(e.netProfit), 0);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Tax Calculator</h2>

      {/* ── INPUT FORM ── */}
      <div className="border rounded p-4 bg-gray-50 max-w-3xl mb-6">
        <h3 className="font-semibold mb-3">New sale</h3>

        <div className="grid grid-cols-2 gap-3">
          {/* Company */}
          <div className="col-span-2">
            <label className="text-sm font-medium">Company name</label>
            <input
              type="text" name="company" value={form.company}
              onChange={handleChange} placeholder="e.g. GOOGL"
              className="w-full p-2 border rounded mt-1"
            />
          </div>

          {/* Shares */}
          <div className="col-span-2">
            <label className="text-sm font-medium">Number of shares</label>
            <input
              type="number" name="shares" value={form.shares}
              onChange={handleChange} placeholder="10"
              className="w-full p-2 border rounded mt-1"
            />
          </div>

          {/* ── BUY SIDE ── */}
          <div className="col-span-2 border-t pt-2 mt-1">
            <span className="text-sm font-semibold text-blue-700">BUY</span>
          </div>

          <div>
            <label className="text-sm font-medium">Day of buy</label>
            <input
              type="date" name="buyDate" value={form.buyDate}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Currency rate at buy (stock → {defaultCurrency})</label>
            <input
              type="number" name="buyRate" value={form.buyRate}
              onChange={handleChange} placeholder="0.88028" step="0.00001"
              className="w-full p-2 border rounded mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Buy price per share</label>
            <input
              type="number" name="buyPrice" value={form.buyPrice}
              onChange={handleChange} placeholder="150" step="0.01"
              className="w-full p-2 border rounded mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Commission at buy (stock currency)</label>
            <input
              type="number" name="buyCommission" value={form.buyCommission}
              onChange={handleChange} placeholder="2" step="0.01"
              className="w-full p-2 border rounded mt-1"
            />
          </div>

          {/* ── SELL SIDE ── */}
          <div className="col-span-2 border-t pt-2 mt-1">
            <span className="text-sm font-semibold text-red-700">SELL</span>
          </div>

          <div>
            <label className="text-sm font-medium">Day of sell</label>
            <input
              type="date" name="sellDate" value={form.sellDate}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Currency rate at sell (stock → {defaultCurrency})</label>
            <input
              type="number" name="sellRate" value={form.sellRate}
              onChange={handleChange} placeholder="0.8654" step="0.00001"
              className="w-full p-2 border rounded mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Sell price per share</label>
            <input
              type="number" name="sellPrice" value={form.sellPrice}
              onChange={handleChange} placeholder="299" step="0.01"
              className="w-full p-2 border rounded mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Commission at sell (stock currency)</label>
            <input
              type="number" name="sellCommission" value={form.sellCommission}
              onChange={handleChange} placeholder="2" step="0.01"
              className="w-full p-2 border rounded mt-1"
            />
          </div>
        </div>

        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

        <button
          onClick={handleAdd}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Calculate & Add
        </button>
      </div>

      {/* ── RESULTS TABLE ── */}
      {entries.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="text-sm border border-gray-300 bg-white rounded min-w-max">
              <thead className="bg-gray-200">
                <tr>
                  {[
                    'Company', 'Shares', 'Buy date', 'Sell date',
                    'Invested (stock)', `Invested (${defaultCurrency})`,
                    'Sell sum (stock)', `Sell sum (${defaultCurrency})`,
                    'Profit / Loss', '% no comm', '% with comm', '% with taxes',
                    `Taxable income (${defaultCurrency})`,
                    `Tax (${defaultCurrency})`,
                    `Net profit (${defaultCurrency})`,
                    ''
                  ].map(h => (
                    <th key={h} className="px-3 py-2 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr key={i} className={`border-t ${e.isProfit ? 'bg-green-50' : 'bg-red-50'}`}>
                    <td className="px-3 py-2 font-semibold">{e.company}</td>
                    <td className="px-3 py-2">{e.shares}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{e.buyDate}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{e.sellDate}</td>
                    <td className="px-3 py-2">{e.investedStock}</td>
                    <td className="px-3 py-2">{e.investedEUR}</td>
                    <td className="px-3 py-2">{e.sellStock}</td>
                    <td className="px-3 py-2">{e.sellEUR}</td>
                    <td className={`px-3 py-2 font-semibold ${e.isProfit ? 'text-green-700' : 'text-red-700'}`}>
                      {e.grossProfit}
                    </td>
                    <td className={`px-3 py-2 ${e.isProfit ? 'text-green-700' : 'text-red-700'}`}>
                      {e.pctWithoutComm}%
                    </td>
                    <td className={`px-3 py-2 ${e.isProfit ? 'text-green-700' : 'text-red-700'}`}>
                      {e.pctWithComm}%
                    </td>
                    <td className={`px-3 py-2 ${e.isProfit ? 'text-green-700' : 'text-red-700'}`}>
                      {e.pctWithTaxes}%
                    </td>
                    <td className="px-3 py-2">{e.taxableIncome}</td>
                    <td className="px-3 py-2 font-semibold text-orange-700">{e.tax}</td>
                    <td className={`px-3 py-2 font-semibold ${e.isProfit ? 'text-green-700' : 'text-red-700'}`}>
                      {e.netProfit}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleDelete(i)}
                        className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── TOTALS ── */}
          <div className="mt-4 flex gap-6">
            <div className="p-3 border rounded bg-orange-50">
              <p className="text-sm text-gray-600">Total tax to pay ({defaultCurrency})</p>
              <p className="text-xl font-bold text-orange-700">{totalTax.toFixed(2)}</p>
            </div>
            <div className={`p-3 border rounded ${totalNet >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="text-sm text-gray-600">Total net profit ({defaultCurrency})</p>
              <p className={`text-xl font-bold ${totalNet >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {totalNet.toFixed(2)}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export { TaxCalculator };
