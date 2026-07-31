output "budget_name" {
  value = aws_budgets_budget.this.name
}

output "cost_allocation_tags" {
  value = [for t in aws_ce_cost_allocation_tag.this : t.tag_key]
}
