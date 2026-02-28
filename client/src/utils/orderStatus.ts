export const getStatusClass = (status: string): string => {
  switch (status) {
    case 'delivered':
      return 'status-success';
    case 'cancelled':
      return 'status-danger';
    case 'shipped':
      return 'status-info';
    case 'pending':
    case 'processing':
    default:
      return 'status-warning';
  }
};
