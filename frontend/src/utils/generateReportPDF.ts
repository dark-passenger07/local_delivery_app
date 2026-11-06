import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Share, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

interface DeliveryItem {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  productName: string;
  baseQuantity: string;
  finalQuantity: string;
  requestType: string | null;
  requestMessage: string | null;
}

interface ReportData {
  reportDate: string;
  totalDeliveries: number;
  totalQuantity: string;
  deliveries: DeliveryItem[];
}

function formatReportDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  if (isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getRequestBadgeColor(type: string): { fill: number[]; text: number[] } {
  switch (type) {
    case 'INCREASE':
      return { fill: [220, 252, 231], text: [22, 163, 74] };
    case 'DECREASE':
      return { fill: [254, 243, 199], text: [217, 119, 6] };
    case 'SKIP':
      return { fill: [254, 226, 226], text: [220, 38, 38] };
    default:
      return { fill: [241, 245, 249], text: [100, 116, 139] };
  }
}

function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  let binaryString = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binaryString += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binaryString);
}

// pdf-lib has no built-in text-centering option, so every "centered" string
// must have its width measured with the font/size it will be drawn at, and
// then be placed at (centerX - textWidth / 2).
function drawCenteredText(
  page: any,
  text: string,
  centerX: number,
  y: number,
  font: any,
  size: number,
  color: any
) {
  const textWidth = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: centerX - textWidth / 2,
    y,
    size,
    font,
    color,
  });
}

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_LEFT = 14;
const MARGIN_RIGHT = 14;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
const MARGIN_TOP = 18;
const MARGIN_BOTTOM = 24;
const TABLE_HEADER_HEIGHT = 22;
const TABLE_ROW_HEIGHT = 22;
const TABLE_HEADER_COLOR = [79, 70, 229];
const TABLE_ALT_ROW_COLOR = [248, 250, 252];
const TABLE_BORDER_COLOR = [226, 232, 240];
const PRIMARY_COLOR = [79, 70, 229];
const TEXT_COLOR = [15, 23, 42];
const SUBTITLE_COLOR = [100, 116, 139];
const MUTED_COLOR = [148, 163, 184];
const WHITE = [255, 255, 255];


function sanitizePdfText(value: string): string {
  return String(value ?? '')
    .replace(/\u202F/g, ' ')
    .replace(/\u00A0/g, ' ')
    .replace(/\u2014/g, '-')
    .replace(/\u2013/g, '-');
}

