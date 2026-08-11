export interface MedicalReference {
  title: string;
  url: string;
}

export interface ConsultResult {
  symptomName: string;
  assessment: string;
  recommendations: string;
  warnings: string;
  references: MedicalReference[];
}

interface MedicalEntry {
  keywords: string[];
  symptomName: string;
  assessment: string;
  recommendations: string;
  warnings: string;
  references: MedicalReference[];
}

const MEDICAL_KNOWLEDGE: MedicalEntry[] = [
  {
    keywords: ['mỏi cơ', 'đau cơ', 'mỏi người', 'căng cơ', 'co rút'],
    symptomName: 'Mỏi cơ, căng cơ sau khi tập luyện / làm việc',
    assessment: 'Đây là tình trạng mỏi cơ khởi phát muộn (DOMS) hoặc tích tụ axit lactic trong cơ bắp, rất phổ biến khi tập luyện bóng bàn, Pickleball hoặc vận động cường độ cao.',
    recommendations: '1. Nghỉ ngơi tích cực, giãn cơ nhẹ nhàng sau tập.\n2. Bổ sung Kali và Magie (chuối, các loại hạt).\n3. Nạp đủ đạm từ thịt gà, cá, trứng.\n4. Uống nước điện giải loãng.',
    warnings: 'Nếu cơ sưng đau dữ dội > 7 ngày hoặc nước tiểu màu sẫm, hãy đi khám bác sĩ ngay.',
    references: [
      { title: 'Vinmec - Đau mỏi cơ sau tập thể dục', url: 'https://www.vinmec.com/vi/tin-tuc/suc-khoe-tong-quat/dau-moi-co-sau-tap-the-duc-nguyen-nhan-va-cach-xu-tri/' },
      { title: 'Tâm Anh - Giảm đau cơ sau khi tập gym', url: 'https://tamanhhospital.vn/cach-giam-dau-co-sau-khi-tap-gym/' }
    ]
  },
  {
    keywords: ['đau đầu', 'chóng mặt', 'nhức đầu', 'hoa mắt', 'xây xẩm'],
    symptomName: 'Đau đầu, chóng mặt hoặc hoa mắt',
    assessment: 'Có thể do mất nước khi chơi thể thao, thiếu năng lượng (tụt đường huyết), căng thẳng kéo dài, hoặc thiếu ngủ.',
    recommendations: '1. Uống ngay nước ấm hoặc điện giải loãng.\n2. Ăn nhẹ 1 quả chuối hoặc bánh mì.\n3. Nghỉ ngơi nơi thoáng mát, tránh ánh sáng mạnh.\n4. Ngủ đủ 7-8 tiếng.',
    warnings: 'Nếu đau đầu kèm sốt cao, nôn mửa, yếu nửa người — đến cơ sở y tế khẩn cấp.',
    references: [
      { title: 'Vinmec - Chóng mặt, hoa mắt là bệnh gì?', url: 'https://www.vinmec.com/vi/tin-tuc/suc-khoe-tong-quat/chong-mat-hoa-mat-la-benh-gi-va-dieu-tri-ra-sao/' },
      { title: 'Medlatec - Đau đầu chóng mặt', url: 'https://medlatec.vn/tin-tuc/dau-dau-chong-mat-nguyen-nhan-va-cach-khac-phuc-hieu-qua-s58-n18460' }
    ]
  },
  {
    keywords: ['đau dạ dày', 'bao tử', 'đau bụng', 'ợ chua', 'ợ hơi', 'trào ngược', 'đầy bụng', 'khó tiêu'],
    symptomName: 'Đau dạ dày, trào ngược dạ dày thực quản',
    assessment: 'Viêm loét dạ dày tá tràng hoặc trào ngược thực quản do ăn uống thất thường, stress hoặc đồ chua cay.',
    recommendations: '1. Ăn đúng giờ, không để đói hoặc no quá.\n2. Tránh ăn tối sau 20h.\n3. Hạn chế đồ cay, rượu bia, cà phê.\n4. Uống nước ấm pha mật ong nghệ buổi sáng.',
    warnings: 'Đi khám ngay nếu nôn ra máu, đi ngoài phân đen, sụt cân nhanh hoặc đau dữ dội vùng thượng vị.',
    references: [
      { title: 'Vinmec - Viêm loét dạ dày tá tràng', url: 'https://www.vinmec.com/vi/tin-tuc/suc-khoe-tong-quat/viem-loet-da-day-ta-trang-nguyen-nhan-trieu-chung-va-dieu-tri/' },
      { title: 'Tâm Anh - Trào ngược dạ dày thực quản GERD', url: 'https://tamanhhospital.vn/trao-nguoc-da-day-thuc-quan-gerd/' }
    ]
  },
  {
    keywords: ['đau khớp', 'khớp gối', 'đau đầu gối', 'đau vai', 'đau lưng', 'mỏi cổ', 'mỏi vai gáy'],
    symptomName: 'Đau khớp, mỏi khớp gối / lưng / vai / cổ gáy',
    assessment: 'Có thể do sai tư thế khi tập, vận động quá tải, hoặc thoái hóa khớp nhẹ.',
    recommendations: '1. Giảm cường độ tập, tránh bật nhảy.\n2. Chườm lạnh nếu sưng đỏ, chườm ấm nếu cứng mỏi.\n3. Bổ sung Omega-3 (cá hồi, hạt chia), glucosamine.\n4. Giãn cơ lưng và đùi nhẹ nhàng.',
    warnings: 'Đi khám nếu khớp sưng nóng đỏ dữ dội, đi lại khó, hoặc đau kèm sốt.',
    references: [
      { title: 'Vinmec - Đau khớp gối khi chơi thể thao', url: 'https://www.vinmec.com/vi/tin-tuc/suc-khoe-tong-quat/dau-khop-goi-khi-choi-the-thao-nguyen-nhan-va-cach-khac-phuc/' },
      { title: 'Tâm Anh - Đau khớp gối ở người trẻ', url: 'https://tamanhhospital.vn/dau-khop-goi-o-nguoi-tre/' }
    ]
  },
  {
    keywords: ['mất ngủ', 'khó ngủ', 'ngủ chập chờn', 'trằn trọc'],
    symptomName: 'Mất ngủ, khó ngủ hoặc giấc ngủ không sâu',
    assessment: 'Thường do căng thẳng thần kinh, dùng điện thoại trước khi ngủ, uống cà phê chiều tối.',
    recommendations: '1. Ngủ đúng giờ, bỏ điện thoại 1 tiếng trước khi ngủ.\n2. Không dùng cafein sau 14h.\n3. Phòng ngủ tối, mát, yên tĩnh.\n4. Ngâm chân nước ấm hoặc trà hoa cúc.',
    warnings: 'Mất ngủ kéo dài > 1 tháng — đi khám chuyên khoa thần kinh.',
    references: [
      { title: 'Vinmec - Mất ngủ kéo dài', url: 'https://www.vinmec.com/vi/tin-tuc/suc-khoe-tong-quat/mat-ngu-keo-dai-nguyen-nhan-va-cach-dieu-tri-hieu-qua/' },
      { title: 'HelloBacsi - Khó ngủ, mất ngủ', url: 'https://hellobacsi.com/giac-ngu/mat-ngu/' }
    ]
  },
  {
    keywords: ['đau ngực', 'khó thở', 'hụt hơi', 'tức ngực', 'hồi hộp', 'tim đập nhanh'],
    symptomName: 'Đau tức ngực, khó thở hoặc hụt hơi',
    assessment: 'Có thể do thể lực chưa thích nghi, hoặc dấu hiệu tiềm ẩn tim mạch / hô hấp.',
    recommendations: '1. Nghỉ ngơi ngay, tựa lưng thoải mái.\n2. Hít thở sâu, chậm rãi.\n3. Tránh tập ở nơi oi bức, thiếu dưỡng khí.\n4. Uống đủ nước.',
    warnings: 'RẤT NGUY HIỂM: Đau ngực lan vai trái + vã mồ hôi lạnh → Gọi cấp cứu ngay!',
    references: [
      { title: 'Tâm Anh - Đau ngực trái là dấu hiệu của bệnh gì?', url: 'https://tamanhhospital.vn/dau-nguc-trai/' },
      { title: 'Vinmec - Khó thở tức ngực', url: 'https://www.vinmec.com/vi/tin-tuc/suc-khoe-tong-quat/kho-tho-tuc-nguc-nguyen-nhan-trieu-chung-va-xu-tri/' }
    ]
  }
];

