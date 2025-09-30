import React, { useState } from "react";
import { Dialog } from "@headlessui/react";

const EditAmountModal = ({ isOpen, onClose, onSave, oldData }) => {
    const [amount, setAmount] = useState(oldData || "");
    console.log("Old data >> ", oldData)
    const handleSubmit = () => {
        if (!amount) {
            alert("Amount is required!");
            return;
        }
        onSave(oldData, amount);
        onClose();
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
                    <Dialog.Title className="text-lg font-semibold text-gray-800">
                        Edit Transaction Amount
                    </Dialog.Title>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-600">
                            Amount
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring focus:ring-blue-300"
                            placeholder="Enter new amount"
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            onClick={onClose}
                            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Save
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default EditAmountModal;
