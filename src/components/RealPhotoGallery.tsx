import {realPointGallery} from '../data/realPhotos';
// Additional verified views for compound steps; primary image remains unchanged.
export function RealPhotoGallery({stationId,index}:{stationId:string;index:number}){
 const photos=realPointGallery(stationId,index).slice(1);
 if(!photos.length)return null;
 return <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2" aria-label="Ảnh khám phá thêm">{photos.map(photo=><img key={photo.id} src={photo.src} alt={photo.subject} loading="lazy" decoding="async" className="max-h-72 w-full rounded-xl bg-slate-100 object-contain"/>)}</div>;
}
