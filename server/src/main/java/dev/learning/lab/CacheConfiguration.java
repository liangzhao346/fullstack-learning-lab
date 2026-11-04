package dev.learning.lab;
import org.springframework.context.annotation.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.core.StringRedisTemplate;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
@Configuration
public class CacheConfiguration {
 @Bean @ConditionalOnProperty(name="app.cache",havingValue="local",matchIfMissing=true)
 CacheStore local(){return new LocalCacheStore();}
 @Bean @ConditionalOnProperty(name="app.cache",havingValue="redis")
 CacheStore redis(StringRedisTemplate redis){return new CacheStore(){
  public String get(String k){return redis.opsForValue().get(k);}
  public void put(String k,String v,long ttl){redis.opsForValue().set(k,v,Duration.ofMillis(ttl));}
  public void delete(String k){redis.delete(k);}
  public long ttl(String k){Long t=redis.getExpire(k,java.util.concurrent.TimeUnit.MILLISECONDS);return t==null?-2:t;}
  public String kind(){return "redis";}
 };}
}
class LocalCacheStore implements CacheStore {
 record Entry(String value,long expires){}
 final ConcurrentHashMap<String,Entry> entries=new ConcurrentHashMap<>();
 public String get(String k){Entry e=entries.get(k);if(e==null)return null;if(e.expires()<=System.nanoTime()){entries.remove(k,e);return null;}return e.value();}
 public void put(String k,String v,long ttl){if(entries.size()>=4096){entries.entrySet().removeIf(e->e.getValue().expires()<=System.nanoTime());if(entries.size()>=4096)return;}entries.put(k,new Entry(v,System.nanoTime()+ttl*1_000_000));}
 public void delete(String k){entries.remove(k);}
 public long ttl(String k){Entry e=entries.get(k);return e==null?-2:Math.max(0,(e.expires()-System.nanoTime())/1_000_000);}
 public String kind(){return "local-demo";}
}
