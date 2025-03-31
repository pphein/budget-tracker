import React, { useState, useEffect } from 'react';
import IncomeExpenseTabs from './components/IncomeExpenseTabs';
import TagInput from './components/TagInput';
import RecordList from './components/RecordList';
import Filter from './components/Filter';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { addTransaction, getTransactions, deleteTransaction, editTransaction, getTags, addTag, deleteTag } from "./db";

const App = () => {
    const [tab, setTab] = useState('income'); // Default to income
    console.log("Tab >>",tab);

    const [type, setType] = useState(tab);
    console.log("type >> ", type);

    const loadTags = async () => {
      const data = await getTags();
      console.log("Tags from DB >> ", data);
      const tagsByType = data.filter((t) => t.type === tab).map((t) => t);
      console.log("Tags by filter >> ", tagsByType);
      setTags(tagsByType);
      setTag(activeTab != 'balance' ? tagsByType[0].name : [])
    }
    
    const [tags, setTags] = useState([]);
    const [tag, setTag] = useState('');

    console.log("Tags forrrrr >> ", tags);
    console.log("Tag forrrrr >> ", tag);

    const currentDateTime = new Date().toISOString().slice(0, 16);
    console.log("Current Date Time >> ", currentDateTime);

    const [selectedTag, setSelectedTag] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
    const [endDate, setEndDate] = useState(currentDateTime);
    const [activeTab, setActiveTab] = useState(tab); // Default to income tab
    console.log("activeTab >> ", activeTab);

    const [transactions, setTransactions] = useState([]);
    console.log("Transactions >> ", transactions);

    const [amount, setAmount] = useState("");
    console.log("amount >>", amount);

    const [newTag, setNewTag] = useState('');
    // Get current date-time in YYYY-MM-DDTHH:MM format (for input type="datetime-local")
    // const getCurrentDateTime = () => {
    //   const now = new Date();
    //   return now.toISOString().slice(0, 16); // Format: "YYYY-MM-DDTHH:MM"
    // };

    const [date, setDate] = useState(currentDateTime);
    console.log("date >>", date);

    const handleAddTransaction = async () => {
      if (!amount) return alert("Please enter an amount");

      const newTransaction = { type, tag, amount: parseFloat(amount), date };
      await addTransaction(newTransaction);
      loadTransactions(); // Refresh list
      setAmount("");
    };

    const handleDeleteTransaction = async (id) => {
      await deleteTransaction(id);
      loadTransactions();
    };
    
    const handleEditTransaction = async (id, oldData) => {
      const updatedAmount = prompt("Enter new amount", oldData.amount);
      if (!updatedAmount) return alert("Amount is required!");
      await editTransaction(id, { amount: parseFloat(updatedAmount) });
      loadTransactions();
    };

    const loadTransactions = async () => {
      const data = await getTransactions();
      setTransactions(data);
    };

    // const loadTags = async (tab) => {
    //   const data = await getTags();
    //   console.log("Tags from DB >> ", data);
    //   const tagsByType = data.filter((t) => t.type === tab).map((t) => t);
    //   setTags(tagsByType);
    //   console.log("Tags by tab >> ", tagsByType);
    // }

    useEffect(() => {
      loadTransactions();
      loadTags();
    }, [tab]);
  
    const createTag = async (e) => {
      e.preventDefault();
      if (!newTag) return alert("Tag is required!");
      const newTagdata = { name: newTag, type: tab };
      await addTag(newTagdata);
      loadTags(); // Refresh list
      setNewTag("");
    };

    const handleDeleteTag = async (id) => {
      await deleteTag(id);
      loadTags();
    }
  
    const formatDateTime = (isoString) => {
      const dateObj = new Date(isoString);
      // return `${dateObj.toLocaleTimeString("en-US", { 
      //     timeZone: "Asia/Yangon",
      //     year: "numeric",
      //     month: "long",
      //     day: "2-digit",
      //     hour: "2-digit",
      //     minute: "2-digit",
      // })}`;
      // return dateObj.toLocaleString();
      // Adjust the time difference for Asia/Yangon (UTC+6:30)
      dateObj.setMinutes(dateObj.getMinutes() + 392); // Add 390 minutes (6 hours and 30 minutes)
      return dateObj.toLocaleString("en-US", {
          year: "numeric",
          month: "numeric",
          day: "2-digit",
          // hour: "2-digit",
          // minute: "2-digit",
      });
      
    };

    // const addTransaction = (e) => {
    //   e.preventDefault();
    //   if (!type || !tag || !amount || !date) return alert("Some fields are required!");
  
    //   const newTransaction = { type, tag, amount: parseFloat(amount), date };
    //   const updatedTransactions = [...transactions, newTransaction];
  
    //   setTransactions(updatedTransactions);
    //   console.log("Updated Transaction >> ", updatedTransactions);

    //   localStorage.setItem("budget-data", JSON.stringify(updatedTransactions));
    //   console.log("Local Storage >> ", JSON.parse(localStorage.getItem("budget-data")));
  
    //   setAmount("");
    // };
    
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setTab(tab); // Pass selected tab to parent component
        setType(tab);
    };

    const filteredRecords = transactions.filter((record) => {
      const typeMatch = record.type === type;
      const tagMatch = selectedTag ? record.tag === selectedTag : true;
      const dateMatch =  (!startDate || new Date(record.date) >= new Date(startDate)) &&
             (!endDate || new Date(record.date) <= new Date(endDate));
      return typeMatch && tagMatch && dateMatch;
    });
    console.log("Transactions to filter >>>>> ", transactions);
    console.log("filteredRecords >> ", filteredRecords);
    console.log("Tags for app >> ", tags);
    return (
        <div className="m-auto flex flex-col justify-center items-center">
            <div className="flex justify-between border-b bg-gray-100 px-10">
                <button
                    className={`py-2 px-8 ${activeTab === 'income' ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={() => handleTabChange('income')}
                >
                    Income
                </button>
                <button
                    className={`py-2 px-8 ${activeTab === 'expense' ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={() => handleTabChange('expense')}
                >
                    Expense
                </button>
                <button
                    className={`py-2 px-8 ${activeTab === 'balance' ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={() => handleTabChange('balance')}
                >
                    Balance
                </button>
              </div>
              <div className="my-4 flex flex-row">
                  <h2 className="text-xl font-bold my-2 mx-2 text-blue-500">New Tag: </h2>
                  <div className="flex space-x-2">
                      <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add custom tag"
                          className="border px-2 py-1 rounded"
                      />
                      <button onClick={createTag} className="px-4 py-2 bg-blue-500 text-white rounded">
                          Add
                      </button>
                  </div>
              </div>

              {/* Transaction Form */}
              <div className="space-3 mb-3">
                <div className='flex space-x-2 flex-row justify-between items-end'>
                  <div style={{display: "none"}}>
                    <label className="block">Type:</label>
                    <select value={type} onChange={(e) => setType(e.target.value)} className="p-2 border rounded">
                      <option value={tab}>{tab}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block">Tag:</label>
                    <select value={tag} onChange={(e) => setTag(e.target.value)} className="p-2 border rounded">
                      {tags.map((t) => (
                          <option key={t.id} value={t.name}> {t.name}</option>                        
                        ))
                      }
                    </select>
                  </div>
                  <div>
                    <label className="block">Date:</label>
                    {/* <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2 border rounded"/> */}
                    <DatePicker selected={date} onChange={(date) => setDate(formatDateTime(date))} dateFormat="dd-MM-YYYY" showIcon className="w-32 p-2 border rounded" />
                  </div>
                  <div>
                    <label className="block">Amount:</label>
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => {
                        const input = e.target.value;
                        if (/^[0-9+\s]*$/.test(input)) {
                          setAmount(input);
                        }
                      }}
                      onBlur={(e) => {
                        try {
                          const result = eval(e.target.value.replace(/\s+/g, ''));
                          if (!isNaN(result)) {
                            setAmount(result.toString());
                          }
                        } catch {
                          alert("Invalid expression");
                        }
                      }}
                      className="w-24 p-2 border rounded"
                    />
                  </div>
                  <div>
                    <button onClick={handleAddTransaction} type="submit" className={`w-full ${tab === 'income' ? 'bg-green-500' : 'bg-red-500'} text-white p-2 rounded`}>
                    Save
                  </button>
                  </div>
                </div>

                {/* <div className='flex space-x-2 flex-row justify-between items-end'>
                  <div>
                    <label className="block">Amount:</label>
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => {
                        const input = e.target.value;
                        if (/^[0-9+\s]*$/.test(input)) {
                          setAmount(input);
                        }
                      }}
                      onBlur={(e) => {
                        try {
                          const result = eval(e.target.value.replace(/\s+/g, ''));
                          if (!isNaN(result)) {
                            setAmount(result.toString());
                          }
                        } catch {
                          alert("Invalid expression");
                        }
                      }}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <button onClick={handleAddTransaction} type="submit" className={`w-full ${tab === 'income' ? 'bg-green-500' : 'bg-red-500'} text-white p-2 rounded`}>
                    Save
                  </button>
                  </div>
                </div> */}
              </div>
              <div className='bg-gray-200 p-4 mt-4'>
                <Filter
                    tags={tags}
                    selectedTag={selectedTag}
                    setSelectedTag={setSelectedTag}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={formatDateTime(endDate)}
                    setEndDate={setEndDate}
                    formatDateTime={formatDateTime}
                />

                <RecordList className="mt-16" type={type} records={filteredRecords} handleDeleteTransaction={handleDeleteTransaction} handleEditTransaction={handleEditTransaction} formatDateTime={formatDateTime} />
              </div>
        </div>
    );
};

export default App;

