// src/components/cost-analysis/TimeRangeSelector.js
import React from 'react';

const timeRanges = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '6m', label: 'Last 6 months' },
  { value: '1y', label: 'Last year' }
];

const TimeRangeSelector = ({ value, onChange }) => {
  return (
    <div className="mt-6 sm:flex sm:items-center">
      <div className="sm:flex-auto">
        <div className="inline-flex shadow-sm rounded-md">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              type="button"
              onClick={() => onChange(range.value)}
              className={`px-4 py-2 text-sm font-medium ${
                value === range.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } ${
                range.value === timeRanges[0].value ? 'rounded-l-md' : ''
              } ${
                range.value === timeRanges[timeRanges.length - 1].value ? 'rounded-r-md' : ''
              } border border-gray-300`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeRangeSelector;