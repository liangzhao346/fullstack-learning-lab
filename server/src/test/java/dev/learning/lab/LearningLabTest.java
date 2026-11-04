package dev.learning.lab;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.MediaType;
import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import static dev.learning.lab.Domain.*;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:learningtests;MODE=MySQL;DB_CLOSE_DELAY=-1","app.seed=false","app.cache=local"})
@AutoConfigureMockMvc
class LearningLabTest {
 @Autowired org.springframework.transaction.PlatformTransactionManager tx;@Autowired MockMvc http;@Autowired JdbcTemplate jdbc;@Autowired ProductService products;@Autowired ProductRepository repository;@Autowired OrderService orders;@Autowired OrderRepository orderRepo;@Autowired ObjectMapper json;@Autowired LabService labs;
 @BeforeEach void clean(){jdbc.update("DELETE FROM purchase_orders");jdbc.update("DELETE FROM products");}
 Product product(int stock){return products.create(new ProductInput("SKU-"+UUID.randomUUID().toString().substring(0,8),"学习商品",new BigDecimal("19.90"),stock,0));}
 @Test void systemExplainsRealDemoMode()throws Exception{http.perform(get("/api/system")).andExpect(status().isOk()).andExpect(jsonPath("$.data.cache").value("local-demo")).andExpect(jsonPath("$.data.database").value("h2-demo"));}
 @Test void createListAndSearchAreACompleteHttpPath()throws Exception{
  String input=json.writeValueAsString(new ProductInput("BOOK-001","Java 入门",new BigDecimal("29.90"),5,0));
  http.perform(post("/api/products").contentType(MediaType.APPLICATION_JSON).content(input)).andExpect(status().isOk()).andExpect(jsonPath("$.data.sku").value("BOOK-001")).andExpect(jsonPath("$.requestId").isNotEmpty());
  http.perform(get("/api/products").param("q","Java").param("size","1")).andExpect(status().isOk()).andExpect(jsonPath("$.data.total").value(1)).andExpect(jsonPath("$.data.items[0].name").value("Java 入门"));
 }
 @Test void invalidInputHasStructuredError()throws Exception{http.perform(post("/api/products").contentType(MediaType.APPLICATION_JSON).content("{\"sku\":\"!\",\"name\":\"\",\"price\":-1,\"stock\":-1}")).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR")).andExpect(jsonPath("$.details.name").exists()).andExpect(jsonPath("$.requestId").isNotEmpty());}
 @Test void invalidPaginationAndMissingProductAreNot500()throws Exception{http.perform(get("/api/products").param("size","1000")).andExpect(status().isBadRequest());http.perform(get("/api/products/999999999")).andExpect(status().isNotFound());}
 @Test void optimisticVersionProtectsEditsAndCacheIsInvalidated(){Product p=product(9);products.get(p.id());Product changed=products.update(p.id(),new ProductInput(p.sku(),"新版商品",p.price(),8,p.version()));assertThat(changed.version()).isEqualTo(1);assertThat(products.get(p.id()).name()).isEqualTo("新版商品");assertThatThrownBy(()->products.update(p.id(),new ProductInput(p.sku(),"过期修改",p.price(),2,p.version()))).isInstanceOf(ApiException.class).hasMessageContaining("其他请求");}
 @Test void repeatOrderIsIdempotentAndUsesDatabasePrice(){Product p=product(10);OrderInput input=new OrderInput(p.id(),2,UUID.randomUUID().toString());Order first=orders.place(input),second=orders.place(input);assertThat(second.id()).isEqualTo(first.id());assertThat(first.total()).isEqualByComparingTo("39.80");assertThat(repository.find(p.id()).orElseThrow().stock()).isEqualTo(8);assertThat(orderRepo.list(0,8).total()).isEqualTo(1);}
 @Test void sameKeyDifferentPayloadIsAConflict(){Product p=product(10);String key=UUID.randomUUID().toString();orders.place(new OrderInput(p.id(),1,key));assertThatThrownBy(()->orders.place(new OrderInput(p.id(),2,key))).isInstanceOf(ApiException.class).hasMessageContaining("不同订单内容");assertThat(repository.find(p.id()).orElseThrow().stock()).isEqualTo(9);}
 @Test void insufficientStockDoesNotCreateOrder(){Product p=product(1);assertThatThrownBy(()->orders.place(new OrderInput(p.id(),2,UUID.randomUUID().toString()))).isInstanceOf(ApiException.class);assertThat(repository.find(p.id()).orElseThrow().stock()).isEqualTo(1);assertThat(orderRepo.list(0,8).total()).isZero();}
 @Test void insertFailureRollsBackStock(){Product p=product(10);String key=UUID.randomUUID().toString();orders.place(new OrderInput(p.id(),1,key));var transaction=new org.springframework.transaction.support.TransactionTemplate(tx);assertThatThrownBy(()->transaction.executeWithoutResult(status->{repository.deduct(p.id(),1);orderRepo.insert(key,p,1);})).isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);assertThat(repository.find(p.id()).orElseThrow().stock()).isEqualTo(9);assertThat(orderRepo.list(0,8).total()).isEqualTo(1);}
 @Test void replayAtLastStockStillReturnsTheOneOrder()throws Exception{Product p=product(1);String key=UUID.randomUUID().toString();ExecutorService pool=Executors.newFixedThreadPool(8);try{List<Callable<String>>calls=new ArrayList<>();for(int i=0;i<8;i++)calls.add(()->orders.place(new OrderInput(p.id(),1,key)).id());Set<String>ids=new HashSet<>();for(var f:pool.invokeAll(calls))ids.add(f.get());assertThat(ids).hasSize(1);assertThat(repository.find(p.id()).orElseThrow().stock()).isZero();}finally{pool.shutdownNow();}}

