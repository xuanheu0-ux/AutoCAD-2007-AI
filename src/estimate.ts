// ============================================================================
// DUY NHẤT MỘT NGUỒN DỮ LIỆU (SINGLE SOURCE OF TRUTH) CHO DỰ TOÁN CÔNG TRÌNH
// Hạng mục: Cấp điện - Sơ đồ đi dây | Nhà vận hành bảng điện
// Đơn giá: thị trường Hà Nội, tháng 09/2026 (VNĐ).
// Được dùng chung bởi:
//   - Bảng dự toán tóm tắt vẽ trên bản vẽ CAD (wiringDrawing.ts)
//   - API /api/estimate (JSON) và /api/estimate/export (tải file .md)
//   - MCP tool 'get_estimate'
// ============================================================================

export interface EstimateItem {
  stt: number;
  name: string;
  unit: string;
  qty: number;
  unitPrice: number; // VNĐ
  note?: string;
}

export interface EstimateResult {
  project: string;
  item: string;
  location: string;
  date: string;
  basis: string;
  materialItems: EstimateItem[];
  laborItems: EstimateItem[];
  machineItems: EstimateItem[];
  materialTotal: number;
  laborTotal: number;
  machineTotal: number;
  directCost: number;
  overheadRate: number; // 7%  (chi phí chung - GP)
  sdRate: number; // 2.5%     (sử dụng kinh doanh - SD)
  overhead: number;
  sd: number;
  overheadCombined: number;
  afterOverhead: number;
  profitRate: number; // 3%
  profit: number;
  preVat: number;
  vatRate: number; // 10%
  vat: number;
  grandTotal: number;
}

const MATERIAL_ITEMS: Omit<EstimateItem, 'stt'>[] = [
  { name: 'Dây điện đồng CV 4x10mm² (3 pha 4 dây, lõi đồng)', unit: 'm', qty: 9, unitPrice: 195000, note: 'Tuyến C1, hao hụt 10%' },
  { name: 'Dây điện đồng CV 3x2.5mm²', unit: 'm', qty: 38, unitPrice: 52000, note: 'Mạch C2 + C4, hao hụt 10%' },
  { name: 'Dây điện đồng CV 3x4mm²', unit: 'm', qty: 20, unitPrice: 76000, note: 'Mạch C3, hao hụt 10%' },
  { name: 'Dây mềm RVV 4x6mm² (mạch UPS)', unit: 'm', qty: 11, unitPrice: 118000, note: 'Mạch C5, hao hụt 10%' },
  { name: 'Ống thép kẽm luồn dây Ø35mm', unit: 'm', qty: 9, unitPrice: 165000, note: 'Tuyến C1 âm sàn' },
  { name: 'Ống thép kẽm luồn dây Ø27mm', unit: 'm', qty: 31, unitPrice: 120000, note: 'Mạch C3 + C5 đi nổi' },
  { name: 'Ống PVC luồn dây Ø21mm', unit: 'm', qty: 38, unitPrice: 38000, note: 'Mạch C2 + C4 đi nổi' },
  { name: 'Tủ bảng điện phân phối TĐP 1200x600x400 (kèm thanh đồng bus, đèn báo, công tắc)', unit: 'cái', qty: 1, unitPrice: 18500000 },
  { name: 'CB tổng MCB 3P 63A (LS/ABB)', unit: 'cái', qty: 1, unitPrice: 1250000 },
  { name: 'CB phân phối MCB 1P 16A (mạch P1, P3)', unit: 'cái', qty: 2, unitPrice: 185000 },
  { name: 'CB phân phối MCB 2P 20A (mạch P2)', unit: 'cái', qty: 1, unitPrice: 240000 },
  { name: 'CB phân phối MCB 3P 32A (mạch UPS P4)', unit: 'cái', qty: 1, unitPrice: 980000 },
  { name: 'Đèn LED panel 600x600 - 40W (Philips/Paragon)', unit: 'cái', qty: 4, unitPrice: 480000 },
  { name: 'Ổ cắm 16A (Schneider)', unit: 'cái', qty: 3, unitPrice: 120000 },
  { name: 'Công tắc 2 chấm (Schneider)', unit: 'cái', qty: 2, unitPrice: 85000 },
  { name: 'Quạt thông gió vuông Ø400 (Tosho)', unit: 'cái', qty: 1, unitPrice: 1150000 },
  { name: 'Hộp nối dây (HĐ) 150x150x100 thép mạ kẽm', unit: 'cái', qty: 6, unitPrice: 65000, note: 'Kèm dự phòng' },
  { name: 'Cọc tiếp đất thép mạ kẽm Ø16 x 2000', unit: 'cây', qty: 3, unitPrice: 95000 },
  { name: 'Thép dẹt mạ kẽm 30x3 (dây tiếp đất)', unit: 'm', qty: 25, unitPrice: 68000 },
  { name: 'Thanh đồng tiếp đất PE 300mm + bu lông neo', unit: 'bộ', qty: 1, unitPrice: 450000 },
  { name: 'Vật tư phụ: cos, kẹp cáp, băng keo, dây nylon, ciment, sơn đánh dấu', unit: 'bộ', qty: 1, unitPrice: 3500000 },
];

