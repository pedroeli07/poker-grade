export type DataTablePaginationState = {
  totalPages: number;
  currentPage: number;
  from: number;
  to: number;
};

export function getDataTablePaginationState(
  page: number,
  pageSize: number,
  totalItems: number
): DataTablePaginationState {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const from = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);
  return { totalPages, currentPage, from, to };
}
