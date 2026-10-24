import type { Task } from './GameModeInteraction';
export const MY_KHE_BAN_THAN_TASKS: Task[] = [
 {type:'pick',prompt:'Em hãy chọn cảnh biển Mỹ Khê nhé!',items:[
  {label:'Bờ cát dài, phẳng, nhiều hoạt động vui chơi',correct:true},
  {label:'Những dãy đá đen có rêu xanh',correct:false},
  {label:'Cảnh núi tuyết quanh năm',correct:false}],hint:'Mỹ Khê có bờ cát dài và phẳng.'},
 {type:'flip',prompt:'Em hãy mở thẻ và tìm nét đặc trưng của Bàn Than!',items:[
  {label:'Ghềnh đá đen với rêu xanh',correct:true},
  {label:'Những cánh đồng lúa',correct:false},
  {label:'Đồi cát giữa sa mạc',correct:false}],hint:'Bàn Than có đá đen với nhiều hình dáng và rêu xanh.'},
 {type:'classify',prompt:'Hãy đưa hoạt động về nơi phù hợp nhé!',groups:['Mỹ Khê','Bàn Than'],items:[
  {label:'Đá bóng trên bờ cát phẳng',group:0},
  {label:'Ngắm những dãy đá đen phủ rêu',group:1},
  {label:'Tạo hình trên cát',group:0}
 ],hint:'Mỹ Khê có bờ cát phẳng; Bàn Than nổi bật với ghềnh đá đen.'},
 {type:'detective',prompt:'Trong tranh, em hãy tìm bạn đang đứng ở chỗ nguy hiểm!',image:'/games/grade3-my-khe-ban-than/safety-scene.svg',
 spots:[{x:22,y:66,label:'Bạn chơi cát trên bờ',correct:false},{x:77,y:59,label:'Bạn đứng sát đá trơn bên sóng',correct:true},{x:48,y:70,label:'Bạn đứng cạnh người lớn',correct:false}],hint:'Không đứng sát mép đá ướt và vùng nước nguy hiểm.'},
 {type:'journey',prompt:'Thấy cờ cảnh báo vùng nước nguy hiểm, em chọn con đường nào?',items:[
  {label:'Dừng lại và làm theo hướng dẫn của người lớn, cứu hộ',correct:true},
  {label:'Tự xuống nước để thử',correct:false},
  {label:'Rủ bạn đi qua vùng cảnh báo',correct:false}
 ],hint:'Gặp cảnh báo nguy hiểm, phải dừng lại và nghe hướng dẫn cứu hộ.'},
];
