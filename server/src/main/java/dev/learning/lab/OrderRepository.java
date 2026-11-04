package dev.learning.lab;
import org.springframework.stereotype.Repository;
import org.springframework.jdbc.core.*;
import java.util.*;
import java.math.BigDecimal;
import static dev.learning.lab.Domain.*;
@Repository
public class OrderRepository {
 final JdbcTemplate jdbc;
 public OrderRepository(JdbcTemplate jdbc){this.jdbc=jdbc;}
 final RowMapper<Order> mapper=(rs,n)->new Order(rs.getString("id"),rs.getString("request_key"),rs.getLong("product_id"),rs.getInt("quantity"),rs.getBigDecimal("unit_price"),rs.getBigDecimal("total"),rs.getTimestamp("created_at").toInstant().toString());
 public Optional<Order> findByKey(String key){return jdbc.query("SELECT * FROM purchase_orders WHERE request_key=?",mapper,key).stream().findFirst();}
 public Order insert(String key,Product p,int qty){String id=UUID.randomUUID().toString();BigDecimal total=p.price().multiply(BigDecimal.valueOf(qty));jdbc.update("INSERT INTO purchase_orders(id,request_key,product_id,quantity,unit_price,total) VALUES (?,?,?,?,?,?)",id,key,p.id(),qty,p.price(),total);return findByKey(key).orElseThrow();}
 public Page<Order> list(int page,int size){long total=jdbc.queryForObject("SELECT COUNT(*) FROM purchase_orders",Long.class);return new Page<>(jdbc.query("SELECT * FROM purchase_orders ORDER BY created_at DESC,id LIMIT ? OFFSET ?",mapper,size,(long)page*size),total,page,size);}
}
