import { formatDate, timeUntil } from "utils/date";
import { Language } from "utils/i18n";

describe("formatDate", () => {
  test("formats a date in each supported locale", () => {
    expect(formatDate("2014-06-08", Language.EN)).toBe("June 8, 2014");
    expect(formatDate("2014-06-08", Language.FR)).toBe("8 juin 2014");
    expect(formatDate("2014-06-08", Language.IT)).toBe("8 giugno 2014");
    expect(formatDate("2014-06-08", Language.DE)).toBe("8. Juni 2014");
    expect(formatDate("2014-06-08", Language.ES)).toBe("8 de junio de 2014");
  });

  test("formats a full timestamp using the UTC calendar day", () => {
    // late-UTC times must not roll back a day for readers west of UTC
    expect(formatDate("2020-09-25T23:30:00Z", Language.EN)).toBe(
      "September 25, 2020"
    );
  });

  test("formats a full timestamp in the local time zone when utc is false", () => {
    // Pin the host environment's time zone to UTC+14, so date rolls over to the next calendar day.
    // spy inspired by https://sheetsj.com/2021/05/mock-intl-and-date-globals-in-jest.
    const OriginalDateTimeFormat = Intl.DateTimeFormat;
    const spy = jest.spyOn(Intl, "DateTimeFormat").mockImplementation(
      (locale?: Intl.LocalesArgument, options?: Intl.DateTimeFormatOptions) =>
        new OriginalDateTimeFormat(locale, {
          ...options,
          timeZone:
            options?.timeZone === undefined
              ? "Pacific/Kiritimati"
              : options.timeZone
        })
    );
    try {
      expect(
        formatDate("2026-10-19T12:00:00Z", Language.EN, { utc: false })
      ).toBe("October 20, 2026");
    } finally {
      spy.mockRestore();
    }
  });

  test("returns undefined for an unparseable date", () => {
    // Intl.DateTimeFormat.format throws a RangeError on an Invalid Date, so a
    // malformed feed value must not reach it
    expect(formatDate("not-a-date", Language.EN)).toBeUndefined();
    expect(formatDate("", Language.EN)).toBeUndefined();
    expect(
      formatDate("not-a-date", Language.EN, { utc: false })
    ).toBeUndefined();
  });
});

describe("timeUntil", () => {
  const now = Date.parse("2026-10-06T12:00:00Z");
  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const at = (ms: number) => new Date(now + ms).toISOString();

  test("rounds down to whole days at 24 hours or more", () => {
    // 13 days, 23 hours, 59 minutes
    expect(timeUntil(at(13 * DAY + 23 * HOUR + 59 * MINUTE), now)).toEqual({
      unit: "days",
      count: 13
    });

    // 1 day
    expect(timeUntil(at(DAY), now)).toEqual({ unit: "days", count: 1 });

    // 1 day, 23 hours
    expect(timeUntil(at(DAY + 23 * HOUR), now)).toEqual({
      unit: "days",
      count: 1
    });
  });

  test("rounds down to whole hours under 24 hours", () => {
    // 23 hours, 59 minutes
    expect(timeUntil(at(23 * HOUR + 59 * MINUTE), now)).toEqual({
      unit: "hours",
      count: 23
    });

    // 1 hour
    expect(timeUntil(at(HOUR), now)).toEqual({ unit: "hours", count: 1 });
  });

  test("is less than an hour under 60 minutes", () => {
    // 59 minutes
    expect(timeUntil(at(59 * MINUTE), now)).toEqual({ unit: "lessThanHour" });

    // 1000 milliseconds
    expect(timeUntil(at(1000), now)).toEqual({ unit: "lessThanHour" });
  });

  test("returns undefined for a date that has passed", () => {
    expect(timeUntil(at(0), now)).toBeUndefined();
    expect(timeUntil(at(-DAY), now)).toBeUndefined();
  });

  test("returns undefined for an unparseable date", () => {
    expect(timeUntil("not-a-date", now)).toBeUndefined();
    expect(timeUntil("", now)).toBeUndefined();
  });

  test("measures from the current time by default", () => {
    jest.spyOn(Date, "now").mockReturnValue(now);
    expect(timeUntil(at(3 * DAY))).toEqual({ unit: "days", count: 3 });
  });
});
