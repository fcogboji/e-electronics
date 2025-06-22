import React from 'react';

interface PaginationData {
  total: number;
  totalPages: number;
  limit: number;
}

interface PaginationControlsProps {
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  pagination?: PaginationData;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  setCurrentPage,
  pagination,
}) => {
  // Handle undefined pagination with safe defaults
  const total = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 0;
  const limit = pagination?.limit || 10;
  
  // Don't render if there's no data or only one page
  if (!total || totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const startItem = Math.min((currentPage - 1) * limit + 1, total);
  const endItem = Math.min(currentPage * limit, total);

  return (
    <div className="flex justify-between items-center p-4 border-t bg-gray-50 text-sm">
      <div>
        Showing {startItem}–{endItem} of {total}
      </div>
      <div className="flex gap-1">
        {currentPage > 1 && (
          <button
            className="px-3 py-1 rounded bg-white border hover:bg-gray-50"
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
        )}
        {pages.map((page) => (
          <button
            key={page}
            className={`px-3 py-1 rounded ${
              page === currentPage 
                ? 'bg-blue-600 text-white' 
                : 'bg-white border hover:bg-gray-50'
            }`}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}
        {currentPage < totalPages && (
          <button
            className="px-3 py-1 rounded bg-white border hover:bg-gray-50"
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default PaginationControls;