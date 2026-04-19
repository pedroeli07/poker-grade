import {
  TOPBAR_DATE_LOADING,
  TOPBAR_TIME_PLACEHOLDER,
  TOPBAR_WEEKDAY_LOADING,
} from "@/lib/constants/topbar";

const timeOpts: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

const weekdayOpts: Intl.DateTimeFormatOptions = { weekday: "long" };

const dateOpts: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "long",
  year: "numeric",
};

export function formatTopbarTime(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", timeOpts).format(d);
}

export function formatTopbarWeekdayCapitalized(d: Date): string {
  const w = new Intl.DateTimeFormat("pt-BR", weekdayOpts).format(d);
  return w.charAt(0).toUpperCase() + w.slice(1);
}

export function formatTopbarLongDate(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", dateOpts).format(d);
}

export type TopbarClockFormatted = {
  timeStr: string;
  weekdayFormatted: string;
  dateStr: string;
};

export function formatTopbarClockStrings(time: Date | null): TopbarClockFormatted {
  if (!time) {
    return {
      timeStr: TOPBAR_TIME_PLACEHOLDER,
      weekdayFormatted: TOPBAR_WEEKDAY_LOADING,
      dateStr: TOPBAR_DATE_LOADING,
    };
  }
  return {
    timeStr: formatTopbarTime(time),
    weekdayFormatted: formatTopbarWeekdayCapitalized(time),
    dateStr: formatTopbarLongDate(time),
  };
}
