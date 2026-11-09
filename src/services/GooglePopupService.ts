import {initializeApp} from 'firebase/app';
import {initializeAuth,inMemoryPersistence,GoogleAuthProvider,signInWithPopup,signOut,browserPopupRedirectResolver} from 'firebase/auth';
import config from '../../firebase-applet-config.json';

// Firebase only brokers Google's popup. App authorization continues to use the
// existing backend's Google JWT/nonce validation and HttpOnly session cookie.
// Never retain a Firebase refresh token or use this identity to read app data.
let popupAuth:ReturnType<typeof initializeAuth>|undefined;
export function googlePopup(nonce:string){
 if(!/^[a-f0-9]{48}$/.test(nonce))throw Error('Phiên đăng nhập chưa hợp lệ. Hãy thử lại.');
 popupAuth ||= initializeAuth(initializeApp({apiKey:config.apiKey,authDomain:config.authDomain,projectId:config.projectId,appId:config.appId},'teacher-google-popup'),{persistence:inMemoryPersistence,popupRedirectResolver:browserPopupRedirectResolver});
 const auth=popupAuth;
 auth.languageCode='vi';
 const provider=new GoogleAuthProvider();
 provider.setCustomParameters({prompt:'select_account',nonce});
 // Start synchronously inside the user's click so mobile browsers allow it.
 return signInWithPopup(auth,provider).then(result=>{
  const token=GoogleAuthProvider.credentialFromResult(result)?.idToken;
  if(!token)throw Error('Google chưa trả về thông tin xác thực. Hãy thử lại.');
  return token;
 }).finally(()=>signOut(auth));
}
