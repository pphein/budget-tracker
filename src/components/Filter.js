import React, {useState, forwardRef, Fragment} from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Listbox, Transition } from "@headlessui/react"; // ✅ added for custom dropdown
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid"; // ✅ icons


const Filter = ({ tags, selectedTag, setSelectedTag, start, setStartDate, end, setEndDate, formatDateTime }) => {

    const [dateRange, setDateRange] = useState([
        null,
        null
    ]);
    const [startDate, endDate] = dateRange;
   
    // Custom input for date range
    const RangeInput = forwardRef(({ value, onClick }: any, ref: any) => (
    <button
        onClick={onClick}
        ref={ref}
        className="w-full text-left p-2 border rounded bg-white"
    >
        {value ? value : "Select date range"}
    </button>
    ));
    return (
        <div className="flex space-x-4">
            {/* <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="border px-2 py-1 rounded"
            >
                <option value="">All Tags</option>
                {tags.map((tag) => (
                    <option key={tag.id} value={tag.name}>
                        {tag.name}
                    </option>
                ))}
            </select> */}
            {/* ✅ Custom Dropdown for Tag */}
            <div className="w-full md:w-48">
                <label className="block mb-1">Tag:</label>
                <Listbox value={selectedTag} onChange={setSelectedTag}>
                <div className="relative">
                    <Listbox.Button className="relative w-full cursor-pointer rounded border bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none">
                    <span className="block truncate">{selectedTag || "All Tags"}</span>
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
            {/* <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border px-2 py-1 rounded"
            /> */}
            {/* <DatePicker selected={startDate} onChange={(startDate) => setStartDate(startDate)} dateFormat="dd-MM-YYYY" showIcon className="w-32 border px-2 py-1 rounded"/> */}
            {/* <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border px-2 py-1 rounded"
            /> */}
            {/* <DatePicker selected={endDate} onChange={(endDate) => setEndDate(formatDateTime(endDate))} dateFormat="dd-MM-YYYY" showIcon className="w-32 border px-2 py-1 rounded"/> */}
            <div>
                <label className="block mb-1">Date Range:</label>
                <DatePicker
                selected={startDate}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => {
                setDateRange(update);
                setEndDate(formatDateTime(update[1]));
                setStartDate(formatDateTime(update[0]));
                }}
                selectsRange
                withPortal
                usePointerEvent
                dateFormat={"dd-MM-yyyy"}
                customInput={<RangeInput />}
            />  
            </div>  
        </div>
    );
};

export default Filter;
