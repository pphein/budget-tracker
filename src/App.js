// import React, { useState, useEffect, useRef } from 'react';
// import RecordList from './components/RecordList';
// import Filter from './components/Filter';
// import DatePicker from 'react-datepicker';
// import "react-datepicker/dist/react-datepicker.css";
// import {
//   addTransaction,
//   getTransactions,
//   deleteTransaction,
//   editTransaction,
//   getTags,
//   addTag,
//   deleteTag,
// } from "./db";

// const App = () => {
//   const [tab, setTab] = useState('income'); // Default to income
//   const [type, setType] = useState(tab);

//   const [tags, setTags] = useState([]);
//   const [tag, setTag] = useState('');
//   const [selectedTag, setSelectedTag] = useState('');
//   const [amount, setAmount] = useState("");
//   const [newTag, setNewTag] = useState('');
//   const [transactions, setTransactions] = useState([]);

//   const currentDateTime = new Date().toISOString().slice(0, 16);
//   const [date, setDate] = useState(currentDateTime);
//   const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
//   const [endDate, setEndDate] = useState(currentDateTime);
//   const [activeTab, setActiveTab] = useState(tab);

//   const tabs = ['income', 'expense', 'balance'];
//   const touchStartX = useRef(null);
//   const touchStartY = useRef(null); // 👈 NEW: detect vertical swipes
//   const isScrolling = useRef(false);

//   // swipe handler
//   const handleTouchStart = (e) => {
//     const target = e.target.closest('.overflow-x-auto');
//     if (target) {
//       isScrolling.current = true;
//       return;
//     }
//     isScrolling.current = false;
//     touchStartX.current = e.touches[0].clientX;
//     touchStartY.current = e.touches[0].clientY; // 👈 save Y to filter vertical swipe
//   };

//   const handleTouchEnd = (e) => {
//     if (isScrolling.current) {
//       isScrolling.current = false;
//       return;
//     }

//     if (touchStartX.current === null || touchStartY.current === null) return;
//     const touchEndX = e.changedTouches[0].clientX;
//     const touchEndY = e.changedTouches[0].clientY;
//     const deltaX = touchEndX - touchStartX.current;
//     const deltaY = touchEndY - touchStartY.current;

//     // 👇 prevent false triggers if user swipes more vertically than horizontally
//     if (Math.abs(deltaY) > Math.abs(deltaX)) {
//       touchStartX.current = null;
//       touchStartY.current = null;
//       return;
//     }

//     if (Math.abs(deltaX) > 50) { // threshold
//       const currentIndex = tabs.indexOf(activeTab);
//       if (deltaX < 0 && currentIndex < tabs.length - 1) {
//         handleTabChange(tabs[currentIndex + 1]);
//       } else if (deltaX > 0 && currentIndex > 0) {
//         handleTabChange(tabs[currentIndex - 1]);
//       }
//     }
//     touchStartX.current = null;
//     touchStartY.current = null;
//   };

//   const loadTags = async () => {
//     const data = await getTags();
//     const tagsByType = data.filter((t) => t.type === tab);
//     setTags(tagsByType);
//     setTag(activeTab !== 'balance' && tagsByType.length > 0 ? tagsByType[0].name : '');
//   };

//   const loadTransactions = async () => {
//     const data = await getTransactions();
//     setTransactions(data);
//   };

//   useEffect(() => {
//     loadTransactions();
//     loadTags();
//   }, [tab]);

//   const handleAddTransaction = async () => {
//     if (!amount) return alert("Please enter an amount");
//     const newTransaction = { type, tag, amount: parseFloat(amount), date };
//     await addTransaction(newTransaction);
//     loadTransactions();
//     setAmount("");
//   };

//   const handleDeleteTransaction = async (id) => {
//     await deleteTransaction(id);
//     loadTransactions();
//   };

//   const handleEditTransaction = async (id, oldData) => {
//     const updatedAmount = prompt("Enter new amount", oldData.amount);
//     if (!updatedAmount) return alert("Amount is required!");
//     await editTransaction(id, { amount: parseFloat(updatedAmount) });
//     loadTransactions();
//   };

//   const createTag = async (e) => {
//     e.preventDefault();
//     if (!newTag) return alert("Tag is required!");
//     const newTagdata = { name: newTag, type: tab };
//     await addTag(newTagdata);
//     loadTags();
//     setNewTag("");
//   };

//   const handleDeleteTag = async (id) => {
//     await deleteTag(id);
//     loadTags();
//   };

//   const formatDateTime = (isoString) => {
//     const dateObj = new Date(isoString);
//     dateObj.setMinutes(dateObj.getMinutes() + 392);
//     return dateObj.toLocaleString("en-US", {
//       year: "numeric",
//       month: "numeric",
//       day: "2-digit",
//     });
//   };

//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//     setTab(tab);
//     setType(tab);
//   };

