import React, { useState, forwardRef, Fragment } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { getTagColorClasses } from '../utils/tagColors';

const RangeInput = forwardRef(({ value, onClick }, ref) => (
  <button
    onClick={onClick}
    ref={ref}
    className="w-full text-left p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200"
  >
    {value || 'All dates'}
  </button>
));

const Filter = ({ tags, allTags, selectedTag, setSelectedTag, setStartDate, setEndDate }) => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const handleRangeChange = (update) => {
    setDateRange(update);
    setStartDate(update[0] ? update[0].toISOString().slice(0, 10) : null);
    setEndDate(update[1] ? update[1].toISOString() : null);
  };

  const getColor = (tagName) => {
    if (!allTags) return null;
    const found = allTags.find((t) => t.name === tagName);
    return found ? getTagColorClasses(found.colorIndex) : null;
  };

  return (
    <div className="flex flex-wrap gap-3 mb-3">
      {/* Tag filter */}
      <div className="w-44">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tag</label>
        <Listbox value={selectedTag} onChange={setSelectedTag}>
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-pointer rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-left text-sm shadow-sm text-gray-800 dark:text-gray-200">
              {selectedTag ? (
                (() => {
                  const c = getColor(selectedTag);
                  return c ? (
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                      {selectedTag}
                    </span>
                  ) : selectedTag;
                })()
              ) : 'All Tags'}
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
              </span>
            </Listbox.Button>
            <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
              <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white dark:bg-gray-700 py-1 shadow-lg ring-1 ring-black/10 z-10 text-sm">
                <Listbox.Option
                  value=""
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>All Tags</span>
                      {selected && <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600"><CheckIcon className="h-4 w-4" /></span>}
                    </>
                  )}
                </Listbox.Option>
                {tags.map((t) => {
                  const c = getTagColorClasses(t.colorIndex);
                  return (
                    <Listbox.Option
                      key={t.id}
                      value={t.name}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                          active ? 'bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                            {t.name}
                          </span>
                          {selected && <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600"><CheckIcon className="h-4 w-4" /></span>}
                        </>
                      )}
                    </Listbox.Option>
                  );
                })}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      </div>

      {/* Date range */}
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date Range</label>
        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={handleRangeChange}
          isClearable
          withPortal
          dateFormat="dd-MM-yyyy"
          customInput={<RangeInput />}
        />
      </div>
    </div>
  );
};

export default Filter;
