import React from 'react';

const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) {
      range.push(i);
    }
    return range;
  };

  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Prev
      </button>
      {getPageNumbers().map((num) => (
        <button
          key={num}
          className={num === page ? 'active' : ''}
          onClick={() => onPageChange(num)}
        >
          {num}
        </button>
      ))}
      <button disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </div>
  );
};

export default Pagination;
