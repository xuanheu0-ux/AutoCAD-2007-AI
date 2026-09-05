import { CadEngine } from './cadEngine.js';

export function buildControlRoomDoorDrawing(engine: CadEngine) {
  // 1. Reset drawing with clean engineering & safety layers
  engine.entities = [];
  engine.layers = [
    { name: '0', color: 'white', colorIndex: 7, on: true, current: false },
    { name: 'KHUNG_NHOM', color: 'cyan', colorIndex: 4, on: true, current: false },
    { name: 'CANH_CUA', color: 'yellow', colorIndex: 2, on: true, current: false },
    { name: 'KINH_AN_TOAN', color: 'magenta', colorIndex: 6, on: true, current: false },
    { name: 'QUY_DAO_MO', color: 'green', colorIndex: 3, on: true, current: false },
    { name: 'PHU_KIEN', color: 'red', colorIndex: 1, on: true, current: false },
    { name: 'BIEN_CANH_BAO', color: 'yellow', colorIndex: 2, on: true, current: false },
    { name: 'KICH_THUOC', color: 'cyan', colorIndex: 4, on: true, current: false },
    { name: 'GHI_CHU', color: 'white', colorIndex: 7, on: true, current: true },
  ];
  engine.activeLayerName = 'GHI_CHU';
  engine.drawingName = 'Bản_vẽ_cửa_nhà_vận_hành_bảng_điện_1.7x2.5m.dwg';
  engine.units = 'millimetres';
  engine.insunits = 4;
  engine.saved = false;

  // ==========================================
  // KHUNG BẢN VẼ TIÊU CHUẨN (STANDARD A1/A0 DRAWING SHEET)
  // Kích thước chuẩn: Rộng 5670mm x Cao 5350mm, phân chia 4 phân khu độc lập
  // ==========================================
  // Khung ngoài bản vẽ tiêu chuẩn
  engine.drawRectangle(-520, -2050, 5670, 5350, 'GHI_CHU');
  // Khung viền trong
  engine.drawRectangle(-490, -2020, 5610, 5290, 'GHI_CHU');

  // TIÊU ĐỀ CHÍNH BẢN VẼ (SHEET TITLE)
  engine.drawText(
    'BẢN VẼ THIẾT KẾ CỬA ĐI LẠI NHÀ VẬN HÀNH BẢNG ĐIỆN - 2 CÁNH MỞ QUAY VÀO TRONG',
    400,
    3200,
    50,
    0,
    'GHI_CHU'
  );
  engine.drawText(
    'KHUNG NHÔM HỘP ĐỊNH HÌNH - KÍNH TRẮNG DÁN AN TOÀN (KÍCH THƯỚC RỘNG 1.7m x CAO 2.5m)',
    550,
    3100,
    34,
    0,
    'GHI_CHU'
  );

  // Đường phân chia ranh giới bố cục (Sub-dividers between sections)
  // Đường phân cách đứng giữa [Mặt đứng/Mặt bằng] và [Mặt cắt/Ghi chú]
  engine.drawLine(2380, -1980, 2380, 3020, 'GHI_CHU');
  // Đường phân cách ngang bên trái giữa Mặt đứng và Mặt bằng
  engine.drawLine(-480, -190, 2380, -190, 'GHI_CHU');
  // Đường phân cách ngang bên phải giữa Mặt cắt và Bảng ghi chú
  engine.drawLine(2380, -190, 5110, -190, 'GHI_CHU');

  // ==========================================
  // PHÂN KHU 1 (TOP-LEFT): 1. MẶT ĐỨNG CỬA ĐI CHÍNH (FRONT ELEVATION - TỈ LỆ 1:20)
  // Tọa độ: X: -450 đến 2300, Y: 0 đến 2980
  // ==========================================
  engine.drawText('1. MẶT ĐỨNG CỬA ĐI CHÍNH (FRONT ELEVATION VIEW - TỈ LỆ 1:20)', 260, 2920, 38, 0, 'GHI_CHU');

  // Cốt sàn hoàn thiện ±0.000
  engine.drawLine(-350, 0, 2050, 0, 'GHI_CHU');
  engine.drawLine(-350, -12, 2050, -12, 'GHI_CHU');
  engine.drawText('CỐT SÀN HOÀN THIỆN ±0.000', -340, 20, 20, 0, 'GHI_CHU');

  // Tường bao phòng vận hành bảng điện và lanh tô bê tông
  engine.drawRectangle(-250, 0, 250, 2550, 'KHUNG_NHOM'); // Tường trái
  engine.drawRectangle(1700, 0, 250, 2550, 'KHUNG_NHOM'); // Tường phải
  engine.drawRectangle(-250, 2500, 2200, 100, 'KHUNG_NHOM'); // Lanh tô trên
  engine.drawText('LANH TÔ BÊ TÔNG CỬA ĐI', 650, 2535, 24, 0, 'KHUNG_NHOM');
  engine.drawText('TƯỜNG PHÒNG ĐIỆN', -230, 1250, 22, 90, 'KHUNG_NHOM');
  engine.drawText('TƯỜNG PHÒNG ĐIỆN', 1860, 1250, 22, 90, 'KHUNG_NHOM');

  // Khung bao nhôm hộp cửa đi (Rộng 1700 mm x Cao 2500 mm)
  // Khung bao đứng trái & phải (nhôm hộp 50x100mm)
  engine.drawRectangle(0, 0, 50, 2500, 'KHUNG_NHOM');
  engine.drawRectangle(1650, 0, 50, 2500, 'KHUNG_NHOM');
  // Khung bao nóc cửa (nhôm hộp 50x100mm)
  engine.drawRectangle(50, 2450, 1600, 50, 'KHUNG_NHOM');
  // Đà nhôm hộp ngang giữa phân chia ô fix và cánh cửa (tại y = 2070 đến 2120, cao 50mm)
  engine.drawRectangle(50, 2070, 1600, 50, 'KHUNG_NHOM');
  engine.drawText('ĐÀ NGANG NHÔM HỘP 50x100', 580, 2085, 20, 0, 'KHUNG_NHOM');

  // Ô FIX KÍNH CỐ ĐỊNH PHÍA TRÊN (y = 2120 đến 2450, Cao 330mm)
  // Đố đứng chia đôi ô kính fix (nhôm hộp 40x50mm)
  engine.drawRectangle(835, 2120, 30, 330, 'KHUNG_NHOM');
  // Ô kính fix trái
  engine.drawRectangle(60, 2130, 765, 310, 'KINH_AN_TOAN');
  engine.drawRectangle(70, 2140, 745, 290, 'KINH_AN_TOAN');
  // Ô kính fix phải
  engine.drawRectangle(875, 2130, 765, 310, 'KINH_AN_TOAN');
  engine.drawRectangle(885, 2140, 745, 290, 'KINH_AN_TOAN');
  // Nét phản quang kính ô fix
  engine.drawLine(150, 2380, 280, 2410, 'KINH_AN_TOAN');
  engine.drawLine(170, 2350, 320, 2400, 'KINH_AN_TOAN');
  engine.drawLine(960, 2380, 1090, 2410, 'KINH_AN_TOAN');
  engine.drawLine(980, 2350, 1130, 2400, 'KINH_AN_TOAN');
  engine.drawText('Ô FIX KÍNH TRẮNG DÁN AN TOÀN (CAO 380mm)', 500, 2270, 22, 0, 'KINH_AN_TOAN');

  // 2 CÁNH CỬA ĐI CHÍNH (y = 15 đến 2060, Cao 2045mm)
  const leaves = [
    { name: 'CÁNH 1 (CÁNH PHỤ TRÁI)', x: 54, w: 794, isMain: false },
    { name: 'CÁNH 2 (CÁNH CHÍNH PHẢI)', x: 852, w: 794, isMain: true },
  ];

  leaves.forEach((leaf) => {
    const lx = leaf.x;
    const lw = leaf.w;
    const by = 15;
    const h = 2045;

    // Khung bao cánh (nhôm hộp hệ 50x90mm)
    engine.drawRectangle(lx, by, lw, h, 'CANH_CUA');

    // Đố đứng bản lề và đố đứng tiếp giáp (nhôm hộp 50x85mm)
    engine.drawRectangle(lx, by, 85, h, 'CANH_CUA');
    engine.drawRectangle(lx + lw - 85, by, 85, h, 'CANH_CUA');

    // Đố đáy cánh chịu lực (nhôm hộp 50x120mm, từ y = 15 đến 135)
    engine.drawRectangle(lx + 85, by, lw - 170, 120, 'CANH_CUA');

    // Đố đỉnh cánh (nhôm hộp 50x85mm, từ y = 1975 đến 2060)
    engine.drawRectangle(lx + 85, 1975, lw - 170, 85, 'CANH_CUA');

    // Đố ngang giữa cánh (tại cao độ tim khóa y = 950 đến 1030, cao 80mm)
    engine.drawRectangle(lx + 85, 950, lw - 170, 80, 'CANH_CUA');

    // Khoang kính trên (y = 1030 đến 1975, Cao 945mm)
    engine.drawRectangle(lx + 95, 1040, lw - 190, 925, 'KINH_AN_TOAN');
    engine.drawRectangle(lx + 105, 1050, lw - 210, 905, 'KINH_AN_TOAN');
    engine.drawLine(lx + 140, 1850, lx + 320, 1920, 'KINH_AN_TOAN');
    engine.drawLine(lx + 160, 1810, lx + 360, 1900, 'KINH_AN_TOAN');
    engine.drawLine(lx + lw - 360, 1150, lx + lw - 160, 1240, 'KINH_AN_TOAN');
    engine.drawLine(lx + lw - 320, 1110, lx + lw - 140, 1190, 'KINH_AN_TOAN');

    // Khoang kính dưới (y = 135 đến 950, Cao 815mm)
    engine.drawRectangle(lx + 95, 145, lw - 190, 795, 'KINH_AN_TOAN');
    engine.drawRectangle(lx + 105, 155, lw - 210, 775, 'KINH_AN_TOAN');
    engine.drawLine(lx + 140, 790, lx + 300, 860, 'KINH_AN_TOAN');
    engine.drawLine(lx + 160, 750, lx + 340, 840, 'KINH_AN_TOAN');
    engine.drawText('KÍNH TRẮNG DÁN AN TOÀN', lx + 140, 480, 20, 0, 'KINH_AN_TOAN');

    // Tên cánh
    engine.drawText(leaf.name, lx + lw / 2 - 140, 50, 20, 0, 'GHI_CHU');
  });

  // Biển cảnh báo an toàn điện lực trên kính
  engine.drawRectangle(180, 1420, 540, 200, 'BIEN_CANH_BAO');
  engine.drawRectangle(188, 1428, 524, 184, 'BIEN_CANH_BAO');
  engine.drawText('PHÒNG VẬN HÀNH BẢNG ĐIỆN', 215, 1535, 24, 0, 'BIEN_CANH_BAO');
  engine.drawText('SWITCHGEAR OPERATING ROOM', 230, 1490, 18, 0, 'BIEN_CANH_BAO');
  engine.drawText('KHÔNG PHẬN SỰ MIỄN VÀO', 255, 1445, 20, 0, 'BIEN_CANH_BAO');

  engine.drawRectangle(980, 1420, 540, 200, 'BIEN_CANH_BAO');
  engine.drawRectangle(988, 1428, 524, 184, 'BIEN_CANH_BAO');
  engine.drawPolyline([[1250, 1590], [1210, 1530], [1290, 1530]], true, 'PHU_KIEN');
  engine.drawLine(1250, 1575, 1245, 1550, 'PHU_KIEN');
  engine.drawCircle(1245, 1540, 3, 'PHU_KIEN');
  engine.drawText('CHÚ Ý: ĐIỆN CAO ÁP NGUY HIỂM ⚡', 1020, 1490, 22, 0, 'PHU_KIEN');
  engine.drawText('DANGER! HIGH VOLTAGE KEEP OUT', 1030, 1445, 18, 0, 'PHU_KIEN');

  // Phụ kiện kim khí
  const hingeYs = [220, 990, 1860];
  hingeYs.forEach((hy) => {
    engine.drawRectangle(42, hy - 40, 20, 80, 'PHU_KIEN');
    engine.drawRectangle(1638, hy - 40, 20, 80, 'PHU_KIEN');
  });
  engine.drawText('BẢN LỀ 3D CHỊU LỰC', 1670, 980, 18, 90, 'PHU_KIEN');

  engine.drawRectangle(835, 960, 30, 100, 'PHU_KIEN');
  engine.drawCircle(850, 990, 6, 'PHU_KIEN');
  engine.drawLine(860, 1020, 940, 1020, 'PHU_KIEN');
  engine.drawCircle(860, 1020, 6, 'PHU_KIEN');
  engine.drawText('KHÓA TAY GẠT INOX', 880, 1035, 18, 0, 'PHU_KIEN');

  engine.drawRectangle(820, 2005, 16, 50, 'PHU_KIEN');
  engine.drawRectangle(820, 20, 16, 50, 'PHU_KIEN');
  engine.drawText('CHỐT ÂM CÁNH PHỤ', 700, 30, 18, 0, 'PHU_KIEN');

  engine.drawRectangle(180, 2025, 200, 32, 'PHU_KIEN');
  engine.drawRectangle(1320, 2025, 200, 32, 'PHU_KIEN');
  engine.drawLine(280, 2025, 340, 1990, 'PHU_KIEN');
  engine.drawLine(1420, 2025, 1360, 1990, 'PHU_KIEN');
  engine.drawText('TAY CO THỦY LỰC TỰ ĐỘNG ĐÓNG (GIỮ KÍN PHÒNG MÁY)', 510, 2030, 18, 0, 'PHU_KIEN');

  // Kích thước mặt đứng
  // Kích thước ngang thông thủy (1700 mm)
  engine.dimLinear(0, 2640, 1700, 2640, 850, 2660, false);
  engine.drawText('1700 (RỘNG THÔNG THỦY CỬA)', 600, 2675, 26, 0, 'KICH_THUOC');

  // Kích thước ngang phủ bì khung (1800 mm)
  engine.dimLinear(-50, 2760, 1750, 2760, 850, 2780, false);
  engine.drawText('1800 (PHỦ BÌ KHUNG BAO NHÔM)', 580, 2795, 26, 0, 'KICH_THUOC');

  // Kích thước ngang 2 cánh (mỗi cánh 794 mm)
  engine.dimLinear(54, -40, 848, -40, 451, -60, false);
  engine.drawText('794', 420, -30, 20, 0, 'KICH_THUOC');
  engine.dimLinear(852, -40, 1646, -40, 1249, -60, false);
  engine.drawText('794', 1220, -30, 20, 0, 'KICH_THUOC');

  // Kích thước đứng tổng thể (2500 mm)
  engine.dimLinear(-160, 0, -160, 2500, -180, 1250, true);
  engine.drawText('2500 (TỔNG CHIỀU CAO CỬA ĐI)', -150, 1150, 26, 90, 'KICH_THUOC');

  // Kích thước chiều cao cánh (2045 mm)
  engine.dimLinear(-70, 15, -70, 2060, -90, 1037, true);
  engine.drawText('2045 (CHIỀU CAO CÁNH)', -60, 950, 22, 90, 'KICH_THUOC');

  // Kích thước chiều cao ô fix (380 mm)
  engine.dimLinear(-70, 2120, -70, 2500, -90, 2310, true);
  engine.drawText('380 (Ô FIX KÍNH)', -60, 2220, 20, 90, 'KICH_THUOC');

  // Mốc cao độ kỹ thuật
  engine.drawText('▼ ±0.000 (CỐT SÀN HOÀN THIỆN)', -340, -35, 19, 0, 'KICH_THUOC');
  engine.drawText('▲ +0.015 (ĐÁY CÁNH CỬA)', -340, 30, 19, 0, 'KICH_THUOC');
  engine.drawText('▲ +0.990 (TIM KHÓA TAY GẠT)', -340, 1005, 19, 0, 'KICH_THUOC');
  engine.drawText('▲ +2.060 (ĐỈNH CÁNH CỬA)', -340, 2075, 19, 0, 'KICH_THUOC');
  engine.drawText('▲ +2.120 (ĐÁY Ô KÍNH FIX)', -340, 2135, 19, 0, 'KICH_THUOC');
  engine.drawText('▲ +2.500 (DẠ LANH TÔ / ĐỈNH CỬA)', -340, 2515, 19, 0, 'KICH_THUOC');

  // ==========================================
  // PHÂN KHU 2 (BOTTOM-LEFT): 2. MẶT BẰNG QUỸ ĐẠO CỬA MỞ QUAY VÀO TRONG (TỈ LỆ 1:20)
  // Tọa độ: X: -450 đến 2300, Y: -1950 đến -200 (KHÔNG CÒN BẢNG GHI CHÚ NÀO ĐÈ LÊN)
  // ==========================================
  engine.drawText(
    '2. MẶT BẰNG QUỸ ĐẠO CỬA MỞ QUAY VÀO TRONG (PLAN VIEW - TỈ LỆ 1:20)',
    160,
    -280,
    38,
    0,
    'GHI_CHU'
  );

  engine.drawText('▲ PHÍA NGOÀI HÀNH LANG (CORRIDOR)', 580, -380, 26, 0, 'GHI_CHU');

  // Trục tường phòng điện tại y = -580
  const planWallY = -580;
  engine.drawRectangle(-250, planWallY - 75, 250, 150, 'KHUNG_NHOM'); // Tường trái
  engine.drawRectangle(1700, planWallY - 75, 250, 150, 'KHUNG_NHOM'); // Tường phải
  engine.drawLine(-350, planWallY, 2050, planWallY, 'GHI_CHU'); // Trục tường

  // Khung bao cửa tại mặt bằng
  engine.drawRectangle(0, planWallY - 75, 50, 150, 'KHUNG_NHOM');
  engine.drawRectangle(1650, planWallY - 75, 50, 150, 'KHUNG_NHOM');

  // Vị trí cửa khi ĐÓNG (Closed - nét liền)
  engine.drawRectangle(54, planWallY - 25, 794, 50, 'CANH_CUA');
  engine.drawRectangle(852, planWallY - 25, 794, 50, 'CANH_CUA');
  engine.drawText('VỊ TRÍ ĐÓNG CỬA (CLOSED)', 680, planWallY + 35, 22, 0, 'CANH_CUA');

  // QUỸ ĐẠO MỞ QUAY VÀO TRONG (QUY_DAO_MO)
  // Cánh 1: Quay quanh tâm bản lề trái (54, planWallY), bán kính R = 794mm, quay vào trong (270° đến 360°)
  // Vị trí mở 90°: Y từ planWallY xuống planWallY - 794 = -1374
  engine.drawRectangle(54, planWallY - 794, 50, 794, 'QUY_DAO_MO');
  engine.drawArc(54, planWallY, 794, 270, 360, 'QUY_DAO_MO');

  // Cánh 2: Quay quanh tâm bản lề phải (1646, planWallY), bán kính R = 794mm, quay vào trong (180° đến 270°)
  engine.drawRectangle(1596, planWallY - 794, 50, 794, 'QUY_DAO_MO');
  engine.drawArc(1646, planWallY, 794, 180, 270, 'QUY_DAO_MO');

  // Vị trí mở tối đa 180° ép sát vách tường trong phòng
  engine.drawRectangle(-250, planWallY - 130, 250, 50, 'QUY_DAO_MO');
  engine.drawRectangle(1700, planWallY - 130, 250, 50, 'QUY_DAO_MO');
  engine.drawText('CÁNH 1 ÉP TƯỜNG 180°', -235, planWallY - 180, 19, 0, 'QUY_DAO_MO');
  engine.drawText('CÁNH 2 ÉP TƯỜNG 180°', 1715, planWallY - 180, 19, 0, 'QUY_DAO_MO');

  // Mũi tên chỉ hướng mở quay vào trong
  engine.drawLine(400, planWallY - 100, 160, planWallY - 500, 'QUY_DAO_MO');
  engine.drawLine(160, planWallY - 500, 190, planWallY - 450, 'QUY_DAO_MO');
  engine.drawLine(160, planWallY - 500, 220, planWallY - 490, 'QUY_DAO_MO');

  engine.drawLine(1300, planWallY - 100, 1540, planWallY - 500, 'QUY_DAO_MO');
  engine.drawLine(1540, planWallY - 500, 1510, planWallY - 450, 'QUY_DAO_MO');
  engine.drawLine(1540, planWallY - 500, 1480, planWallY - 490, 'QUY_DAO_MO');

  // Chú thích cơ cấu mở quay
  engine.drawText(
    'CƠ CẤU MỞ QUAY VÀO TRONG 2 CÁNH (GÓC MỞ 90° - 180° THUẬN TIỆN VẬN HÀNH THIẾT BỊ)',
    200,
    -1450,
    24,
    0,
    'QUY_DAO_MO'
  );

  // Kích thước mặt bằng
  engine.dimLinear(0, -1560, 1700, -1560, 850, -1580, false);
  engine.drawText('1700 (RỘNG THÔNG THỦY CỬA)', 600, -1540, 24, 0, 'KICH_THUOC');

  engine.dimLinear(-50, -1660, 1750, -1660, 850, -1680, false);
  engine.drawText('1800 (PHỦ BÌ KHUNG BAO NHÔM)', 580, -1640, 24, 0, 'KICH_THUOC');

  engine.drawText(
    '▼ PHÍA TRONG NHÀ VẬN HÀNH BẢNG ĐIỆN (INWARD - MỞ VÀO TRONG)',
    320,
    -1790,
    28,
    0,
    'GHI_CHU'
  );

  // ==========================================
  // PHÂN KHU 3 (TOP-RIGHT): 3. CHI TIẾT MẶT CẮT KỸ THUẬT A-A (SECTION A-A - TỈ LỆ 1:10)
  // Tọa độ: X: 2450 đến 5100, Y: 0 đến 2980
  // ==========================================
  engine.drawText('3. CHI TIẾT MẶT CẮT ĐỨNG A-A (SECTION A-A)', 2550, 2920, 38, 0, 'GHI_CHU');

  // Lanh tô bê tông
  engine.drawRectangle(2700, 2500, 180, 150, 'KHUNG_NHOM');
  // Khung bao nóc nhôm hộp 50x100mm
  engine.drawRectangle(2700, 2450, 100, 50, 'KHUNG_NHOM');
  // Nẹp kính ô fix trên
  engine.drawRectangle(2740, 2430, 20, 20, 'KHUNG_NHOM');
  // Kính dán an toàn ô fix dày theo thiết kế
  engine.drawRectangle(2748, 2120, 6, 310, 'KINH_AN_TOAN');
  // Nẹp dưới ô fix
  engine.drawRectangle(2740, 2120, 20, 20, 'KHUNG_NHOM');
  // Đà ngang giữa hộp 50x100mm
  engine.drawRectangle(2700, 2070, 100, 50, 'KHUNG_NHOM');

  // Đố đỉnh cánh 50x90mm
  engine.drawRectangle(2700, 1975, 50, 85, 'CANH_CUA');
  // Nẹp giữ kính trên cánh
  engine.drawRectangle(2720, 1960, 15, 15, 'CANH_CUA');
  // Kính an toàn cánh trên
  engine.drawRectangle(2723, 1030, 6, 930, 'KINH_AN_TOAN');
  // Nẹp kính tại đố giữa
  engine.drawRectangle(2720, 1030, 15, 15, 'CANH_CUA');
  // Đố giữa cánh 50x80mm
  engine.drawRectangle(2700, 950, 50, 80, 'CANH_CUA');
  // Nẹp kính khoang dưới
  engine.drawRectangle(2720, 935, 15, 15, 'CANH_CUA');
  // Kính an toàn cánh dưới
  engine.drawRectangle(2723, 135, 6, 800, 'KINH_AN_TOAN');
  // Nẹp kính tại đố đáy
  engine.drawRectangle(2720, 135, 15, 15, 'CANH_CUA');
  // Đố đáy cánh 50x120mm
  engine.drawRectangle(2700, 15, 50, 120, 'CANH_CUA');

  // Khe hở sàn 15mm có ron cao su quét bụi
  engine.drawRectangle(2715, 0, 20, 15, 'PHU_KIEN');
  // Sàn hoàn thiện bê tông / sơn epoxy phòng điện
  engine.drawRectangle(2620, -70, 320, 70, 'GHI_CHU');

  // Bản lề cối 3D tại mặt cắt
  hingeYs.forEach((hy) => {
    engine.drawRectangle(2675, hy - 35, 25, 70, 'PHU_KIEN');
  });

  // Chú thích các chi tiết mặt cắt A-A (Chỉ dẫn sang bên phải rõ ràng)
  engine.drawLine(2800, 2560, 2950, 2560, 'GHI_CHU');
  engine.drawText('LANH TÔ BÊ TÔNG ĐỠ CỬA', 2980, 2550, 20, 0, 'GHI_CHU');

  engine.drawLine(2800, 2475, 2950, 2475, 'GHI_CHU');
  engine.drawText('KHUNG BAO NÓC NHÔM HỘP 50x100', 2980, 2465, 20, 0, 'GHI_CHU');

  engine.drawLine(2754, 2275, 2950, 2275, 'GHI_CHU');
  engine.drawText('KÍNH TRẮNG DÁN AN TOÀN Ô FIX', 2980, 2265, 20, 0, 'GHI_CHU');

  engine.drawLine(2800, 2095, 2950, 2095, 'GHI_CHU');
  engine.drawText('ĐÀ NGANG NHÔM HỘP 50x100x1.8mm', 2980, 2085, 20, 0, 'GHI_CHU');

  engine.drawLine(2750, 2015, 2950, 2015, 'GHI_CHU');
  engine.drawText('ĐỐ ĐỈNH CÁNH NHÔM HỘP 50x90', 2980, 2005, 20, 0, 'GHI_CHU');

  engine.drawLine(2729, 1550, 2950, 1550, 'GHI_CHU');
  engine.drawText('KÍNH TRẮNG DÁN AN TOÀN (LAMINATED GLASS)', 2980, 1540, 20, 0, 'GHI_CHU');

  engine.drawLine(2750, 990, 2950, 990, 'GHI_CHU');
  engine.drawText('ĐỐ GIỮA CÁNH HỘP 50x80 VÀ KHÓA TAY GẠT', 2980, 980, 20, 0, 'GHI_CHU');

  engine.drawLine(2729, 550, 2950, 550, 'GHI_CHU');
  engine.drawText('KÍNH DÁN AN TOÀN TRẮNG CHỐNG VỠ VỤN', 2980, 540, 20, 0, 'GHI_CHU');

  engine.drawLine(2750, 75, 2950, 75, 'GHI_CHU');
  engine.drawText('ĐỐ ĐÁY CÁNH HỘP 50x120 TĂNG CỨNG', 2980, 65, 20, 0, 'GHI_CHU');

  engine.drawLine(2735, 8, 2950, 8, 'GHI_CHU');
  engine.drawText('RON CAO SU CHỐNG BỤI VÀ KHE SÀN 15mm', 2980, -2, 20, 0, 'GHI_CHU');

  // ==========================================
  // PHÂN KHU 4 (BOTTOM-RIGHT UPPER): 4. BẢNG GHI CHÚ KỸ THUẬT AN TOÀN PHÒNG ĐIỆN (SPECS)
  // Tọa độ: X: 2480 đến 5050 (Rộng 2570mm), Y: -1150 đến -250 (Cao 900mm)
  // Độc lập hoàn toàn, chữ số và dòng kẻ cách nhau rộng rãi
  // ==========================================
  const specX = 2480;
  const specY = -1150;
  const specW = 2570;
  const specH = 900;
  engine.drawRectangle(specX, specY, specW, specH, 'GHI_CHU');
  engine.drawText('GHI CHÚ KỸ THUẬT CỬA ĐI NHÀ VẬN HÀNH BẢNG ĐIỆN:', specX + 30, specY + specH - 45, 26, 0, 'GHI_CHU');
  engine.drawLine(specX, specY + specH - 65, specX + specW, specY + specH - 65, 'GHI_CHU');

  const specs = [
    '1. VỊ TRÍ LẮP ĐẶT: CỬA ĐI LẠI CHÍNH NHÀ VẬN HÀNH BẢNG ĐIỆN (SWITCHGEAR ROOM).',
    '2. KHUNG NHÔM HỘP: DÙNG NHÔM ĐỊNH HÌNH HỘP 50x100mm DÀY 1.8mm, SƠN TĨNH ĐIỆN CÁCH ĐIỆN.',
    '3. KÍNH CỬA: KÍNH TRẮNG DÁN AN TOÀN DÀY TIÊU CHUẨN 2 LỚP CHỐNG VỠ VỤN, CHỐNG TIA LỬA ĐIỆN.',
    '4. HƯỚNG MỞ QUAY: MỞ QUAY VÀO TRONG (INWARD OPENING) THUẬN TIỆN THAO TÁC VÀ THOÁT HIỂM.',
    '5. TAY CO THỦY LỰC: TRANG BỊ TAY CO TỰ ĐỘNG ĐÓNG ĐỂ GIỮ KÍN PHÒNG ĐIỀU HÒA, NGĂN BỤI VÀO TỦ ĐIỆN.',
    '6. PHỤ KIỆN AN TOÀN: KHÓA TAY GẠT INOX 304, CHỐT ÂM CÁNH PHỤ, BẢN LỀ 3D CHỊU TẢI 120KG/CỐI.',
    '7. GIOĂNG ĐỆM KÉP: HỆ GIOĂNG CAO SU EPDM ĐẢM BẢO ĐỘ KÍN KHÍT, CÁCH ÂM, CÁCH NHIỆT VÀ CHỐNG CÔN TRÙNG.',
    '8. BIỂN BÁO: DÁN BIỂN CẢNH BÁO ĐIỆN CAO ÁP NGUY HIỂM ⚡ VÀ KHÔNG PHẬN SỰ MIỄN VÀO TRÊN KÍNH.',
  ];

  specs.forEach((line, idx) => {
    engine.drawText(line, specX + 30, specY + specH - 120 - idx * 85, 20, 0, 'GHI_CHU');
  });

  // ==========================================
  // PHÂN KHU 5 (BOTTOM-RIGHT LOWER): 5. KHUNG TÊN BẢN VẼ TIÊU CHUẨN (TCVN TITLE BLOCK)
  // Tọa độ: X: 2480 đến 5050 (Rộng 2570mm), Y: -1950 đến -1220 (Cao 730mm)
  // ==========================================
  const tbX = 2480;
  const tbY = -1950;
  const tbW = 2570;
  const tbH = 730;
  engine.drawRectangle(tbX, tbY, tbW, tbH, 'GHI_CHU');

  // Kẻ bảng phân chia thông tin khung tên
  engine.drawLine(tbX, tbY + 580, tbX + tbW, tbY + 580, 'GHI_CHU');
  engine.drawLine(tbX, tbY + 430, tbX + tbW, tbY + 430, 'GHI_CHU');
  engine.drawLine(tbX, tbY + 290, tbX + tbW, tbY + 290, 'GHI_CHU');
  engine.drawLine(tbX, tbY + 140, tbX + tbW, tbY + 140, 'GHI_CHU');
  engine.drawLine(tbX + 1350, tbY, tbX + 1350, tbY + 430, 'GHI_CHU');

  // Cột thông tin công trình và quy cách (bên trái)
  engine.drawText('CÔNG TRÌNH: NHÀ VẬN HÀNH BẢNG ĐIỆN', tbX + 30, tbY + 630, 26, 0, 'GHI_CHU');
  engine.drawText('HẠNG MỤC: CỬA ĐI 2 CÁNH KHUNG NHÔM HỘP - KÍNH AN TOÀN', tbX + 30, tbY + 480, 24, 0, 'GHI_CHU');
  engine.drawText('QUY CÁCH: HỆ MỞ QUAY VÀO TRONG (GÓC MỞ 90° - 180°)', tbX + 30, tbY + 340, 22, 0, 'GHI_CHU');
  engine.drawText('KÍCH THƯỚC: W1700 x H2500 mm (THÔNG THỦY)', tbX + 30, tbY + 195, 22, 0, 'GHI_CHU');
  engine.drawText('VẬT LIỆU: NHÔM HỘP 50x100mm, KÍNH DÁN AN TOÀN 2 LỚP', tbX + 30, tbY + 55, 20, 0, 'GHI_CHU');

  // Cột quản lý thiết kế, tỉ lệ, duyệt (bên phải)
  engine.drawText('ĐƠN VỊ THIẾT KẾ: AI AUTOCAD STUDIO', tbX + 1390, tbY + 340, 22, 0, 'GHI_CHU');
  engine.drawText('BẢN VẼ SỐ: KT-C02 | TỈ LỆ: 1:20 & 1:10', tbX + 1390, tbY + 195, 22, 0, 'GHI_CHU');
  engine.drawText('THIẾT KẾ: KỸ SƯ AUTOCAD AI', tbX + 1390, tbY + 55, 22, 0, 'GHI_CHU');

  engine.saved = true;
  return engine.entities.length;
}
