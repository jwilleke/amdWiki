#!/bin/bash

# Update badge classes
find views/ -name "*.ejs" -exec sed -i'' \
  -e 's/class="badge bg-info"/class="badge" style="background-color: var(--badge-info-bg); color: var(--badge-info-text);"/g' \
  -e 's/class="badge bg-primary"/class="badge" style="background-color: var(--badge-primary-bg); color: var(--badge-primary-text);"/g' \
  -e 's/class="badge bg-secondary"/class="badge" style="background-color: var(--badge-secondary-bg); color: var(--badge-secondary-text);"/g' \
  -e 's/class="badge bg-light text-dark"/class="badge" style="background-color: var(--badge-light-bg); color: var(--badge-light-text);"/g' \
  -e 's/class="badge bg-warning text-dark"/class="badge" style="background-color: var(--badge-warning-bg); color: var(--badge-warning-text);"/g' \
  -e 's/class="badge bg-success"/class="badge" style="background-color: var(--badge-success-bg); color: var(--badge-success-text);"/g' \
  -e 's/class="badge bg-danger"/class="badge" style="background-color: var(--badge-danger-bg); color: var(--badge-danger-text);"/g' \
  {} +

# Update button classes
find views/ -name "*.ejs" -exec sed -i'' \
  -e 's/class="btn btn-primary"/class="btn" style="background-color: var(--btn-primary-bg); color: var(--btn-primary-text); border-color: var(--btn-primary-border);"/g' \
  -e 's/class="btn btn-outline-primary btn-sm"/class="btn btn-sm" style="background-color: var(--btn-outline-primary-bg); color: var(--btn-outline-primary-text); border-color: var(--btn-outline-primary-border);"/g' \
  -e 's/class="btn btn-outline-info btn-sm"/class="btn btn-sm" style="background-color: var(--btn-outline-info-bg); color: var(--btn-outline-info-text); border-color: var(--btn-outline-info-border);"/g' \
  -e 's/class="btn btn-outline-secondary btn-sm"/class="btn btn-sm" style="background-color: var(--btn-outline-secondary-bg); color: var(--btn-outline-secondary-text); border-color: var(--btn-outline-secondary-border);"/g' \
  -e 's/class="btn btn-outline-danger btn-sm"/class="btn btn-sm" style="background-color: var(--btn-outline-danger-bg); color: var(--btn-outline-danger-text); border-color: var(--btn-outline-danger-border);"/g' \
  -e 's/class="btn btn-link btn-sm"/class="btn btn-link btn-sm" style="background-color: var(--btn-link-bg); color: var(--btn-link-text); border-color: var(--btn-link-border);"/g' \
  -e 's/class="btn btn-secondary"/class="btn" style="background-color: var(--btn-secondary-bg); color: var(--btn-secondary-text); border-color: var(--btn-secondary-border);"/g' \
  -e 's/class="btn btn-success"/class="btn" style="background-color: var(--btn-success-bg); color: var(--btn-success-text); border-color: var(--btn-success-border);"/g' \
  -e 's/class="btn btn-danger"/class="btn" style="background-color: var(--btn-danger-bg); color: var(--btn-danger-text); border-color: var(--btn-danger-border);"/g' \
  {} +

# Update card classes
find views/ -name "*.ejs" -exec sed -i'' \
  -e 's/class="card bg-primary text-white"/class="card" style="background-color: var(--card-primary-bg); color: var(--card-primary-text);"/g' \
  -e 's/class="card bg-info text-white"/class="card" style="background-color: var(--card-info-bg); color: var(--card-info-text);"/g' \
  -e 's/class="card bg-warning text-white"/class="card" style="background-color: var(--card-warning-bg); color: var(--card-warning-text);"/g' \
  -e 's/class="card bg-success text-white"/class="card" style="background-color: var(--card-success-bg); color: var(--card-success-text);"/g' \
  -e 's/class="card bg-danger text-white"/class="card" style="background-color: var(--card-danger-bg); color: var(--card-danger-text);"/g' \
  {} +

# Update text color classes
find views/ -name "*.ejs" -exec sed -i'' \
  -e 's/text-primary/style="color: var(--text-primary);"/g' \
  -e 's/text-info/style="color: var(--text-info);"/g' \
  -e 's/text-secondary/style="color: var(--text-secondary);"/g' \
  -e 's/text-warning/style="color: var(--text-warning);"/g' \
  -e 's/text-success/style="color: var(--text-success);"/g' \
  -e 's/text-danger/style="color: var(--text-danger);"/g' \
  -e 's/text-dark/style="color: var(--text-dark);"/g' \
  -e 's/text-white/style="color: var(--text-white);"/g' \
  {} +

echo "Extended theme variable replacements complete."
