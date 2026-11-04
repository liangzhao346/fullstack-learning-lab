package dev.learning.lab;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import static dev.learning.lab.Domain.*;
@Service
public class ProductService {
 final ProductRepository repo;final CacheStore cache;final CacheReader reader;final String prefix;final CacheReader.Stats stats=new CacheReader.Stats();
 public ProductService(ProductRepository repo,CacheStore cache,ObjectMapper json,@Value("${app.cache-prefix}")String prefix){this.repo=repo;this.cache=cache;this.reader=new CacheReader(cache,json);this.prefix=prefix;}
 public Page<Product> list(int page,int size,String q){return repo.list(page,size,q);}
 public java.util.Map<String,Long> metrics(){return stats.snapshot();}
 public Product get(long id){return reader.read(prefix+":product:"+id,()->repo.find(id),CacheReader.Policy.guarded(),stats,0).orElseThrow(()->new ApiException(404,"PRODUCT_NOT_FOUND","商品不存在"));}
 @Transactional public Product create(ProductInput p){return repo.insert(p);}
 @Transactional public Product update(long id,ProductInput p){if(repo.update(id,p)==0){if(repo.find(id).isEmpty())throw new ApiException(404,"PRODUCT_NOT_FOUND","商品不存在");throw new ApiException(409,"VERSION_CONFLICT","商品已被其他请求修改，请重新加载后再编辑");}afterCommit(id);return repo.find(id).orElseThrow();}
 @Transactional public void delete(long id){if(repo.delete(id)==0)throw new ApiException(404,"PRODUCT_NOT_FOUND","商品不存在");afterCommit(id);}
 public void afterCommit(long id){
  TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization(){@Override public void afterCommit(){try{cache.delete(prefix+":product:"+id);}catch(Exception e){stats.cacheErrors.incrementAndGet();}}});
 }
}
