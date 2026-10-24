export type AssistantPosition = {x:number;y:number};
export const ASSISTANT_LAUNCHER_SIZE = {width:156,height:122};
export function constrainAssistantPosition(position:AssistantPosition,width:number,height:number):AssistantPosition {
  const margin=8;
  return {
    x:Math.max(margin,Math.min(position.x,Math.max(margin,width-ASSISTANT_LAUNCHER_SIZE.width-margin))),
    y:Math.max(margin,Math.min(position.y,Math.max(margin,height-ASSISTANT_LAUNCHER_SIZE.height-margin))),
  };
}
