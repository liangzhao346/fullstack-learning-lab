package dev.learning.lab;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import static dev.learning.lab.Domain.*;
@Service
public class OrderTransaction {
 final OrderRepository orders;final ProductRepository products;final ProductService productService;
 public OrderTransaction(OrderRepository o,ProductRepository p,ProductService s){orders=o;products=p;productService=s;}
 @Transactional public Order place(OrderInput input){
  var existing=orders.findByKey(input.requestKey());if(existing.isPresent())return matching(existing.get(),input);
  Product product=products.find(input.productId()).orElseThrow(()->new ApiException(404,"PRODUCT_NOT_FOUND","商品不存在"));
  if(products.deduct(product.id(),input.quantity())==0)throw new ApiException(409,"INSUFFICIENT_STOCK","库存不足，订单未创建");
  Order order=orders.insert(input.requestKey(),product,input.quantity());productService.afterCommit(product.id());return order;
 }
 static Order matching(Order order,OrderInput input){if(order.productId()!=input.productId()||order.quantity()!=input.quantity())throw new ApiException(409,"IDEMPOTENCY_CONFLICT","相同提交标识不能用于不同订单内容");return order;}
}
