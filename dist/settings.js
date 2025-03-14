export var Layout;
(function (Layout) {
    Layout["Month"] = "month";
    Layout["Week"] = "week";
    Layout["Weekday"] = "weekday";
    Layout["Custom"] = "custom";
})(Layout || (Layout = {}));
export var PastMode;
(function (PastMode) {
    PastMode["None"] = "none";
    PastMode["Fade"] = "fade";
    PastMode["Solid"] = "solid";
})(PastMode || (PastMode = {}));
export const BaseCalendarSettings = {
    layout: Layout.Weekday,
    startDate: "03-01",
    endDate: "06",
    year: null,
    daySize: 16,
    gap: 4,
    startDayOfWeek: 1,
    daysPerRow: 21,
    showLabels: false,
    labelWidth: 56,
    events: {},
    colors: {
        current: "#FFD700",
        fadePastDates: true,
        pastDay: "#555",
        futureDay: "#eee",
        alternateMonths: true,
        alternateMonthColor: "#d2f0fa",
        highlight: {
            weekdays: {
                0: "#BAFFC9",
                6: "#BAFFC9",
            },
            months: {},
        },
    },
};
//# sourceMappingURL=settings.js.map