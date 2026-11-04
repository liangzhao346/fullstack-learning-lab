package dev.learning.lab;
import org.springframework.stereotype.Service;
import org.springframework.dao.DuplicateKeyException;
import static dev.learning.lab.Domain.*;
@Service
public class OrderService {
 final OrderTransaction transaction;final OrderRepository orders;
 public OrderService(OrderTransaction transaction,OrderRepository orders){this.transaction=transaction;this.orders=orders;}
 public Order place(OrderInput input){try{return transaction.place(input);}catch(DuplicateKeyException e){return orders.findByKey(input.requestKey()).map(o->OrderTransaction.matching(o,input)).orElseThrow(()->e);}catch(ApiException e){if(e.code.equals("INSUFFICIENT_STOCK"))return orders.findByKey(input.requestKey()).map(o->OrderTransaction.matching(o,input)).orElseThrow(()->e);throw e;}}
}