const LABOR_ITEMS: Omit<EstimateItem, 'stt'>[] = [
  { name: 'Lắp đặt tuyến C1 (dây CV 4x10 trong ống kẽm Ø35, âm sàn)', unit: 'm', qty: 9, unitPrice: 32000 },
  { name: 'Lắp đặt mạch chiếu sáng + quạt (dây CV 3x2.5 đi nổi)', unit: 'm', qty: 34, unitPrice: 18000 },
  { name: 'Lắp đặt mạch ổ cắm (dây CV 3x4 đi nổi)', unit: 'm', qty: 18, unitPrice: 21000 },
  { name: 'Lắp đặt mạch UPS (dây RVV 4x6 đi nổi)', unit: 'm', qty: 10, unitPrice: 25000 },
  { name: 'Lắp đặt ống đi nổi Ø21/Ø27 (kèm kẹp, hộp nối)', unit: 'm', qty: 62, unitPrice: 25000 },
  { name: 'Khoan, đục, chôn ống âm sàn Ø35 + hoàn thiện mặt sàn', unit: 'm', qty: 8, unitPrice: 45000 },
  { name: 'Lắp đặt tủ TĐP (gắn tủ, kẹp dây, đánh nhãn, nối thanh bus)', unit: 'bộ', qty: 1, unitPrice: 1850000 },
  { name: 'Lắp đặt thiết bị: đèn LED, ổ cắm, công tắc', unit: 'cái', qty: 9, unitPrice: 120000 },
  { name: 'Lắp đặt quạt thông gió Ø400', unit: 'cái', qty: 1, unitPrice: 280000 },
  { name: 'Lắp đặt hệ thống tiếp đất (3 cọc + thép dẹt + đo điện trở)', unit: 'hệ', qty: 1, unitPrice: 1250000 },
  { name: 'Vận hành thử, đo cách điện, thử tải, nghiệm thu', unit: 'bộ', qty: 1, unitPrice: 850000 },
];

const MACHINE_ITEMS: Omit<EstimateItem, 'stt'>[] = [
  { name: 'Máy thi công phụ trợ (khoan, kéo dây, thang, thiết bị đo kiểm)', unit: 'bộ', qty: 1, unitPrice: 780000 },
];

export const ESTIMATE_META = {
  project: 'NHÀ VẬN HÀNH BẢNG ĐIỆN (SWITCHGEAR OPERATING ROOM)',
  item: 'CẤP ĐIỆN - SƠ ĐỒ ĐI DÂY VÀ DỰ TOÁN CÔNG TRÌNH',
  location: 'Phòng vận hành bảng điện, kích thước 6.0m x 4.2m (25.2 m²)',
  date: '12/09/2026',
  basis: 'Đơn giá vật liệu và nhân công thị trường Hà Nội tháng 09/2026; định mức thi công điện công nghiệp; QCVN 05:2021/BXD',
};

function sum(items: Omit<EstimateItem, 'stt'>[]): number {
  return items.reduce((acc, it) => acc + it.qty * it.unitPrice, 0);
}

export function computeEstimate(): EstimateResult {
  const materialItems: EstimateItem[] = MATERIAL_ITEMS.map((it, i) => ({ ...it, stt: i + 1 }));
  const laborItems: EstimateItem[] = LABOR_ITEMS.map((it, i) => ({ ...it, stt: i + 1 }));
  const machineItems: EstimateItem[] = MACHINE_ITEMS.map((it, i) => ({ ...it, stt: i + 1 }));

  const materialTotal = sum(materialItems);
  const laborTotal = sum(laborItems);
  const machineTotal = sum(machineItems);
  const directCost = materialTotal + laborTotal + machineTotal;

  const overheadRate = 0.07;
  const sdRate = 0.025;
  const overhead = Math.round(directCost * overheadRate);
  const sd = Math.round(directCost * sdRate);
  const overheadCombined = overhead + sd;
  const afterOverhead = directCost + overheadCombined;

  const profitRate = 0.03;
  const profit = Math.round(afterOverhead * profitRate);
  const preVat = afterOverhead + profit;

  const vatRate = 0.1;
  const vat = Math.round(preVat * vatRate);
  const grandTotal = preVat + vat;

  return {
    ...ESTIMATE_META,
    materialItems,
    laborItems,
    machineItems,
    materialTotal,
    laborTotal,
    machineTotal,
    directCost,
    overheadRate,
    sdRate,
    overhead,
    sd,
    overheadCombined,
    afterOverhead,
    profitRate,
    profit,
    preVat,
    vatRate,
    vat,
    grandTotal,
  };
}

