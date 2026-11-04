#!/usr/bin/env python3
"""Download a pinned Maven distribution into the user's cache; verify SHA-512."""
from pathlib import Path
import hashlib,os,shutil,tarfile,tempfile,urllib.request
VERSION='3.9.11'
base=Path(os.environ.get('LAB_MAVEN_CACHE',Path(os.environ.get('XDG_CACHE_HOME',Path.home()/'.cache'))/'learning-project-builder'))
home=base/f'apache-maven-{VERSION}'
if not (home/'bin/mvn').is_file():
 base.mkdir(parents=True,exist_ok=True)
 url=f'https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/{VERSION}/apache-maven-{VERSION}-bin.tar.gz'
 with tempfile.TemporaryDirectory(prefix='maven-',dir=base) as temp:
  temp=Path(temp);archive=temp/'maven.tar.gz'
  opener=urllib.request.build_opener(urllib.request.ProxyHandler() if os.environ.get('LAB_DOWNLOAD_USE_PROXY')=='1' else urllib.request.ProxyHandler({}))
  with opener.open(url,timeout=30) as response:archive.write_bytes(response.read())
  expected='bcfe4fe305c962ace56ac7b5fc7a08b87d5abd8b7e89027ab251069faebee516b0ded8961445d6d91ec1985dfe30f8153268843c89aa392733d1a3ec956c9978'
  if hashlib.sha512(archive.read_bytes()).hexdigest()!=expected:raise SystemExit('Maven checksum mismatch: bytes='+str(archive.stat().st_size)+' actual='+hashlib.sha512(archive.read_bytes()).hexdigest()+' expected='+expected)
  with tarfile.open(archive) as tf:
   for member in tf.getmembers():
    if member.name.startswith('/') or '..' in Path(member.name).parts:raise SystemExit('Unsafe archive path')
    if member.issym() or member.islnk():
     if member.linkname.startswith('/') or '..' in Path(member.linkname).parts:raise SystemExit('Unsafe archive link')
   tf.extractall(temp)
  if not home.exists():(temp/f'apache-maven-{VERSION}').rename(home)
print(home/'bin/mvn')
