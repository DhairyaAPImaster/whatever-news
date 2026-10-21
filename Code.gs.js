
const SPREADSHEET_ID = "1JRNgIF4l0xsUOexpotsqt_pWC9Y7PqJuYAR7E7U1T6w";

function getNewspaperSheet() {
  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("Newspapers");

  if (!sheet) {
    throw new Error('Sheet "Newspapers" was not found.');
  }

  return sheet;
}

function doGet(e) {
  try {
    const sheet = getNewspaperSheet();
    const rows = sheet.getDataRange().getValues();
    const newspapers = [];

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] && rows[i][1]) {
        newspapers.push({
          name: rows[i][0],
          pages: JSON.parse(rows[i][1]),
          date: rows[i][2]
        });
      }
    }

    newspapers.reverse();

    const result = JSON.stringify(newspapers);
    const callback = e && e.parameter
      ? e.parameter.callback
      : null;

    if (
      callback &&
      /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(callback)
    ) {
      return ContentService
        .createTextOutput(callback + "(" + result + ");")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    return ContentService
      .createTextOutput(result)
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const name = String(data.name || "").trim();
    const pages = data.pages;

    if (
      !name ||
      name.length > 150 ||
      !Array.isArray(pages) ||
      pages.length === 0 ||
      pages.length > 100
    ) {
      throw new Error("Invalid newspaper details.");
    }

    for (let i = 0; i < pages.length; i++) {
      if (
        typeof pages[i] !== "string" ||
        !pages[i].startsWith("https://")
      ) {
        throw new Error("Invalid page URL.");
      }
    }

    const sheet = getNewspaperSheet();

    sheet.appendRow([
      name,
      JSON.stringify(pages),
      new Date()
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
