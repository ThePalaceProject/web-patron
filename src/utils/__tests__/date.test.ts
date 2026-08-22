import { formatDate } from "utils/date";
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

  test("returns undefined for an unparseable date", () => {
    // Intl.DateTimeFormat.format throws a RangeError on an Invalid Date, so a
    // malformed feed value must not reach it
    expect(formatDate("not-a-date", Language.EN)).toBeUndefined();
    expect(formatDate("", Language.EN)).toBeUndefined();
  });
});
