export function getColor(dateContext, colorSettings) {
  const currentColor = colorSettings.current;
  const pastDayColor = colorSettings.pastDay;
  const futureDayColor = colorSettings.futureDay;
  const alternateMonths = colorSettings.alternateMonths;
  const alternateMonthColor = colorSettings.alternateMonthColor;
  const weekdayColors = colorSettings.highlight?.weekdays || {};
  const monthColors = colorSettings.highlight?.months || {};
  const fadePast = colorSettings.fadePastDates;

  if (dateContext.isPresent) return currentColor;
  if (fadePast && dateContext.isPast) return pastDayColor;
  if (dateContext.dayOfWeek in weekdayColors) {
    return weekdayColors[dateContext.dayOfWeek];
  }
  if (dateContext.month in monthColors) {
    return monthColors[dateContext.month];
  }
  if (alternateMonths && dateContext.month % 2 == 0) {
    return alternateMonthColor;
  }
  return futureDayColor;
}

export function getClasses({ isPresent, isPast, isFuture }) {
  const classList = ["dateBox"];
  if (isFuture) classList.push("future-day");
  if (isPresent) {
    classList.push("present-day");
  } else if (isPast) {
    classList.push("past-day");
  }
  return classList;
}
