export default class Calendar {
  static generateYearMonthData(start, end) {
    let month;
    let year;
    let startMonth = start.month();
    let startYear = start.year();
    let endMonth = end.month();
    let endYear = end.year();
    let dataArray = [];

    for (month = startMonth; month < 12; month++) {
      dataArray.push(Calendar.createYearMonthObj(month, startYear));
    }
    for (year = (startYear + 1); year < endYear; year++) {
      for (month = 0; month < 12; month++) {
        dataArray.push(Calendar.createYearMonthObj(month, year));
      }
    }
    for (month = 0; month <= (endMonth); month++) {
      dataArray.push(Calendar.createYearMonthObj(month, endYear));
    }

    return dataArray;
  }

  static createYearMonthObj(month, year) {
    return {
      key: month.toString() + year.toString(),
      month: month,
      year: year
    }
  }
}
