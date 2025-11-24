# Persons and Relationships

## Schema.org RBAC (Role-Based Access Control)

Using Schema.org makes your system interoperable and future-proofs your data model. It solves the "naming problem" (e.g., deciding between surname, last_name, or family_name) by adhering to a global standard.

### The Structural Mapping

In Schema.org terms, your "Human" is a Person, and your "Relation-Types" are Roles.

Here is how you map your specific requirements to Schema.org types:[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

## Your Concept Schema.org Type Why?

The Humanschema:Person The anchor.
Holds global attributes (Name, SSN, Home Address).

Employeeschema:EmployeeRole

Explicitly designed for this. Holds jobTitle, salaryCurrency, etc.

Association Memberschema:ProgramMembership
Perfect for Churches/Clubs. Holds membershipNumber, hostingOrganization.Customerschema:Role (Generic)

Schema.org lacks a "CustomerRole". Use the generic Role and tag it as "Customer".Vendorschema:OrganizationRoleVendors are often people acting on behalf of an org, or independent contractors.2. The Data Model (JSON-LD Example)Here is how a single "Digital Identity" looks when they are simultaneously an Employee and a Church Member. Notice how the attributes are compartmentalized.

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "urn:uuid:user-12345",
  "name": "Jonathan Doe",
  "taxID": "XXX-XX-XXXX", 
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Private Ln" 
  },
  
  "hasOccupation": {
    "@type": "EmployeeRole",
    "@id": "urn:role:emp-998877",
    "roleName": "Senior Analyst",
    "identifier": "EMP-001", 
    "startDate": "2023-01-01",
    "worksFor": {
      "@type": "Organization",
      "name": "Acme Corp"
    }
  },

  "memberOf": {
    "@type": "ProgramMembership",
    "@id": "urn:role:mem-555",
    "membershipNumber": "MEM-777",
    "hostingOrganization": {
      "@type": "Organization",
      "name": "St. Mary's Church"
    }
  }
}
```

## The "Policy Overlay" (The RBAC Layer)

Schema.org defines what the data is, but not who can edit it. You need a separate Policy Map that references the Schema.org paths.This is where you define your "Attribute Groups.

### "Policy Definition Example

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

```json
{
  "policy_id": "policy_employee_standard",
  "target_type": "EmployeeRole",
  "attributes": {
    "identifier": {
      "path": "identifier",
      "label": "Employee ID",
      "access": "read_only",
      "source": "system"
    },
    "jobTitle": {
      "path": "roleName",
      "label": "Job Title",
      "access": "admin_edit",
      "source": "hr_system"
    },
    "workPhone": {
      "path": "contactPoint.telephone",
      "label": "Office Phone",
      "access": "read_only", 
      "source": "it_provisioning"
    }
  }
}
```

### Policy Definition for "Person" (The Human)

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}

```json
{
  "policy_id": "policy_human_core",
  "target_type": "Person",
  "attributes": {
    "name": {
      "path": "name",
      "label": "Display Name",
      "access": "user_edit",
      "validation": "min_length:2"
    },
    "taxID": {
      "path": "taxID",
      "label": "SSN/TIN",
      "access": "hidden", 
      "view_permission": "finance_admin"
    }
  }
}
```

### Handling the "Customer" Gap

Since Schema.org doesn't have a dedicated CustomerRole, you have two strong options:

#### Option A: The ProgramMembership Hack (Recommended for Loyalty)

Treat being a "Customer" as a membership in your business ecosystem.

- Attribute: membershipNumber = Customer ID.
- Attribute: memberOf = Your Company.

#### Option B: The Generic Role

Use the base Role type.

[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}"hasRole": 

```json
{
  "@type": "Role",
  "roleName": "Customer",
  "identifier": "CUST-101",
  "startDate": "2020-05-20"
}
```

## Summary of Benefits

Standardization: If you ever need to export this data or integrate with an external HR system, they will understand worksFor and EmployeeRole much better than a custom table called tbl_user_relation_types.
Flexibility: A user can have multiple EmployeeRole entries (e.g., they have two jobs within the parent holding company) without breaking your database schema.
Semantic Clarity: It forces you to decide: Is this phone number attached to the Person (person.telephone) or the Job (employeeRole.contactPoint.telephone)? This solves your "merge" conflicts by design.