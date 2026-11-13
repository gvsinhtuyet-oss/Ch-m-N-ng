import {proxyApi} from '../[[path]].js';
import {ensureNamedReports} from '../effectiveness.js';
import {FEEDBACK_STATIONS} from '../../../learning-feedback-catalog.mjs';
export async function namedStationRatings(request,env,proxy=proxyApi){
 if(request.method!=='GET')return new Response(null,{status:405});
 const auth=await proxy(new Request(new URL('/api/auth/session',request.url),{headers:{Cookie:request.headers.get('Cookie')||''}}));
 if(!auth.ok)return Response.json({error:'Chưa xác minh được quyền quản trị.'},{status:503});
 const {user}=await auth.json();if(!user)return Response.json({error:'Vui lòng đăng nhập.'},{status:401});if(user.role!=='admin')return Response.json({error:'Chỉ quản trị được xem.'},{status:403});
 const legacy=await proxy(request);let data=legacy.ok?await legacy.json():null;
 if(!env.EFFECTIVENESS_DB||env.EFFECTIVENESS_ENABLED!=='true')return legacy.ok?Response.json(data):legacy;
 try{
  const db=env.EFFECTIVENESS_DB;await ensureNamedReports(db);
  const result=await db.prepare('SELECT station_id AS stationId,stars,COUNT(*) AS total FROM report_named_ratings GROUP BY station_id,stars').all();
  const ratings=data?.ratings||Object.fromEntries(FEEDBACK_STATIONS.map(s=>[s.id,[0,0,0,0,0]]));
  for(const row of result.results||[])if(ratings[row.stationId]&&row.stars>=1&&row.stars<=5)ratings[row.stationId][row.stars-1]+=row.total;
  return Response.json({ratings,warning:legacy.ok?'':'Chỉ hiển thị đánh giá khách từ kho báo cáo; chưa tải được đánh giá cũ từ máy chủ.'},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Chưa tải đủ các nguồn đánh giá. Vui lòng thử lại.'},{status:503});}
}

export const onRequest=({request,env})=>namedStationRatings(request,env);
