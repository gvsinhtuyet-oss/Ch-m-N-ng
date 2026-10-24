import followup from '../../content-review/real-photos-followup-2026-10-25.json';
import manifest from '../../content-review/real-photos-2026-10-24.json';
// Publisher metadata is retained for management; student screens show only the photo.
export const REAL_PHOTOS = [...manifest,...followup];
export const realPhoto = (id:string) => {
 const photo=REAL_PHOTOS.find(p=>p.id===id);
 if(!photo)throw new Error('Missing reviewed photograph: '+id);
 return {...photo,caption:photo.subject,credit:`${photo.subject} · ${photo.author} · ${photo.sourceUrl}`};
};
export const REAL_POINT_PHOTOS:Record<string,string[][]>={
 'g1-station-1':[[],['school-kim-dong'],[],['hoc-sinh-cham-cay']],
 'g1-station-2':[['bit-mat-bat-de'],['bit-mat-bat-de'],['bit-mat-bat-de'],['bit-mat-bat-de']],
 'g1-station-3':[['suoi-tien-official-1'],['suoi-tien-official-1'],['suoi-tien-official-2'],['suoi-tien-official-2']],
 'g1-station-5':[[],['existing-mi-quang'],[],['existing-mi-quang']],
 'g3-station-1':[[],[],['my-khe-31'],['my-khe-31']],
 'g3-station-2':[['hoang-dieu-nha'],[],[],['hoang-dieu-lang']],
 'g3-station-3':[[],[],['co-cay-neu']],
 'g4-station-1':[['danang-map-2025'],[],['existing-thu-bon-2018'],['existing-g2s2-son-tra'],['phuoc-kieu-khuon']],
 'g4-station-3':[['ma-chau-xuong'],['existing-hoi-an-pho-co'],['tra-que-rau'],['tien-sa-9']],
 'g4-thu-bon-hon-kem':[[],[],[],['existing-hon-kem'],['existing-thu-bon-2018']],
 'g5-station-3':[[],[],['bana-nature-19'],[],[],['hai-van-tu-bo']],
 'g3-station-4':[['nam-o-lang'],['nam-o-ca'],['nam-o-muoi','nam-o-dao','nam-o-loc'],['nam-o-chai']],
 'g4-station-2':[['my-son'],['my-son'],['cham-gajasimha'],[],['cham-ganesha'],['existing-cham']],
 'g5-station-4':[[],['ma-nhai-1'],['ma-nhai-2'],['non-nuoc-3'],['non-nuoc-1','non-nuoc-2'],['ma-nhai-1']],
 'g5-station-5':[[],['sam-vuon'],['sam-nghien-cuu'],['existing-sam'],['sam-uom'],['sam-le-hoi']],
 'g3-station-5':[['thung-dan-than'],['thung-nan','thung-dan-than'],['thung-dan','thung-dau','thung-phoi'],['thung-thanh-pham']],
 'g4-station-4':[['phuoc-kieu-san-pham'],['phuoc-kieu-khuon'],['phuoc-kieu-nau','phuoc-kieu-rot','phuoc-kieu-mai'],['phuoc-kieu-san-pham'],['phuoc-kieu-san-pham']],
 'g5-ky-anh-me-nhu':[['ky-anh-loi-vao'],['ky-anh-duong-ham'],['ky-anh-dinh'],['me-nhu-tuong'],['me-nhu-luu-niem','me-nhu-tuong'],['ky-anh-tham-quan']],
 'g5-lua-ma-chau':[['ma-chau-xuong'],['ma-chau-tam','ma-chau-to'],['ma-chau-ken','ma-chau-uom'],['ma-chau-det','ma-chau-lang'],['ma-chau-san-pham']],
};
export const REAL_COVER_PHOTOS:Record<string,string>={
 'g1-station-2':'bit-mat-bat-de','g1-station-3':'suoi-tien-official-1',
 'g4-station-1':'existing-my-khe','g4-station-3':'ma-chau-xuong','g4-thu-bon-hon-kem':'existing-hon-kem',
 'g3-station-4':'nam-o-lang','g4-station-2':'my-son',
 'g3-station-5':'thung-dan-than','g4-station-4':'phuoc-kieu-san-pham',
 'g5-ky-anh-me-nhu':'me-nhu-tuong','g5-lua-ma-chau':'ma-chau-xuong'
};
export const realPointPhoto=(stationId:string,index:number)=>{
 const id=REAL_POINT_PHOTOS[stationId]?.[index]?.[0];return id?realPhoto(id):undefined;
};
export const realCoverPhoto=(stationId:string)=>REAL_COVER_PHOTOS[stationId]?realPhoto(REAL_COVER_PHOTOS[stationId]):undefined;
export const realPointGallery=(stationId:string,index:number)=>(REAL_POINT_PHOTOS[stationId]?.[index]||[]).map(realPhoto);
