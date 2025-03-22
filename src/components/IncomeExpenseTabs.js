import React, { useState } from 'react';

const IncomeExpenseTabs = ({ setTab }) => {
    const [activeTab, setActiveTab] = useState('income'); // Default to income tab

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setTab(tab); // Pass selected tab to parent component
    };

    return (
        <div className="flex border-b">
            <button
                className={`py-2 px-4 ${activeTab === 'income' ? 'border-b-2 border-blue-500' : ''}`}
                onClick={() => handleTabChange('income')}
            >
                Income
            </button>
            <button
                className={`py-2 px-4 ${activeTab === 'expense' ? 'border-b-2 border-blue-500' : ''}`}
                onClick={() => handleTabChange('expense')}
            >
                Expense
            </button>
        </div>
    );
};

export default IncomeExpenseTabs;
