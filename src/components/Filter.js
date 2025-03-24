import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Filter = ({ tags, selectedTag, setSelectedTag, startDate, setStartDate, endDate, setEndDate, formatDateTime }) => {

    return (
        <div className="flex space-x-4">
            <select
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
            </select>

            {/* <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border px-2 py-1 rounded"
            /> */}
            <DatePicker selected={startDate} onChange={(startDate) => setStartDate(startDate)} dateFormat="dd-MM-YYYY" showIcon className="w-32 border px-2 py-1 rounded"/>
            {/* <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border px-2 py-1 rounded"
            /> */}
            <DatePicker selected={endDate} onChange={(endDate) => setEndDate(formatDateTime(endDate))} dateFormat="dd-MM-YYYY" showIcon className="w-32 border px-2 py-1 rounded"/>
                
        </div>
    );
};

export default Filter;
