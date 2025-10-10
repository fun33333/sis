import React from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterField {
  key: string;
  label: string;
  type: 'select' | 'text' | 'number';
  options?: FilterOption[];
  placeholder?: string;
}

interface FilterPanelProps {
  filters: Record<string, string>;
  filterFields: FilterField[];
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  className?: string;
}

export function FilterPanel({
  filters,
  filterFields,
  onFilterChange,
  onClearFilters,
  className = ""
}: FilterPanelProps) {
  const renderFilterField = (field: FilterField) => {
    switch (field.type) {
      case 'select':
        return (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <select
              value={filters[field.key] || ''}
              onChange={(e) => onFilterChange(field.key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All {field.label}</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'text':
        return (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <input
              type="text"
              placeholder={field.placeholder || `Filter by ${field.label.toLowerCase()}...`}
              value={filters[field.key] || ''}
              onChange={(e) => onFilterChange(field.key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );

      case 'number':
        return (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <input
              type="number"
              placeholder={field.placeholder || `Filter by ${field.label.toLowerCase()}...`}
              value={filters[field.key] || ''}
              onChange={(e) => onFilterChange(field.key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {filterFields.map(renderFilterField)}
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear Filters
        </button>

        {hasActiveFilters && (
          <div className="text-sm text-gray-500">
            {Object.values(filters).filter(value => value !== '').length} filter(s) active
          </div>
        )}
      </div>
    </div>
  );
}
