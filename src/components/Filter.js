import React, {useState} from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Filter = ({ tags, selectedTag, setSelectedTag, start, setStartDate, end, setEndDate, formatDateTime }) => {

    const [dateRange, setDateRange] = useState([
        null,
        null
    ]);
    const [startDate, endDate] = dateRange;
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
            {/* <DatePicker selected={startDate} onChange={(startDate) => setStartDate(startDate)} dateFormat="dd-MM-YYYY" showIcon className="w-32 border px-2 py-1 rounded"/> */}
            {/* <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border px-2 py-1 rounded"
            /> */}
            {/* <DatePicker selected={endDate} onChange={(endDate) => setEndDate(formatDateTime(endDate))} dateFormat="dd-MM-YYYY" showIcon className="w-32 border px-2 py-1 rounded"/> */}
            <DatePicker
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => {
                setDateRange(update);
                setEndDate(formatDateTime(update[1]));
                setStartDate(formatDateTime(update[0]));
                }}
                selectsRange
                withPortal
            />    
        </div>
    );
};

export default Filter;