 @Test void simultaneousDifferentOrdersCannotOversell()throws Exception{Product p=product(3);ExecutorService pool=Executors.newFixedThreadPool(8);try{List<Callable<Boolean>>calls=new ArrayList<>();for(int i=0;i<16;i++)calls.add(()->{try{orders.place(new OrderInput(p.id(),1,UUID.randomUUID().toString()));return true;}catch(ApiException e){return false;}});long success=0;for(var f:pool.invokeAll(calls))if(f.get())success++;assertThat(success).isEqualTo(3);assertThat(repository.find(p.id()).orElseThrow().stock()).isZero();assertThat(orderRepo.list(0,8).total()).isEqualTo(3);}finally{pool.shutdownNow();}}
 @Test void simultaneousSameKeyDeductsStockOnce()throws Exception{Product p=product(20);String key=UUID.randomUUID().toString();ExecutorService pool=Executors.newFixedThreadPool(8);try{List<Callable<String>>calls=new ArrayList<>();for(int i=0;i<12;i++)calls.add(()->orders.place(new OrderInput(p.id(),1,key)).id());Set<String>ids=new HashSet<>();for(var f:pool.invokeAll(calls))ids.add(f.get());assertThat(ids).hasSize(1);assertThat(repository.find(p.id()).orElseThrow().stock()).isEqualTo(19);}finally{pool.shutdownNow();}}
 @Test void orderedProductCannotBeDeletedThroughApi()throws Exception{Product p=product(10);orders.place(new OrderInput(p.id(),1,UUID.randomUUID().toString()));http.perform(delete("/api/products/"+p.id())).andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("DATA_CONFLICT"));}
 @Test void penetrationProtectionCachesMissingData()throws Exception{product(3);Map<String,Object> naive=labs.run(new LabInput("penetration","naive",8)),guard=labs.run(new LabInput("penetration","guarded",8));assertThat(metric(naive,"dbReads")).isEqualTo(8);assertThat(metric(guard,"dbReads")).isEqualTo(1);assertThat(metric(guard,"negativeHits")).isEqualTo(7);}
 @Test void hotKeyProtectionCoalescesConcurrentLoads()throws Exception{product(3);Map<String,Object> naive=labs.run(new LabInput("breakdown","naive",16)),guard=labs.run(new LabInput("breakdown","guarded",16));assertThat(metric(naive,"dbReads")).isGreaterThan(1);assertThat(metric(guard,"dbReads")).isEqualTo(1);}
 @Test void avalancheUsesStaggeredTtlRatherThanPromisingNoMisses()throws Exception{for(int i=0;i<12;i++)product(5);Map<String,Object> naive=labs.run(new LabInput("avalanche","naive",12)),guard=labs.run(new LabInput("avalanche","guarded",12));assertThat(new HashSet<>((List<?>)naive.get("seededTtlMs"))).hasSize(1);assertThat(new HashSet<>((List<?>)guard.get("seededTtlMs"))).hasSizeGreaterThan(1);assertThat(metric(guard,"dbReads")).isLessThan(metric(naive,"dbReads"));}
 @Test void outageFallbackIsBoundedInsteadOfUnlimitedDatabaseFanout()throws Exception{product(3);Map<String,Object> naive=labs.run(new LabInput("outage","naive",24)),guard=labs.run(new LabInput("outage","guarded",24));assertThat(metric(naive,"dbReads")).isZero();assertThat(metric(guard,"dbReads")).isPositive().isLessThan(24);assertThat(metric(guard,"rejected")).isPositive();}
 @Test void labDoesNotClearBusinessCache()throws Exception{Product p=product(3);products.get(p.id());labs.run(new LabInput("penetration","guarded",8));long before=products.metrics().get("dbReads");products.get(p.id());assertThat(products.metrics().get("dbReads")).isEqualTo(before);}
 @Test void redisTtlContractIsMirroredByLocalDemo()throws Exception{CacheStore cache=new LocalCacheStore();cache.put("x","value",20);assertThat(cache.get("x")).isEqualTo("value");Thread.sleep(35);assertThat(cache.get("x")).isNull();cache.put("y","another",1000);cache.delete("y");assertThat(cache.get("y")).isNull();}
 long metric(Map<String,Object> result,String key){return ((Number)((Map<?,?>)result.get("metrics")).get(key)).longValue();}
}
