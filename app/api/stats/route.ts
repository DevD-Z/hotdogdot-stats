import {forward} from '../../server';
export async function GET(request:Request){return forward('stats',request);}