/** Định dạng tiền VNĐ kiểu Việt Nam: 44.463.000 */
export function formatVND(n: number): string {
  return Math.round(n).toLocaleString('vi-VN');
}

/** Định dạng phần trăm gọn (tránh lỗi float: 0.07*100 -> 7.000000000000001) */
export function pct(r: number): number {
  return Math.round(r * 10000) / 100;
}

/** Các dòng của bảng dự toán tóm tắt (vẽ lên bản vẽ CAD) */
export function estimateSummaryRows(est: EstimateResult): { label: string; value: number }[] {
  return [
    { label: `Chi phí vật tư (${est.materialItems.length} hạng mục)`, value: est.materialTotal },
    { label: `Chi phí nhân công (${est.laborItems.length} hạng mục)`, value: est.laborTotal },
    { label: 'Chi phí máy thi công', value: est.machineTotal },
    { label: `Chi phí chung (GP ${pct(est.overheadRate)}% + SXKD ${pct(est.sdRate)}%)`, value: est.overheadCombined },
    { label: `Lợi nhuận (${pct(est.profitRate)}%)`, value: est.profit },
    { label: `Thuế GTGT - VAT (${pct(est.vatRate)}%)`, value: est.vat },
  ];
}

/** Bảng dự toán đầy đủ dạng văn bản (dùng cho MCP tool 'get_estimate') */
export function estimateAsText(est: EstimateResult): string {
  const lines: string[] = [];
  lines.push('DỰ TOÁN CÔNG TRÌNH - HẠNG MỤC CẤP ĐIỆN (SƠ ĐỒ ĐI DÂY)');
  lines.push(`Công trình: ${est.project}`);
  lines.push(`Địa điểm: ${est.location}`);
  lines.push('');
  lines.push(`I. CHI PHÍ VẬT TƯ - ${est.materialItems.length} hạng mục:`);
  est.materialItems.forEach((it) =>
    lines.push(`  ${it.stt}. ${it.name} | ${it.unit} | SL ${it.qty} | ĐG ${formatVND(it.unitPrice)} | TT ${formatVND(it.qty * it.unitPrice)}`)
  );
  lines.push(`   TONG VAT TU: ${formatVND(est.materialTotal)} VND`);
  lines.push('');
  lines.push(`II. CHI PHI NHAN CONG - ${est.laborItems.length} hang muc:`);
  est.laborItems.forEach((it) =>
    lines.push(`  ${it.stt}. ${it.name} | ${it.unit} | SL ${it.qty} | TT ${formatVND(it.qty * it.unitPrice)}`)
  );
  lines.push(`   TONG NHAN CONG: ${formatVND(est.laborTotal)} VND`);
  lines.push('');
  lines.push('III. CHI PHI MAY THI CONG:');
  est.machineItems.forEach((it) =>
    lines.push(`  ${it.stt}. ${it.name} | TT ${formatVND(it.qty * it.unitPrice)}`)
  );
  lines.push(`   TONG MAY: ${formatVND(est.machineTotal)} VND`);
  lines.push('');
  lines.push('IV. TONG HOP DU TOAN:');
  lines.push(`  - Chi phieu truc tiep (VT + NC + May): ${formatVND(est.directCost)} VND`);
  lines.push(`  - Chi phi chung GP ${pct(est.overheadRate)}% + SD ${pct(est.sdRate)}%: ${formatVND(est.overheadCombined)} VND`);
  lines.push(`  - Loi nhun ${pct(est.profitRate)}%: ${formatVND(est.profit)} VND`);
  lines.push(`  - VAT ${pct(est.vatRate)}%: ${formatVND(est.vat)} VND`);
  lines.push(`  ==> TONG DU TOAN (da goi VAT): ${formatVND(est.grandTotal)} VND`);
  lines.push('Chi tiet: tai file Du_toan_cong_trinh.md qua nut Export hoac API /api/estimate/export.');
  return lines.join('\n');
}

