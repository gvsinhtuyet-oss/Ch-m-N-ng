export type AssistantPosition = {x:number;y:number};
export const ASSISTANT_LAUNCHER_SIZE = {width:156,height:122};
export function constrainAssistantPosition(position:AssistantPosition,width:number,height:number):AssistantPosition {
  const margin=8;
  return {
    x:Math.max(margin,Math.min(position.x,Math.max(margin,width-ASSISTANT_LAUNCHER_SIZE.width-margin))),
    y:Math.max(margin,Math.min(position.y,Math.max(margin,height-ASSISTANT_LAUNCHER_SIZE.height-margin))),
  };
}

// Keep the compact game launcher above the mobile victory action row.
export function compactAssistantPosition(width:number,height:number,stage?:number):AssistantPosition {
  return width < 1024
    ? stage===2 ? {x:8,y:Math.max(8,height-144)} : {x:64,y:10}
    : {x:Math.max(4,(width-48)/2),y:Math.max(4,height-56)};
}
