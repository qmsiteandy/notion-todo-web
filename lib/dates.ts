const TIME_ZONE = "Asia/Taipei";

/** Today's date as YYYY-MM-DD in Taipei time. */
export function todayInTaipei(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
