// import React, { useState } from "react";
// import EditAmountModal from "./EditAmountModal";
// import { editTransaction } from "./db";

// const Transactions = ({ transactions, loadTransactions }) => {
//     const [selectedTransaction, setSelectedTransaction] = useState(null);

//     const handleEditTransaction = async (id, oldData) => {
//         setSelectedTransaction({ id, oldData });
//     };

//     const handleSave = async (newAmount) => {
//         await editTransaction(selectedTransaction.id, { amount: newAmount });
//         loadTransactions();
//     };

//     return (
//         <div>
//             {transactions.map((t) => (
//                 <div key={t.id} className="flex justify-between p-2 border-b">
//                     <span>{t.amount}</span>
//                     <button
//                         onClick={() => handleEditTransaction(t.id, t)}
//                         className="text-blue-600 hover:underline"
//                     >
//                         Edit
//                     </button>
//                 </div>
//             ))}

//             {selectedTransaction && (
//                 <EditAmountModal
//                     isOpen={!!selectedTransaction}
//                     oldData={selectedTransaction.oldData}
//                     onClose={() => setSelectedTransaction(null)}
//                     onSave={handleSave}
//                 />
//             )}
//         </div>
//     );
// };

// export default Transactions;
