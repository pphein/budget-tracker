import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const RecordList = ({ type, records, handleDeleteTransaction, handleEditTransaction, formatDateTime }) => {
    // return (
    //     <div>
    //         {records.length > 0 ? (
    //             records.map((record, index) => (
    //                 <div key={index} className="border-b py-2">
    //                     <span className="font-bold">{record.tag}</span>: ${record.amount} - {record.datetime}
    //                 </div>
    //             ))
    //         ) : (
    //             <p>No records yet</p>
    //         )}
    //     </div>
    // );
    // return (
    //     <table className="table-auto w-full border-collapse border border-gray-300">
    //         <thead>
    //             <tr>
    //                 <th className="border border-gray-300 px-4 py-2">Tag</th>
    //                 <th className="border border-gray-300 px-4 py-2">Amount</th>
    //                 <th className="border border-gray-300 px-4 py-2">Date & Time</th>
    //             </tr>
    //         </thead>
    //         <tbody>
    //             {records.length > 0 ? (
    //                 records.map((record, index) => (
    //                     <tr key={index}>
    //                         <td className="border border-gray-300 px-4 py-2">{record.tag}</td>
    //                         <td className="border border-gray-300 px-4 py-2">${record.amount}</td>
    //                         <td className="border border-gray-300 px-4 py-2">{record.datetime}</td>
    //                     </tr>
    //                 ))
    //             ) : (
    //                 <tr>
    //                     <td colSpan="3" className="text-center border border-gray-300 px-4 py-2">
    //                         No records yet
    //                     </td>
    //                 </tr>
    //             )}
    //         </tbody>
    //     </table>
    // );
    const [tagFilter, setTagFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredRecords.map(record => ({
            Tag: record.tag,
            Amount: record.amount,
            DateTime: record.date,
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Records');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
        const date = new Date().toISOString().slice(0, 10).toLocaleString();
        saveAs(data, 
            type 
            +'_records_'
            +date
            +'.xlsx');
    };
    
    const filteredRecords = records.filter((record) => {
        const recordDate = new Date(record.datetime);
        const isTagMatch = tagFilter ? record.tag.toLowerCase().includes(tagFilter.toLowerCase()) : true;
        const isStartDateMatch = startDate ? recordDate >= new Date(startDate) : true;
        const isEndDateMatch = endDate ? recordDate <= new Date(endDate) : true;
        return isTagMatch && isStartDateMatch && isEndDateMatch;
    });

    const totalAmount = filteredRecords.reduce((sum, record) => sum + Number(record.amount), 0);

    
    const formatAmount = (amount) => {
        return new Intl.NumberFormat("en-US", {
            // style: "currency",
            // currency: "MMK",
        }).format(amount);  
    }

    return (
        <div className='w-container'>
            <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                    <tr>
                        <th className="border border-gray-300 px-4 py-2">Tag</th>
                        <th className="border border-gray-300 px-4 py-2">Amount</th>
                        <th className="border border-gray-300 px-4 py-2">Date</th>
                        <th className="border border-gray-300 px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredRecords.length > 0 ? (
                        filteredRecords.map((record, index) => (
                            <tr key={index}>
                                <td className="border border-gray-300 px-4 py-2">{record.tag}</td>
                                <td className="border border-gray-300 px-4 py-2 text-end">{formatAmount(record.amount)}</td>
                                <td className="border border-gray-300 px-4 py-2">{formatDateTime(record.date)}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={() => handleEditTransaction(record.id, record)}>Edit</button>
                                    <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => handleDeleteTransaction(record.id)}>Del</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" className="text-center border border-gray-300 px-4 py-2">
                                No records found
                            </td>
                        </tr>
                    )}
                </tbody>
                <tfoot>
                    <tr>
                        <td className="border border-gray-300 px-4 py-2 font-bold">Total</td>
                        <td className="border border-gray-300 px-4 py-2 font-bold">${totalAmount}</td>
                        <td className="border border-gray-300 px-4 py-2 font-bold"></td>
                        <td className="border border-gray-300 px-4 py-2">
                        <button
                        className="bg-green-500 text-white px-4 py-2 rounded mt-4"
                        onClick={exportToExcel}
                    >
                        Export
                    </button>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default RecordList;

// const FilterableRecordList = ({ records }) => {
//     const [tagFilter, setTagFilter] = useState('');
//     const [startDate, setStartDate] = useState('');
//     const [endDate, setEndDate] = useState('');

//     const filteredRecords = records.filter((record) => {
//         const recordDate = new Date(record.datetime);
//         const isTagMatch = tagFilter ? record.tag.toLowerCase().includes(tagFilter.toLowerCase()) : true;
//         const isStartDateMatch = startDate ? recordDate >= new Date(startDate) : true;
//         const isEndDateMatch = endDate ? recordDate <= new Date(endDate) : true;
//         return isTagMatch && isStartDateMatch && isEndDateMatch;
//     });

//     const totalAmount = filteredRecords.reduce((sum, record) => sum + record.amount, 0);

//     return (
//         <div>
//             <div className="mb-4">
//                 <input
//                     type="text"
//                     placeholder="Filter by tag"
//                     value={tagFilter}
//                     onChange={(e) => setTagFilter(e.target.value)}
//                     className="border px-2 py-1 mr-2"
//                 />
//                 <input
//                     type="date"
//                     value={startDate}
//                     onChange={(e) => setStartDate(e.target.value)}
//                     className="border px-2 py-1 mr-2"
//                 />
//                 <input
//                     type="date"
//                     value={endDate}
//                     onChange={(e) => setEndDate(e.target.value)}
//                     className="border px-2 py-1"
//                 />
//             </div>
//             <table className="table-auto w-full border-collapse border border-gray-300">
//                 <thead>
//                     <tr>
//                         <th className="border border-gray-300 px-4 py-2">Tag</th>
//                         <th className="border border-gray-300 px-4 py-2">Amount</th>
//                         <th className="border border-gray-300 px-4 py-2">Date & Time</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {filteredRecords.length > 0 ? (
//                         filteredRecords.map((record, index) => (
//                             <tr key={index}>
//                                 <td className="border border-gray-300 px-4 py-2">{record.tag}</td>
//                                 <td className="border border-gray-300 px-4 py-2">${record.amount}</td>
//                                 <td className="border border-gray-300 px-4 py-2">{record.datetime}</td>
//                             </tr>
//                         ))
//                     ) : (
//                         <tr>
//                             <td colSpan="3" className="text-center border border-gray-300 px-4 py-2">
//                                 No records found
//                             </td>
//                         </tr>
//                     )}
//                 </tbody>
//                 <tfoot>
//                     <tr>
//                         <td className="border border-gray-300 px-4 py-2 font-bold">Total</td>
//                         <td className="border border-gray-300 px-4 py-2 font-bold">${totalAmount}</td>
//                         <td className="border border-gray-300 px-4 py-2"></td>
//                     </tr>
//                 </tfoot>
//             </table>
//         </div>
//     );
// };

// export default FilterableRecordList;