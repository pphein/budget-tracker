// import React, { useState, useEffect } from 'react';
// import RecordList from './components/RecordList';
// import Filter from './components/Filter';
// import DatePicker from 'react-datepicker';
// import "react-datepicker/dist/react-datepicker.css";
// import { addTransaction, getTransactions, deleteTransaction, editTransaction, getTags, addTag, deleteTag } from "./db";

// const App = () => {
//     const [tab, setTab] = useState('income'); // Default to income
//     console.log("Tab >>",tab);

//     const [type, setType] = useState(tab);
//     console.log("type >> ", type);

//     const loadTags = async () => {
//       const data = await getTags();
//       console.log("Tags from DB >> ", data);
//       const tagsByType = data.filter((t) => t.type === tab).map((t) => t);
//       console.log("Tags by filter >> ", tagsByType);
//       setTags(tagsByType);
//       setTag(activeTab != 'balance' ? tagsByType[0].name : [])
//     }
    
//     const [tags, setTags] = useState([]);
//     const [tag, setTag] = useState('');

//     console.log("Tags forrrrr >> ", tags);
//     console.log("Tag forrrrr >> ", tag);

//     const currentDateTime = new Date().toISOString().slice(0, 16);
//     console.log("Current Date Time >> ", currentDateTime);

//     const [selectedTag, setSelectedTag] = useState('');
//     const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
//     const [endDate, setEndDate] = useState(currentDateTime);
//     const [activeTab, setActiveTab] = useState(tab); // Default to income tab
//     console.log("activeTab >> ", activeTab);

//     const [transactions, setTransactions] = useState([]);
//     console.log("Transactions >> ", transactions);

//     const [amount, setAmount] = useState("");
//     console.log("amount >>", amount);

//     const [newTag, setNewTag] = useState('');

//     const [date, setDate] = useState(currentDateTime);
//     console.log("date >>", date);

//     const handleAddTransaction = async () => {
//       if (!amount) return alert("Please enter an amount");

//       const newTransaction = { type, tag, amount: parseFloat(amount), date };
//       await addTransaction(newTransaction);
//       loadTransactions(); // Refresh list
//       setAmount("");
//     };

//     const handleDeleteTransaction = async (id) => {
//       await deleteTransaction(id);
//       loadTransactions();
//     };
    
//     const handleEditTransaction = async (id, oldData) => {
//       const updatedAmount = prompt("Enter new amount", oldData.amount);
//       if (!updatedAmount) return alert("Amount is required!");
//       await editTransaction(id, { amount: parseFloat(updatedAmount) });
//       loadTransactions();
//     };

//     const loadTransactions = async () => {
//       const data = await getTransactions();
//       setTransactions(data);
//     };

//     useEffect(() => {
//       loadTransactions();
//       loadTags();
//     }, [tab]);
  
//     const createTag = async (e) => {
//       e.preventDefault();
//       if (!newTag) return alert("Tag is required!");
//       const newTagdata = { name: newTag, type: tab };
//       await addTag(newTagdata);
//       loadTags(); // Refresh list
//       setNewTag("");
//     };

//     const handleDeleteTag = async (id) => {
//       await deleteTag(id);
//       loadTags();
//     }
  
//     const formatDateTime = (isoString) => {
//       const dateObj = new Date(isoString);
//       // Adjust the time difference for Asia/Yangon (UTC+6:30)
//       dateObj.setMinutes(dateObj.getMinutes() + 392); // Add 390 minutes (6 hours and 30 minutes)
//       return dateObj.toLocaleString("en-US", {
//           year: "numeric",
//           month: "numeric",
//           day: "2-digit",
//           // hour: "2-digit",
//           // minute: "2-digit",
//       });
      
//     };
    
//     const handleTabChange = (tab) => {
//         setActiveTab(tab);
//         setTab(tab); // Pass selected tab to parent component
//         setType(tab);
//     };

