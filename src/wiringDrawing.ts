// ============================================================================
// SƠ ĐỒ ĐI DÂY & DỰ TOÁN CÔNG TRÌNH (WIRING DIAGRAM + COST ESTIMATE)
// Hạng mục: Cấp điện - Nhà vận hành bảng điện (phòng 6.0m x 4.2m)
// Layout khung bản vẽ A1 tiêu chuẩn (5670 x 5350) gồm 6 phân khu:
//   1. Sơ đồ 1 tuyến cấp điện (ONE-LINE DIAGRAM)
//   2. Mặt bằng đi dây & bố trí thiết bị (TỈ LỆ 1:50)
//   3. Bảng thống kê tuyến đi dây (CABLE SCHEDULE)
//   4. Ghi chú kỹ thuật (TECHNICAL NOTES)
//   5. Bảng dự toán tóm tắt (COST ESTIMATE SUMMARY)
//   6. Khung tên bản vẽ (TCVN TITLE BLOCK)
// ============================================================================
import { CadEngine } from './cadEngine.js';
import { computeEstimate, estimateSummaryRows, formatVND, pct } from './estimate.js';

// Kí hiệu CB (MCB): hình chữ nhật + đường chéo ngắt
function cbSymbol(engine: CadEngine, x: number, y: number, w: number, h: number, layer: string) {
  engine.drawRectangle(x, y, w, h, layer);
  engine.drawLine(x, y, x + w, y + h, layer);
}

// Kí hiệu đèn: hình tròn + chữ X
function lampSymbol(engine: CadEngine, x: number, y: number, r: number, layer: string) {
  engine.drawCircle(x, y, r, layer);
  const d = r * 0.72;
  engine.drawLine(x - d, y - d, x + d, y + d, layer);
  engine.drawLine(x - d, y + d, x + d, y - d, layer);
}

// Kí hiệu tiếp đất: 3 gạch ngang thu dần
function groundSymbol(engine: CadEngine, x: number, y: number, layer: string) {
  engine.drawLine(x - 30, y, x + 30, y, layer);
  engine.drawLine(x - 20, y - 18, x + 20, y - 18, layer);
  engine.drawLine(x - 10, y - 36, x + 10, y - 36, layer);
}

// Kí hiệu ổ cắm: bán tròn + 2 đầu cắm
function outletSymbol(engine: CadEngine, x: number, y: number, r: number, layer: string) {
  engine.drawArc(x, y, r, 0, 180, layer);
  engine.drawLine(x - r, y, x + r, y, layer);
  engine.drawLine(x - 10, y, x - 10, y + r * 0.8, layer);
  engine.drawLine(x + 10, y, x + 10, y + r * 0.8, layer);
}

// Kẻ bảng: khung, lưới, nội dung từng ô
function drawTable(
  engine: CadEngine,
  x: number,
  yTop: number,
  colWidths: number[],
  rowH: number,
  header: string[],
  rows: string[][],
  layer: string,
  textH: number = 18
) {
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  const totalRows = rows.length + 1;
  const yBottom = yTop - rowH * totalRows;
  engine.drawRectangle(x, yBottom, totalW, yTop - yBottom, layer);
  for (let i = 1; i < totalRows; i++) {
    const yy = yTop - i * rowH;
    engine.drawLine(x, yy, x + totalW, yy, layer);
  }
  let cx = x;
  for (let i = 0; i < colWidths.length - 1; i++) {
    cx += colWidths[i];
    engine.drawLine(cx, yBottom, cx, yTop, layer);
  }
  header.forEach((hText, i) => {
    engine.drawText(hText, x + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + 12, yTop - rowH / 2 + textH / 2, textH, 0, layer);
  });
  rows.forEach((row, rIdx) => {
    row.forEach((cell, i) => {
      engine.drawText(cell, x + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + 12, yTop - (rIdx + 1.5) * rowH + textH / 2, textH, 0, layer);
    });
  });
}

