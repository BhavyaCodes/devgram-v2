export const formatDate = (date: Date | undefined): string => {
  if (!date) {
    return '';
  }
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.toLocaleString('default', { year: 'numeric' });

  return month + ' ' + year;
};
