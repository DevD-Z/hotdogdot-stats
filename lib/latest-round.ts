export type Session={session:string;startedAt:number;values:number[];updatedAt:number;revision?:number;license?:string};

export function newerLatest(current:Session|null|undefined,incoming:Session|null|undefined){
 if(!incoming||!Array.isArray(incoming.values)||incoming.values.length!==14||
    incoming.values.some(n=>!Number.isSafeInteger(n)||n<0)||
    typeof incoming.session!=='string'||!Number.isSafeInteger(incoming.startedAt)||
    !Number.isSafeInteger(incoming.updatedAt)||
    (incoming.revision!==undefined&&(!Number.isSafeInteger(incoming.revision)||incoming.revision<1)))return current;
 if(!current)return incoming;
 if(current.license!==incoming.license)return incoming.updatedAt>current.updatedAt||
  (incoming.updatedAt===current.updatedAt&&(incoming.startedAt>current.startedAt||
   (incoming.startedAt===current.startedAt&&(incoming.license??'')<(current.license??''))))?incoming:current;
 if(current.session!==incoming.session){
  return incoming.startedAt>current.startedAt||(incoming.startedAt===current.startedAt&&incoming.session>current.session)?incoming:current;
 }
 return (incoming.revision??0)>(current.revision??0)||
  (incoming.revision===undefined&&current.revision===undefined&&incoming.updatedAt>current.updatedAt)?incoming:current;
}
