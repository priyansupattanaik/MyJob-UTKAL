const moment = require("moment");


const validateAndFormatDate = async (dateInput) => {
  const formats = [
    "DD/MM/YYYY",
    "DD-MM-YYYY",
    "YYYY/MM/DD",
    "YYYY-MM-DD",
    "MM-DD-YYYY",
    "MMM/DD/YYYY",
    "DD/MMM/YYYY",
  ];

  // Helper function to parse date with specific format
  const parseDateWithFormat = (dateStr, format) => {
    const parts = dateStr.split(format.includes("-") ? "-" : "/");
    if (parts.length !== 3) return null;

    let day, month, year;
    if (format === "DD/MM/YYYY" || format === "DD-MM-YYYY") {
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1; // Months are 0-indexed
      year = parseInt(parts[2], 10);
    } else if (format === "YYYY/MM/DD" || format === "YYYY-MM-DD") {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    } else if (format === "MM-DD-YYYY") {
      month = parseInt(parts[0], 10) - 1;
      day = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
    } else if (format === "MMM/DD/YYYY" || format === "DD/MMM/YYYY") {
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const monthIndex = monthNames.indexOf(parts[0]);
      if (monthIndex === -1) return null;
      month = monthIndex;
      day = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
    }

    const parsedDate = new Date(year, month, day);
    return parsedDate.getTime() ? parsedDate : null;
  };

  // Handle JavaScript Date object
  if (dateInput instanceof Date && !isNaN(dateInput)) {
    return dateInput.toISOString().slice(0, 23) + "Z";
  }

  if (typeof dateInput === "string") {
    // Try parsing the string with the specified formats
    for (let format of formats) {
      const parsedDate = parseDateWithFormat(dateInput, format);
      if (parsedDate) {
        return parsedDate.toISOString().slice(0, 23) + "Z";
      }
    }

    // Handle ISO 8601 and other common date formats using Date.parse()
    const parsedDate = Date.parse(dateInput);
    if (!isNaN(parsedDate)) {
      return new Date(parsedDate).toISOString().slice(0, 23) + "Z";
    }

    // If no valid date was found, attempt to convert to a numeric value
    const numericDate = Number(dateInput);
    if (!isNaN(numericDate)) {
      dateInput = numericDate;
    }
  }

  // Handle number input (Excel date or Unix timestamp)
  if (typeof dateInput === "number") {
    // Handle Excel serial date
    if (dateInput >= 1 && dateInput < 1e10) {
      // Roughly restrict to valid Excel serial numbers
      const excelEpoch = new Date(Date.UTC(1900, 0, 1)); // Correct starting date
      const excelDateOffset = dateInput - 1; // Excel dates start from 1
      const convertedDate = new Date(
        excelEpoch.getTime() + excelDateOffset * 86400000
      );
      if (!isNaN(convertedDate.getTime())) {
        return convertedDate.toISOString().slice(0, 23) + "Z";
      }
    }

    // Handle Unix timestamp
    const convertedDate = new Date(
      dateInput > 10000000000 ? dateInput : dateInput * 1000
    );
    if (!isNaN(convertedDate.getTime())) {
      return convertedDate.toISOString().slice(0, 23) + "Z";
    }
  }

  // Log failure if no valid date found
  console.log(`Failed to parse date: ${dateInput}`);
  return null;
};


const validateAndFormatDateTime = async (dateInput) => {
  const formats = ['DD/MM/YYYY', 'DD-MM-YYYY', 'YYYY/MM/DD', 'YYYY-MM-DD', 'MM-DD-YYYY', 'MMM/DD/YYYY', 'DD/MMM/YYYY', moment.ISO_8601];
  // Handle JavaScript Date object
  if (dateInput instanceof Date && !isNaN(dateInput)) {
    return moment(dateInput); // Return formatted date
  }

  // Check if the input is a string
  if (typeof dateInput === 'string') {

    // Try parsing the string with the specified formats
    for (let format of formats) {
      const parsedDate = moment(dateInput, format, true); // Using strict parsing
      if (parsedDate.isValid()) {
        return parsedDate; // Return formatted date
      }
    }

    // If no valid date was found, attempt to convert to a numeric value
    const numericDate = Number(dateInput);
    if (!isNaN(numericDate)) {
      dateInput = numericDate; // Convert to number if valid
    }
  }

  // Handle number input (Excel date or Unix timestamp)
  if (typeof dateInput === 'number') {
    // Handle Excel serial date
    if (dateInput >= 1 && dateInput < 1e10) { // Roughly restrict to valid Excel serial numbers
      const excelEpoch = new Date(Date.UTC(1900, 0, 1)); // Correct starting date
      const excelDateOffset = (dateInput - 1); // Excel dates start from 1
      const convertedDate = new Date(excelEpoch.getTime() + excelDateOffset * 86400000); // 86400000 ms in a day
      if (moment(convertedDate).isValid()) {
        return moment(convertedDate); // Return formatted date
      }
    }

    // Handle Unix timestamp
    const convertedDate = moment(dateInput > 10000000000 ? dateInput : dateInput * 1000);
    if (convertedDate.isValid()) {
      return convertedDate; // Return formatted date
    }
  }

  // Log failure if no valid date found
  console.log(`Failed to parse date: ${dateInput}`);
  return null; // Return null for invalid input
};

// (async () => {
//   console.log(await validateAndFormatDate("12/12/2024")); // Expected output: "2024-12-12T00:00:00.000Z"
//   console.log(await validateAndFormatDate("12-12-2024")); // Expected output: "2024-12-12T00:00:00.000Z"
//   console.log(await validateAndFormatDate("2024-12-12")); // Expected output: "2024-12-12T00:00:00.000Z"
//   console.log(await validateAndFormatDate("Dec/12/2024")); // Expected output: "2024-12-12T00:00:00.000Z"
//   console.log(await validateAndFormatDate(1639046400)); // Expected output: "2021-12-09T00:00:00.000Z"
//   console.log(await validateAndFormatDate(44204)); // Expected output: "2021-12-09T00:00:00.000Z"
//   console.log(await validateAndFormatDate("31/02/2024")); // Expected output: null, invalid date
// })();

module.exports = { validateAndFormatDateTime };