//   const filteredRecords = transactions.filter((record) => {
//     const typeMatch = record.type === type;
//     const tagMatch = selectedTag ? record.tag === selectedTag : true;
//     const dateMatch = (!startDate || new Date(record.date) >= new Date(startDate)) &&
//       (!endDate || new Date(record.date) <= new Date(endDate));
//     return typeMatch && tagMatch && dateMatch;
//   });

//   return (
//     <div
//       className="m-auto flex flex-col justify-center items-center px-2 sm:px-4 md:px-8 w-full max-w-6xl"
//       onTouchStart={handleTouchStart}
//       onTouchEnd={handleTouchEnd}
//     >
//       {/* --- Tab Buttons --- */}
//       <div className="flex flex-row justify-between border-b bg-gray-100 w-full">
//         {tabs.map((t) => (
//           <button
//             key={t}
//             className={`py-2 px-4 sm:px-8 ${activeTab === t ? 'border-b-2 border-blue-500' : ''}`}
//             onClick={() => handleTabChange(t)}
//           >
//             {t.charAt(0).toUpperCase() + t.slice(1)}
//           </button>
//         ))}
//       </div>

//       {/* --- New Tag Section --- */}
//       {activeTab !== 'balance' && (
//         <div className="my-4 w-full flex flex-col sm:flex-row sm:items-center sm:space-x-4">
//           <h2 className="text-lg sm:text-xl font-bold my-2 text-blue-500">New Tag: </h2>
//           <div className="flex flex-row w-full sm:w-auto sm:space-y-0 sm:space-x-2">
//             <input
//               type="text"
//               value={newTag}
//               onChange={(e) => setNewTag(e.target.value)}
//               placeholder="Add custom tag"
//               className="border px-2 py-1 rounded w-full sm:w-auto"
//             />
//             <button
//               onClick={createTag}
//               className="px-2 py-2 bg-blue-500 text-white rounded w-full sm:w-auto"
//             >
//               Add
//             </button>
//           </div>
//         </div>
//       )}

//       {/* --- Transaction Form --- */}
//       {activeTab !== 'balance' && (
//         <div className="space-3 mb-3 w-full">
//           <div className="flex sm:flex-row flex-col md:space-x-4 md:space-y-0 justify-center md:justify-around items-stretch md:items-end">
//             <div>
//               <label className="block">Tag:</label>
//               <select value={tag} onChange={(e) => setTag(e.target.value)} className="p-2 border rounded w-full">
//                 {tags.map((t) => (
//                   <option key={t.id} value={t.name}> {t.name}</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block">Date:</label>
//               <DatePicker
//                 selected={date}
//                 onChange={(date) => setDate(formatDateTime(date))}
//                 dateFormat="dd-MM-YYYY"
//                 showIcon
//                 className="w-full p-2 border rounded"
//               />
//             </div>
//             <div>
//               <label className="block">Amount:</label>
//               <input
//                 type="number"
//                 inputMode="decimal"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 className="w-full md:w-32 p-2 border rounded"
//               />
//             </div>
//             <div className="flex items-end">
//               <button
//                 onClick={handleAddTransaction}
//                 type="submit"
//                 className={`w-full md:w-auto ${tab === 'income' ? 'bg-green-500' : 'bg-red-500'} text-white p-2 rounded`}
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* --- Transaction Display Section --- */}
      
//         {activeTab === "balance" ? (
//           <div className="bg-gray-200 p-2 sm:p-4 mt-4 w-full">
//             <div className="w-full">
//               <h2 className="text-lg sm:text-xl font-bold mb-4 text-blue-500">Daily Balance</h2>
//               <div className="">
//                 <table className="w-full border-collapse border border-gray-400 text-sm sm:text-base">
//                   <thead>
//                     <tr className="bg-gray-300">
//                       <th className="border border-gray-400 p-2">Date</th>
//                       <th className="border border-gray-400 p-2">Total Income</th>
//                       <th className="border border-gray-400 p-2">Total Expense</th>
//                       <th className="border border-gray-400 p-2">Net</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {Object.values(
//                       transactions.reduce((acc, t) => {
//                         const day = new Date(t.date).toISOString().split("T")[0];
//                         if (!acc[day]) acc[day] = { date: day, income: 0, expense: 0 };
//                         if (t.type === "income") acc[day].income += parseFloat(t.amount || 0);
//                         if (t.type === "expense") acc[day].expense += parseFloat(t.amount || 0);
//                         return acc;
//                       }, {})
//                     ).map((row) => (
//                       <tr key={row.date}>
//                         <td className="border border-gray-400 p-2">{row.date}</td>
//                         <td className="border border-gray-400 p-2 text-green-600">${row.income}</td>
//                         <td className="border border-gray-400 p-2 text-red-600">${row.expense}</td>
//                         <td className="border border-gray-400 p-2 font-bold text-blue-600">${row.income - row.expense}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//           ) : (
//           <div className="bg-gray-200 p-2 sm:p-4 mt-4 w-full overflow-x-auto">
//             <>
//               <Filter
//                 tags={tags}
//                 selectedTag={selectedTag}
//                 setSelectedTag={setSelectedTag}
//                 startDate={startDate}
//                 setStartDate={setStartDate}
//                 endDate={formatDateTime(endDate)}
//                 setEndDate={setEndDate}
//                 formatDateTime={formatDateTime}
//               />
//               <RecordList
//                 className="mt-4"
//                 type={type}
//                 records={filteredRecords}
//                 handleDeleteTransaction={handleDeleteTransaction}
//                 handleEditTransaction={handleEditTransaction}
//                 formatDateTime={formatDateTime}
//               />
//             </>
//           </div>
//         )}
//     </div>
//   );
// };

