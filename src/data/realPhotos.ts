import manifest from '../../content-review/real-photos-2026-10-24.json';
// Publisher metadata is retained for management; student screens show only the photo.
export const REAL_PHOTOS = manifest;
export const realPhoto = (id:string) => {
 const photo=REAL_PHOTOS.find(p=>p.id===id);
 if(!photo)throw new Error('Missing reviewed photograph: '+id);
 return {...photo,caption:photo.subject,credit:`${photo.subject} · ${photo.author} · ${photo.sourceUrl}`};
};
export const REAL_POINT_PHOTOS:Record<string,string[][]>={
 'g3-station-4':[['nam-o-lang'],['nam-o-ca'],['nam-o-muoi','nam-o-dao','nam-o-loc'],['nam-o-chai']],
 'g4-station-2':[['my-son'],['my-son']],
 'g5-station-4':[[],['ma-nhai-1'],['ma-nhai-2'],['non-nuoc-3'],['non-nuoc-1','non-nuoc-2'],['ma-nhai-1']],
 'g5-station-5':[[],['sam-vuon']],
 'g3-station-5':[['thung-dan-than'],['thung-nan','thung-dan-than'],['thung-dan','thung-dau','thung-phoi'],['thung-thanh-pham']],
 'g4-station-4':[['phuoc-kieu-san-pham'],['phuoc-kieu-khuon'],['phuoc-kieu-nau','phuoc-kieu-rot','phuoc-kieu-mai'],['phuoc-kieu-san-pham'],['phuoc-kieu-san-pham']],
 'g5-ky-anh-me-nhu':[['ky-anh-loi-vao'],['ky-anh-duong-ham'],['ky-anh-dinh'],['me-nhu-tuong'],['me-nhu-luu-niem','me-nhu-tuong'],['ky-anh-tham-quan']],
 'g5-lua-ma-chau':[['ma-chau-xuong'],['ma-chau-tam','ma-chau-to'],['ma-chau-ken','ma-chau-uom'],['ma-chau-det','ma-chau-lang'],['ma-chau-san-pham']],
};
export const REAL_COVER_PHOTOS:Record<string,string>={
 'g3-station-4':'nam-o-lang','g4-station-2':'my-son',
 'g3-station-5':'thung-dan-than','g4-station-4':'phuoc-kieu-san-pham',
 'g5-ky-anh-me-nhu':'me-nhu-tuong','g5-lua-ma-chau':'ma-chau-xuong'
};
export const realPointPhoto=(stationId:string,index:number)=>{
 const id=REAL_POINT_PHOTOS[stationId]?.[index]?.[0];return id?realPhoto(id):undefined;
};
export const realCoverPhoto=(stationId:string)=>REAL_COVER_PHOTOS[stationId]?realPhoto(REAL_COVER_PHOTOS[stationId]):undefined;
export const realPointGallery=(stationId:string,index:number)=>(REAL_POINT_PHOTOS[stationId]?.[index]||[]).map(realPhoto);
