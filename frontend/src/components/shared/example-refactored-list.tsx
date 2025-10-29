/**
 * EXAMPLE: How to use the new reusable components in your list pages
 * This shows how to replace 500+ lines of duplicate code with ~100 lines
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, PaginationControls, SearchFilterBar, type FilterOption } from '@/components/shared';
import { LoadingState, ErrorState } from '@/components/shared';
import { User, GraduationCap, MapPin } from 'lucide-react';

// ===== EXAMPLE INTERFACE =====
interface ExampleItem {
  id: number;
  name: string;
  email: string;
  status: string;
}

// ===== MAIN COMPONENT =====
export function ExampleRefactoredList() {
  const router = useRouter();
  
  // State management (reduced from ~50 lines to ~20)
  const [items, setItems] = React.useState<ExampleItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(50);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterValues, setFilterValues] = React.useState({
    status: "",
    campus: "",
  });

  // Fetch function (same as before)
  const fetchData = async () => {
    setLoading(true);
    try {
      // Your fetch logic here
      // const response = await getFilteredData(...)
      // setItems(response.results);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Define your filter options ONCE
  const filterOptions: FilterOption[] = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ],
    },
    {
      key: 'campus',
      label: 'Campus',
      options: [
        { value: '1', label: 'Campus 1' },
        { value: '2', label: 'Campus 2' }
      ],
    }
  ];

  // Define your table columns ONCE
  const columns = [
    {
      key: 'name',
      label: 'Name',
      icon: <User className="h-3 w-3 sm:h-4 sm:w-4" />,
      render: (item: ExampleItem) => (
        <div>
          <div className="font-medium">{item.name}</div>
          <div className="text-xs text-gray-500">{item.email}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      icon: <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4" />,
      render: (item: ExampleItem) => (
        <span className={`px-2 py-1 rounded text-xs ${
          item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {item.status}
        </span>
      ),
    },
  ];

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Render loading state
  if (loading) {
    return <LoadingState message="Loading items..." />;
  }

  // Render error state
  if (error) {
    return <ErrorState message={error} onRetry={fetchData} showRetryButton />;
  }

  // Main render
  return (
    <div className="container mx-auto p-6 space-y-4">
      {/* Search and Filters - was 100+ lines, now just this */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filterOptions}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        onClearFilters={() => {
          setFilterValues({ status: "", campus: "" });
          setSearchQuery("");
        }}
      />

      {/* Data Table - was 200+ lines of table JSX, now just this */}
      <DataTable
        data={items}
        columns={columns}
        onView={(item) => router.push(`/admin/example/${item.id}`)}
        onEdit={(item) => {
          // Your edit logic
          console.log('Edit:', item);
        }}
        isLoading={loading}
        emptyMessage="No items found"
      />

      {/* Pagination - was 80+ lines, now just this */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}

/**
 * BEFORE vs AFTER comparison:
 * 
 * BEFORE: ~1000 lines per list page (student-list, teacher-list, etc.)
 * - 100+ lines of search/filter JSX
 * - 200+ lines of table JSX
 * - 80+ lines of pagination JSX
 * - 50+ lines of loading/error states
 * - Duplicated across 4+ pages
 * 
 * AFTER: ~150 lines per list page
 * - Reusable components handle all the boilerplate
 * - Only business logic remains
 * - Consistent UI/UX across all pages
 * - Easy to maintain and update
 */
