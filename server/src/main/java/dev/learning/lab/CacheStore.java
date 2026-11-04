package dev.learning.lab;
public interface CacheStore {
 String get(String key);
 void put(String key,String value,long ttlMillis);
 void delete(String key);
 long ttl(String key);
 String kind();
}
