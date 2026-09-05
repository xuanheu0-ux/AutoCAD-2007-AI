import { CadEngine } from './cadEngine.js';

export function buildAluminumGateDrawing(engine: CadEngine) {
  // 1. Reset drawing to a clean canvas with standard architectural layers
  engine.entities = [];
  engine.layers = [
    { name: '0', color: 'white', colorIndex: 7, on: true, current: false },
    { name: 'KHUNG_TRU', color: 'cyan', colorIndex: 4, on: true, current: false },
    { name: 'KHUNG_CANH', color: 'yellow', colorIndex: 2, on: true, current: false },
    { name: 'NHOM_TAM', color: 'magenta', colorIndex: 6, on: true, current: false },
    { name: 'QUY_DAO_MO', color: 'green', colorIndex: 3, on: true, current: false },
    { name: 'PHU_KIEN', color: 'red', colorIndex: 1, on: true, current: false },
    { name: 'KICH_THUOC', color: 'cyan', colorIndex: 4, on: true, current: false },
    { name: 'GHI_CHU', color: 'white', colorIndex: 7, on: true, current: true },
  ];
  engine.activeLayerName = 'GHI_CHU';
  engine.drawingName = 'Bản_vẽ_cổng_nhôm_hộp_4_cánh_4x3.4m.dwg';
  engine.units = 'millimetres';
  engine.insunits = 4;
  engine.saved = false;

  // ==========================================
  // KHUNG BẢN VẼ TIÊU CHUẨN (DRAWING SHEET BORDER)
  // ==========================================
  // Khung ngoài bản vẽ khổ A1 tỷ lệ
  engine.drawRectangle(-500, -1800, 6200, 6050, 'GHI_CHU');
  // Khung viền trong
  engine.drawRectangle(-470, -1770, 6140, 5990, 'GHI_CHU');

  // TIÊU ĐỀ CHÍNH BẢN VẼ
  engine.drawText(
    'BẢN VẼ LẮP ĐẶT CỔNG CHÍNH 4 CÁNH KHUNG NHÔM HỘP - PANO NHÔM TẤM 3.0mm',
    450,
    4020,
    65,
    0,
    'GHI_CHU'
  );
  engine.drawText(
    'HỆ NHÔM THƯỜNG GẬP MỞ 4 CÁNH RA NGOÀI (KÍCH THƯỚC RỘNG 4.0m x CAO 3.4m)',
    650,
    3910,
    46,
    0,
    'GHI_CHU'
  );

  // ==========================================
  // 1. MẶT ĐỨNG CỔNG CHÍNH (FRONT ELEVATION VIEW)
  // ==========================================
  engine.drawText('1. MẶT ĐỨNG CỔNG CHÍNH (FRONT ELEVATION VIEW - TỈ LỆ 1:25)', 850, 3570, 48, 0, 'GHI_CHU');

  // Cốt nền sàn hoàn thiện ±0.000
  engine.drawLine(-450, 0, 4450, 0, 'GHI_CHU');
  engine.drawLine(-450, -15, 4450, -15, 'GHI_CHU');
  engine.drawText('CỐT SÀN HOÀN THIỆN ±0.000', -430, 20, 26, 0, 'GHI_CHU');

  // Trụ cổng và khung bao chính (KHUNG_TRU)
  // Trụ trái (nhôm hộp 150x150 liên kết bản mã)
  engine.drawRectangle(-150, 0, 150, 3400, 'KHUNG_TRU');
  engine.drawLine(-75, 0, -75, 3400, 'KHUNG_TRU');
  engine.drawRectangle(-180, 0, 210, 30, 'KHUNG_TRU'); // Bản mã chân trụ
  engine.drawCircle(-140, 15, 6, 'PHU_KIEN'); // Bulong nở M12
  engine.drawCircle(-40, 15, 6, 'PHU_KIEN');

  // Trụ phải (nhôm hộp 150x150)
  engine.drawRectangle(4000, 0, 150, 3400, 'KHUNG_TRU');
  engine.drawLine(4075, 0, 4075, 3400, 'KHUNG_TRU');
  engine.drawRectangle(3970, 0, 210, 30, 'KHUNG_TRU'); // Bản mã chân trụ
  engine.drawCircle(4040, 15, 6, 'PHU_KIEN');
  engine.drawCircle(4140, 15, 6, 'PHU_KIEN');

  // Xà đà giằng ngang đỉnh nóc cổng (Nhôm hộp 100x150)
  engine.drawRectangle(-150, 3400, 4300, 100, 'KHUNG_TRU');
  engine.drawLine(-150, 3450, 4150, 3450, 'KHUNG_TRU');
  engine.drawText('XÀ ĐÀ NÓC NHÔM HỘP 100x150', 1600, 3440, 28, 0, 'KHUNG_TRU');

  // Đường gióng thông thủy cổng
  engine.drawLine(0, 0, 0, 3400, 'KHUNG_TRU');
  engine.drawLine(4000, 0, 4000, 3400, 'KHUNG_TRU');

  // ==========================================
  // Ô THOÁNG CỐ ĐỊNH PHÍA TRÊN (y = 2900 đến 3400, Cao 500mm)
  // ==========================================
  engine.drawRectangle(0, 2900, 4000, 500, 'KHUNG_TRU');
  // 3 Đố đứng chia 4 khoang thoáng (nhôm hộp 50x50)
  engine.drawRectangle(985, 2900, 30, 500, 'KHUNG_TRU');
  engine.drawRectangle(1985, 2900, 30, 500, 'KHUNG_TRU');
  engine.drawRectangle(2985, 2900, 30, 500, 'KHUNG_TRU');

  // Pano nhôm tấm cắt CNC thông gió nghệ thuật (4 khoang)
  const transomWidth = 925;
  const transomHeight = 440;
  const transomXs = [30, 1030, 2030, 3030];
  transomXs.forEach((tx) => {
    // Khung nẹp tấm
    engine.drawRectangle(tx, 2930, transomWidth, transomHeight, 'NHOM_TAM');
    const midX = tx + transomWidth / 2;
    const midY = 2930 + transomHeight / 2;
    // Hoa văn CNC hình học
    engine.drawCircle(midX, midY, 95, 'NHOM_TAM');
    engine.drawCircle(midX, midY, 45, 'NHOM_TAM');
    engine.drawLine(tx + 20, 2950, midX - 95, midY, 'NHOM_TAM');
    engine.drawLine(tx + transomWidth - 20, 2950, midX + 95, midY, 'NHOM_TAM');
    engine.drawLine(tx + 20, 2930 + transomHeight - 20, midX - 95, midY, 'NHOM_TAM');
    engine.drawLine(tx + transomWidth - 20, 2930 + transomHeight - 20, midX + 95, midY, 'NHOM_TAM');
  });
  engine.drawText('Ô THOÁNG CỐ ĐỊNH - PANO NHÔM TẤM CNC (CAO 500mm)', 1350, 3135, 30, 0, 'NHOM_TAM');

  // ==========================================
  // 4 CÁNH CỔNG CHÍNH GẬP MỞ (y = 60 đến 2880, Cao 2820mm)
  // ==========================================
  // Kích thước 4 cánh:
  // Cánh 1: x = 10 -> 1000
  // Cánh 2: x = 1006 -> 1996
  // Cánh 3: x = 2004 -> 2994
  // Cánh 4: x = 3000 -> 3990
  const leaves = [
    { name: 'CÁNH 1 (TRÁI)', x: 10, w: 990 },
    { name: 'CÁNH 2 (TRÁI)', x: 1006, w: 990 },
    { name: 'CÁNH 3 (PHẢI)', x: 2004, w: 990 },
    { name: 'CÁNH 4 (PHẢI)', x: 3000, w: 990 },
  ];

  leaves.forEach((leaf) => {
    const lx = leaf.x;
    const lw = leaf.w;
    const h = 2820;
    const by = 60; // Bottom elevation

    // Khung bao cánh (nhôm hộp 50x100)
    engine.drawRectangle(lx, by, lw, h, 'KHUNG_CANH');

    // Đố đứng trái và đố đứng phải cánh (nhôm hộp 50x100)
    engine.drawRectangle(lx, by, 95, h, 'KHUNG_CANH');
    engine.drawRectangle(lx + lw - 95, by, 95, h, 'KHUNG_CANH');

    // Đố đáy cánh chịu lực (nhôm hộp 50x150, từ y=60 đến 210)
    engine.drawRectangle(lx + 95, by, lw - 190, 150, 'KHUNG_CANH');

    // Đố đỉnh cánh (nhôm hộp 50x100, từ y=2780 đến 2880)
    engine.drawRectangle(lx + 95, 2780, lw - 190, 100, 'KHUNG_CANH');

    // Đố ngang giữa phân chia (nhôm hộp 50x100, từ y=1080 đến 1180)
    engine.drawRectangle(lx + 95, 1080, lw - 190, 100, 'KHUNG_CANH');

    // Pano nhôm tấm dưới (từ y=210 đến y=1080, cao 870mm): Nhôm tấm 3.0mm dập gân trang trí
    const pw = lw - 210;
    engine.drawRectangle(lx + 105, 220, pw, 850, 'NHOM_TAM');
    // 3 đường gân chấn nổi mỹ thuật (dập nổi tạo độ cứng và chống rung)
    engine.drawLine(lx + 115, 430, lx + 105 + pw - 10, 430, 'NHOM_TAM');
    engine.drawLine(lx + 115, 645, lx + 105 + pw - 10, 645, 'NHOM_TAM');
    engine.drawLine(lx + 115, 860, lx + 105 + pw - 10, 860, 'NHOM_TAM');
    // Gân chéo tăng cứng
    engine.drawLine(lx + 115, 230, lx + 105 + pw - 10, 1060, 'NHOM_TAM');
    engine.drawLine(lx + 115, 1060, lx + 105 + pw - 10, 230, 'NHOM_TAM');
    engine.drawText('NHÔM TẤM 3mm (CHẤN GÂN)', lx + 180, 520, 22, 0, 'NHOM_TAM');

    // Pano nhôm tấm trên (từ y=1180 đến y=2780, cao 1600mm): Nhôm tấm 3.0mm cắt CNC hoa văn
    engine.drawRectangle(lx + 105, 1190, pw, 1580, 'NHOM_TAM');
    // Khung nẹp viền hoa văn CNC
    engine.drawRectangle(lx + 150, 1240, pw - 90, 1480, 'NHOM_TAM');
    const midLeafX = lx + lw / 2;
    const midLeafY = 1980;
    // Cắt CNC nghệ thuật hiện đại: vòng tròn đồng tâm và nan hình thoi
    engine.drawCircle(midLeafX, midLeafY, 180, 'NHOM_TAM');
    engine.drawCircle(midLeafX, midLeafY, 110, 'NHOM_TAM');
    engine.drawCircle(midLeafX, midLeafY, 40, 'NHOM_TAM');
    // Nan hình thoi CNC
    engine.drawPolyline(
      [
        [midLeafX, 1540],
        [midLeafX + 220, midLeafY],
        [midLeafX, 2420],
        [midLeafX - 220, midLeafY],
      ],
      true,
      'NHOM_TAM'
    );
    // Nan trang trí 4 góc
    engine.drawLine(lx + 160, 1250, midLeafX - 120, midLeafY - 120, 'NHOM_TAM');
    engine.drawLine(lx + lw - 160, 1250, midLeafX + 120, midLeafY - 120, 'NHOM_TAM');
    engine.drawLine(lx + 160, 2710, midLeafX - 120, midLeafY + 120, 'NHOM_TAM');
    engine.drawLine(lx + lw - 160, 2710, midLeafX + 120, midLeafY + 120, 'NHOM_TAM');
    engine.drawText('PANO NHÔM TẤM CNC 3.0mm', lx + 200, 1310, 22, 0, 'NHOM_TAM');

    // Tên cánh
    engine.drawText(leaf.name, lx + lw / 2 - 130, 100, 28, 0, 'GHI_CHU');
  });

  // ==========================================
  // PHỤ KIỆN KIM KHÍ (HARDWARE & ACCESSORIES)
  // ==========================================
  // Bản lề cối 3D inox 304 chịu lực (3 bản lề mỗi liên kết trục xoay)
  const hingeYs = [300, 1480, 2660];
  hingeYs.forEach((hy) => {
    // Trụ trái - Cánh 1
    engine.drawRectangle(-15, hy - 40, 25, 80, 'PHU_KIEN');
    // Giữa Cánh 1 & Cánh 2 (Bản lề gập mở 180°)
    engine.drawRectangle(995, hy - 40, 20, 80, 'PHU_KIEN');
    // Giữa Cánh 3 & Cánh 4 (Bản lề gập mở 180°)
    engine.drawRectangle(2995, hy - 40, 20, 80, 'PHU_KIEN');
    // Cánh 4 - Trụ phải
    engine.drawRectangle(3990, hy - 40, 25, 80, 'PHU_KIEN');
  });
  engine.drawText('BẢN LỀ CỐI 3D INOX 304', -35, 1430, 20, 90, 'PHU_KIEN');

  // Bộ tay nắm kéo ống inox dài 800mm (tại Cánh 2 và Cánh 3)
  // Cánh 2
  engine.drawRectangle(1940, 740, 30, 800, 'PHU_KIEN');
  engine.drawRectangle(1935, 770, 40, 25, 'PHU_KIEN');
  engine.drawRectangle(1935, 1515, 40, 25, 'PHU_KIEN');
  // Cánh 3
  engine.drawRectangle(2030, 740, 30, 800, 'PHU_KIEN');
  engine.drawRectangle(2025, 770, 40, 25, 'PHU_KIEN');
  engine.drawRectangle(2025, 1515, 40, 25, 'PHU_KIEN');
  engine.drawText('TAY NẮM ỐNG INOX L=800mm', 1830, 1580, 22, 0, 'PHU_KIEN');

  // Hộp khóa cổng đa điểm
  engine.drawRectangle(1985, 1090, 30, 100, 'PHU_KIEN');
  engine.drawCircle(2000, 1140, 8, 'PHU_KIEN');

  // Chốt âm đỉnh và chốt âm sàn (Flush bolts)
  const flushBoltXs = [150, 1920, 2080, 3850];
  flushBoltXs.forEach((fx) => {
    // Chốt đỉnh
    engine.drawRectangle(fx - 10, 2830, 20, 50, 'PHU_KIEN');
    // Chốt sàn
    engine.drawRectangle(fx - 10, 30, 20, 60, 'PHU_KIEN');
  });
  engine.drawText('CHỐT ÂM SÀN INOX', 130, 10, 20, 0, 'PHU_KIEN');

  // ==========================================
  // 2. MẶT BẰNG QUỸ ĐẠO GẬP MỞ 4 CÁNH RA NGOÀI (PLAN VIEW)
  // ==========================================
  engine.drawText(
    '2. MẶT BẰNG QUỸ ĐẠO GẬP MỞ 4 CÁNH RA NGOÀI (PLAN VIEW - OUTWARD FOLDING)',
    500,
    -400,
    46,
    0,
    'GHI_CHU'
  );

  // Trụ cổng và tường rào ở cao độ y = -900
  // Trụ trái
  engine.drawRectangle(-150, -975, 150, 150, 'KHUNG_TRU');
  engine.drawRectangle(-450, -950, 300, 100, 'KHUNG_TRU'); // Tường rào trái
  // Trụ phải
  engine.drawRectangle(4000, -975, 150, 150, 'KHUNG_TRU');
  engine.drawRectangle(4150, -950, 300, 100, 'KHUNG_TRU'); // Tường rào phải

  // Đường tim trục cổng
  engine.drawLine(-450, -900, 4450, -900, 'GHI_CHU');

  // 4 Cánh ở trạng thái ĐÓNG (Closed position - nét liền)
  engine.drawRectangle(10, -925, 990, 50, 'KHUNG_CANH');
  engine.drawRectangle(1006, -925, 990, 50, 'KHUNG_CANH');
  engine.drawRectangle(2004, -925, 990, 50, 'KHUNG_CANH');
  engine.drawRectangle(3000, -925, 990, 50, 'KHUNG_CANH');

  engine.drawText('VỊ TRÍ CỔNG ĐÓNG (CLOSED)', 1750, -860, 28, 0, 'KHUNG_CANH');
  engine.drawText('▲ PHÍA TRONG SÂN / NHÀ', 1700, -780, 34, 0, 'GHI_CHU');
  engine.drawText('▼ PHÍA NGOÀI ĐƯỜNG (HƯỚNG MỞ RA NGOÀI)', 1500, -1580, 36, 0, 'GHI_CHU');

  // QUỸ ĐẠO GẬP MỞ 4 CÁNH RA NGOÀI (QUY_DAO_MO)
  // Bên trái: Cánh 1 & 2 gập về trụ trái
  // Cánh 1 xoay 90° ra ngoài quanh (0, -900):
  engine.drawRectangle(-50, -1890, 50, 990, 'QUY_DAO_MO');
  // Cánh 2 gập áp sát song song Cánh 1:
  engine.drawRectangle(5, -1890, 50, 990, 'QUY_DAO_MO');
  // Cung quỹ đạo quay Cánh 1 (R = 990, tâm 0, -900, từ 270° đến 360°)
  engine.drawArc(0, -900, 990, 270, 360, 'QUY_DAO_MO');
  // Cung quỹ đạo Cánh 2 khi gập
  engine.drawArc(0, -900, 1400, 270, 320, 'QUY_DAO_MO');

  // Bên phải: Cánh 3 & 4 gập về trụ phải
  // Cánh 4 xoay 90° ra ngoài quanh (4000, -900):
  engine.drawRectangle(4000, -1890, 50, 990, 'QUY_DAO_MO');
  // Cánh 3 gập áp sát song song Cánh 4:
  engine.drawRectangle(3945, -1890, 50, 990, 'QUY_DAO_MO');
  // Cung quỹ đạo quay Cánh 4 (R = 990, tâm 4000, -900, từ 180° đến 270°)
  engine.drawArc(4000, -900, 990, 180, 270, 'QUY_DAO_MO');
  // Cung quỹ đạo Cánh 3 khi gập
  engine.drawArc(4000, -900, 1400, 220, 270, 'QUY_DAO_MO');

  // Vị trí mở tối đa 180° ép sát mặt tường ngoài
  engine.drawRectangle(-450, -1070, 300, 95, 'QUY_DAO_MO');
  engine.drawRectangle(4150, -1070, 300, 95, 'QUY_DAO_MO');
  engine.drawText('CÁNH 1 & 2 XẾP GẬP', -420, -1120, 22, 0, 'QUY_DAO_MO');
  engine.drawText('CÁNH 3 & 4 XẾP GẬP', 4180, -1120, 22, 0, 'QUY_DAO_MO');

  // Mũi tên chỉ hướng mở ra ngoài
  engine.drawLine(500, -1020, 150, -1450, 'QUY_DAO_MO');
  engine.drawLine(150, -1450, 180, -1400, 'QUY_DAO_MO');
  engine.drawLine(150, -1450, 210, -1450, 'QUY_DAO_MO');

  engine.drawLine(3500, -1020, 3850, -1450, 'QUY_DAO_MO');
  engine.drawLine(3850, -1450, 3820, -1400, 'QUY_DAO_MO');
  engine.drawLine(3850, -1450, 3790, -1450, 'QUY_DAO_MO');

  engine.drawText(
    'CƠ CHẾ GẬP MỞ 4 CÁNH RA NGOÀI (2 CÁNH XẾP TRÁI, 2 CÁNH XẾP PHẢI - ÉP SÁT TƯỜNG)',
    750,
    -1480,
    30,
    0,
    'QUY_DAO_MO'
  );

  // ==========================================
  // 3. CHI TIẾT MẶT CẮT A-A (VERTICAL SECTION)
  // ==========================================
  engine.drawText('3. CHI TIẾT MẶT CẮT A-A (SECTION DETAIL A-A)', 4450, 3570, 42, 0, 'GHI_CHU');

  // Cấu tạo từng lớp dọc theo mặt cắt A-A (từ y = -80 đến y = 3500)
  // Xà nóc 100x150
  engine.drawRectangle(4650, 3400, 150, 100, 'KHUNG_TRU');
  // Khung ô thoáng
  engine.drawRectangle(4650, 3350, 50, 50, 'KHUNG_TRU');
  engine.drawRectangle(4672, 2920, 6, 430, 'NHOM_TAM'); // Nhôm tấm ô thoáng 3mm
  engine.drawRectangle(4650, 2900, 50, 50, 'KHUNG_TRU');

  // Đố đỉnh cánh 50x100
  engine.drawRectangle(4650, 2780, 50, 100, 'KHUNG_CANH');
  // Pano nhôm tấm CNC 3mm
  engine.drawRectangle(4672, 1180, 6, 1600, 'NHOM_TAM');
  // Nẹp nhôm giữ tấm
  engine.drawRectangle(4662, 1180, 10, 20, 'KHUNG_CANH');
  engine.drawRectangle(4678, 1180, 10, 20, 'KHUNG_CANH');
  engine.drawRectangle(4662, 2760, 10, 20, 'KHUNG_CANH');
  engine.drawRectangle(4678, 2760, 10, 20, 'KHUNG_CANH');

  // Đố giữa cánh 50x100
  engine.drawRectangle(4650, 1080, 50, 100, 'KHUNG_CANH');
  // Pano nhôm tấm dập gân 3mm
  engine.drawRectangle(4672, 210, 6, 870, 'NHOM_TAM');
  // Đố đáy cánh 50x150 (chịu lực chân cánh)
  engine.drawRectangle(4650, 60, 50, 150, 'KHUNG_CANH');

  // Sàn bê tông & chốt âm
  engine.drawRectangle(4550, -80, 350, 80, 'GHI_CHU');
  engine.drawRectangle(4665, -30, 20, 90, 'PHU_KIEN'); // Chốt âm ăn sâu xuống sàn 30mm

  // Bản lề cối 3D gắn mặt bên
  hingeYs.forEach((hy) => {
    engine.drawRectangle(4610, hy - 40, 40, 80, 'PHU_KIEN');
  });

  // Chú thích mặt cắt A-A
  engine.drawLine(4800, 3450, 4840, 3450, 'GHI_CHU');
  engine.drawText('ĐÀ NÓC NHÔM HỘP 100x150x2.0mm', 4850, 3440, 24, 0, 'GHI_CHU');

  engine.drawLine(4680, 3140, 4840, 3140, 'GHI_CHU');
  engine.drawText('Ô THOÁNG NHÔM TẤM CNC 3.0mm', 4850, 3130, 24, 0, 'GHI_CHU');

  engine.drawLine(4700, 2830, 4840, 2830, 'GHI_CHU');
  engine.drawText('ĐỐ ĐỈNH CÁNH HỘP 50x100x1.8mm', 4850, 2820, 24, 0, 'GHI_CHU');

  engine.drawLine(4680, 1980, 4840, 1980, 'GHI_CHU');
  engine.drawText('PANO NHÔM TẤM CNC 3.0mm + NẸP SẬP', 4850, 1970, 24, 0, 'GHI_CHU');

  engine.drawLine(4700, 1130, 4840, 1130, 'GHI_CHU');
  engine.drawText('ĐỐ GIỮA CÁNH HỘP 50x100x1.8mm', 4850, 1120, 24, 0, 'GHI_CHU');

  engine.drawLine(4680, 650, 4840, 650, 'GHI_CHU');
  engine.drawText('PANO NHÔM TẤM 3.0mm CHẤN GÂN NỔI', 4850, 640, 24, 0, 'GHI_CHU');

  engine.drawLine(4700, 135, 4840, 135, 'GHI_CHU');
  engine.drawText('ĐỐ ĐÁY CÁNH HỘP 50x150x2.0mm', 4850, 125, 24, 0, 'GHI_CHU');

  engine.drawLine(4685, 25, 4840, 25, 'GHI_CHU');
  engine.drawText('KHE HỞ SÀN 60mm & CHỐT ÂM SÀN INOX', 4850, 15, 24, 0, 'GHI_CHU');

  // ==========================================
  // HỆ THỐNG KÍCH THƯỚC (DIMENSIONS) & CAO ĐỘ (ELEVATIONS)
  // ==========================================
  // Kích thước ngang thông thủy (4000 mm)
  engine.dimLinear(0, 3620, 4000, 3620, 2000, 3640, false);
  engine.drawText('4000 (RỘNG THÔNG THỦY CỔNG)', 1450, 3650, 32, 0, 'KICH_THUOC');

  // Kích thước ngang phủ bì (4300 mm)
  engine.dimLinear(-150, 3780, 4150, 3780, 2000, 3800, false);
  engine.drawText('4300 (PHỦ BÌ KHUNG TRỤ CỔNG)', 1450, 3810, 32, 0, 'KICH_THUOC');

  // Kích thước ngang 4 cánh (mỗi cánh 990 mm)
  engine.dimLinear(10, -50, 1000, -50, 505, -70, false);
  engine.drawText('990', 470, -40, 24, 0, 'KICH_THUOC');

  engine.dimLinear(1006, -50, 1996, -50, 1501, -70, false);
  engine.drawText('990', 1470, -40, 24, 0, 'KICH_THUOC');

  engine.dimLinear(2004, -50, 2994, -50, 2499, -70, false);
  engine.drawText('990', 2470, -40, 24, 0, 'KICH_THUOC');

  engine.dimLinear(3000, -50, 3990, -50, 3495, -70, false);
  engine.drawText('990', 3470, -40, 24, 0, 'KICH_THUOC');

  // Kích thước chiều cao đứng tổng thể (3400 mm)
  engine.dimLinear(-380, 0, -380, 3400, -400, 1700, true);
  engine.drawText('3400 (TỔNG CHIỀU CAO CỔNG)', -370, 1500, 30, 90, 'KICH_THUOC');

  // Kích thước chiều cao cánh (2820 mm)
  engine.dimLinear(-230, 60, -230, 2880, -250, 1470, true);
  engine.drawText('2820 (CAO CÁNH)', -220, 1350, 26, 90, 'KICH_THUOC');

  // Kích thước ô thoáng (500 mm)
  engine.dimLinear(-230, 2900, -230, 3400, -250, 3150, true);
  engine.drawText('500 (Ô THOÁNG)', -220, 3000, 24, 90, 'KICH_THUOC');

  // Kích thước khe hở chân cánh (60 mm)
  engine.dimLinear(-230, 0, -230, 60, -250, 30, true);
  engine.drawText('60', -210, 20, 20, 0, 'KICH_THUOC');

  // Ký hiệu cao độ (Elevation symbols)
  engine.drawText('▼ ±0.000 (CỐT SÀN HOÀN THIỆN)', -440, -40, 22, 0, 'KICH_THUOC');
  engine.drawText('▲ +0.060 (ĐÁY CÁNH CỔNG)', -440, 75, 22, 0, 'KICH_THUOC');
  engine.drawText('▲ +1.100 (TIM TAY NẮM / KHÓA)', -440, 1115, 22, 0, 'KICH_THUOC');
  engine.drawText('▲ +2.880 (ĐỈNH CÁNH CỔNG)', -440, 2895, 22, 0, 'KICH_THUOC');
  engine.drawText('▲ +3.400 (DẠ ĐÀ / ĐỈNH Ô THOÁNG)', -440, 3415, 22, 0, 'KICH_THUOC');
  engine.drawText('▲ +3.500 (ĐỈNH ĐÀ NÓC CỔNG)', -440, 3515, 22, 0, 'KICH_THUOC');

  // ==========================================
  // BẢNG GHI CHÚ KỸ THUẬT LẮP ĐẶT (SPECIFICATIONS TABLE)
  // ==========================================
  const specX = -450;
  const specY = -1730;
  const specW = 2800;
  const specH = 650;
  engine.drawRectangle(specX, specY, specW, specH, 'GHI_CHU');
  engine.drawText('BẢNG GHI CHÚ KỸ THUẬT VẬT TƯ & LẮP ĐẶT CỔNG NHÔM HỘP 4 CÁNH:', specX + 30, specY + specH - 50, 28, 0, 'GHI_CHU');
  engine.drawLine(specX, specY + specH - 70, specX + specW, specY + specH - 70, 'GHI_CHU');

  const specs = [
    '1. KHUNG TRỤ & ĐÀ NÓC: DÙNG NHÔM HỘP ĐỊNH HÌNH 150x150 / 100x150 DÀY 2.0mm LIÊN KẾT BẢN MÃ NỞ SẮT M12 VÀO ĐÀ BÊ TÔNG.',
    '2. KHUNG CÁNH CỬA: DÙNG NHÔM HỘP 50x100 DÀY 1.8mm, ĐỐ ĐÁY CHỊU LỰC TĂNG CỨNG 50x150mm, GÓC CẮT 45° ÉP KE ĐÚC CHỊU LỰC.',
    '3. PANO THÂN CÁNH: NHÔM TẤM HỢP KIM AL-MG DÀY 3.0mm CẮT HOA VĂN CNC HIỆN ĐẠI (KHOANG TRÊN) VÀ DẬP 3 GÂN NỔI CHỐNG RUNG (KHOANG DƯỚI).',
    '4. CƠ CẤU MỞ GẬP NGOÀI: 4 CÁNH GẬP MỞ RA NGOÀI (CÁNH 1-2 XẾP TRÁI, CÁNH 3-4 XẾP PHẢI), GÓC MỞ 90° ĐẾN 180° ÁP SÁT TƯỜNG RÀO.',
    '5. BẢN LÈ CỐI 3D: DÙNG BẢN LỀ CỐI INOX 304 CHỊU TẢI 150KG/CỐI (MỖI TRỤ 3 BẢN LỀ, MỖI KHỚP GẬP 3 BẢN LỀ) CHỐNG XỆ TUYỆT ĐỐI.',
    '6. PHỤ KIỆN ĐỒNG BỘ: BỘ TAY NẮM ỐNG INOX 304 DÀI 800mm (PHI 38), KHÓA ĐA ĐIỂM, CHỐT ÂM SÀN VÀ CHỐT ÂM ĐỈNH ĐỒNG BỘ.',
    '7. SƠN TĨNH ĐIỆN: TOÀN BỘ BỀ MẶT SƠN TĨNH ĐIỆN NGOÀI TRỜI CAO CẤP CHỐNG OXY HÓA, BẢO HÀNH THỜI TIẾT KHẮC NGHIỆT TRÊN 10 NĂM.',
    '8. KHE HỞ THÔNG THỦY: KHE CHÂN CÁNH 60mm ĐẢM BẢO THOÁT NƯỚC VÀ ĐỘ DỐC SÂN; KHE GIỮA CÁNH 6-8mm ĐẢM BẢO ĐÓNG MỞ ÊM ÁI.',
  ];

  specs.forEach((line, idx) => {
    engine.drawText(line, specX + 30, specY + specH - 120 - idx * 60, 20, 0, 'GHI_CHU');
  });

  // ==========================================
  // KHUNG TÊN BẢN VẼ TIÊU CHUẨN (TITLE BLOCK)
  // ==========================================
  const tbX = 2500;
  const tbY = -1730;
  const tbW = 3170;
  const tbH = 650;
  engine.drawRectangle(tbX, tbY, tbW, tbH, 'GHI_CHU');

  // Kẻ bảng khung tên
  engine.drawLine(tbX, tbY + 520, tbX + tbW, tbY + 520, 'GHI_CHU');
  engine.drawLine(tbX, tbY + 380, tbX + tbW, tbY + 380, 'GHI_CHU');
  engine.drawLine(tbX, tbY + 250, tbX + tbW, tbY + 250, 'GHI_CHU');
  engine.drawLine(tbX, tbY + 120, tbX + tbW, tbY + 120, 'GHI_CHU');
  engine.drawLine(tbX + 1600, tbY, tbX + 1600, tbY + 380, 'GHI_CHU');

  engine.drawText('CÔNG TRÌNH: BIỆT THỰ / NHÀ PHỐ HIỆN ĐẠI', tbX + 40, tbY + 560, 30, 0, 'GHI_CHU');
  engine.drawText('HẠNG MỤC: CỔNG CHÍNH 4 CÁNH KHUNG NHÔM HỘP - PANO NHÔM TẤM 3.0mm', tbX + 40, tbY + 430, 28, 0, 'GHI_CHU');

  engine.drawText('QUY CÁCH: HỆ GẬP MỞ 4 CÁNH RA NGOÀI (BI-FOLD OUTWARD)', tbX + 40, tbY + 300, 24, 0, 'GHI_CHU');
  engine.drawText('KÍCH THƯỚC: W4000 x H3400 mm | TỈ LỆ: 1:25', tbX + 40, tbY + 170, 24, 0, 'GHI_CHU');
  engine.drawText('VẬT LIỆU: NHÔM HỘP HỆ 50x100, NHÔM TẤM AL-MG 3.0mm', tbX + 40, tbY + 50, 24, 0, 'GHI_CHU');

  engine.drawText('ĐƠN VỊ THIẾT KẾ: AI AUTOCAD STUDIO', tbX + 1640, tbY + 300, 24, 0, 'GHI_CHU');
  engine.drawText('NGƯỜI THIẾT KẾ: KỸ SƯ AUTOCAD AI', tbX + 1640, tbY + 170, 24, 0, 'GHI_CHU');
  engine.drawText('BẢN VẼ SỐ: KT-C01 | ĐƠN VỊ: mm', tbX + 1640, tbY + 50, 24, 0, 'GHI_CHU');

  engine.saved = true;
  return engine.entities.length;
}