export function buildWiringDiagram(engine: CadEngine): number {
  const est = computeEstimate();

  // 1. Khởi tạo lớp bản vẽ
  engine.entities = [];
  engine.layers = [
    { name: '0', color: 'white', colorIndex: 7, on: true, current: false },
    { name: 'GHI_CHU', color: 'white', colorIndex: 7, on: true, current: true },
    { name: 'NGUON', color: 'red', colorIndex: 1, on: true, current: false },
    { name: 'BUSBAR', color: 'green', colorIndex: 3, on: true, current: false },
    { name: 'CB', color: 'yellow', colorIndex: 2, on: true, current: false },
    { name: 'THIET_BI', color: 'magenta', colorIndex: 6, on: true, current: false },
    { name: 'TU', color: 'cyan', colorIndex: 4, on: true, current: false },
    { name: 'DAY_DAN', color: 'red', colorIndex: 1, on: true, current: false },
    { name: 'TIEP_DAT', color: 'green', colorIndex: 3, on: true, current: false },
    { name: 'KICH_THUOC', color: 'cyan', colorIndex: 4, on: true, current: false },
  ];
  engine.activeLayerName = 'GHI_CHU';
  engine.drawingName = 'Ban_ve_so_do_di_day_va_du_toan_nha_van_hanh.dwg';
  engine.units = 'millimetres';
  engine.insunits = 4;
  engine.saved = false;

  // ============================================================
  // KHUNG BẢN VẼ A1 TIÊU CHUẨN (5670 x 5350)
  // ============================================================
  engine.drawRectangle(-520, -2050, 5670, 5350, 'GHI_CHU');
  engine.drawRectangle(-490, -2020, 5610, 5290, 'GHI_CHU');

  engine.drawText('BẢN VẼ SƠ ĐỒ ĐI DÂY ĐIỆN & DỰ TOÁN CÔNG TRÌNH', 300, 3180, 50, 0, 'GHI_CHU');
  engine.drawText('HẠNG MỤC CẤP ĐIỆN - PHÒNG VẬN HÀNH BẢNG ĐIỆN (MẠNG 380/220V - 3 PHA 4 DÂY - 50Hz)', 300, 3080, 34, 0, 'GHI_CHU');

  // Đường phân chia phân khu
  engine.drawLine(2380, -1980, 2380, 3020, 'GHI_CHU'); // đứng giữa
  engine.drawLine(-480, -190, 2380, -190, 'GHI_CHU'); // ngang trái (dưới mặt bằng)
  engine.drawLine(2380, 820, 5110, 820, 'GHI_CHU'); // ngang phải (trên)
  engine.drawLine(2380, -200, 5110, -200, 'GHI_CHU'); // ngang phải (giữa)
  engine.drawLine(2380, -1200, 5110, -1200, 'GHI_CHU'); // ngang phải (dưới)

  // ============================================================
  // PHÂN KHU 1 (TRÁI TRÊN): 1. SƠ ĐỒ 1 TUYẾN CẤP ĐIỆN
  // Tọa độ: X: -450..2330, Y: 0..2980
  // ============================================================
  engine.drawText('1. SƠ ĐỒ 1 TUYẾN CẤP ĐIỆN (ONE-LINE DIAGRAM)', -400, 2910, 38, 0, 'GHI_CHU');

  // Nguồn đến
  engine.drawText('NGUỒN: TỪ TỦ PHÂN PHỐI HẠ ÁP TP (380/220V - 3 PHA 4 DÂY)', 300, 2860, 26, 0, 'NGUON');
  engine.drawLine(950, 2840, 950, 2740, 'NGUON'); // dây nguồn
  engine.drawLine(935, 2765, 950, 2740, 'NGUON'); // mũi tên
  engine.drawLine(965, 2765, 950, 2740, 'NGUON');
  engine.drawText('DÂY DẪN TIẾP NHẬN: CV 4x10mm² TRONG ỐNG KẼM Ø35', 990, 2780, 18, 0, 'NGUON');

  // CB tổng 3P 63A
  cbSymbol(engine, 890, 2620, 120, 100, 'CB');
  engine.drawLine(950, 2740, 950, 2720, 'CB'); // nguồn vào CB
  engine.drawLine(950, 2620, 950, 2560, 'CB'); // CB ra bus
  engine.drawLine(890, 2670, 800, 2670, 'GHI_CHU'); // đường dẫn chú thích
  engine.drawText('CB TỔNG 3P 63A', 480, 2650, 22, 0, 'CB');
  engine.drawText('(LS/ABB)', 480, 2615, 18, 0, 'CB');

  // Thanh bus 380/220V (2 nét)
  engine.drawLine(120, 2560, 1900, 2560, 'BUSBAR');
  engine.drawLine(120, 2545, 1900, 2545, 'BUSBAR');
  engine.drawText('BUS 380/220V', 1450, 2505, 20, 0, 'BUSBAR');

  // ---- Nhánh P1: Chiếu sáng (x = 300) ----
  engine.drawLine(300, 2545, 300, 2360, 'DAY_DAN');
  cbSymbol(engine, 260, 2260, 80, 100, 'CB');
  engine.drawLine(300, 2260, 300, 2060, 'DAY_DAN');
  engine.drawText('P1: MCB 1P 16A', 90, 2290, 20, 0, 'CB');
  engine.drawLine(105, 1950, 555, 1950, 'DAY_DAN');
  for (const lx of [105, 255, 405, 555]) lampSymbol(engine, lx, 1950, 45, 'THIET_BI');
  engine.drawText('CHIẾU SÁNG: 4 LED PANEL 600x600 - 40W (D1-D4)', 40, 1850, 20, 0, 'THIET_BI');

  // ---- Nhánh P2: Ổ cắm (x = 800) ----
  engine.drawLine(800, 2545, 800, 2360, 'DAY_DAN');
  cbSymbol(engine, 760, 2260, 80, 100, 'CB');
  engine.drawLine(800, 2260, 800, 2060, 'DAY_DAN');
  engine.drawText('P2: MCB 2P 20A', 590, 2290, 20, 0, 'CB');
  engine.drawLine(700, 1950, 900, 1950, 'DAY_DAN');
  for (const ox of [700, 800, 900]) outletSymbol(engine, ox, 1950, 40, 'THIET_BI');
  engine.drawText('ĐIỆN NĂNG: 3 Ổ CẮM 16A (OC1-OC3) + RCD 30mA', 560, 1850, 20, 0, 'THIET_BI');

  // ---- Nhánh P3: Quạt (x = 1300) ----
  engine.drawLine(1300, 2545, 1300, 2360, 'DAY_DAN');
  cbSymbol(engine, 1260, 2260, 80, 100, 'CB');
  engine.drawLine(1300, 2260, 1300, 2060, 'DAY_DAN');
  engine.drawText('P3: MCB 1P 16A', 1090, 2290, 20, 0, 'CB');
  engine.drawCircle(1300, 1950, 50, 'THIET_BI');
  engine.drawText('F', 1288, 1935, 24, 0, 'THIET_BI');
  engine.drawText('QUẠT THOÁT KHÍ Ø400 (QTG1)', 1080, 1850, 20, 0, 'THIET_BI');

  // ---- Nhánh P4: UPS (x = 1750) ----
  engine.drawLine(1750, 2545, 1750, 2360, 'DAY_DAN');
  cbSymbol(engine, 1710, 2260, 80, 100, 'CB');
  engine.drawLine(1750, 2260, 1750, 2060, 'DAY_DAN');
  engine.drawText('P4: MCB 3P 32A', 1540, 2290, 20, 0, 'CB');
  engine.drawRectangle(1670, 1900, 160, 100, 'THIET_BI');
  engine.drawText('UPS', 1715, 1930, 24, 0, 'THIET_BI');
  engine.drawText('UPS CHO BẢNG ĐIỀU KHIỂN DC 24V', 1490, 1850, 20, 0, 'THIET_BI');

  // ---- Tiếp đất PE từ bus (x = 1075) ----
  engine.drawLine(1075, 2545, 1075, 2420, 'TIEP_DAT');
  groundSymbol(engine, 1075, 2420, 'TIEP_DAT');
  engine.drawText('TIẾP ĐẤT PE (HỆ THỐNG TN-C-S)', 1130, 2400, 18, 0, 'TIEP_DAT');

  // ---- Chú giải ký hiệu ----
  engine.drawRectangle(1150, 1350, 1050, 380, 'GHI_CHU');
  engine.drawText('CHÚ GIẢI KÝ HIỆU (LEGEND)', 1180, 1680, 22, 0, 'GHI_CHU');
  cbSymbol(engine, 1180, 1600, 40, 26, 'CB');
  engine.drawText('CB - ÁO CHỐNG (MCB) BẢO VỆ MẠCH', 1250, 1605, 18, 0, 'GHI_CHU');
  lampSymbol(engine, 1200, 1540, 18, 'THIET_BI');
  engine.drawText('ĐÈN CHIẾU SÁNG LED', 1250, 1535, 18, 0, 'GHI_CHU');
  engine.drawCircle(1200, 1475, 18, 'THIET_BI');
  engine.drawText('F', 1194, 1468, 14, 0, 'THIET_BI');
  engine.drawText('QUẠT / THIẾT BỊ ĐIỆN', 1250, 1470, 18, 0, 'GHI_CHU');
  groundSymbol(engine, 1200, 1410, 'TIEP_DAT');
  engine.drawText('TIẾP ĐẤT (EARTH / PE)', 1250, 1405, 18, 0, 'GHI_CHU');

  // ============================================================
  // PHÂN KHU 2 (TRÁI DƯỚI): 2. MẶT BẰNG ĐI DÂY & BỐ TRÍ THIẾT BỊ
  // Phòng 6000 x 4200 mm, vẽ với hệ số thu nhỏ 0.38 (chú thích 1:50)
  // Tọa độ: X: -450..2330, Y: -1950..-240
  // ============================================================
  engine.drawText('2. MẶT BẰNG ĐI DÂY & BỐ TRÍ THIẾT BỊ (TỈ LỆ 1:50)', -400, -270, 36, 0, 'GHI_CHU');

  const S = 0.38; // hệ số thu nhỏ (mm thực tế -> đơn vị bản vẽ)
  const X0 = -100; // góc trái dưới của phòng (bản vẽ)
  const Y0 = -1930;
  const px = (ax: number) => X0 + ax * S; // ax: mm thực tế theo phương X
  const py = (ay: number) => Y0 + ay * S; // ay: mm thực tế theo phương Y
  const T = 220; // độ dày tường (mm)

  // Tường phòng (vách ngoài, cửa thoát hiểm 900mm trên vách nam: ax 800..1700)
  engine.drawLine(X0, py(4200), px(6000), py(4200), 'GHI_CHU'); // vách bắc
  engine.drawLine(px(6000), py(4200), px(6000), Y0, 'GHI_CHU'); // vách đông
  engine.drawLine(px(1700), Y0, px(6000), Y0, 'GHI_CHU'); // vách nam (phải cửa)
  engine.drawLine(X0, Y0, px(800), Y0, 'GHI_CHU'); // vách nam (trái cửa)
  engine.drawLine(X0, Y0, X0, py(4200), 'GHI_CHU'); // vách tây
  // Vách trong (lớp tường dày 220mm)
  engine.drawLine(px(T), py(4200 - T), px(6000 - T), py(4200 - T), 'GHI_CHU');
  engine.drawLine(px(6000 - T), py(4200 - T), px(6000 - T), py(T), 'GHI_CHU');
  engine.drawLine(px(1700), py(T), px(6000 - T), py(T), 'GHI_CHU');
  engine.drawLine(px(T), py(T), px(800), py(T), 'GHI_CHU');
  engine.drawLine(px(T), py(T), px(T), py(4200 - T), 'GHI_CHU');

  // Cửa thoát hiểm 900mm (bản lề trái, mở 90° vào trong)
  engine.drawLine(px(800), Y0, px(800), py(900), 'THIET_BI'); // cánh cửa (vị trí mở)
  engine.drawArc(px(800), Y0, px(1700) - px(800), 0, 90, 'THIET_BI'); // quỹ đạo mở
  engine.drawText('CỬA THOÁT HIỂM 900', px(1750), Y0 + 20, 16, 0, 'THIET_BI');

  // Tủ bảng điện TĐP (tủ 1200x600x400, gắn vách bắc: ax 150..1350, ay 3700..4200)
  engine.drawRectangle(px(150), py(3700), (1350 - 150) * S, 500 * S, 'TU');
  engine.drawText('TỦ BẢNG ĐIỆN TĐP', px(200), py(3990), 16, 0, 'TU');
  engine.drawText('(1200x600x400mm)', px(230), py(3850), 14, 0, 'TU');

  // Bảng UPS 24VDC cạnh tủ (ax 1450..1900, ay 3700..4200)
  engine.drawRectangle(px(1450), py(3700), 450 * S, 500 * S, 'THIET_BI');
  engine.drawText('UPS', px(1560), py(3850), 20, 0, 'THIET_BI');

  // 4 đèn LED panel 600x600 (D1-D4)
  const leds: { ax: number; ay: number; name: string }[] = [
    { ax: 2100, ay: 1050, name: 'D1' },
    { ax: 3900, ay: 1050, name: 'D2' },
    { ax: 2100, ay: 3150, name: 'D3' },
    { ax: 3900, ay: 3150, name: 'D4' },
  ];
  leds.forEach((led) => {
    const cx = px(led.ax);
    const cy = py(led.ay);
    const r = 300 * S; // ô vuông 600x600
    engine.drawRectangle(cx - r, cy - r, r * 2, r * 2, 'THIET_BI');
    engine.drawLine(cx - r, cy - r, cx + r, cy + r, 'THIET_BI');
    engine.drawLine(cx - r, cy + r, cx + r, cy - r, 'THIET_BI');
    engine.drawText(led.name, cx - 14, cy - 8, 16, 0, 'THIET_BI');
  });

  // 3 ổ cắm 16A (OC1-OC3) trên vách nam
  [
    { ax: 2400, name: 'OC1' },
    { ax: 3600, name: 'OC2' },
    { ax: 4800, name: 'OC3' },
  ].forEach((oc) => {
    outletSymbol(engine, px(oc.ax), py(250), 26, 'THIET_BI');
    engine.drawText(oc.name, px(oc.ax) - 24, py(500), 14, 0, 'THIET_BI');
  });

  // 2 công tắc (CT1-CT2) trên vách tây gần cửa
  [
    { ay: 800, name: 'CT1' },
    { ay: 1300, name: 'CT2' },
  ].forEach((ct) => {
    engine.drawRectangle(px(300) - 14, py(ct.ay) - 14, 28, 28, 'THIET_BI');
    engine.drawLine(px(300) - 14, py(ct.ay), px(T), py(ct.ay), 'THIET_BI'); // dây về tường
    engine.drawText(ct.name, px(300) + 20, py(ct.ay) - 8, 14, 0, 'THIET_BI');
  });

  // Quạt thoát khí Ø400 (QTG1) trên vách đông
  engine.drawCircle(px(5800), py(2100), 70, 'THIET_BI');
  engine.drawText('F', px(5800) - 8, py(2100) - 12, 20, 0, 'THIET_BI');
  engine.drawText('QTG1', px(5800) - 90, py(2450), 16, 0, 'THIET_BI');

  // ---- TUYẾN DÂY DẪN ----
  // C1: nguồn 3 pha 4 dây vào tủ TĐP (từ vách tây, âm sàn)
  engine.drawPolyline(
    [
      [X0, py(2900)],
      [px(350), py(2900)],
      [px(350), py(3700)],
    ],
    false,
    'DAY_DAN'
  );
  engine.drawText('C1: CV 4x10 / Ø35', -430, py(2900) - 25, 16, 0, 'DAY_DAN');

  // C2: mạch chiếu sáng D1 -> D2 -> D3 -> D4 (đi nổi trên trần)
  engine.drawPolyline(
    [
      [px(1350), py(3900)],
      [px(2100), py(3900)],
      [px(2100), py(1050)],
      [px(3900), py(1050)],
      [px(3900), py(3150)],
      [px(2100), py(3150)],
    ],
    false,
    'DAY_DAN'
  );
  engine.drawText('C2: CV 3x2.5 / Ø21 (đi nổi trần +3.6m)', px(1850) + 60, py(3760), 16, 0, 'DAY_DAN');

  // C3: mạch ổ cắm OC1 -> OC3 (đi nổi sát vách nam)
  engine.drawPolyline(
    [
      [px(600), py(3700)],
      [px(600), py(250)],
      [px(4800), py(250)],
    ],
    false,
    'DAY_DAN'
  );
  engine.drawText('C3: CV 3x4 / Ø27', px(680), py(120), 16, 0, 'DAY_DAN');

  // C4: mạch quạt thoát khí QTG1
  engine.drawPolyline(
    [
      [px(1350), py(3600)],
      [px(1350), py(3550)],
      [px(5800), py(3550)],
      [px(5800), py(2100)],
    ],
    false,
    'DAY_DAN'
  );
  engine.drawText('C4: CV 3x2.5 / Ø21', px(3300), py(3550) - 25, 16, 0, 'DAY_DAN');

  // C5: mạch UPS (dây mềm RVV 4x6, trong tủ)
  engine.drawLine(px(1350), py(4000), px(1450), py(4000), 'DAY_DAN');
  engine.drawText('C5: RVV 4x6', px(1460), py(3960), 12, 0, 'DAY_DAN');

  // C6: dây tiếp đất PE (thép dẹt 30x3) từ tủ TĐP ra cọc tiếp đất RD1
  // (ra ngoài phòng qua vách đông, chôn đất, góc đông nam)
  engine.drawPolyline(
    [
      [px(350), py(4200)],
      [px(350), py(4330)],
      [px(7000), py(4330)],
      [px(7000), py(2100)],
    ],
    false,
    'TIEP_DAT'
  );
  groundSymbol(engine, px(7000), py(2100), 'TIEP_DAT');
  engine.drawText('C6: THÉP DẺO 30x3 (PE)', px(3900), py(4330) - 22, 16, 0, 'TIEP_DAT');
  engine.drawText('RD1: CỌC TIẾP ĐẤT Ø16x2000 (3 CỌC, R <= 4 Ohm)', 1800, py(1250), 16, 0, 'TIEP_DAT');

  // Hộp nối dây (HĐ) tại các điểm rẽ
  [
    { ax: 2100, ay: 3900, name: 'HĐ1' },
    { ax: 3900, ay: 2100, name: 'HĐ2' },
    { ax: 600, ay: 250, name: 'HĐ3' },
    { ax: 5800, ay: 3550, name: 'HĐ4' },
  ].forEach((hd) => {
    engine.drawRectangle(px(hd.ax) - 17, py(hd.ay) - 17, 34, 34, 'TU');
    engine.drawText(hd.name, px(hd.ax) + 24, py(hd.ay) - 8, 14, 0, 'TU');
  });

  // Tên phòng
  engine.drawText('PHÒNG VẬN HÀNH BẢNG ĐIỆN', px(2350), py(1900), 22, 0, 'GHI_CHU');
  engine.drawText('(6.0m x 4.2m - 25.2 m²)', px(2350), py(1700), 20, 0, 'GHI_CHU');

  // Kích thước phòng (vẽ thủ công, ghi giá trị thực tế)
  engine.drawLine(X0, Y0 - 55, px(6000), Y0 - 55, 'KICH_THUOC');
  engine.drawLine(X0, Y0 - 70, X0, Y0 - 40, 'KICH_THUOC');
  engine.drawLine(px(6000), Y0 - 70, px(6000), Y0 - 40, 'KICH_THUOC');
  engine.drawText('6000', px(3000) - 60, Y0 - 80, 18, 0, 'KICH_THUOC');
  engine.drawLine(X0 - 60, Y0, X0 - 60, py(4200), 'KICH_THUOC');
  engine.drawLine(X0 - 75, Y0, X0 - 45, Y0, 'KICH_THUOC');
  engine.drawLine(X0 - 75, py(4200), X0 - 45, py(4200), 'KICH_THUOC');
  engine.drawText('4200', X0 - 95, py(2100) - 8, 18, 90, 'KICH_THUOC');

  // Dòng chú giải dưới mặt bằng (cạnh kích thước 6000)
  engine.drawText(
    'TỈ LỆ 1:50 | XEM CHÚ GIẢI KÝ HIỆU Ở PHẦN 1',
    px(3000) + 200,
    Y0 - 80,
    15,
    0,
    'GHI_CHU'
  );

  // ============================================================
  // PHÂN KHU 3 (PHẢI TRÊN): 3. BẢNG THỐNG KÊ TUYẾN ĐI DÂY
  // Tọa độ: X: 2450..5080, Y: 820..2980
  // ============================================================
  engine.drawText('3. BẢNG THỐNG KÊ TUYẾN ĐI DÂY (CABLE SCHEDULE)', 2450, 2910, 38, 0, 'GHI_CHU');

  const cableCols = [120, 800, 190, 300, 250, 150, 790];
  const cableRows = [
    ['1', 'Từ tủ phân phối TP -> tủ TĐP phòng điện', 'CV', '4x10', '8', '4', 'Ống kẽm Ø35, âm sàn'],
    ['2', 'Tủ TĐP -> chiếu sáng (D1-D4)', 'CV', '3x2.5', '24', '3', 'Ống PVC Ø21, đi nổi trần'],
    ['3', 'Tủ TĐP -> ổ cắm (OC1-OC3)', 'CV', '3x4', '18', '3', 'Ống kẽm Ø27, đi nổi'],
    ['4', 'Tủ TĐP -> quạt thoát khí (QTG1)', 'CV', '3x2.5', '10', '3', 'Ống PVC Ø21, đi nổi'],
    ['5', 'Tủ TĐP -> bảng điều khiển UPS', 'RVV', '4x6', '10', '4', 'Ống kẽm Ø27, đi nổi'],
    ['6', 'Tiếp đất RD1 -> thanh PE tủ TĐP', 'Thép dẹt', '30x3', '25', '1', 'Chôn đất, bọc cách điện'],
    ['', 'TỔNG DÂY DẪN (không kể tiếp đất)', '', '', '70', '', '6 tuyến (C1-C6)'],
  ];
  drawTable(
    engine,
    2480,
    2840,
    cableCols,
    128,
    ['STT', 'TUYẾN ĐI DÂY', 'DÂY DẪN', 'TIẾT DIỆN (mm²)', 'CHIỀU DÀI (m)', 'SỐ LÕI', 'CÁCH KHUẤT PHỦ / ĐẶT DÂY'],
    cableRows,
    'GHI_CHU',
    18
  );

  // Chú thích cách đi dây
  engine.drawText('CHÚ THÍCH CÁCH ĐẶT DÂY:', 2480, 1700, 20, 0, 'GHI_CHU');
  [
    '1. Màu cách điện dây: L1 nâu - L2 đen - L3 xám - N xanh lam - PE vàng/lục.',
    '2. Dây PE chạy trong ống chung với dây pha ở mọi tuyến.',
    '3. Tuyến C1 chôn âm sàn dày 100mm, các tuyến khác đi nổi trên trần cốt +3.6m.',
    '4. Mọi tuyến đều qua hộp nối dây (HĐ) tại các điểm rẽ và điểm thiết bị.',
  ].forEach((line, i) => {
    engine.drawText(line, 2480, 1600 - i * 70, 18, 0, 'GHI_CHU');
  });

  // ============================================================
  // PHÂN KHU 4 (PHẢI GIỮA): 4. GHI CHÚ KỸ THUẬT
  // Tọa độ: X: 2450..5080, Y: -1200..820
  // ============================================================
  engine.drawText('4. GHI CHÚ KỸ THUẬT (TECHNICAL NOTES)', 2450, 760, 38, 0, 'GHI_CHU');
  [
    '1. NGUỒN ĐIỆN: 3 pha 4 dây 380/220V - 50Hz từ tủ phân phối hạ áp TP của nhà máy.',
    '2. HỆ THỐNG BẢO VỆ: TN-C-S, điện trở tiếp đất của hệ thống không lớn hơn 4 Ohm.',
    '3. BẢO VỆ: CB tổng 3P 63A, các mạch phụ MCB 1P/2P/3P, ổ cắm có RCD 30mA.',
    '4. CÁCH ĐẶT: đi nổi / âm trần, dây trong ống kẽm và ống PVC theo bảng thống kê.',
    '5. VẬT TƯ: phải có chứng nhận CO/CQ, phù hợp QCVN 05:2021/BXD về an toàn điện.',
    '6. NGHIỆM THU: đo cách điện mỗi mạch (>= 1 Mohm), vận hành thử tải 72h trước bàn giao.',
    `7. DỰ TOÁN: lập theo đơn giá thị trường Hà Nội 09/2026; tổng dự toán ${formatVND(est.grandTotal)} VNĐ.`,
  ].forEach((line, i) => {
    engine.drawText(line, 2480, 640 - i * 105, 20, 0, 'GHI_CHU');
  });

  // ============================================================
  // PHÂN KHU 5 (PHẢI DƯỚI): 5. BẢNG DỰ TOÁN TÓM TẮT
  // Tọa độ: X: 2450..5080, Y: -1200..-200
  // ============================================================
  engine.drawText('5. BẢNG DỰ TOÁN TÓM TẮT (COST ESTIMATE SUMMARY)', 2450, -240, 34, 0, 'GHI_CHU');

  const estRows = estimateSummaryRows(est);
  const estCols = [120, 1620, 860];
  drawTable(
    engine,
    2480,
    -290,
    estCols,
    100,
    ['STT', 'NỘI DUNG CHI PHÍ', 'SỐ TIỀN (VNĐ)'],
    [
      ...estRows.map((r, i) => [String(i + 1), r.label, formatVND(r.value)]),
      ['', `TỔNG DỰ TOÁN (đã gồm VAT ${pct(est.vatRate)}%)`, formatVND(est.grandTotal)],
    ],
    'GHI_CHU',
    18
  );
  engine.drawText(
    `-> Bảng dự toán chi tiết (${est.materialItems.length} vật tư + ${est.laborItems.length} nhân công + máy): tải file Du_toan_cong_trinh.md từ nút Export.`,
    2480,
    -1130,
    16,
    0,
    'GHI_CHU'
  );

  // ============================================================
  // PHÂN KHU 6 (PHẢI DƯỚI CÙNG): 6. KHUNG TÊN BẢN VẼ (TCVN TITLE BLOCK)
  // Tọa độ: X: 2480..5080, Y: -1950..-1220
  // ============================================================
  const tbX = 2480;
  const tbY = -1950;
  const tbW = 2600;
  const tbH = 730;
  engine.drawRectangle(tbX, tbY, tbW, tbH, 'GHI_CHU');
  engine.drawLine(tbX, tbY + 580, tbX + tbW, tbY + 580, 'GHI_CHU');
  engine.drawLine(tbX, tbY + 430, tbX + tbW, tbY + 430, 'GHI_CHU');
  engine.drawLine(tbX, tbY + 290, tbX + tbW, tbY + 290, 'GHI_CHU');
  engine.drawLine(tbX, tbY + 140, tbX + tbW, tbY + 140, 'GHI_CHU');
  engine.drawLine(tbX + 1350, tbY, tbX + 1350, tbY + 430, 'GHI_CHU');

  engine.drawText('CÔNG TRÌNH: NHÀ VẬN HÀNH BẢNG ĐIỆN (SWITCHGEAR ROOM)', tbX + 30, tbY + 630, 24, 0, 'GHI_CHU');
  engine.drawText('HẠNG MỤC: CẤP ĐIỆN - SƠ ĐỒ ĐI DÂY & DỰ TOÁN CÔNG TRÌNH', tbX + 30, tbY + 480, 22, 0, 'GHI_CHU');
  engine.drawText('QUY PHẠM: TCVN 9218:2012 - QCVN 05:2021/BXD', tbX + 30, tbY + 340, 20, 0, 'GHI_CHU');
  engine.drawText('MẠNG: 380/220V - 3 PHA 4 DÂY - 50Hz', tbX + 30, tbY + 195, 20, 0, 'GHI_CHU');
  engine.drawText('DIỆN TÍCH PHÒNG: 6000 x 4200 mm (25.2 m²)', tbX + 30, tbY + 55, 20, 0, 'GHI_CHU');

  engine.drawText('ĐƠN VỊ THIẾT KẾ: AI AUTOCAD STUDIO', tbX + 1390, tbY + 340, 20, 0, 'GHI_CHU');
  engine.drawText('BẢN VẼ SỐ: SD-01 | TỈ LỆ: 1:50', tbX + 1390, tbY + 195, 20, 0, 'GHI_CHU');
  engine.drawText('NGÀY: 12/09/2026 | KỸ SƯ: AUTOCAD AI', tbX + 1390, tbY + 55, 20, 0, 'GHI_CHU');

  engine.saved = true;
  return engine.entities.length;
}