//     const filteredRecords = transactions.filter((record) => {
//       const typeMatch = record.type === type;
//       const tagMatch = selectedTag ? record.tag === selectedTag : true;
//       const dateMatch =  (!startDate || new Date(record.date) >= new Date(startDate)) &&
//              (!endDate || new Date(record.date) <= new Date(endDate));
//       return typeMatch && tagMatch && dateMatch;
//     });
//     console.log("Transactions to filter >>>>> ", transactions);
//     console.log("filteredRecords >> ", filteredRecords);
//     console.log("Tags for app >> ", tags);
//     return (
//         <div className="m-auto flex flex-col justify-center items-center">
//             <div className="flex justify-between border-b bg-gray-100 px-10">
//                 <button
//                     className={`py-2 px-8 ${activeTab === 'income' ? 'border-b-2 border-blue-500' : ''}`}
//                     onClick={() => handleTabChange('income')}
//                 >
//                     Income
//                 </button>
//                 <button
//                     className={`py-2 px-8 ${activeTab === 'expense' ? 'border-b-2 border-blue-500' : ''}`}
//                     onClick={() => handleTabChange('expense')}
//                 >
//                     Expense
//                 </button>
//                 <button
//                     className={`py-2 px-8 ${activeTab === 'balance' ? 'border-b-2 border-blue-500' : ''}`}
//                     onClick={() => handleTabChange('balance')}
//                 >
//                     Balance
//                 </button>
//               </div>
//               { activeTab !== 'balance' && (
//                 <div className="my-4 flex flex-row">
//                   <h2 className="text-xl font-bold my-2 mx-2 text-blue-500">New Tag: </h2>
//                   <div className="flex space-x-2">
//                       <input
//                           type="text"
//                           value={newTag}
//                           onChange={(e) => setNewTag(e.target.value)}
//                           placeholder="Add custom tag"
//                           className="border px-2 py-1 rounded"
//                       />
//                       <button onClick={createTag} className="px-4 py-2 bg-blue-500 text-white rounded">
//                           Add
//                       </button>
//                   </div>
//                 </div>
//               )}

//               {/* Transaction Form */}
//               { activeTab !== 'balance' && (
//                 <div className="space-3 mb-3">
//                   <div className='flex space-x-2 flex-row justify-between items-end'>
//                     <div style={{display: "none"}}>
//                       <label className="block">Type:</label>
//                       <select value={type} onChange={(e) => setType(e.target.value)} className="p-2 border rounded">
//                         <option value={tab}>{tab}</option>
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block">Tag:</label>
//                       <select value={tag} onChange={(e) => setTag(e.target.value)} className="p-2 border rounded">
//                         {tags.map((t) => (
//                             <option key={t.id} value={t.name}> {t.name}</option>                        
//                           ))
//                         }
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block">Date:</label>
//                       <DatePicker selected={date} onChange={(date) => setDate(formatDateTime(date))} dateFormat="dd-MM-YYYY" showIcon className="w-32 p-2 border rounded" />
//                     </div>
//                     <div>
//                       <label className="block">Amount:</label>
//                       <input
//                         type="text"
//                         value={amount}
//                         onChange={(e) => {
//                           const input = e.target.value;
//                           if (/^[0-9+\s]*$/.test(input)) {
//                             setAmount(input);
//                           }
//                         }}
//                         onBlur={(e) => {
//                           try {
//                             const result = eval(e.target.value.replace(/\s+/g, ''));
//                             if (!isNaN(result)) {
//                               setAmount(result.toString());
//                             }
//                           } catch {
//                             alert("Invalid expression");
//                           }
//                         }}
//                         className="w-24 p-2 border rounded"
//                       />
//                     </div>
//                     <div>
//                       <button onClick={handleAddTransaction} type="submit" className={`w-full ${tab === 'income' ? 'bg-green-500' : 'bg-red-500'} text-white p-2 rounded`}>
//                       Save
//                     </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//               {/* <div className='bg-gray-200 p-4 mt-4'>
//                 <Filter
//                     tags={tags}
//                     selectedTag={selectedTag}
//                     setSelectedTag={setSelectedTag}
//                     startDate={startDate}
//                     setStartDate={setStartDate}
//                     endDate={formatDateTime(endDate)}
//                     setEndDate={setEndDate}
//                     formatDateTime={formatDateTime}
//                 />