// export default App;

import React, { useState, useEffect, useRef } from 'react';
import RecordList from './components/RecordList';
import Filter from './components/Filter';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {
  addTransaction,
  getTransactions,
  deleteTransaction,
  editTransaction,
  getTags,
  addTag,
  deleteTag,
} from "./db";
import EditAmountModal from './components/EditAmountModal';

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

  const tabs = ['income', 'expense', 'balance'];
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const isScrolling = useRef(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // swipe handler
  const handleTouchStart = (e) => {
    const target = e.target.closest('.overflow-x-auto');
    if (target) {
      isScrolling.current = true;
      return;
    }
    isScrolling.current = false;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (isScrolling.current) {
      isScrolling.current = false;
      return;
    }
    if (touchStartX.current === null || touchStartY.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }

    if (Math.abs(deltaX) > 50) {
      const currentIndex = tabs.indexOf(activeTab);
      if (deltaX < 0 && currentIndex < tabs.length - 1) {
        handleTabChange(tabs[currentIndex + 1]);
      } else if (deltaX > 0 && currentIndex > 0) {
        handleTabChange(tabs[currentIndex - 1]);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

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

  const handleEditTransaction = (transaction) => {
    console.log("Selected transaction ", transaction)
    setEditingTransaction(transaction);
    setIsModalOpen(true);
    console.log("Editing transactoin", editingTransaction)
  };

  const saveEditTransaction = async (id, updatedAmount) => {
    await editTransaction(id, { amount: parseFloat(updatedAmount) });
    loadTransactions();
    setIsModalOpen(false);
    setEditingTransaction(null);
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
    const dateMatch =
      (!startDate || new Date(record.date) >= new Date(startDate)) &&
      (!endDate || new Date(record.date) <= new Date(endDate));
    return typeMatch && tagMatch && dateMatch;
  });

  return (
    <div
      className="m-auto flex flex-col justify-center items-center px-2 sm:px-4 md:px-8 w-full max-w-6xl"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* --- Tab Buttons --- */}
      <div className="flex flex-row justify-between border-b bg-gray-100 w-full">
        {tabs.map((t) => (
          <button
            key={t}
            className={`py-2 px-4 sm:px-8 ${activeTab === t ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => handleTabChange(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* --- New Tag Section --- */}
      {activeTab !== 'balance' && (
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
            <button
              onClick={createTag}
              className="px-2 py-2 bg-blue-500 text-white rounded w-full sm:w-auto"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* --- Transaction Form --- */}
      {activeTab !== 'balance' && (
        <div className="space-3 mb-3 w-full">
          <div className="flex sm:flex-row flex-col md:space-x-4 md:space-y-0 justify-center md:justify-around items-stretch md:items-end">
            <div>
              <label className="block">Tag:</label>
              <select value={tag} onChange={(e) => setTag(e.target.value)} className="p-2 border rounded w-full">
                {tags.map((t) => (
                  <option key={t.id} value={t.name}> {t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block">Date:</label>
              <DatePicker
                selected={date}
                onChange={(date) => setDate(formatDateTime(date))}
                dateFormat="dd-MM-YYYY"
                showIcon
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block">Amount:</label>
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full md:w-32 p-2 border rounded"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddTransaction}
                type="submit"
                className={`w-full md:w-auto ${tab === 'income' ? 'bg-green-500' : 'bg-red-500'} text-white p-2 rounded`}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Transaction Display Section --- */}
      {activeTab === "balance" ? (
        <div className="bg-gray-200 p-2 sm:p-4 mt-4 w-full">
          <div className="w-full">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-blue-500">Daily Balance</h2>
            <div className="">
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
        </div>
      ) : (
        <div className="bg-gray-200 p-2 sm:p-4 mt-4 w-full overflow-x-auto">
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
        </div>
      )}

      {/* --- Edit Modal --- */}
      <EditAmountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={saveEditTransaction}
        oldData={editingTransaction}
      />
    </div>
  );
};

export default App;