import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TableColumn {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
}

interface TableAction {
  icon: React.ReactNode;
  onClick: (row: any) => void;
  tooltip?: string;
  className?: string;
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  error?: string | null;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage?: number;
    totalItems?: number;
  };
  onRowClick?: (row: any) => void;
  actions?: TableAction[];
  keyExtractor?: (row: any) => string;
  emptyMessage?: string;
  className?: string;
}

const Table: React.FC<TableProps> = ({
  columns,
  data,
  loading = false,
  error = null,
  pagination,
  onRowClick,
  actions = [],
  keyExtractor = (row) => row.id || row._id,
  emptyMessage = "No data found",
  className = "",
}) => {
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);

  useEffect(() => {
    if (tableBodyRef.current && data.length > 0) {
      gsap.fromTo(
        tableBodyRef.current.querySelectorAll('tr'),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05 }
      );
    }
  }, [data]);

  const handlePrevPage = () => {
    if (pagination && pagination.currentPage > 1) {
      pagination.onPageChange(pagination.currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination && pagination.currentPage < pagination.totalPages) {
      pagination.onPageChange(pagination.currentPage + 1);
    }
  };

  return (
    <div className={`bg-card rounded-xl shadow-card overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.label}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody ref={tableBodyRef} className="divide-y divide-border">
            {loading && (
              <tr>
                <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="text-center py-10">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                  <p className="mt-2 text-muted-foreground">Loading data...</p>
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="text-center py-10">
                  <div className="text-destructive bg-destructive/10 py-3 px-4 rounded-lg inline-block">
                    {error}
                  </div>
                </td>
              </tr>
            )}
            {!loading && !error && data.length === 0 && (
              <tr>
                <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="text-center py-10">
                  <p className="text-muted-foreground">{emptyMessage}</p>
                </td>
              </tr>
            )}
            {!loading && !error && data.map((row) => (
              <tr
                key={keyExtractor(row)}
                className={`hover:bg-muted/50 transition ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className={`px-4 py-3 ${column.className || ''}`}>
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]}
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      {actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(row);
                          }}
                          className={action.className || "text-primary hover:text-primary/80"}
                          title={action.tooltip}
                        >
                          {action.icon}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {pagination && (
        <div className="flex items-center justify-between border-t border-border bg-card px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={handlePrevPage}
              disabled={pagination.currentPage === 1}
              className={`relative inline-flex items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted ${
                pagination.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={pagination.currentPage === pagination.totalPages}
              className={`relative ml-3 inline-flex items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted ${
                pagination.currentPage === pagination.totalPages ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{(pagination.currentPage - 1) * (pagination.itemsPerPage || 10) + 1}</span> to{' '}
                <span className="font-medium text-foreground">
                  {Math.min(pagination.currentPage * (pagination.itemsPerPage || 10), pagination.totalItems || data.length)}
                </span>{' '}
                of <span className="font-medium text-foreground">{pagination.totalItems || data.length}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={handlePrevPage}
                  disabled={pagination.currentPage === 1}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-muted-foreground ring-1 ring-inset ring-border hover:bg-muted focus:z-20 focus:outline-offset-0 ${
                    pagination.currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-inset ring-border hover:bg-muted focus:outline-offset-0">
                  Page {pagination.currentPage} of {pagination.totalPages || 1}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-muted-foreground ring-1 ring-inset ring-border hover:bg-muted focus:z-20 focus:outline-offset-0 ${
                    pagination.currentPage === pagination.totalPages ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;