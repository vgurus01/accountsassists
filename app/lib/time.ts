export function formatISODate(date: Date) {
  const yyyy = date.getFullYear();
  const mm = `${date.getMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getDate()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function isWeekday(date: Date) {
  const day = date.getDay(); // 0 Sun ... 6 Sat
  return day >= 1 && day <= 5;
}

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getDefaultSlots() {
  const hours = [];
  for (let h = 9; h <= 21; h += 1) {
    hours.push(`${`${h}`.padStart(2, "0")}:00`);
  }
  return hours;
}

