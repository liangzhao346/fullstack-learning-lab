/** 金额展示。商品表和订单记录统一显示人民币符号与两位小数。 */
export function formatMoney(value: number): string {
  return `¥${value.toFixed(2)}`;
}
