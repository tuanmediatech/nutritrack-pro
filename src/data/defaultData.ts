import { MealOption, ChecklistItem, NutritionRule, AdjustRule, FoodGuideItem, ProfileType } from '../types';

export const PROFILE_DATA: Record<ProfileType, {
  MEAL_SCHEDULE: MealOption[];
  CHECKLIST_ITEMS: ChecklistItem[];
  RULES: NutritionRule[];
  ADJUST_RULES: AdjustRule[];
  GOOD_FOODS: FoodGuideItem[];
  BAD_FOODS: FoodGuideItem[];
  WATER_GUIDE: {
    heavy: { target: number; summary: string; reminder: string };
    light: { target: number; summary: string; reminder: string };
  };
}> = {
  tang_can: {
    MEAL_SCHEDULE: [
      { id: 'pre_morning', time: '04:30', displayTime: '4h30', name: 'Ăn nhẹ trước dạy sáng', icon: '🌅', activity: 'Trước khi dạy Pickleball sáng', goal: 'Có năng lượng nhẹ, không nặng bụng', category: 'morning', options: ['1 quả chuối nhỏ', '1 lát bánh mì nhỏ hoặc ½ ổ nhỏ', '½ củ khoai lang nhỏ', '1 ly nhỏ sữa tươi không đường', '300–500ml nước lọc'] },
      { id: 'pickleball_morning', time: '05:00', displayTime: '5h–6h15', name: 'Dạy Pickleball sáng', icon: '🏸', activity: 'Dạy Pickleball 5h–6h15', goal: 'Duy trì nước và năng lượng cho buổi sáng', category: 'morning', options: ['Nước lọc từng ngụm nhỏ', 'Điện giải loãng nếu trời nóng/mồ hôi nhiều'] },
      { id: 'breakfast', time: '06:15', displayTime: '6h15–6h45', name: 'Ăn sáng chính', icon: '🍜', activity: 'Bữa sáng chính', goal: 'Bù năng lượng sau dạy sáng, nền cho cả ngày', category: 'morning', options: ['Phở/bún bò/bún chả cá/mì quảng có thịt hoặc trứng + sữa', 'Bánh mì thịt hoặc bánh mì trứng + sữa', '1–1.5 chén cơm + cá/thịt/trứng + canh + sữa', 'Bánh mì + 2 trứng luộc + sữa (khi bận)'] },
      { id: 'work_morning', time: '07:00', displayTime: '7h–9h', name: 'Làm việc', icon: '💼', activity: 'Làm việc hành chính 7h–11h30', goal: 'Giữ tỉnh táo, không dùng đường ngọt trong ca làm việc', category: 'morning', options: ['Nước lọc đều đặn', 'Không uống cà phê sữa quá ngọt'] },
      { id: 'snack_morning', time: '09:30', displayTime: '9h30', name: 'Bữa phụ tại cơ quan', icon: '🥛', activity: 'Bữa phụ sáng', goal: 'Tránh tụt năng lượng, hỗ trợ tăng cân', category: 'morning', options: ['Sữa chua không đường + trái cây', 'Sữa tươi không đường + đậu phộng/hạt điều/hạnh nhân', 'Trái cây + 1 quả trứng luộc', 'Bánh mì nhỏ + sữa không đường', 'Bắp luộc hoặc khoai lang'] },
      { id: 'pre_noon', time: '10:45', displayTime: '10h45–11h', name: 'Lót năng lượng trước dạy trưa', icon: '⚡', activity: 'Lót năng lượng trước dạy Pickleball trưa', goal: 'Không để cơ thể rỗng năng lượng trước ca dạy trưa', category: 'noon', options: ['1 quả chuối', '1 khúc bắp luộc', '1 lát bánh mì', '1 hộp sữa tươi không đường', '1 củ khoai nhỏ'] },
      { id: 'pickleball_noon', time: '11:30', displayTime: '11h30–12h30', name: 'Dạy Pickleball trưa', icon: '🏸', activity: 'Dạy Pickleball 11h30–12h30', goal: 'Bù nước và năng lượng trong giờ dạy trưa', category: 'noon', options: ['Nước lọc thường xuyên', 'Điện giải loãng nếu nắng nóng, mồ hôi nhiều'] },
      { id: 'lunch', time: '12:30', displayTime: '12h30–13h', name: 'Ăn trưa chính', icon: '🍚', activity: 'Ăn trưa chính sau ca dạy', goal: '2 chén cơm + đạm + rau + canh để phục hồi', category: 'noon', options: ['2 chén cơm', 'Đạm: Cá kho/hấp, gà, thịt heo nạc, bò, tôm, mực, trứng, đậu phụ', 'Rau luộc, rau xào ít dầu, salad', '1 chén canh (canh rau/cá/thịt/xương)', 'Tráng miệng nhỏ: ổi, đu đủ, thanh long, táo'] },
      { id: 'rest', time: '13:00', displayTime: '13h–13h30', name: 'Nghỉ phục hồi', icon: '😴', activity: 'Nghỉ trưa rồi đi làm ở công ty 13h30–17h', goal: 'Giảm mệt và chuẩn bị cho ca làm việc chiều', category: 'noon', options: ['Chợp mắt 15–20 phút nếu được', 'Rất quan trọng nếu ngủ đêm ít'] },
      { id: 'snack_afternoon', time: '15:30', displayTime: '15h30–16h', name: 'Bữa phụ chiều', icon: '🍌', activity: 'Bữa phụ chiều trong ca làm việc ở công ty', goal: 'Giữ năng lượng khi làm việc từ 13h30–17h', category: 'afternoon', options: ['Sữa tươi không đường + chuối (ưu tiên)', 'Sữa tươi không đường + bắp luộc', 'Sữa chua không đường + trái cây', 'Bánh bao / bánh bèo / bún riêu / bánh bột lọc: 1 phần + thêm 1 trứng hoặc 100g tôm/gà/đậu phụ', 'Vịt gỏi trộn: 1 phần + thêm 1 trứng luộc hoặc 1 hộp đậu phụ + 1 ly sữa'] },
      { id: 'extra_sport', time: '16:30', displayTime: '16h30', name: 'Ăn thêm nếu chơi đến 20h', icon: '🥖', activity: 'Sau ca công ty, trước khi chơi 17h–19h30', goal: 'Tăng năng lượng trước buổi vận động kéo dài', category: 'afternoon', optional: true, options: ['1 lát bánh mì hoặc ½ ổ nhỏ', '1 củ khoai nhỏ', '1 quả trứng luộc', '1 khúc bắp', '1 phần cơm nắm nhỏ'] },
      { id: 'sport_evening', time: '17:00', displayTime: '17h–20h', name: 'Bóng bàn / Social Pickleball', icon: '🏓', activity: 'Chơi bóng bàn / Pickleball 17h–19h30', goal: 'Duy trì nước, điện giải và năng lượng khi chơi', category: 'afternoon', optional: true, options: ['Dưới 60 phút: nước lọc là đủ', '90–180 phút: nước lọc + điện giải loãng', 'Hụt sức: 1 quả chuối hoặc 1 lát bánh mì nhỏ'] },
      { id: 'dinner', time: '20:15', displayTime: '20h15–20h45', name: 'Ăn tối chính', icon: '🌙', activity: 'Ăn tối sau buổi làm việc và thể thao', goal: 'Có chơi 17h–19h30: 2 chén cơm | Không chơi: 1.5 chén', category: 'evening', options: ['Cơm + cá + rau + canh (ưu tiên thường xuyên)', 'Cơm + gà + rau (tốt sau vận động)', 'Cơm + thịt bò + canh (1–2 bữa/tuần)', 'Cơm + đậu phụ + cá (nhẹ bụng)', 'Bún/phở/mì quảng nếu không muốn ăn cơm'] },
      { id: 'work_evening', time: '21:00', displayTime: '21h–22h30', name: 'Làm việc tối', icon: '💻', activity: 'Làm việc tối', goal: 'Không kích thích thần kinh quá mức', category: 'evening', options: ['Nước lọc', 'Tránh cà phê/trà đặc sau chiều'] },
      { id: 'pre_sleep', time: '22:00', displayTime: '22h–22h30', name: 'Trước khi ngủ (nếu đói)', icon: '🌛', activity: 'Bữa phụ trước ngủ', goal: 'Bổ sung nhẹ, không tăng đường nhanh', category: 'evening', options: ['1 ly sữa tươi không đường ấm (dễ ngủ hơn)', 'Sữa tươi không đường + 1 quả trứng luộc', '1 hũ sữa chua không đường', 'Sữa + ½ củ khoai (hôm vận động rất nặng)'] },
      { id: 'sleep', time: '22:30', displayTime: '22h30–23h', name: 'Ngủ', icon: '💤', activity: 'Ngủ phục hồi', goal: 'Cố định giờ ngủ', category: 'evening', options: ['Càng ngủ đều càng dễ tăng cân sạch', 'Mục tiêu: 7–8 tiếng'] }
    ],
    CHECKLIST_ITEMS: [
      { id: 'c1', text: 'Ăn nhẹ trước dạy sáng (4h30)', time: '4h30', icon: '🌅' },
      { id: 'c2', text: 'Ăn sáng có tinh bột + đạm (6h15)', time: '6h15', icon: '🍜' },
      { id: 'c3', text: 'Uống ít nhất 2 bịch sữa/sữa chua trong ngày', time: 'Cả ngày', icon: '🥛' },
      { id: 'c4', text: 'Ăn bữa phụ 9h30', time: '9h30', icon: '🥗' },
      { id: 'c5', text: 'Ăn nhẹ trước dạy trưa (10h45)', time: '10h45', icon: '⚡' },
      { id: 'c6', text: 'Ăn trưa đủ 2 chén cơm + đạm + rau + canh', time: '12h45', icon: '🍚' },
      { id: 'c7', text: 'Nghỉ trưa 15–20 phút', time: '13h20', icon: '😴' },
      { id: 'c8', text: 'Ăn bữa phụ chiều (15h30)', time: '15h30', icon: '🍌' },
      { id: 'c9', text: 'Nếu chơi đến 20h: Ăn thêm lúc 16h30', time: '16h30', icon: '🥖' },
      { id: 'c10', text: 'Ăn tối đủ đạm, không bỏ cơm (20h15)', time: '20h15', icon: '🌙' },
      { id: 'c11', text: 'Uống đủ nước (2–3 lít)', time: 'Cả ngày', icon: '💧' },
      { id: 'c12', text: 'Không dùng sữa đặc / nước ngọt / trà sữa', time: 'Cả ngày', icon: '🚫' }
    ],
    RULES: [
      { icon: '⏰', title: 'Giữ khung giờ cố định', text: 'Ăn đúng các mốc trong ngày để không bị rỗng năng lượng. Cơ thể quen giờ ăn sẽ hấp thu tốt hơn.' },
      { icon: '🔄', title: 'Món ăn xoay vòng', text: 'Không ăn mãi trứng, bánh mì, khoai lang. Dùng nhiều nguồn tinh bột và đạm khác nhau để đủ chất và không ngán.' },
      { icon: '🚫', title: 'Không tăng cân bằng đường ngọt', text: 'Tránh sữa đặc, nước ngọt, trà sữa, bánh ngọt. Đường sẽ tăng glucose và tích mỡ bụng, không tốt.' },
      { icon: '🍚', title: 'Tăng cân bằng thực phẩm thật', text: 'Cơm, bún, phở, mì quảng, cá, thịt, gà, trứng, đậu phụ, sữa không đường — đây là nền tảng.' },
      { icon: '🍽️', title: 'Ưu tiên bữa trưa và tối', text: 'Đây là 2 bữa phục hồi chính sau vận động và làm việc. Không thay bằng trái cây hay sữa.' },
      { icon: '🥗', title: 'Bữa phụ là bắt buộc', text: 'Vì bạn vận động nhiều, không nên để khoảng cách giữa các bữa quá dài. Bữa phụ giúp duy trì năng lượng.' },
      { icon: '🥚', title: 'Ưu tiên protein mỗi bữa', text: 'Nếu ăn bánh bao, bánh bèo, bún riêu, hãy kèm thêm trứng, tôm, gà, đậu phụ hoặc sữa để đạt đủ đạm cho thể thao.' },
      { icon: '💪', title: 'Mục tiêu protein cho vận động', text: 'Mỗi ngày nên ưu tiên khoảng 1.6–2.2 g protein/kg cân nặng, chia đều vào bữa sáng, trưa, chiều và tối.' }
    ],
    ADJUST_RULES: [
      { condition: '⚖️ Cân không tăng', action: 'Thêm ½ chén cơm tối, 1 quả trứng hoặc 1 hộp sữa trong ngày, và giữ protein ở mỗi bữa' },
      { condition: '⚡ Chiều vẫn hụt sức', action: 'Thêm 1 lát bánh mì/khoai/bắp lúc 16h30, hoặc sữa + trứng + bắp/khoai để tăng năng lượng và protein' },
      { condition: '✅ Tăng 0.3–0.7kg/2 tuần', action: 'Giữ nguyên lịch, đang đúng hướng!' },
      { condition: '🤔 Cân tăng nhanh, bụng to', action: 'Giảm ½ chén cơm tối, giữ đạm và rau đầy đủ' }
    ],
    GOOD_FOODS: [
      { icon: '🍚', name: 'Cơm, bún, phở, mì quảng' },
      { icon: '🥖', name: 'Bánh mì, khoai lang, bắp' },
      { icon: '🐟', name: 'Cá, tôm, mực (3–4 bữa/tuần)' },
      { icon: '🍗', name: 'Thịt gà, heo nạc, thịt bò' },
      { icon: '🥚', name: 'Trứng (1–2 quả/ngày)' },
      { icon: '🥛', name: 'Sữa tươi, sữa chua không đường' }
    ],
    BAD_FOODS: [
      { icon: '🍯', name: 'Sữa đặc có đường' },
      { icon: '🥤', name: 'Nước ngọt, nước tăng lực' },
      { icon: '🧋', name: 'Trà sữa, cà phê sữa ngọt' },
      { icon: '🍰', name: 'Bánh ngọt, bánh quy ngọt' }
    ],
    WATER_GUIDE: {
      heavy: { target: 2500, summary: 'Đủ nước: 2500ml/ngày ≈ 13 ly 200ml', reminder: 'Nhắc uống nước mỗi 90 phút, 1 ly 200–300ml mỗi lần' },
      light: { target: 2000, summary: 'Đủ nước: 2000ml/ngày ≈ 10 ly 200ml', reminder: 'Nhắc uống nước mỗi 90 phút, 1 ly 200–300ml mỗi lần' }
    }
  },
  giam_can: {
    MEAL_SCHEDULE: [
      { id: 'pre_morning', time: '04:30', displayTime: '4h30', name: 'Uống nước ấm & Khởi động', icon: '🥛', activity: 'Khởi động ruột & dạ dày sáng', goal: 'Bù nước & kích hoạt chuyển hóa mỡ sáng', category: 'morning', options: ['300ml nước ấm pha 1 lát chanh (không đường)', '300ml nước lọc ấm phòng'] },
      { id: 'pickleball_morning', time: '05:00', displayTime: '5h–6h15', name: 'Dạy Pickleball sáng (Đốt calo)', icon: '🏸', activity: 'Dạy Pickleball 5h–6h15', goal: 'Đốt mỡ tự nhiên khi chưa nạp tinh bột nặng', category: 'morning', options: ['Nước lọc nhấp ngụm nhỏ (300–500ml)', 'Không uống nước ngọt/điện giải có đường'] },
      { id: 'breakfast', time: '06:15', displayTime: '6h15–6h45', name: 'Ăn sáng Low-GI & Đạm nạc', icon: '🥣', activity: 'Bữa sáng giảm mỡ', goal: 'Đạm giữ cơ + tinh bột hấp thu chậm, no lâu', category: 'morning', options: ['2 quả trứng luộc + 1 củ khoai lang nhỏ (100g) + 1 ly sữa tươi KĐ', '1 tô bún riêu/phở gà (1/2 lượng bánh + nhiều rau nạc)', 'Yến mạch 40g pha sữa tươi không đường + 1 quả trứng luộc'] },
      { id: 'work_morning', time: '07:00', displayTime: '7h–9h', name: 'Làm việc công ty', icon: '💼', activity: 'Làm việc 7h–11h30', goal: 'Uống đủ nước, tránh trà sữa / ăn vặt ngọt', category: 'morning', options: ['Nước lọc 500ml', 'Cà phê đen / trà xanh không đường'] },
      { id: 'snack_morning', time: '09:30', displayTime: '9h30', name: 'Bữa phụ sáng nhẹ', icon: '🍏', activity: 'Bữa phụ cắt cơn thèm', goal: 'Giữ đường huyết ổn định, chống tích mỡ', category: 'morning', options: ['1 quả táo xanh nhỏ', '1/2 quả ổi tươi', '1 hũ sữa chua không đường (Greek yogurt)', '5-7 hạt hạnh nhân/hạt điều'] },
      { id: 'pre_noon', time: '10:45', displayTime: '10h45–11h', name: 'Lót đạm nhẹ trước dạy trưa', icon: '⚡', activity: 'Lót dạ trước ca trưa', goal: 'Tránh kiệt sức ca trưa không tăng calo', category: 'noon', options: ['1 hộp sữa tươi không đường (200ml)', '1 quả trứng luộc', '1/2 hũ sữa chua không đường'] },
      { id: 'pickleball_noon', time: '11:30', displayTime: '11h30–12h30', name: 'Dạy Pickleball trưa', icon: '🏸', activity: 'Dạy Pickleball ca trưa', goal: 'Bù nước lọc đều đặn', category: 'noon', options: ['Nước lọc 500ml', 'Điện giải loãng 0 calo'] },
      { id: 'lunch', time: '12:30', displayTime: '12h30–13h', name: 'Ăn trưa kiểm soát Calo', icon: '🥗', activity: 'Ăn trưa chính', goal: 'Tối đa 1–1.5 chén cơm gạo lứt + đạm nạc + nhiều rau', category: 'noon', options: ['1 chén cơm gạo lứt + 150g ức gà áp chảo/hấp + rau luộc + canh', '1 chén cơm lứt + 150g cá kho nạc/hấp + rau luộc + 1 bát canh', 'Salad ức gà/tôm hấp sốt chanh béo nhẹ'] },
      { id: 'rest', time: '13:00', displayTime: '13h–13h30', name: 'Nghỉ trưa phục hồi', icon: '😴', activity: 'Nghỉ trưa 15-20 phút', goal: 'Giảm cortisol, hỗ trợ thâm hụt mỡ', category: 'noon', options: ['Chợp mắt 15–20 phút'] },
      { id: 'snack_afternoon', time: '15:30', displayTime: '15h30–16h', name: 'Bữa phụ chiều đạm nạc', icon: '🥜', activity: 'Bữa phụ chiều công ty', goal: 'Giữ tỉnh táo, hỗ trợ tập chiều', category: 'afternoon', options: ['1 hũ sữa chua không đường', '1 hộp sữa tươi không đường', '1/2 quả ổi tươi + 1 quả trứng luộc'] },
      { id: 'sport_evening', time: '17:00', displayTime: '17h–19h30', name: 'Bóng bàn / Pickleball đốt calo', icon: '🔥', activity: 'Thể thao chiều 17h–19h30', goal: 'Đốt 400–600 kcal mỡ thừa', category: 'afternoon', options: ['Nước lọc 500-700ml', '1/2 quả chuối nếu hụt sức'] },
      { id: 'dinner', time: '19:30', displayTime: '19h30–20h00', name: 'Ăn tối đạm nạc & nhiều rau', icon: '🌙', activity: 'Ăn tối thâm hụt calo', goal: 'Chỉ 1/2 chén cơm lứt hoặc cắt cơm, ăn ức gà/cá + rau luộc', category: 'evening', options: ['1/2 chén cơm gạo lứt + 150g cá hấp + đĩa lớn rau luộc + canh', '150g ức gà xé phay trộn gỏi bắp cải ổi (không cơm)', 'Salad cá ngừ / tôm hấp sốt chanh (không sốt béo)'] },
      { id: 'work_evening', time: '21:00', displayTime: '21h–22h30', name: 'Làm việc tối', icon: '💻', activity: 'Làm việc tối', goal: 'Không ăn vặt đêm', category: 'evening', options: ['Nước lọc ấm', 'Trà hoa cúc / trà 0 calo'] },
      { id: 'sleep', time: '22:30', displayTime: '22h30–23h', name: 'Ngủ sớm đốt mỡ', icon: '💤', activity: 'Ngủ phục hồi', goal: 'Ngủ trước 23h giúp tiết GH đốt mỡ', category: 'evening', options: ['Mục tiêu: 7-8 tiếng'] }
    ],
    CHECKLIST_ITEMS: [
      { id: 'c1', text: 'Uống 300ml nước ấm ngay khi thức dậy', time: '4h30', icon: '🥛' },
      { id: 'c2', text: 'Ăn sáng đạm nạc + tinh bột hấp thu chậm', time: '6h15', icon: '🥣' },
      { id: 'c3', text: 'Ăn phụ sáng nhẹ (táo xanh / ổi / sữa chua KĐ)', time: '9h30', icon: '🍏' },
      { id: 'c4', text: 'Ăn trưa tối đa 1–1.5 chén cơm lứt', time: '12h30', icon: '🥗' },
      { id: 'c5', text: 'Nghỉ trưa 15-20 phút', time: '13h00', icon: '😴' },
      { id: 'c6', text: 'Bữa phụ chiều 15h30 nhẹ đạm', time: '15h30', icon: '🥜' },
      { id: 'c7', text: 'Chơi thể thao / Pickleball chiều đốt calo', time: '17h00', icon: '🔥' },
      { id: 'c8', text: 'Ăn tối tối đa 1/2 chén cơm lứt + đạm nạc', time: '19h30', icon: '🌙' },
      { id: 'c9', text: 'Không uống nước ngọt / trà sữa / ăn vặt đêm', time: 'Cả ngày', icon: '🚫' },
      { id: 'c10', text: 'Uống đủ 2 - 2.5L nước lọc', time: 'Cả ngày', icon: '💧' }
    ],
    RULES: [
      { icon: '🔥', title: 'Thâm hụt calo lành mạnh', text: 'Giữ năng lượng nạp vào ít hơn năng lượng tiêu hao khoảng 300–500 kcal mỗi ngày.' },
      { icon: '🌾', title: 'Ưu tiên tinh bột chậm', text: 'Thay cơm trắng bằng cơm gạo lứt, khoai lang, yến mạch để no lâu hơn.' },
      { icon: '🍗', title: 'Giữ đạm cao để giữ cơ', text: 'Đảm bảo 1.5–1.8g protein/kg cân nặng từ ức gà, cá, tôm, lòng trắng trứng.' },
      { icon: '🥦', title: 'Tăng gấp đôi rau xanh', text: 'Bổ sung rau luộc, salad trước bữa ăn để lấp đầy dạ dày mà ít calo.' }
    ],
    ADJUST_RULES: [
      { condition: '⚖️ Cân chưa giảm sau 2 tuần', action: 'Giảm 1/3 chén cơm trưa và tối, tăng thêm 15 phút Cardio' },
      { condition: '⚡ Hay đói hoa mắt buổi chiều', action: 'Thêm 1 quả trứng luộc hoặc 1 hũ sữa chua KĐ lúc 15h30' },
      { condition: '✅ Giảm 0.5–1kg/ tuần', action: 'Tốc độ hoàn hảo, tiếp tục duy trì!' }
    ],
    GOOD_FOODS: [
      { icon: '🌾', name: 'Cơm gạo lứt, khoai lang, yến mạch' },
      { icon: '🍗', name: 'Ức gà, lòng trắng trứng, cá nạc, tôm' },
      { icon: '🥦', name: 'Bông cải xanh, rau cải, dưa chuột' },
      { icon: '🍏', name: 'Táo xanh, ổi, đu đủ, dâu tây' }
    ],
    BAD_FOODS: [
      { icon: '🥤', name: 'Nước ngọt, trà sữa, nước ép ngọt' },
      { icon: '🍟', name: 'Đồ chiên rán nhiều dầu mỡ' },
      { icon: '🍰', name: 'Bánh ngọt, chè, kem' }
    ],
    WATER_GUIDE: {
      heavy: { target: 2500, summary: 'Đủ nước: 2500ml/ngày', reminder: 'Nhắc uống nước mỗi 90 phút' },
      light: { target: 2000, summary: 'Đủ nước: 2000ml/ngày', reminder: 'Nhắc uống nước mỗi 90 phút' }
    }
  }
};

