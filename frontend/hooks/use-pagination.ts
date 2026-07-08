"use client";

import * as React from "react";

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const [page, setPage] = React.useState(options.initialPage || 1);
  const [pageSize, setPageSize] = React.useState(options.initialPageSize || 10);

  const resetPagination = React.useCallback(() => {
    setPage(1);
  }, []);

  const offset = React.useMemo(() => {
    return (page - 1) * pageSize;
  }, [page, pageSize]);

  return {
    page,
    pageSize,
    offset,
    setPage,
    setPageSize,
    resetPagination,
  };
}
