const { supabase } = require("./supabase");

export async function getSalesMetrics() {
  // Total sales
  const { data: totalSalesData, error: totalError } = await supabase
    .from("orders")
    .select("total_amount", { count: "exact" });

  const total_sales = totalSalesData?.reduce((sum, row) => sum + row.total_amount, 0) || 0;
  const total_count = totalSalesData?.length || 0;

  // Paid / completed sales
  const { data: paidData } = await supabase
    .from("orders")
    .select("total_amount", { count: "exact" })
    .in("status", ["paid", "completed"]);

  const sales_by_paid = paidData?.reduce((sum, row) => sum + row.total_amount, 0) || 0;
  const paid_count = paidData?.length || 0;

  // Pending sales
  const { data: pendingData } = await supabase
    .from("orders")
    .select("total_amount", { count: "exact" })
    .eq("status", "pending");

  const sales_by_pending = pendingData?.reduce((sum, row) => sum + row.total_amount, 0) || 0;
  const pending_count = pendingData?.length || 0;

  return {
    total_sales: total_sales / 100,
    total_count,
    sales_by_paid: sales_by_paid / 100,
    paid_count,
    sales_by_pending: sales_by_pending / 100,
    pending_count,
  };
}
