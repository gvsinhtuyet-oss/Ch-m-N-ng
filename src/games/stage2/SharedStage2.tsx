import React, {useCallback,useEffect,useRef} from 'react';
import type {Station} from '../../types';
import {progressService} from '../../services/ProgressService';
import {backgroundMusic} from '../../services/BackgroundMusic';
import {SharedChallengeGame} from './SharedChallengeGame';
import type {GameConfig} from './types';
export function SharedStage2({station,studentId,isReadOnly,onCompleteStage,config,embedded=false}:{station:Station;studentId:string;isReadOnly:boolean;onCompleteStage:()=>void;config:GameConfig;embedded?:boolean}) {
  const completed=useRef(false);
  useEffect(()=>{completed.current=false;},[station.id]);
  useEffect(()=>{backgroundMusic.setScene(false);return ()=>backgroundMusic.setScene(true);},[]);
  const complete=useCallback(()=>{
    if(completed.current)return;
    if(station.id!==config.stationId)throw new Error('Sai mã trạm');
    completed.current=true;
    const reward=station.rewards.find(r=>r.stage===2);
    if(!isReadOnly)progressService.completeStage2(studentId,station.id,reward?.id);
    onCompleteStage();
  },[station,config.stationId,studentId,isReadOnly,onCompleteStage]);
  return <SharedChallengeGame key={station.id} config={config} onComplete={complete} embedded={embedded}/>;
}
