package dev.learning.lab;
import static dev.learning.lab.Domain.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Supplier;
import com.fasterxml.jackson.databind.ObjectMapper;
public class CacheReader {
 public record Policy(boolean negative,boolean coalesce,boolean jitter,boolean fallback,boolean bounded,long ttl){
  public static Policy guarded(){return new Policy(true,true,true,true,true,30000);}
  public static Policy naive(){return new Policy(false,false,false,false,false,30000);}
 }
 public static class Stats {
  public final AtomicLong requests=new AtomicLong(),hits=new AtomicLong(),misses=new AtomicLong(),dbReads=new AtomicLong(),negativeHits=new AtomicLong(),cacheErrors=new AtomicLong(),rejected=new AtomicLong();
  public Map<String,Long> snapshot(){Map<String,Long>m=new LinkedHashMap<>();m.put("requests",requests.get());m.put("hits",hits.get());m.put("misses",misses.get());m.put("dbReads",dbReads.get());m.put("negativeHits",negativeHits.get());m.put("cacheErrors",cacheErrors.get());m.put("rejected",rejected.get());return m;}
 }
 private final CacheStore cache;private final ObjectMapper json;private final ReentrantLock[] locks=new ReentrantLock[128];private final Semaphore budget=new Semaphore(4);
 public CacheReader(CacheStore cache,ObjectMapper json){this.cache=cache;this.json=json;Arrays.setAll(locks,i->new ReentrantLock());}
 public Optional<Product> read(String key,Supplier<Optional<Product>> loader,Policy policy,Stats stats,int delay){
  stats.requests.incrementAndGet();
  try {
   String v=cache.get(key);
   if(v!=null)return decoded(v,stats);
  }catch(Exception e){stats.cacheErrors.incrementAndGet();if(!policy.fallback())throw new ApiException(503,"CACHE_UNAVAILABLE","缓存不可用，未启用回源保护");return load(key,loader,policy,stats,delay,false);}
  stats.misses.incrementAndGet();
  if(policy.coalesce()){
   ReentrantLock lock=locks[Math.floorMod(key.hashCode(),locks.length)];lock.lock();
   try{
    try{String v=cache.get(key);if(v!=null)return decoded(v,stats);}catch(Exception e){stats.cacheErrors.incrementAndGet();return load(key,loader,policy,stats,delay,false);}
    return load(key,loader,policy,stats,delay,true);
   }finally{lock.unlock();}
  }
  return load(key,loader,policy,stats,delay,true);
 }
 private Optional<Product> decoded(String text,Stats stats){stats.hits.incrementAndGet();if(text.equals("~missing~")){stats.negativeHits.incrementAndGet();return Optional.empty();}try{return Optional.of(json.readValue(text,Product.class));}catch(Exception e){throw new IllegalStateException("Invalid cached data",e);}}
 private Optional<Product> load(String key,Supplier<Optional<Product>> loader,Policy p,Stats s,int delay,boolean cacheAvailable){
  boolean admitted=false;
  if(!cacheAvailable&&p.bounded()){admitted=budget.tryAcquire();if(!admitted){s.rejected.incrementAndGet();throw new ApiException(503,"DB_BUDGET_EXHAUSTED","缓存故障，回源并发已达上限");}}
  try{
   s.dbReads.incrementAndGet();
   if(delay>0)try{Thread.sleep(delay);}catch(InterruptedException e){Thread.currentThread().interrupt();throw new ApiException(503,"INTERRUPTED","请求已中止");}
   Optional<Product> value=loader.get();
   if(cacheAvailable&&(value.isPresent()||p.negative())){
    try{long ttl=value.isPresent()?p.ttl()+(p.jitter()?ThreadLocalRandom.current().nextLong(p.ttl()/2+1):0):2000;cache.put(key,value.isPresent()?json.writeValueAsString(value.get()):"~missing~",ttl);}catch(Exception e){s.cacheErrors.incrementAndGet();if(!p.fallback())throw new ApiException(503,"CACHE_WRITE_FAILED","缓存写入失败");}
   }
   return value;
  }finally{if(admitted)budget.release();}
 }
}
