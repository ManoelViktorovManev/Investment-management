import React, { useState, useEffect } from "react";
import API_BASE_URI from "./EnvVar.js";

const ProfitAndTaxesComponent = ({ userId, superAdmin }) => {
    const [userProfitAndTaxes, setUserProfitAndTaxes] = useState([]);

    useEffect(() => {
        getUserProfitAndTaxes();
    }, [userId]);
    // Method that help to format the number 
    const formatPrice = (value) => {
        if (value === null || value === undefined) return null;
        return parseFloat(Number(value).toFixed(4)); // до 4 знака, без излишни нули
    };

    const getUserProfitAndTaxes = async () => {
        const res = await fetch(
            `${API_BASE_URI}/getProfitAndTaxesWithGrossProfit/${userId}`
        );
        if (res.ok) {
            const response = await res.json();

            const formattedData = response.map((tx) => ({
                ...tx,
                stockQuantity: formatPrice(tx.stockQuantity),
                boughtPrice: formatPrice(tx.boughtPrice),
                soldPrice: formatPrice(tx.soldPrice),
                grossProfit: formatPrice(tx.grossProfit),
                taxesToPayPercantage: formatPrice(tx.taxesToPayPercantage),
                taxesToPay: formatPrice(tx.taxesToPay),
                managementFeesToPay: formatPrice(tx.managementFeesToPay),
                managementFeesToPayPercantage: formatPrice(tx.managementFeesToPayPercantage),
                netProfit: formatPrice(tx.netProfit),
            }));
            setUserProfitAndTaxes(formattedData);
        }
    };

    const handleInputChange = (id, field, value) => {
        setUserProfitAndTaxes((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        [field]: value ? parseFloat(value) : null,
                    }
                    : item
            )
        );
    };

    const calculateValues = (id) => {
        setUserProfitAndTaxes((prev) =>
            prev.map((item) => {
                if (item.id !== id) return item;

                const grossProfit = parseFloat(item.grossProfit);
                const managementFees =
                    item.managementFeesToPayPercantage && !isNaN(item.managementFeesToPayPercantage)
                        ? (grossProfit * item.managementFeesToPayPercantage) / 100
                        : 0;
                const taxes =
                    item.taxesToPayPercantage && !isNaN(item.taxesToPayPercantage)
                        ? (grossProfit * item.taxesToPayPercantage) / 100
                        : 0;

                const net = grossProfit - managementFees - taxes;
                // console.log(item);
                const managementFeesPercent = item.managementFeesToPayPercantage == null ? 0 : item.managementFeesToPayPercantage;
                const taxesPercent = item.taxesToPayPercantage == null ? 0 : item.taxesToPayPercantage;
                return {
                    ...item,
                    managementFeesToPay: managementFees.toFixed(2),
                    taxesToPay: taxes.toFixed(2),
                    netProfit: net.toFixed(2),
                    managementFeesToPayPercantage: managementFeesPercent.toFixed(2),
                    taxesToPayPercantage: taxesPercent.toFixed(2)
                };
            })
        );
    };

    // handle here because it is always true
    const handlePayed = (id) => {
        setUserProfitAndTaxes((prev) =>
            prev.map((item) =>
                // console.log();
                item.id === id ? { ...item, isPayed: !item.isPayed } : item
            )
        );
    };

    const handleUpdateToCurrentState = async () => {
        const response = await fetch(`${API_BASE_URI}/updateProfitAndTaxes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                currentData: userProfitAndTaxes,
                superUserId: superAdmin
            })
        });
    };



    return (
        <div className="p-4 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">User Profit & Taxes</h2>

            {userProfitAndTaxes.length === 0 ? (
                <p className="text-gray-500">No profits found.</p>
            ) : (
                <>
                    <button
                        onClick={() => handleUpdateToCurrentState()}
                        className={`px-2 py-1 rounded text-white}`}
                    >
                        Update all to the current state
                    </button>
                    <table className="min-w-full border-collapse border border-gray-300 text-sm text-left">

                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border border-gray-300 px-2 py-1">Stock</th>
                                <th className="border border-gray-300 px-2 py-1">Broker</th>
                                <th className="border border-gray-300 px-2 py-1">Currency</th>
                                <th className="border border-gray-300 px-2 py-1">Quantity</th>
                                <th className="border border-gray-300 px-2 py-1">Bought Price</th>
                                <th className="border border-gray-300 px-2 py-1">Sold Price</th>
                                <th className="border border-gray-300 px-2 py-1">Gross Profit</th>
                                {superAdmin != userId && (
                                    <th className="border border-gray-300 px-2 py-1">Mgmt Fee %</th>
                                )}

                                <th className="border border-gray-300 px-2 py-1">Taxes %</th>
                                {superAdmin != userId && (
                                    <th className="border border-gray-300 px-2 py-1">Mgmt Fees</th>
                                )}

                                <th className="border border-gray-300 px-2 py-1">Taxes</th>
                                <th className="border border-gray-300 px-2 py-1">Net Profit</th>
                                <th className="border border-gray-300 px-2 py-1">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userProfitAndTaxes.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-2 py-1">
                                        {item.stockName}
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        {item.portfolioName}
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        {item.currencyName}
                                    </td>

                                    <td className="border border-gray-300 px-2 py-1">
                                        {item.stockQuantity}
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        {item.boughtPrice}
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                        {item.soldPrice}
                                    </td>
                                    {/* to make it red and green */}
                                    <td className="border border-gray-300 px-2 py-1">
                                        {item.grossProfit}
                                    </td>
                                    {item.grossProfit > 0 && (
                                        <>
                                            {superAdmin != userId && (
                                                <td className="border border-gray-300 px-2 py-1">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.managementFeesToPayPercantage ?? ""}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                item.id,
                                                                "managementFeesToPayPercantage",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="border rounded p-1 w-20"
                                                    />
                                                </td>
                                            )}

                                            <td className="border border-gray-300 px-2 py-1">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.taxesToPayPercantage ?? ""}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            item.id,
                                                            "taxesToPayPercantage",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="border rounded p-1 w-20"
                                                />
                                            </td>
                                            {superAdmin != userId && (
                                                <td className="border border-gray-300 px-2 py-1">
                                                    {item.managementFeesToPay ?? "-"}
                                                </td>
                                            )}
                                            <td className="border border-gray-300 px-2 py-1">
                                                {item.taxesToPay ?? "-"}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-1">
                                                {item.netProfit ?? "-"}
                                            </td>
                                            <td className="border border-gray-300 px-2 py-1 space-x-2">
                                                <button
                                                    onClick={() => calculateValues(item.id)}

                                                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                                >
                                                    Calculate
                                                </button>
                                                <button
                                                    onClick={() => handlePayed(item.id)}
                                                    className={`px-2 py-1 rounded text-white ${item.isPayed ? "bg-green-500" : "bg-gray-500 hover:bg-gray-600"
                                                        }`}
                                                >
                                                    {item.isPayed ? "Payed" : "Not Payed"}
                                                </button>
                                            </td>
                                        </>
                                    )}

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>

            )}
        </div>
    );
};

export default ProfitAndTaxesComponent;
