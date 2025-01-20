export function stringToDate(datestring, year, last = false) {
  const [month, day] = datestring.split("-");
  const monthNum = parseInt(month);
  const dayNum = parseInt(day) || !last ? 1 : null;
  if (dayNum) {
    return new Date(year, monthNum - 1, dayNum);
  }
  return new Date(year, monthNum, 0);
}

export function getRangeDates(initial, final, year = null) {
  const dateYear = year || new Date().getFullYear();
  return {
    startDate: stringToDate(initial, dateYear),
    endDate: stringToDate(final, dateYear, true),
  };
}

export function isSpecialDate(date, specialDates) {
  const formattedDate = date
    .toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
    })
    .replace("/", "-");

  return formattedDate in specialDates ? specialDates[formattedDate] : {};
}

export function getDateContext(date, today = new Date()) {
  return {
    isPresent: date.toDateString() === today.toDateString(),
    isPast: date < today,
    isFuture: date > today,
    dayOfWeek: date.getDay(),
    month: date.getMonth(),
  };
}
