package dev.learning.lab;
import java.util.*;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.validation.ConstraintViolationException;
import java.io.IOException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.dao.DataIntegrityViolationException;
@Component
class TraceFilter extends OncePerRequestFilter {
 @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)throws ServletException,IOException{
  String id=UUID.randomUUID().toString(); req.setAttribute("requestId",id);res.setHeader("X-Request-Id",id);chain.doFilter(req,res);
 }
}
@RestControllerAdvice
public class ApiErrors {
 public record Failure(String code,String message,String requestId,Map<String,String> details){}
 private ResponseEntity<Failure> fail(int status,String code,String message,HttpServletRequest req,Map<String,String> details){return ResponseEntity.status(status).body(new Failure(code,message,(String)req.getAttribute("requestId"),details));}
 @ExceptionHandler(ApiException.class) ResponseEntity<Failure> business(ApiException e,HttpServletRequest r){return fail(e.status,e.code,e.getMessage(),r,Map.of());}
 @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<Failure> validation(MethodArgumentNotValidException e,HttpServletRequest r){Map<String,String>d=new LinkedHashMap<>();e.getBindingResult().getFieldErrors().forEach(f->d.put(f.getField(),f.getDefaultMessage()));return fail(400,"VALIDATION_ERROR","请检查输入字段",r,d);}
 @ExceptionHandler({HttpMessageNotReadableException.class,ConstraintViolationException.class,org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class}) ResponseEntity<Failure> bad(Exception e,HttpServletRequest r){return fail(400,"BAD_REQUEST","请求格式或参数不正确",r,Map.of());}
 @ExceptionHandler(DataIntegrityViolationException.class) ResponseEntity<Failure> conflict(Exception e,HttpServletRequest r){return fail(409,"DATA_CONFLICT","SKU 已存在，或商品已有订单而不能删除",r,Map.of());}
 @ExceptionHandler(Exception.class) ResponseEntity<Failure> unknown(Exception e,HttpServletRequest r){return fail(500,"INTERNAL_ERROR","服务发生异常，请通过 requestId 排查",r,Map.of());}
}
