package dev.learning.lab;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import static dev.learning.lab.Domain.*;
@Service
public class LabService {
 final CacheStore store;final ObjectMapper json;final ProductRepository products;final String prefix;final boolean enabled;final Semaphore runSlot=new Semaphore(1);
 public LabService(CacheStore s,ObjectMapper j,ProductRepository p,@Value("${app.cache-prefix}")String prefix,@Value("${app.labs-enabled}")boolean enabled){store=s;json=j;products=p;this.prefix=prefix;this.enabled=enabled;}
 public Map<String,Object> run(LabInput input)throws Exception{
  if(!enabled)throw new ApiException(404,"LAB_DISABLED","实验接口已关闭");
  if(!runSlot.tryAcquire())throw new ApiException(429,"LAB_BUSY","另一个实验正在运行，请稍后重试");
  String ns=prefix+":lab:"+UUID.randomUUID()+":";Set<String>keys=new HashSet<>();ExecutorService pool=Executors.newFixedThreadPool(8);
  try{
   boolean guarded=input.mode().equals("guarded");boolean outage=input.scenario().equals("outage");
   List<Product> sample=products.list(0,24,"").items();if(sample.isEmpty())throw new ApiException(409,"LAB_NEEDS_DATA","请先创建至少一个商品");
   CacheStore cache=outage?new CacheStore(){public String get(String k){throw new IllegalStateException("Injected cache fault");}public void put(String k,String v,long t){throw new IllegalStateException();}public void delete(String k){}public long ttl(String k){return -2;}public String kind(){return "injected-outage";}}:store;
   CacheReader reader=new CacheReader(cache,json);CacheReader.Stats stats=new CacheReader.Stats();CacheReader.Policy policy=guarded?CacheReader.Policy.guarded():CacheReader.Policy.naive();
   List<Long>ids=new ArrayList<>();List<Long>ttls=new ArrayList<>();
   for(int i=0;i<input.requests();i++)ids.add(input.scenario().equals("penetration")?Long.MAX_VALUE:input.scenario().equals("avalanche")?sample.get(i%sample.size()).id():sample.get(0).id());
   for(long id:ids)keys.add(ns+id);
   if(input.scenario().equals("avalanche")){
    int index=0;for(String key:new TreeSet<>(keys)){long id=Long.parseLong(key.substring(ns.length()));Product p=products.find(id).orElseThrow();long ttl=400+(guarded?(index++*97)%1200:0);store.put(key,json.writeValueAsString(p),ttl);ttls.add(ttl);}Thread.sleep(450);
   }else if(input.scenario().equals("breakdown")){
    store.put(ns+sample.get(0).id(),json.writeValueAsString(sample.get(0)),50);Thread.sleep(80);
   }
   AtomicInteger failures=new AtomicInteger(),missing=new AtomicInteger();long start=System.nanoTime();
   List<Callable<Void>>calls=new ArrayList<>();for(long id:ids)calls.add(()->{try{var value=reader.read(ns+id,()->products.find(id),policy,stats,35);if(value.isEmpty())missing.incrementAndGet();}catch(ApiException e){failures.incrementAndGet();}return null;});
   if(input.scenario().equals("penetration")){for(var call:calls)call.call();}else{for(Future<Void> f:pool.invokeAll(calls))f.get();}
   Map<String,Object>out=new LinkedHashMap<>();out.put("scenario",input.scenario());out.put("mode",input.mode());out.put("cacheBackend",store.kind());out.put("metrics",stats.snapshot());out.put("failedRequests",failures.get());out.put("notFound",missing.get());out.put("elapsedMs",(System.nanoTime()-start)/1_000_000);out.put("seededTtlMs",ttls);out.put("note","真实读取当前学习数据库；35ms 延迟与短 TTL 用于放大现象。预热查询不计入回源计数；并发结果以实际计数为准。实验只清理自己的随机命名空间。");return out;
  }finally{pool.shutdownNow();for(String k:keys)try{store.delete(k);}catch(Exception ignored){}runSlot.release();}
 }
}
