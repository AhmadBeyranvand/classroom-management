import { format, addDays, parse } from 'date-fns-jalali';

export const getCurrentPersianDate = (): string => {
  return format(new Date(), 'yyyy/MM/dd');
};

export const formatPersianDate = (date: string): string => {
  try {
    const parsed = parse(date, 'yyyy/MM/dd', new Date());
    return format(parsed, 'yyyy/MM/dd');
  } catch {
    return date;
  }
};

export const getPersianWeekday = (date: string): string => {
  try {
    const parsed = parse(date, 'yyyy/MM/dd', new Date());
    const weekdays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
    return weekdays[parsed.getDay()];
  } catch {
    return '';
  }
};

export const addPersianDays = (date: string, days: number): string => {
  try {
    const parsed = parse(date, 'yyyy/MM/dd', new Date());
    return format(addDays(parsed, days), 'yyyy/MM/dd');
  } catch {
    return date;
  }
};

export const isValidPersianDate = (date: string): boolean => {
  try {
    parse(date, 'yyyy/MM/dd', new Date());
    return true;
  } catch {
    return false;
  }
};