//                 <RecordList className="mt-16" type={type} records={filteredRecords} handleDeleteTransaction={handleDeleteTransaction} handleEditTransaction={handleEditTransaction} formatDateTime={formatDateTime} />
//               </div> */}
//               <div className="bg-gray-200 p-4 mt-4">
//                 {activeTab === "balance" ? (
//                   <div>
//                     <h2 className="text-xl font-bold mb-4 text-blue-500">Daily Balance</h2>
//                     <table className="w-full border-collapse border border-gray-400">
//                       <thead>
//                         <tr className="bg-gray-300">
//                           <th className="border border-gray-400 p-2">Date</th>
//                           <th className="border border-gray-400 p-2">Total Income</th>
//                           <th className="border border-gray-400 p-2">Total Expense</th>
//                           <th className="border border-gray-400 p-2">Net</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {Object.values(
//                           transactions.reduce((acc, t) => {
//                             const day = new Date(t.date).toISOString().split("T")[0];
//                             if (!acc[day]) acc[day] = { date: day, income: 0, expense: 0 };
//                             if (t.type === "income") acc[day].income += parseFloat(t.amount || 0);
//                             if (t.type === "expense") acc[day].expense += parseFloat(t.amount || 0);
//                             return acc;
//                           }, {})
//                         ).map((row) => (
//                           <tr key={row.date}>
//                             <td className="border border-gray-400 p-2">{row.date}</td>
//                             <td className="border border-gray-400 p-2 text-green-600">${row.income}</td>
//                             <td className="border border-gray-400 p-2 text-red-600">${row.expense}</td>
//                             <td className="border border-gray-400 p-2 font-bold text-blue-600">${row.income - row.expense}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 ) : (
//                   <>
//                     <Filter
//                       tags={tags}
//                       selectedTag={selectedTag}
//                       setSelectedTag={setSelectedTag}
//                       startDate={startDate}
//                       setStartDate={setStartDate}
//                       endDate={formatDateTime(endDate)}
//                       setEndDate={setEndDate}
//                       formatDateTime={formatDateTime}
//                     />
//                     <RecordList
//                       className="mt-16"
//                       type={type}
//                       records={filteredRecords}
//                       handleDeleteTransaction={handleDeleteTransaction}
//                       handleEditTransaction={handleEditTransaction}
//                       formatDateTime={formatDateTime}
//                     />
//                   </>
//                 )}
//               </div>
//         </div>
//     );
// };

// export default App;

import React, { useState, useEffect } from 'react';
import RecordList from './components/RecordList';
import Filter from './components/Filter';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { addTransaction, getTransactions, deleteTransaction, editTransaction, getTags, addTag, deleteTag } from "./db";

