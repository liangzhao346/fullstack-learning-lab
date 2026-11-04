package dev.learning.lab;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import static dev.learning.lab.Domain.*;
@RestController @RequestMapping("/api") @Validated
public class ApiController {
 final ProductService products;final OrderService orders;final OrderRepository orderRepo;final LabService labs;final CacheStore cache;final Environment env;
 public ApiController(ProductService p,OrderService o,OrderRepository r,LabService l,CacheStore c,Environment e){products=p;orders=o;orderRepo=r;labs=l;cache=c;env=e;}
 record Envelope<T>(T data,String requestId){}
 private <T>Envelope<T>ok(T data,HttpServletRequest req){return new Envelope<>(data,(String)req.getAttribute("requestId"));}
 @GetMapping("/system") Object system(HttpServletRequest req){return ok(Map.of("application",env.getProperty("spring.application.name","learning-lab"),"cache",cache.kind(),"database",env.getProperty("app.cache").equals("redis")?"mysql":"h2-demo","java",System.getProperty("java.version"),"scope","本地学习项目，无登录与权限系统，勿直接公开部署"),req);}
 @GetMapping("/products") Object list(@RequestParam(defaultValue="0")@Min(0)@Max(100000)int page,@RequestParam(defaultValue="8")@Min(1)@Max(50)int size,@RequestParam(defaultValue="")@Size(max=80)String q,HttpServletRequest req){return ok(products.list(page,size,q),req);}
 @GetMapping("/products/{id}") Object detail(@PathVariable@Min(1)long id,HttpServletRequest req){return ok(products.get(id),req);}
 @PostMapping("/products") Object create(@Valid@RequestBody ProductInput p,HttpServletRequest req){return ok(products.create(p),req);}
 @PutMapping("/products/{id}") Object update(@PathVariable@Min(1)long id,@Valid@RequestBody ProductInput p,HttpServletRequest req){return ok(products.update(id,p),req);}
 @DeleteMapping("/products/{id}") Object delete(@PathVariable@Min(1)long id,HttpServletRequest req){products.delete(id);return ok(Map.of("deleted",id),req);}
 @GetMapping("/orders") Object orderList(@RequestParam(defaultValue="0")@Min(0)int page,@RequestParam(defaultValue="8")@Min(1)@Max(50)int size,HttpServletRequest req){return ok(orderRepo.list(page,size),req);}
 @PostMapping("/orders") Object order(@Valid@RequestBody OrderInput p,HttpServletRequest req){return ok(orders.place(p),req);}
 @GetMapping("/metrics/cache") Object metrics(HttpServletRequest req){return ok(products.metrics(),req);}
 @PostMapping("/labs/cache/run") Object lab(@Valid@RequestBody LabInput input,HttpServletRequest req)throws Exception{return ok(labs.run(input),req);}
}
