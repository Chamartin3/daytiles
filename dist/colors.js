export const DATE_BOX_CLASS = "dateBox";
export const FUTURE_DAY_CLASS = "future-day";
export const PRESENT_DAY_CLASS = "present-day";
export const PAST_DAY_CLASS = "past-day";
export function getColor(dateContext, colorSettings) {
    const { current: currentColor, pastDay: pastDayColor, futureDay: futureDayColor, alternateMonths, alternateMonthColor, solidPastColor: solidPast, } = colorSettings;
    const weekdayColors = colorSettings.highlight?.weekdays ?? {};
    const monthColors = colorSettings.highlight?.months ?? {};
    const highlightCurrent = colorSettings.highlightCurrent !== false;
    if (highlightCurrent && dateContext.isPresent)
        return currentColor;
    if (solidPast && dateContext.isPast && !dateContext.isPresent)
        return pastDayColor;
    const weekdayMatch = weekdayColors[dateContext.dayOfWeek];
    if (weekdayMatch)
        return weekdayMatch;
    const monthMatch = monthColors[dateContext.month];
    if (monthMatch)
        return monthMatch;
    if (alternateMonths && dateContext.month % 2 === 0) {
        return alternateMonthColor;
    }
    return futureDayColor;
}
export function getClasses(ctx) {
    const classList = [DATE_BOX_CLASS];
    if (ctx.isFuture)
        classList.push(FUTURE_DAY_CLASS);
    if (ctx.isPresent) {
        classList.push(PRESENT_DAY_CLASS);
    }
    else if (ctx.isPast) {
        classList.push(PAST_DAY_CLASS);
    }
    return classList;
}
//# sourceMappingURL=colors.js.map