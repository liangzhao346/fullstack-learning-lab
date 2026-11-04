package dev.learning.lab;
import org.springframework.stereotype.Component;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import java.math.BigDecimal;
@Component @ConditionalOnProperty(name="app.seed",havingValue="true")
public class SeedData implements ApplicationRunner {
 final JdbcTemplate jdbc;public SeedData(JdbcTemplate jdbc){this.jdbc=jdbc;}
 public void run(ApplicationArguments args){if(jdbc.queryForObject("SELECT COUNT(*) FROM products",Long.class)>0)return;String[] names={"入门机械键盘","便携笔记本支架","桌面收纳盒","双口充电器","无线鼠标","学习笔记本"};for(int i=1;i<=24;i++)jdbc.update("INSERT INTO products(sku,name,price,stock) VALUES (?,?,?,?)","LAB-"+i,names[(i-1)%names.length]+" "+i,BigDecimal.valueOf(19+i*7),20+i);}
}
