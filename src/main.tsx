import {createRoot} from 'react-dom/client';
import React, {lazy, Suspense} from 'react';
import App from './App.tsx';
const Stage2Preview=lazy(()=>import('./games/stage2/Preview'));
const isStage2Preview=new URLSearchParams(window.location.search).has('stage2-preview');
import './index.css';

createRoot(document.getElementById('root')!).render(isStage2Preview?<Suspense fallback={<p>Đang mở thử thách…</p>}><Stage2Preview/></Suspense>:<App />);
