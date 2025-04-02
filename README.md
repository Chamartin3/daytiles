# Daytiles

A tiny JavaScript library for visualizing date ranges as grids of tiles. One tile per day, configurable layout, shape, colors, and events. No dependencies, renders to plain SVG.

[**Live examples →**](https://chamartin3.github.io/daytiles/examples/)

![Daytiles preview](examples/american-revolution/preview.png)

## What it's for

You have a date range and want to show it visually — a habit tracker, a project timeline, a pregnancy calendar, a historical period. Daytiles draws one tile per day, lets you mark events on specific days or ranges, and arranges everything as weeks, months, weekdays, or a custom grid.

## Using it

This is a **GitHub repository**, not an npm package. To use it, copy `dist/index.js` into your project (or reference it directly via a relative path) and import the `Daytiles` class.

```html
<!doctype html>
<svg id="calendar"></svg>
<script type="module">
  import { Daytiles, Layout, Shape } from "./dist/index.js";

  const dt = new Daytiles({
    layout: Layout.Month,
    shape: Shape.RoundedRect,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
  });

  dt.addEvents([
    { start: "2026-03-15", color: "#ff5577", note: "Launch" },
    { start: "2026-07-01", end: "2026-07-14", type: "vacation" },
  ]);

  dt.render(document.getElementById("calendar"));
</script>
```

That's it. The library auto-sizes the SVG to fit the rendered grid and makes it responsive.

### Building from source

If you change the TypeScript sources, rebuild `dist/`:

```bash
npm install
npm run build
```

## Configuration

All options are passed to the `Daytiles` constructor or `update()`.

### Layouts

How days are arranged into rows.

| `Layout`          | Behavior                                                                 |
| ----------------- | ------------------------------------------------------------------------ |
| `Layout.Month`    | One row per calendar month. Best for multi-month or multi-year ranges.   |
| `Layout.Week`     | One row per ISO week. Best for ~3-12 month ranges.                       |
| `Layout.Weekday`  | Columns are weekdays, rows accumulate weeks (GitHub-style heatmap).      |
| `Layout.Custom`   | Fixed `daysPerRow` count. Use for arbitrary widths regardless of weeks.  |

### Shapes

Each tile can be drawn as one of four shapes:

| `Shape`              | Result                       |
| -------------------- | ---------------------------- |
| `Shape.Rect`         | Square (default).            |
| `Shape.RoundedRect`  | Square with rounded corners. |
| `Shape.Circle`       | Circle.                      |
| `Shape.Diamond`      | 45°-rotated square.          |

### Sizing

| Option            | Type     | Description                                                    |
| ----------------- | -------- | -------------------------------------------------------------- |
| `daySize`         | number   | Tile size in px.                                               |
| `gap`             | number   | Spacing between tiles in px.                                   |
| `daysPerRow`      | number   | Used only when `layout: Layout.Custom`.                        |
| `startDayOfWeek`  | number   | 0 = Sunday, 1 = Monday. Affects week alignment.                |
| `showLabels`      | boolean  | Show row labels (month/week names).                            |
| `labelWidth`      | number   | Reserved width for labels in px.                               |

### Date range

| Option       | Type                  | Description                                          |
| ------------ | --------------------- | ---------------------------------------------------- |
| `startDate`  | `string` or `Date`    | ISO `YYYY-MM-DD` string, or a `Date` instance.       |
| `endDate`    | `string` or `Date`    | Inclusive end of the range.                          |

### Colors

The `colors` object groups all visual settings:

```js
colors: {
  current: "#FFD700",       // today's tile
  dayColor: "#eee",         // base tile color
  pastFade: 0.6,            // brightness multiplier for past days (omit to disable)
  futureFade: 1,            // brightness multiplier for future days
  highlightCurrent: true,   // highlight today with `current` color
  defaultEventColor: "#ff5577",
  eventTypeColors: {        // map event.type → color
    work: "#3c3b6e",
    vacation: "#34c759",
  },
  alternation: {
    mode: AlternationMode.Month,  // alternate background per bucket
    color: "#d2f0fa",
    size: 7,                       // only used in Custom mode
  },
  highlight: {
    weekdays: { 0: "#fee", 6: "#fee" },  // 0 = Sunday
    months: { 11: "#fef" },               // 11 = December
  },
}
```

#### Alternation modes

`AlternationMode` picks which buckets get the alternation color:

- `None` — disabled
- `Day` — every other day
- `Week` — every other ISO week
- `Month` — every other month
- `Year` — every other calendar year (useful for multi-year ranges)
- `Custom` — every `size` days

## Events

Events mark individual days or date ranges. Each event has a `start`, optional `end`, and either an explicit `color` or a `type` resolved through `colors.eventTypeColors`.

```js
dt.addEvent({ start: "2026-03-15", color: "#ff0000", note: "Release" });
dt.addEvents([
  { start: "2026-04-01", end: "2026-04-07", type: "vacation" },
  { start: "2026-05-20", color: "#0066cc", note: "Demo", wiki: "Demo_(disambiguation)" },
]);
```

| Method                       | Returns                  |
| ---------------------------- | ------------------------ |
| `addEvent(event)`            | event id                 |
| `addEvents(events)`          | array of event ids       |
| `prependEvent(event)`        | event id (rendered last) |
| `prependEvents(events)`      | array of event ids       |
| `removeEvent(id)`            | boolean                  |
| `clearEvents()`              | void                     |
| `listEvents()`               | array of stored events   |

Events are stacked in insertion order. When two events overlap, the first one inserted wins for color; notes accumulate joined by ` • `.

## Interactivity

```js
dt.onTileClick(({ date, event }) => {
  console.log(date.toDateString(), event.note);
});
```

The handler receives the clicked `Date` and the `EventInfo` (which may be empty if the day has no event).

## Updating

Call `update()` to change settings without re-creating the instance, then `render()` again:

```js
dt.update({ layout: Layout.Week, daySize: 20 });
dt.render(svgElement);
```

## Examples

The [`examples/`](examples/) directory has six self-contained demos. Each one is a static HTML page that imports `dist/index.js` directly — open them locally with any static server, or browse the live versions on GitHub Pages.

| Example                       | Showcases                                            |
| ----------------------------- | ---------------------------------------------------- |
| `playground/`                 | Every option exposed as a live form control.         |
| `habit-tracker/`              | `Layout.Weekday`, weekday-style heatmap.             |
| `pregnancy/`                  | `Layout.Week`, `Shape.Circle`, themed colors.        |
| `quarterly-goals/`            | One quarter, sprint markers as ranges.               |
| `american-revolution/`        | `Layout.Month`, multi-year, side Wikipedia panel.    |
| `french-revolution/`          | `Layout.Custom` (90 days/row), year alternation.     |

## Deploying the examples

The repo includes a GitHub Actions workflow at `.github/workflows/pages.yml` that publishes the entire repo to GitHub Pages on every push to `main`. To enable it:

1. Push the repo to GitHub.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. The workflow will run automatically; the examples will be available at `https://chamartin3.github.io/daytiles/examples/`.

Because the examples reference `../../dist/index.js` directly, no build step is required at deploy time — `dist/` is committed alongside the source.

## License

MIT.
