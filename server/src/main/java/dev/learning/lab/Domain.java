package dev.learning.lab;
import java.math.BigDecimal;
import java.util.List;
import jakarta.validation.constraints.*;
public final class Domain {
 public record Product(long id,String sku,String name,BigDecimal price,int stock,int version,String createdAt){}
 public record ProductInput(@NotBlank @Pattern(regexp="[A-Za-z0-9-]{2,40}") String sku,@NotBlank @Size(max=120) String name,@NotNull @DecimalMin("0.01") @Digits(integer=8,fraction=2) BigDecimal price,@Min(0) @Max(1000000) int stock,@Min(0) int version){}
 public record OrderInput(@Min(1) long productId,@Min(1) @Max(1000) int quantity,@NotBlank @Pattern(regexp="[A-Za-z0-9-]{8,80}") String requestKey){}
 public record Order(String id,String requestKey,long productId,int quantity,BigDecimal unitPrice,BigDecimal total,String createdAt){}
 public record Page<T>(List<T> items,long total,int page,int size){}
 public record LabInput(@NotBlank @Pattern(regexp="penetration|breakdown|avalanche|outage") String scenario,@NotBlank @Pattern(regexp="naive|guarded") String mode,@Min(8) @Max(60) int requests){}
}
