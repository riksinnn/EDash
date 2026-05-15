function downloadText(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvCell(value) {
  const cell = value == null ? "" : String(value);
  if (!/[",\n\r]/.test(cell)) return cell;
  return `"${cell.replace(/"/g, '""')}"`;
}

export function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
  downloadText(filename, csv, "text/csv;charset=utf-8");
}

function escapeIcsText(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatIcsDate(date, time) {
  const [hours, minutes] = time.split(":");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(
    hours
  )}${pad(minutes)}00`;
}

function nextDateForDay(dayIndex) {
  const date = new Date();
  const diff = (dayIndex - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

const dayCodes = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

export function downloadScheduleIcs(entries, filename = "edash-classes.ics") {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Manila";
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const events = entries
    .filter((entry) => entry.startTime && entry.endTime)
    .map((entry) => {
      const startDate = nextDateForDay(entry.dayIndex);
      const details = [
        entry.teacher ? `Teacher: ${entry.teacher}` : "",
        entry.room ? `Room: ${entry.room}` : "",
      ]
        .filter(Boolean)
        .join("\\n");

      return [
        "BEGIN:VEVENT",
        `UID:edash-${entry.id}@edash.local`,
        `DTSTAMP:${timestamp}`,
        `DTSTART;TZID=${timeZone}:${formatIcsDate(startDate, entry.startTime)}`,
        `DTEND;TZID=${timeZone}:${formatIcsDate(startDate, entry.endTime)}`,
        `RRULE:FREQ=WEEKLY;BYDAY=${dayCodes[entry.dayIndex]}`,
        `SUMMARY:${escapeIcsText(entry.subject)}`,
        entry.room ? `LOCATION:${escapeIcsText(entry.room)}` : "",
        details ? `DESCRIPTION:${escapeIcsText(details)}` : "",
        "END:VEVENT",
      ]
        .filter(Boolean)
        .join("\r\n");
    })
    .join("\r\n");

  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//EDash//Class Schedule//EN",
    "CALSCALE:GREGORIAN",
    events,
    "END:VCALENDAR",
  ].join("\r\n");

  downloadText(filename, calendar, "text/calendar;charset=utf-8");
}