export const CALORIE_KEYWORDS = [
  { key: 'sữa chua', kcal: 100 }, { key: 'đậu phụ', kcal: 90 }, { key: 'bánh mì', kcal: 180 },
  { key: 'đu đủ', kcal: 70 }, { key: 'thanh long', kcal: 60 }, { key: 'khoai', kcal: 130 },
  { key: 'miến', kcal: 220 }, { key: 'chuối', kcal: 90 }, { key: 'canh', kcal: 35 },
  { key: 'phở', kcal: 320 }, { key: 'bún', kcal: 250 }, { key: 'nui', kcal: 260 },
  { key: 'mì', kcal: 300 }, { key: 'cơm', kcal: 180 }, { key: 'cá', kcal: 150 },
  { key: 'gà', kcal: 180 }, { key: 'thịt', kcal: 200 }, { key: 'trứng', kcal: 70 },
  { key: 'sữa', kcal: 120 }, { key: 'bắp', kcal: 120 }, { key: 'rau', kcal: 40 },
  { key: 'ổi', kcal: 65 }, { key: 'táo', kcal: 55 }, { key: 'tôm', kcal: 100 },
  { key: 'bò', kcal: 200 }, { key: 'heo', kcal: 190 }
];

export const PROTEIN_KEYWORDS = [
  { key: 'sữa chua', protein: 5 }, { key: 'đậu phụ', protein: 8 }, { key: 'trứng', protein: 6 },
  { key: 'sữa', protein: 8 }, { key: 'cá', protein: 22 }, { key: 'tôm', protein: 18 },
  { key: 'gà', protein: 25 }, { key: 'thịt', protein: 20 }, { key: 'bò', protein: 22 },
  { key: 'heo', protein: 19 }, { key: 'mực', protein: 16 }, { key: 'đậu phộng', protein: 7 },
  { key: 'hạnh nhân', protein: 5 }, { key: 'hạt điều', protein: 5 }
];
