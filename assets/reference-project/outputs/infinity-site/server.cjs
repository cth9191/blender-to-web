const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=__dirname,port=Number(process.env.PORT||4175);
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.json':'application/json','.mp4':'video/mp4','.ttf':'font/ttf'};
http.createServer((req,res)=>{let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400).end();return}
const target=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return}
fs.stat(target,(err,stat)=>{
 if(err||!stat.isFile()){res.writeHead(404).end('Not found');return}
 const immutable=/\/assets\/quality\/v[0-9]+\//.test(pathname);
 const headers={'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':immutable?'public, max-age=31536000, immutable':'no-store','Accept-Ranges':'bytes'};
 let start=0,end=stat.size-1,status=200;
 if(req.headers.range){
  const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
  if(!match||(!match[1]&&!match[2])){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`}).end();return}
  if(match[1]){start=Number(match[1]);if(match[2])end=Math.min(Number(match[2]),end)}
  else{start=Math.max(0,stat.size-Number(match[2]))}
  if(start>end||start>=stat.size){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`}).end();return}
  status=206;headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;
 }
 headers['Content-Length']=Math.max(0,end-start+1);res.writeHead(status,headers);
 if(req.method==='HEAD'){res.end();return}
 const stream=fs.createReadStream(target,{start,end});stream.on('error',()=>res.destroy());stream.pipe(res);
});
}).listen(port,'127.0.0.1',()=>console.log('APERTURE: http://127.0.0.1:'+port));