function fitText(value: string, maxLength: number): string {
  const text = (value || "").trim();
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

// Wraps text into as many lines as needed so nothing is truncated — the
// address column especially must always show in full, never "…".
function wrapLines(value: string, font: any, size: number, maxWidth: number): string[] {
  const clean = sanitizePdfText(value || "").trim();
  if (!clean) return ["-"];
  const words = clean.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  const pushWord = (word: string) => {
    // Hard-break a single word that is wider than the column itself
    // (e.g. a long phone number or house code with no spaces).
    let w = word;
    while (w && font.widthOfTextAtSize(w, size) > maxWidth) {
      let k = w.length - 1;
      while (k > 1 && font.widthOfTextAtSize(w.slice(0, k), size) > maxWidth) k--;
      if (current) {
        lines.push(current);
        current = "";
      }
      lines.push(w.slice(0, k));
      w = w.slice(k);
    }
    const test = current ? `${current} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = w;
    }
  };
  for (const word of words) pushWord(word);
  if (current) lines.push(current);
  return lines.length > 0 ? lines : ["-"];
}

// Column widths sum to CONTENT_WIDTH (567). Address gets the widest share
// so full delivery addresses fit without overflow.
const TABLE_COL_WIDTHS = [92, 62, 148, 72, 48, 145];
const TABLE_HEADERS = ['Customer', 'Phone', 'Address', 'Product', 'Qty', 'Request'];
const CELL_FONT_SIZE = 8;
const CELL_LINE_HEIGHT = 10;
const CELL_PAD_Y = 5;
const CELL_PAD_X = 3;

export async function generateAndDownloadReport(report: ReportData): Promise<void> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let yPosition = PAGE_HEIGHT - MARGIN_TOP;
  let pageNum = 1;

  const drawHeader = () => {
    yPosition = PAGE_HEIGHT - MARGIN_TOP;

    page.drawLine({
      start: { x: MARGIN_LEFT, y: yPosition },
      end: { x: PAGE_WIDTH - MARGIN_RIGHT, y: yPosition },
      color: rgb(0.94, 0.95, 0.98),
      thickness: 2,
    });
    yPosition -= 8;

    drawCenteredText(
      page,
      "Today's Delivery Report",
      PAGE_WIDTH / 2,
      yPosition,
      fontBold,
      20,
      rgb(0.06, 0.09, 0.17)
    );
    yPosition -= 17;

    const subtitle = `${formatReportDate(report.reportDate)}  •  ${report.totalDeliveries} ${report.totalDeliveries === 1 ? "delivery" : "deliveries"}  •  ${report.totalQuantity} units`;
    drawCenteredText(
      page,
      subtitle,
      PAGE_WIDTH / 2,
      yPosition,
      font,
      9,
      rgb(0.39, 0.45, 0.55)
    );
    yPosition -= 10;

    page.drawLine({
      start: { x: MARGIN_LEFT, y: yPosition },
      end: { x: PAGE_WIDTH - MARGIN_RIGHT, y: yPosition },
      color: rgb(0.31, 0.27, 0.89),
      thickness: 0.8,
    });
    yPosition -= 10;
  };

  const drawFooter = () => {
    const footerY = MARGIN_BOTTOM - 4;
    drawCenteredText(
      page,
      `Page ${pageNum}`,
      PAGE_WIDTH / 2,
      footerY,
      font,
      8,
      rgb(0.58, 0.64, 0.72)
    );

    page.drawLine({
      start: { x: MARGIN_LEFT, y: footerY + 3 },
      end: { x: PAGE_WIDTH - MARGIN_RIGHT, y: footerY + 3 },
      color: rgb(0.89, 0.91, 0.94),
      thickness: 0.3,
    });
  };

  const drawSummaryStats = () => {
    const statWidth = CONTENT_WIDTH / 2 - 4;
    const statHeight = 56;

    const drawStat = (x: number, value: string, label: string) => {
      page.drawRectangle({
        x,
        y: yPosition - statHeight,
        width: statWidth,
        height: statHeight,
        borderColor: rgb(0.89, 0.91, 0.94),
        borderWidth: 1,
        color: rgb(0.96, 0.97, 0.99),
      });
      // Accent bar on top of each stat card
      page.drawRectangle({
        x,
        y: yPosition - 4,
        width: statWidth,
        height: 4,
        color: rgb(0.31, 0.27, 0.89),
      });
      drawCenteredText(
        page,
        String(value),
        x + statWidth / 2,
        yPosition - 30,
        fontBold,
        22,
        rgb(0.31, 0.27, 0.89)
      );
      drawCenteredText(
        page,
        label,
        x + statWidth / 2,
        yPosition - 44,
        font,
        8,
        rgb(0.39, 0.45, 0.55)
      );
    };

    drawStat(MARGIN_LEFT, String(report.totalDeliveries), 'TOTAL DELIVERIES');
    drawStat(MARGIN_LEFT + statWidth + 8, String(report.totalQuantity), 'TOTAL QUANTITY');

    yPosition -= statHeight + 10;
  };

  const drawTable = () => {
    const drawTableHeader = () => {
      page.drawText('Delivery Details', {
        x: MARGIN_LEFT,
        y: yPosition,
        size: 11,
        font: fontBold,
        color: rgb(0.06, 0.09, 0.17),
      });
      yPosition -= 8;

      const colWidths = TABLE_COL_WIDTHS;
      const headers = TABLE_HEADERS;

      page.drawRectangle({
        x: MARGIN_LEFT,
        y: yPosition - TABLE_HEADER_HEIGHT,
        width: CONTENT_WIDTH,
        height: TABLE_HEADER_HEIGHT,
        color: rgb(0.31, 0.27, 0.89),
      });

      let headerXPos = MARGIN_LEFT + 3;
      for (let i = 0; i < headers.length; i++) {
        page.drawText(headers[i], {
          x: headerXPos,
          y: yPosition - 14,
          size: 8,
          font: fontBold,
          color: rgb(1, 1, 1),
        });
        headerXPos += colWidths[i];
      }

      const verticalLines = [MARGIN_LEFT];
      let vx = MARGIN_LEFT;
      for (let i = 0; i < colWidths.length; i++) {
        vx += colWidths[i];
        verticalLines.push(vx);
      }

      for (const vl of verticalLines) {
        page.drawLine({
          start: { x: vl, y: yPosition - TABLE_HEADER_HEIGHT },
          end: { x: vl, y: yPosition },
          color: rgb(0.27, 0.23, 0.81),
          thickness: 0.5,
        });
      }

      yPosition -= TABLE_HEADER_HEIGHT;

      return { colWidths, verticalLines };
    };
    yPosition -= 8;

    if (report.deliveries.length === 0) {
      // Empty state: a bordered box with breathing room below the stat
      // cards. yPosition only ever moves DOWN here (PDF origin is at the
      // bottom-left), so nothing can overlap what was drawn above.
      const boxHeight = 52;
      const boxTop = yPosition - 6;
      page.drawRectangle({
        x: MARGIN_LEFT,
        y: boxTop - boxHeight,
        width: CONTENT_WIDTH,
        height: boxHeight,
        borderColor: rgb(0.89, 0.91, 0.94),
        borderWidth: 1,
        color: rgb(0.98, 0.99, 1.0),
      });
      drawCenteredText(
        page,
        'No deliveries recorded for this date.',
        PAGE_WIDTH / 2,
        boxTop - 32,
        font,
        12,
        rgb(0.39, 0.45, 0.55)
      );
      yPosition = boxTop - boxHeight - 14;
      return;
    }

    let { colWidths, verticalLines } = drawTableHeader();

    report.deliveries.forEach((item, rowIndex) => {
      const isModified =
        item.requestType === 'INCREASE' || item.requestType === 'DECREASE';
      const qtyDisplay = isModified
        ? `${item.baseQuantity} -> ${item.finalQuantity}*`
        : item.finalQuantity;

      let requestLabel = '-';
      if (item.requestType) {
        requestLabel = item.requestType;
      }
      const requestDetail = item.requestMessage
        ? `${requestLabel}: ${item.requestMessage}`
        : requestLabel;

      // Wrap every cell to its column width so the full address (and every
      // other field) is always visible — nothing is truncated or overflows.
      const cellTexts = [
        item.customerName || "-",
        item.customerPhone || "-",
        item.customerAddress || "-",
        item.productName || "-",
        qtyDisplay || "-",
        requestDetail,
      ];
      const cellLines = cellTexts.map((text, col) =>
        wrapLines(text, font, CELL_FONT_SIZE, colWidths[col] - CELL_PAD_X * 2)
      );
      const maxLines = Math.max(...cellLines.map((l) => l.length));
      const rowHeight = maxLines * CELL_LINE_HEIGHT + CELL_PAD_Y * 2;

      // If the full wrapped row would spill past the bottom margin, start a
      // new page and redraw headers so columns keep lining up.
      if (yPosition - rowHeight < MARGIN_BOTTOM) {
        drawFooter();
        page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        pageNum++;
        yPosition = PAGE_HEIGHT - MARGIN_TOP;
        drawHeader();
        const headerState = drawTableHeader();
        colWidths = headerState.colWidths;
        verticalLines = headerState.verticalLines;
      }

      const rowY = yPosition - rowHeight;

      if (rowIndex % 2 === 1) {
        page.drawRectangle({
          x: MARGIN_LEFT,
          y: rowY,
          width: CONTENT_WIDTH,
          height: rowHeight,
          color: rgb(0.97, 0.98, 0.99),
        });
      }

      page.drawLine({
        start: { x: MARGIN_LEFT, y: rowY },
        end: { x: PAGE_WIDTH - MARGIN_RIGHT, y: rowY },
        color: rgb(0.89, 0.91, 0.94),
        thickness: 0.5,
      });

      for (const vl of verticalLines) {
        page.drawLine({
          start: { x: vl, y: rowY },
          end: { x: vl, y: rowY + rowHeight },
          color: rgb(0.89, 0.91, 0.94),
          thickness: 0.5,
        });
      }

      let cellX = MARGIN_LEFT;
      for (let col = 0; col < cellLines.length; col++) {
        const textColor =
          col === 4 && isModified
            ? rgb(0.31, 0.27, 0.89)
            : col === 5 && item.requestType
              ? rgb(
                getRequestBadgeColor(item.requestType).text[0] / 255,
                getRequestBadgeColor(item.requestType).text[1] / 255,
                getRequestBadgeColor(item.requestType).text[2] / 255
              )
              : rgb(0.06, 0.09, 0.17);

        const lines = cellLines[col];
        for (let li = 0; li < lines.length; li++) {
          const line = lines[li];
          const baselineY = yPosition - CELL_PAD_Y - CELL_FONT_SIZE - li * CELL_LINE_HEIGHT;
          if (col === 4) {
            // Center the quantity inside its narrow column
            const w = font.widthOfTextAtSize(line, CELL_FONT_SIZE);
            page.drawText(line, {
              x: cellX + (colWidths[col] - w) / 2,
              y: baselineY,
              size: CELL_FONT_SIZE,
              font: isModified ? fontBold : font,
              color: textColor,
            });
          } else {
            page.drawText(line, {
              x: cellX + CELL_PAD_X,
              y: baselineY,
              size: CELL_FONT_SIZE,
              font,
              color: textColor,
            });
          }
        }
        cellX += colWidths[col];
      }

      yPosition = rowY;
    });

    yPosition -= 6;
  };

  const drawProductSummary = () => {
    if (report.deliveries.length === 0) {
      return;
    }

    yPosition -= 10;

    page.drawText('Product Quantity Summary', {
      x: MARGIN_LEFT,
      y: yPosition,
      size: 11,
      font: fontBold,
      color: rgb(0.06, 0.09, 0.17),
    });
    yPosition -= 8;

    const productTotals = new Map<string, number>();
    for (const item of report.deliveries) {
      const qty = parseFloat(item.finalQuantity) || 0;
      const current = productTotals.get(item.productName) || 0;
      productTotals.set(item.productName, current + qty);
    }

    const summaryRows = Array.from(productTotals.entries()).map(([name, qty]) => ({
      productName: name,
      totalQuantity: qty,
    }));

    const rowHeight = 18;
    const headerHeight = 18;
    const colWidths = [CONTENT_WIDTH - 80, 80];

    const drawSummaryHeader = () => {
      page.drawRectangle({
        x: MARGIN_LEFT,
        y: yPosition - headerHeight,
        width: CONTENT_WIDTH,
        height: headerHeight,
        color: rgb(0.31, 0.27, 0.89),
      });

      page.drawText('Product', {
        x: MARGIN_LEFT + 3,
        y: yPosition - 12,
        size: 8,
        font: fontBold,
        color: rgb(1, 1, 1),
      });

      page.drawText('Total Quantity', {
        x: MARGIN_LEFT + colWidths[0] + 3,
        y: yPosition - 12,
        size: 8,
        font: fontBold,
        color: rgb(1, 1, 1),
      });

      const verticalLines = [
        MARGIN_LEFT,
        MARGIN_LEFT + colWidths[0],
        MARGIN_LEFT + CONTENT_WIDTH,
      ];
      for (const vl of verticalLines) {
        page.drawLine({
          start: { x: vl, y: yPosition - headerHeight },
          end: { x: vl, y: yPosition },
          color: rgb(0.27, 0.23, 0.81),
          thickness: 0.5,
        });
      }

      yPosition -= headerHeight;
    };

    drawSummaryHeader();

    summaryRows.forEach((row, rowIndex) => {
      if (yPosition - rowHeight < MARGIN_BOTTOM) {
        drawFooter();
        page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        pageNum++;
        yPosition = PAGE_HEIGHT - MARGIN_TOP;
        drawHeader();
        drawSummaryHeader();
      }

      const rowY = yPosition - rowHeight;

      if (rowIndex % 2 === 1) {
        page.drawRectangle({
          x: MARGIN_LEFT,
          y: rowY,
          width: CONTENT_WIDTH,
          height: rowHeight,
          color: rgb(0.97, 0.98, 0.99),
        });
      }

      page.drawLine({
        start: { x: MARGIN_LEFT, y: rowY },
        end: { x: PAGE_WIDTH - MARGIN_RIGHT, y: rowY },
        color: rgb(0.89, 0.91, 0.94),
        thickness: 0.1,
      });

      page.drawLine({
        start: { x: MARGIN_LEFT + colWidths[0], y: rowY },
        end: { x: MARGIN_LEFT + colWidths[0], y: rowY + rowHeight },
        color: rgb(0.89, 0.91, 0.94),
        thickness: 0.1,
      });

      page.drawLine({
        start: { x: MARGIN_LEFT + CONTENT_WIDTH, y: rowY },
        end: { x: MARGIN_LEFT + CONTENT_WIDTH, y: rowY + rowHeight },
        color: rgb(0.89, 0.91, 0.94),
        thickness: 0.1,
      });

      page.drawText(sanitizePdfText(fitText(row.productName, 55)), {
        x: MARGIN_LEFT + 3,
        y: rowY + 5,
        size: 9,
        font: font,
        color: rgb(0.06, 0.09, 0.17),
      });

      drawCenteredText(
        page,
        String(row.totalQuantity),
        MARGIN_LEFT + colWidths[0] + colWidths[1] / 2,
        rowY + 5,
        font,
        9,
        rgb(0.06, 0.09, 0.17)
      );

      yPosition = rowY;
    });

    page.drawLine({
      start: { x: MARGIN_LEFT, y: yPosition },
      end: { x: PAGE_WIDTH - MARGIN_RIGHT, y: yPosition },
      color: rgb(0.89, 0.91, 0.94),
      thickness: 0.3,
    });

    yPosition -= 6;
  };

  const drawFooterNote = () => {
    if (yPosition < MARGIN_BOTTOM + 20) {
      drawFooter();
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      pageNum++;
      yPosition = PAGE_HEIGHT - MARGIN_TOP;
      drawHeader();
    }

    page.drawLine({
      start: { x: MARGIN_LEFT, y: yPosition },
      end: { x: PAGE_WIDTH - MARGIN_RIGHT, y: yPosition },
      color: rgb(0.89, 0.91, 0.94),
      thickness: 0.3,
    });
    yPosition -= 12;

    drawCenteredText(
      page,
      sanitizePdfText(
        report.deliveries.length > 0
          ? '* Modified quantity shown for accepted increase/decrease requests  |  Generated on ' +
            formatDateTime(new Date())
          : 'Generated on ' + formatDateTime(new Date())
      ),
      PAGE_WIDTH / 2,
      yPosition,
      font,
      7,
      rgb(0.58, 0.64, 0.72)
    );
  };

  drawHeader();
  drawSummaryStats();
  drawTable();
  drawProductSummary();
  drawFooterNote();
  drawFooter();

  const pdfBytes = await pdfDoc.save();
  const pdfBase64 = uint8ArrayToBase64(pdfBytes);
  const fileName = `Delivery_Report_${report.reportDate}.pdf`;
  const fileUri = `${FileSystem.documentDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(fileUri, pdfBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Use expo-sharing instead of React Native Share for better PDF handling
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share Delivery Report',
      UTI: 'com.adobe.pdf',
    });
  } else {
    throw new Error('Sharing is not available on this device');
  }
}