package dev.learning.lab;
import org.springframework.stereotype.Repository;
import org.springframework.jdbc.core.*;
import java.util.*;
import static dev.learning.lab.Domain.*;
@Repository
public class ProductRepository {
 private final JdbcTemplate jdbc;
 public ProductRepository(JdbcTemplate jdbc){this.jdbc=jdbc;}
 private final RowMapper<Product> mapper=(rs,n)->new Product(rs.getLong("id"),rs.getString("sku"),rs.getString("name"),rs.getBigDecimal("price"),rs.getInt("stock"),rs.getInt("version"),rs.getTimestamp("created_at").toInstant().toString());
 public Optional<Product> find(long id){return jdbc.query("SELECT * FROM products WHERE id=?",mapper,id).stream().findFirst();}
 public Page<Product> list(int page,int size,String q){String like="%"+q+"%";long count=jdbc.queryForObject("SELECT COUNT(*) FROM products WHERE name LIKE ? OR sku LIKE ?",Long.class,like,like);return new Page<>(jdbc.query("SELECT * FROM products WHERE name LIKE ? OR sku LIKE ? ORDER BY id LIMIT ? OFFSET ?",mapper,like,like,size,(long)page*size),count,page,size);}
 public Product insert(ProductInput p){jdbc.update("INSERT INTO products(sku,name,price,stock) VALUES (?,?,?,?)",p.sku(),p.name(),p.price(),p.stock());return jdbc.queryForObject("SELECT * FROM products WHERE sku=?",mapper,p.sku());}
 public int update(long id,ProductInput p){return jdbc.update("UPDATE products SET sku=?,name=?,price=?,stock=?,version=version+1 WHERE id=? AND version=?",p.sku(),p.name(),p.price(),p.stock(),id,p.version());}
 public int delete(long id){return jdbc.update("DELETE FROM products WHERE id=?",id);}
 public int deduct(long id,int count){return jdbc.update("UPDATE products SET stock=stock-?,version=version+1 WHERE id=? AND stock>=?",count,id,count);}
}