export function consultSymptoms(symptomsText: string): ConsultResult {
  const query = (symptomsText || '').toLowerCase().trim();
  if (!query) {
    return {
      symptomName: 'Chưa xác định',
      assessment: 'Vui lòng nhập triệu chứng cụ thể để hệ thống tra cứu.',
      recommendations: 'Nhập các triệu chứng như: đau dạ dày, mỏi cơ, chóng mặt, đau khớp...',
      warnings: '',
      references: []
    };
  }

  const matched = MEDICAL_KNOWLEDGE.find(k =>
    k.keywords.some(kw => query.includes(kw))
  );

  if (matched) return { symptomName: matched.symptomName, assessment: matched.assessment, recommendations: matched.recommendations, warnings: matched.warnings, references: matched.references };

  const encQuery = encodeURIComponent(symptomsText);
  return {
    symptomName: `Triệu chứng: ${symptomsText}`,
    assessment: `Hệ thống chưa tìm thấy chẩn đoán khớp chính xác trong cơ sở dữ liệu nội bộ. Vui lòng tra cứu qua các liên kết bên dưới.`,
    recommendations: `1. Nghỉ ngơi và theo dõi sát sao.\n2. Tránh làm việc nặng khi mệt mỏi.\n3. Uống nước ấm và giữ ấm cơ thể.`,
    warnings: `Nếu có dấu hiệu nghiêm trọng: đau ngực kéo dài, sốt cao, khó thở nặng — đến cơ sở y tế ngay.`,
    references: [
      { title: `Tra cứu tại Bệnh viện Vinmec`, url: `https://www.google.com/search?q=site:vinmec.com+${encQuery}` },
      { title: `Tra cứu tại Bệnh viện Tâm Anh`, url: `https://tamanhhospital.vn/?s=${encQuery}` },
      { title: `Tra cứu tại HelloBacsi`, url: `https://hellobacsi.com/?s=${encQuery}` },
      { title: `Cổng thông tin Bộ Y tế`, url: `https://www.google.com/search?q=site:moh.gov.vn+${encQuery}` }
    ]
  };
}
