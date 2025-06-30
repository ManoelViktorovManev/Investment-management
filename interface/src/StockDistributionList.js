
import React from 'react';
const StockDistributionList = ({ usersData }) => {


    return (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Arial' }}>
            <thead>
                <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
                    <th style={cellStyle}>Percentage</th>
                    <th style={cellStyle}>User</th>
                    <th style={cellStyle}>Number of stocks</th>
                    <th style={cellStyle}>Current Market Cap</th>
                </tr>
            </thead>
            <tbody>
                {usersData.map((user, index) => {

                    return (
                        <tr key={index}>

                            <td style={cellStyle}>{user.percentage}</td>
                            <td style={cellStyle}>{user.name}</td>
                            <td style={cellStyle}>{user.stockQuantity}</td>
                            <td style={cellStyle}>{user.currentMarketCap}</td>

                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};
const cellStyle = {
    padding: '8px',
    borderBottom: '1px solid #ddd',
};

export default StockDistributionList;