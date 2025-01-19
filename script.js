const BaseCalendarSettings = {
  layout: "weekday",
  startDate: `03-01`,
  endDate: `06`,
  year: null,
  daySize: 22,
  gap: 4,
  startDayOfWeek: 1,
  daysPerRow: 21, // only for custom layout
  specialDates: {
  },
  colors: {
    current: "#FFD700",
    fadePastDates: false,
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

function stringToDate(datestring, year, last = false) {
  const [month, day] = datestring.split("-");
  const monthNum = parseInt(month);
  const dayNum = parseInt(day) || !last ? 1 : null;
  if (dayNum) {
    return new Date(year, monthNum - 1, dayNum);
  }
  return new Date(year, monthNum, 0);
}

function getRangeDates(initial, final, year = null) {
  const dateYear = year || new Date().getFullYear();

  return {
    startDate: stringToDate(initial, dateYear),
    endDate: stringToDate(final, dateYear, true),
  };
}

function isSpecialDate(date, specialDates) {
  const formattedDate = date
    .toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
    })
    .replace("/", "-");

  return formattedDate in specialDates ? specialDates[formattedDate] : {};
}

function getColor(dateContext, colorSettings) {
  const colorConfigs = colorSettings;
  const currentColor = colorConfigs.current;
  const pastDayColor = colorConfigs.pastDay;
  const futureDayColor = colorConfigs.futureDay;
  const alternateMonths = colorConfigs.alternateMonths;
  const alternateMonthColor = colorConfigs.alternateMonthColor;
  const weekdayColors = colorConfigs.highlight?.weekdays || {};
  const monthColors = colorConfigs.highlight?.months || {};
  const fadePast = colorConfigs.fadePastDates;

  if (dateContext.isPresent) {
    return currentColor;
  }
  if (fadePast && dateContext.isPast) {
    return pastDayColor;
  }
  if (dateContext.dayOfWeek in weekdayColors) {
    return weekdayColors[dateContext.dayOfWeek];
  }
  if (dateContext.month in monthColors) {
    return monthColors[month];
  }
  if (alternateMonths && dateContext.month % 2 == 0) {
    return alternateMonthColor;
  }
  return futureDayColor;
}

function getClasses({ isPresent, isPast, isFuture, dayOfWeek, month }) {
  const classList = ["dateBox"];

  if (isFuture) classList.push("future-day");
  if (isPresent) {
    classList.push("present-day");
  } else {
    if (isPast) classList.push("past-day");
  }

  return classList;
}

let selectedDate = new Date();

function drawDateSquare(dateToDraw, { x, y, size, overwrites, colorSettings }) {
  const today = new Date();
  const dateContext = {
    isPresent: dateToDraw.toDateString() === today.toDateString(),
    isPast: dateToDraw < today,
    isFuture: dateToDraw > today,
    dayOfWeek: dateToDraw.getDay(),
    month: dateToDraw.getMonth(),
  };
  const svgNS = "http://www.w3.org/2000/svg";
  const square = document.createElementNS(svgNS, "rect");
  const dayColor = overwrites.color || getColor(dateContext, colorSettings);
  const dayClasses = getClasses(dateContext);
  const note = overwrites.note || dateToDraw.toDateString();
  square.setAttribute("x", x);
  square.setAttribute("y", y);
  square.setAttribute("width", size);
  square.setAttribute("height", size);
  square.setAttribute("fill", dayColor);
  square.setAttribute("data-date", note);
  square.addEventListener("mouseover", showDateTooltip);
  square.addEventListener("mouseout", hideDateTooltip);
  dayClasses.forEach((className) => square.classList.add(className));

  return square;
}

function drawCalendar() {
  const calendar = document.getElementById("calendar");
  const {
    layout = "month",
    daysPerRow = 28,
    daySize: squareSize,
    gap,
    startDayOfWeek = 1,
    specialDates,
    startDate: begin,
    endDate: end,
    year,
    colors: colorSettings,
  } = BaseCalendarSettings;

  calendar.innerHTML = "";
  const { startDate, endDate } = getRangeDates(begin, end, year);
  let currentDate = new Date(startDate);
  let row = 0;
  let col = 0;
  let dayIndex = 0;
  const totalWeeks = Math.ceil(
    (startDate - endDate) / (7 * 24 * 60 * 60 * 1000),
  );

  function getAdjustedColumn(date) {
    return (7 + date.getDay() - startDayOfWeek) % 7;
  }
  while (currentDate <= endDate) {
    let newRow = false;

    switch (layout) {
      case "week":
        col = getAdjustedColumn(currentDate);
        newRow = col === 0 && currentDate > startDate;
        break;
      case "weekday":
        row = getAdjustedColumn(currentDate);
        newRow = true;
        if (row == 0) {
          col++;
        }
        break;
      case "month":
        if (
          currentDate.getDate() === 1 ||
          currentDate.getTime() === startDate.getTime()
        ) {
          col = getAdjustedColumn(currentDate);
          newRow = true;
        } else {
          col++;
        }
        break;
      case "custom":
        col = dayIndex % daysPerRow;
        newRow = col === 0 && dayIndex !== 0;
        dayIndex++;
        break;
    }

    if (newRow) row++;

    const displayConfig = {
      x: col * (squareSize + gap),
      y: row * (squareSize + gap),
      size: squareSize,
      overwrites: isSpecialDate(currentDate, specialDates),
      colorSettings,
    };

    calendar.appendChild(drawDateSquare(currentDate, displayConfig));

    currentDate.setDate(currentDate.getDate() + 1);
  }
}
function showDateTooltip(event) {
  const svgNS = "http://www.w3.org/2000/svg";
  const dateInfo = event.target.getAttribute("data-date");
  // console.log(dateInfo);
  const x = parseInt(event.target.getAttribute("x"));
  const y = parseInt(event.target.getAttribute("y"));
  const tooltipGroup = document.createElementNS(svgNS, "g");
  tooltipGroup.setAttribute("id", "dateTooltip");

  const background = document.createElementNS(svgNS, "rect");
  background.setAttribute("x", x - 5);
  background.setAttribute("y", y - 5);
  background.setAttribute("width", 100);
  background.setAttribute("height", 20);
  background.setAttribute("class", "tooltip-box");

  const text = document.createElementNS(svgNS, "text");
  text.setAttribute("x", x);
  text.setAttribute("y", y + 10);
  text.textContent = dateInfo;
  text.setAttribute("class", "tooltip-text");

  tooltipGroup.appendChild(background);
  tooltipGroup.appendChild(text);

  document.getElementById("calendar").appendChild(tooltipGroup);
}

function hideDateTooltip() {
  const tooltip = document.getElementById("dateTooltip");
  if (tooltip) tooltip.remove();
}
drawCalendar();
