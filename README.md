# Daytiles

Snippet for visualizing date ranges as grids of tiles (Github syle)  One tile per day. Useful to visualize long ranges of days,  


Configurable layout, shape, colors, and events. No dependencies, renders to plain SVG.


[**See the Live examples →**](https://chamartin3.github.io/daytiles/examples/)

<img width="1082" height="189" alt="Screenshot_20260507_003151" src="https://github.com/user-attachments/assets/6a34141d-9262-49d8-8e6b-c8d64363ec2a" />



## Using it


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

- `None`: disabled
- `Day`: every other day
- `Week`: every other ISO week
- `Month`: every other month
- `Year`: every other calendar year (useful for multi-year ranges)
- `Custom`: every `size` days

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


## License

MIT.