const App = () => {
    const [tab, setTab] = useState('income'); // Default to income
    const [type, setType] = useState(tab);

    const [tags, setTags] = useState([]);
    const [tag, setTag] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [amount, setAmount] = useState("");
    const [newTag, setNewTag] = useState('');
    const [transactions, setTransactions] = useState([]);

    const currentDateTime = new Date().toISOString().slice(0, 16);
    const [date, setDate] = useState(currentDateTime);
    const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
    const [endDate, setEndDate] = useState(currentDateTime);
    const [activeTab, setActiveTab] = useState(tab);

    const loadTags = async () => {
      const data = await getTags();
      const tagsByType = data.filter((t) => t.type === tab);
      setTags(tagsByType);
      setTag(activeTab !== 'balance' && tagsByType.length > 0 ? tagsByType[0].name : '');
    };

    const loadTransactions = async () => {
      const data = await getTransactions();
      setTransactions(data);
    };

    useEffect(() => {
      loadTransactions();
      loadTags();
    }, [tab]);

    const handleAddTransaction = async () => {
      if (!amount) return alert("Please enter an amount");
      const newTransaction = { type, tag, amount: parseFloat(amount), date };
      await addTransaction(newTransaction);
      loadTransactions();
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

    const createTag = async (e) => {
      e.preventDefault();
      if (!newTag) return alert("Tag is required!");
      const newTagdata = { name: newTag, type: tab };
      await addTag(newTagdata);
      loadTags();
      setNewTag("");
    };

    const handleDeleteTag = async (id) => {
      await deleteTag(id);
      loadTags();
    };

    const formatDateTime = (isoString) => {
      const dateObj = new Date(isoString);
      dateObj.setMinutes(dateObj.getMinutes() + 392);
      return dateObj.toLocaleString("en-US", {
          year: "numeric",
          month: "numeric",
          day: "2-digit",
      });
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setTab(tab);
        setType(tab);
    };

    const filteredRecords = transactions.filter((record) => {
      const typeMatch = record.type === type;
      const tagMatch = selectedTag ? record.tag === selectedTag : true;
      const dateMatch =  (!startDate || new Date(record.date) >= new Date(startDate)) &&
             (!endDate || new Date(record.date) <= new Date(endDate));
      return typeMatch && tagMatch && dateMatch;
    });

    return (
        <div className="m-auto flex flex-col justify-center items-center px-2 sm:px-4 md:px-8 w-full max-w-6xl">
            <div className="flex flex-row justify-between border-b bg-gray-100 w-full">
                <button
                    className={`py-2 px-4 sm:px-8 ${activeTab === 'income' ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={() => handleTabChange('income')}
                >
                    Income
                </button>
                <button
                    className={`py-2 px-4 sm:px-8 ${activeTab === 'expense' ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={() => handleTabChange('expense')}
                >
                    Expense
                </button>
                <button
                    className={`py-2 px-4 sm:px-8 ${activeTab === 'balance' ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={() => handleTabChange('balance')}
                >
                    Balance
                </button>
            </div>

            { activeTab !== 'balance' && (
              <div className="my-4 w-full flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                <h2 className="text-lg sm:text-xl font-bold my-2 text-blue-500">New Tag: </h2>
                <div className="flex flex-row w-full sm:w-auto sm:space-y-0 sm:space-x-2">
                    <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add custom tag"
                        className="border px-2 py-1 rounded w-full sm:w-auto"
                    />
                    <button onClick={createTag} className="px-2 py-2 bg-blue-500 text-white rounded w-full sm:w-auto">
                        Add
                    </button>
                </div>
              </div>
            )}

            { activeTab !== 'balance' && (
              <div className="space-3 mb-3 w-full">
                <div className="flex sm:flex-row flex-col  md:space-x-4 md:space-y-0 justify-center md:justify-around items-stretch md:items-end">
                  <div>
                    <label className="block">Tag:</label>
                    <select value={tag} onChange={(e) => setTag(e.target.value)} className="p-2 border rounded w-full">
                      {tags.map((t) => (
                          <option key={t.id} value={t.name}> {t.name}</option>                        
                        ))
                      }
                    </select>
                  </div>
                  <div>
                    <label className="block">Date:</label>
                    <DatePicker selected={date} onChange={(date) => setDate(formatDateTime(date))} dateFormat="dd-MM-YYYY" showIcon className="w-full p-2 border rounded" />
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
                      className="w-full md:w-32 p-2 border rounded"
                    />
                  </div>
                  <div className="flex items-end">
                    <button onClick={handleAddTransaction} type="submit" className={`w-full md:w-auto ${tab === 'income' ? 'bg-green-500' : 'bg-red-500'} text-white p-2 rounded`}>
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-200 p-2 sm:p-4 mt-4 w-full overflow-x-auto">
              {activeTab === "balance" ? (
                <div className="w-full">
                  <h2 className="text-lg sm:text-xl font-bold mb-4 text-blue-500">Daily Balance</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-400 text-sm sm:text-base">
                      <thead>
                        <tr className="bg-gray-300">
                          <th className="border border-gray-400 p-2">Date</th>
                          <th className="border border-gray-400 p-2">Total Income</th>
                          <th className="border border-gray-400 p-2">Total Expense</th>
                          <th className="border border-gray-400 p-2">Net</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.values(
                          transactions.reduce((acc, t) => {
                            const day = new Date(t.date).toISOString().split("T")[0];
                            if (!acc[day]) acc[day] = { date: day, income: 0, expense: 0 };
                            if (t.type === "income") acc[day].income += parseFloat(t.amount || 0);
                            if (t.type === "expense") acc[day].expense += parseFloat(t.amount || 0);
                            return acc;
                          }, {})
                        ).map((row) => (
                          <tr key={row.date}>
                            <td className="border border-gray-400 p-2">{row.date}</td>
                            <td className="border border-gray-400 p-2 text-green-600">${row.income}</td>
                            <td className="border border-gray-400 p-2 text-red-600">${row.expense}</td>
                            <td className="border border-gray-400 p-2 font-bold text-blue-600">${row.income - row.expense}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <>
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
                  <RecordList
                    className="mt-4"
                    type={type}
                    records={filteredRecords}
                    handleDeleteTransaction={handleDeleteTransaction}
                    handleEditTransaction={handleEditTransaction}
                    formatDateTime={formatDateTime}
                  />
                </>
              )}
            </div>
        </div>
    );
};

export default App;
