export const getStatusOrder = (status: string): number => {
  switch (status) {
    case 'OPEN':
      return 1;
    case 'IN_PROGRESS':
      return 2;
    case 'COMPLETED':
      return 3;
    case 'CANCELLED':
      return 4;
    default:
      return 5;
  }
};
