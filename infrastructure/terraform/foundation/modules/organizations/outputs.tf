output "organization_id" {
  value = aws_organizations_organization.this.id
}

output "root_id" {
  value = aws_organizations_organization.this.roots[0].id
}

output "organizational_unit_ids" {
  value = { for k, v in aws_organizations_organizational_unit.this : k => v.id }
}

output "account_ids" {
  value = { for k, v in aws_organizations_account.this : k => v.id }
}
