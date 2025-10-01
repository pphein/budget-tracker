import { Listbox, Transition, Dialog } from "@headlessui/react"; // ✅ added for custom dropdown
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid"; // ✅ icons

import React, { useState, useEffect, useRef, forwardRef, Fragment } from 'react';
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

// ✅ New InfoModal for replacing alert()
const InfoModal = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
        <h2 className="text-lg font-bold mb-4 text-blue-600">Information</h2>
        <p className="mb-4">{message}</p>

        {/* ✅ Align button to the end */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [tab, setTab] = useState('income'); 
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

  // ✅ New state for info modal (replace alert)
  const [infoMessage, setInfoMessage] = useState('');
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

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
    if (!amount) {
      // ❌ Old: alert("Please enter an amount")
      // ✅ New: use InfoModal
      setInfoMessage("Please enter an amount");
      setIsInfoModalOpen(true);
      return;
    }
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
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const saveEditTransaction = async (id, updatedAmount) => {
    if (!updatedAmount) {
      setInfoMessage("Amount is required!");
      setIsInfoModalOpen(true);
      return;
    }
    await editTransaction(id, { amount: parseFloat(updatedAmount) });
    loadTransactions();
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const createTag = async () => {
    // e.preventDefault();
    if (!newTag) {
      setInfoMessage("Tag is required!");
      setIsInfoModalOpen(true);
      return;
    }
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

  // const CustomInput = forwardRef(({ value, onClick }, ref) => (
  //   <input
  //     className="w-full p-2 border rounded bg-white cursor-pointer"
  //     value={value}
  //     onClick={onClick}
  //     readOnly  // ✅ prevents typing
  //     ref={ref}
  //     inputMode='none'
  //   />
  // ));

  const ExampleCustomInput = forwardRef(({ value, onClick, className }, ref) => <button className={className} onClick={onClick} ref={ref}>
      {value}
    </button>)

  const [isTagFormModalOpen, setIsTagFormModalOpen] = useState(false); // ✅ state for tag form modal

  return (
    <div
      className="m-auto flex flex-col justify-center items-center px-2 sm:px-4 md:px-8 w-full max-w-6xl"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Tab Buttons */}
      <div className="flex flex-row justify-between border-b bg-gray-100 w-full">
        {tabs.map((t) => (
          <button
            key={t}
            className={`py-2 px-4 sm:px-8 ${activeTab === t ? 'border-b-2 border-blue-500 text-blue-500 font-bold' : ''}`}
            onClick={() => handleTabChange(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* New Tag Section */}
      {activeTab !== 'balance' && (
        // <div className="my-4 w-full flex flex-col sm:flex-row sm:items-center sm:space-x-4">
        //   <h2 className="text-lg sm:text-xl font-bold my-2 text-blue-500">New Tag: </h2>
        //   <div className="flex flex-row w-full sm:w-auto sm:space-y-0 sm:space-x-2">
        //     <input
        //       type="text"
        //       value={newTag}
        //       onChange={(e) => setNewTag(e.target.value)}
        //       placeholder="Add custom tag"
        //       className="border px-2 py-1 rounded w-full sm:w-auto"
        //     />
        //     <button
        //       onClick={createTag}
        //       className="px-2 py-2 bg-blue-500 text-white rounded w-full sm:w-auto"
        //     >
        //       Add
        //     </button>
        //   </div>
        // </div>
        <>
          {/* New Tag Section */}
          <div className="my-4 w-full flex flex-col sm:flex-row sm:items-center sm:space-x-4">
            <h2 className="text-lg sm:text-xl font-bold my-2 text-blue-500">Tags</h2>
            <div>
              <button
                onClick={() => setIsTagFormModalOpen(true)} // ✅ open modal
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                + Add Tag
              </button>
            </div>
          </div>

          {/* ✅ Modal for adding tag */}
          <Dialog open={isTagFormModalOpen} onClose={() => setIsTagFormModalOpen(false)} className="relative z-50">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            {/* Modal panel */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
                <Dialog.Title className="text-lg font-bold mb-4">Create New Tag</Dialog.Title>

                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Tag name"
                  className="w-full border px-3 py-2 rounded mb-4"
                />

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setIsTagFormModalOpen(false)} // close modal
                    className="px-4 py-2 bg-gray-300 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      await createTag();
                      setIsTagFormModalOpen(false);
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    Save
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        </>
      )}

      {/* Transaction Form */}
      {activeTab !== 'balance' && (
        <div className="space-3 mb-3 w-full">
          <div className="flex sm:flex-row flex-col md:space-x-4 md:space-y-0 justify-center md:justify-around items-stretch md:items-end">

            {/* ✅ Custom Dropdown for Tag */}
            <div className="w-full md:w-48">
              <label className="block mb-1">Tag:</label>
              <Listbox value={tag} onChange={setTag}>
                <div className="relative">
                  <Listbox.Button className="relative w-full cursor-pointer rounded border bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none">
                    <span className="block truncate">{tag || "Select a tag"}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                    </span>
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded bg-white py-1 shadow-lg ring-1 ring-black/10 focus:outline-none z-10">
                      {tags.map((t) => (
                        <Listbox.Option
                          key={t.id}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                              active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                            }`
                          }
                          value={t.name}
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={`block truncate ${
                                  selected ? "font-medium" : "font-normal"
                                }`}
                              >
                                {t.name}
                              </span>
                              {selected ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                  <CheckIcon className="h-5 w-5" />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>

            {/* ✅ Date Picker with custom button input */}
            <div>
              <label className="block mb-1">Date:</label>
              <DatePicker
                toggleCalendarOnIconClick
                selected={date}
                dateFormat={"dd-MM-yyyy"}
                onChange={(d) => setDate(d)}
                customInput={<ExampleCustomInput className="p-2 border rounded w-full" />}
                withPortal
              />
            </div>

            {/* ✅ Amount input with decimal keypad on mobile */}
            <div>
              <label className="block mb-1">Amount:</label>
              <input
                type="number"
                inputMode="decimal" // ✅ ensures decimal keyboard on mobile
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full md:w-32 p-2 border rounded"
              />
            </div>

            {/* Save button */}
            <div className="flex items-end">
              <button
                onClick={handleAddTransaction}
                type="submit"
                className={`w-full md:w-auto ${
                  tab === "income" ? "bg-green-500" : "bg-red-500"
                } text-white p-2 rounded`}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Display Section */}
      {activeTab === "balance" ? (
        // <div className="bg-gray-200 p-2 sm:p-4 mt-4 w-full">
        //   <div className="w-full">
        //     <h2 className="text-lg sm:text-xl font-bold mb-4 text-blue-500">Daily Balance</h2>
        //     <div>
        //       <table className="w-full border-collapse border border-gray-400 text-sm sm:text-base">
        //         <thead>
        //           <tr className="bg-gray-300">
        //             <th className="border border-gray-400 p-2">Date</th>
        //             <th className="border border-gray-400 p-2">Total Income</th>
        //             <th className="border border-gray-400 p-2">Total Expense</th>
        //             <th className="border border-gray-400 p-2">Net</th>
        //           </tr>
        //         </thead>
        //         <tbody>
        //           {Object.values(
        //             transactions.reduce((acc, t) => {
        //               const day = new Date(t.date).toISOString().split("T")[0];
        //               if (!acc[day]) acc[day] = { date: day, income: 0, expense: 0 };
        //               if (t.type === "income") acc[day].income += parseFloat(t.amount || 0);
        //               if (t.type === "expense") acc[day].expense += parseFloat(t.amount || 0);
        //               return acc;
        //             }, {})
        //           ).map((row) => (
        //             <tr key={row.date}>
        //               <td className="border border-gray-400 p-2">{row.date}</td>
        //               <td className="border border-gray-400 p-2 text-green-600">{row.income}</td>
        //               <td className="border border-gray-400 p-2 text-red-600">{row.expense}</td>
        //               <td className="border border-gray-400 p-2 font-bold text-blue-600">{row.income - row.expense}</td>
        //             </tr>
        //           ))}
        //         </tbody>
        //       </table>
        //     </div>
        //   </div>
        // </div>

        <div className="bg-gray-200 p-2 sm:p-4 mt-4 w-full">
          <div className="w-full">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-blue-500 inline-block">Daily Balance</h2>

            {/* --- Date Range Filter --- */}
            <div className="flex flex-col sm:flex-row sm:space-x-4 mb-4">
              <div className="w-full sm:w-1/2">
                <label className="block text-sm font-medium mb-1">Select Date Range:</label>
                <DatePicker
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => {
                    const [start, end] = update;
                    setStartDate(start);
                    setEndDate(end);
                  }}
                  isClearable
                  withPortal
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            {/* --- Table --- */}
            <div>
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
                  )
                    // ✅ Apply date range filter here
                    .filter((row) => {
                      if (!startDate || !endDate) return true;
                      const rowDate = new Date(row.date);
                      return rowDate >= startDate && rowDate <= endDate;
                    })
                    .map((row) => (
                      <tr key={row.date}>
                        <td className="border border-gray-400 p-2">{row.date}</td>
                        <td className="border border-gray-400 p-2 text-green-600">{row.income}</td>
                        <td className="border border-gray-400 p-2 text-red-600">{row.expense}</td>
                        <td className="border border-gray-400 p-2 font-bold text-blue-600">{row.income - row.expense}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      ) : (
        <div className="bg-gray-200 p-2 sm:p-4 mt-4 w-full overflow-x-auto">
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
        </div>
      )}

      {/* Edit Modal */}
      <EditAmountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={saveEditTransaction}
        oldData={editingTransaction}
      />

      {/* ✅ Info Modal for replacing alert */}
      <InfoModal
        isOpen={isInfoModalOpen}
        message={infoMessage}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </div>
  );
};

export default App;