/** Bảng dự toán đầy đủ dạng Markdown (file tải về) */
export function estimateAsMarkdown(est: EstimateResult): string {
  const md: string[] = [];
  md.push('# BẢNG DỰ TOÁN CÔNG TRÌNH');
  md.push('');
  md.push(`## Hạng mục: ${est.item}`);
  md.push('');
  md.push(`| | |`);
  md.push(`|---|---|`);
  md.push(`| **Công trình** | ${est.project} |`);
  md.push(`| **Địa điểm** | ${est.location} |`);
  md.push(`| **Đơn vị lập** | AI AUTOCAD STUDIO |`);
  md.push(`| **Ngày lập** | ${est.date} |`);
  md.push(`| **Căn cứ lập** | ${est.basis} |`);
  md.push('');
  md.push(`## I. CHI PHÍ VẬT TƯ (${est.materialItems.length} hạng mục)`);
  md.push('');
  md.push('| STT | Tên vật tư | Đơn vị | SL | Đơn giá (VNĐ) | Thành tiền (VNĐ) | Ghi chú |');
  md.push('|---:|---|:---:|---:|---:|---:|---|');
  est.materialItems.forEach((it) =>
    md.push(`| ${it.stt} | ${it.name} | ${it.unit} | ${it.qty} | ${formatVND(it.unitPrice)} | ${formatVND(it.qty * it.unitPrice)} | ${it.note || ''} |`)
  );
  md.push(`| | **TỔNG CHI PHÍ VẬT TƯ** | | | | **${formatVND(est.materialTotal)}** | |`);
  md.push('');
  md.push(`## II. CHI PHÍ NHÂN CÔNG (${est.laborItems.length} hạng mục)`);
  md.push('');
  md.push('| STT | Tên công việc | Đơn vị | SL | Đơn giá (VNĐ) | Thành tiền (VNĐ) |');
  md.push('|---:|---|:---:|---:|---:|---:|');
  est.laborItems.forEach((it) =>
    mm0(md, it)
  );
  md.push(`| | **TỔNG CHI PHÍ NHÂN CÔNG** | | | | **${formatVND(est.laborTotal)}** |`);
  md.push('');
  md.push(`## III. CHI PHÍ MÁY THI CÔNG`);
  md.push('');
  md.push('| STT | Tên máy | Đơn vị | SL | Đơn giá (VNĐ) | Thành tiền (VNĐ) |');
  md.push('|---:|---|:---:|---:|---:|---:|');
  est.machineItems.forEach((it) =>
    md.push(`| ${it.stt} | ${it.name} | ${it.unit} | ${it.qty} | ${formatVND(it.unitPrice)} | ${formatVND(it.qty * it.unitPrice)} |`)
  );
  md.push(`| | **TỔNG CHI PHÍ MÁY** | | | | **${formatVND(est.machineTotal)}** |`);
  md.push('');
  md.push('## IV. TỔNG HỢP DỰ TOÁN');
  md.push('');
  md.push('| STT | Nội dung | Số tiền (VNĐ) |');
  md.push('|---:|---|---:|');
  const rows = estimateSummaryRows(est);
  rows.forEach((r, i) => md.push(`| ${i + 1} | ${r.label} | ${formatVND(r.value)} |`));
  md.push(`| | **CHI PHÍ TRƯỚC THUẾ** | **${formatVND(est.preVat)}** |`);
  md.push(`| | **TỔNG DỰ TOÁN (đã gồm VAT ${pct(est.vatRate)}%)** | **${formatVND(est.grandTotal)}** |`);
  md.push('');
  md.push('## V. GHI CHÚ');
  md.push('');
  md.push('1. Dự toán lập theo đơn giá thị trường Hà Nội tháng 09/2026, có thể điều chỉnh theo báo giá nhà cung cấp tại thời điểm đấu thầu.');
  md.push('2. Vật tư điện phải có chứng nhận hợp chuẩn/hợp quy (CO/CQ) phù hợp QCVN 05:2021/BXD.');
  md.push('3. Chi phí phát sinh ngoài phạm vi hồ sơ thiết kế (nếu có) sẽ lập dự toán bổ sung theo thực tế phát sinh.');
  md.push('4. Kèm theo bản vẽ: Bản vẽ sơ đồ đi dây & dự toán công trình (SD-01, tỉ lệ 1:50).');
  md.push('');
  md.push(`*Tài liệu do AI AUTOCAD STUDIO tự động lập - ngày ${est.date}.*`);
  return md.join('\n');
}

function mm0(md: string[], it: EstimateItem) {
  md.push(`| ${it.stt} | ${it.name} | ${it.unit} | ${it.qty} | ${formatVND(it.unitPrice)} | ${formatVND(it.qty * it.unitPrice)} |`);
}
