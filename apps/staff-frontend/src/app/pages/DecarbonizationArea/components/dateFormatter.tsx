// utils/dateFormatter.ts
import moment from 'moment';

export const formatDate = (date: string | Date) => moment(date).format('D MMM YY');