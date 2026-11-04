import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const children=[spawn('./mvnw',['spring-boot:run'],{cwd:path.join(root,'server'),stdio:'inherit'}),spawn(process.platform==='win32'?'npm.cmd':'npm',['run','dev'],{cwd:path.join(root,'client'),stdio:'inherit'})];
let stopping=false;
function stop(code=0){if(stopping)return;stopping=true;for(const child of children)child.kill('SIGTERM');setTimeout(()=>process.exit(code),1500).unref();}
for(const child of children){child.on('error',e=>{console.error(e.message);stop(1)});child.on('exit',code=>{if(!stopping)stop(code??1)});}
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
