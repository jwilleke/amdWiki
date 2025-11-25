# Persons and Relationships

## Key Direction
✅ Separate Person from Roles: Person is the identity; roles define relationships
✅ Keep Auth Separate: Don't mix Schema.org with security data
✅ Use Role Arrays: memberOf, hasOccupation, affiliation for different role types
✅ Permissions Belong to Roles: Not the person directly
✅ Credentiles belong to the Person
✅ Apply Policies Dynamically: Based on requesting user's permissions
✅ Current Role and identity is in WikiContext Object

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

## Further Discussions

The "amdWiki" would be an Organization as defined in users/organizations.json.

Most implementations of amdWiki woulld be 

Example Core Person Identity (Immutable)

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "urn:uuid:testuser-d0b8b3ee",
  "identifier": "testuser",
  "name": "Test User",
  "alternateName": ["testuser"],
  "email": "test@example.com",
  "birthDate": null,
  "nationality": null,
  "gender": null,
  "knowsLanguage": ["English"],
  "alumniOf": null,
  "dateCreated": "2025-09-09T09:45:58.487Z",
  
  "address": {
    "@type": "PostalAddress",
    "addressLocality": null,
    "addressRegion": null,
    "addressCountry": null
  },
  
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Account",
    "availableLanguage": ["English"],
    "email": "test@example.com"
  },
  
  "knowsAbout": [
    "Content Consumption",
    "Basic Navigation",
    "Information Retrieval"
  ]
}
```

Member Role (Church/Association Membership)

```json
{
  "@context": "https://schema.org",
  "@type": "OrganizationRole",
  "@id": "urn:amdwiki:role:member:testuser-001",
  "identifier": "MEMBER-testuser-001",
  "roleName": "Platform Member",
  "startDate": "2025-09-09T09:45:58.487Z",
  "endDate": null,
  "isActiveRole": true,
  
  "member": {
    "@id": "urn:uuid:testuser-d0b8b3ee"
  },
  
  "memberOf": {
    "@type": "Organization",
    "@id": "amdwiki-platform",
    "name": "amdWiki Platform"
  },
  
  "additionalProperty": [
    {
      "@type": "PropertyValue",
      "name": "membershipType",
      "value": "Basic"
    },
    {
      "@type": "PropertyValue",
      "name": "membershipStatus",
      "value": "Active"
    }
  ]
}
```

Authentication or interaction or transaction data Should stored be out side objects 

```json
{
  "userId": "testuser",
  "personId": "urn:uuid:testuser-d0b8b3ee",
  "authentication": {
    "passwordHash": "9e88709605483b521494a7306abbc14f700e3861c9d7370bd1218a38239a8af1",
    "lastLogin": "2025-11-24T09:29:30Z",
    "mfaEnabled": false,
    "isSystem": false,
    "accountStatus": "active"
  },
  "preferences": {
    "theme": "light",
    "language": "en",
    "notifications": true
  }
}
```

### Example: E-Commerce Order Transaction

```json
{
  "@context": "https://schema.org",
  "@type": "Order",
  "@id": "urn:amdwiki:order:2025-001",
  "orderNumber": "ORD-2025-001",
  "orderDate": "2025-11-24T10:15:00Z",
  "orderStatus": "OrderProcessing",
  
  "customer": {
    "@type": "Person",
    "@id": "urn:uuid:testuser-d0b8b3ee",
    "name": "Test User",
    "email": "test@example.com"
  },
  
  "seller": {
    "@type": "Organization",
    "@id": "amdwiki-platform",
    "name": "amdWiki Platform"
  },
  
  "orderedItem": [
    {
      "@type": "OrderItem",
      "orderItemNumber": "1",
      "orderQuantity": 1,
      "orderedItem": {
        "@type": "Product",
        "name": "Premium Subscription",
        "sku": "SUB-PREMIUM-ANNUAL"
      },
      "orderItemStatus": "OrderItemProcessing",
      "price": 99.00,
      "priceCurrency": "USD"
    }
  ],
  
  "paymentMethod": {
    "@type": "PaymentCard",
    "name": "Visa ending in 1234"
  },
  
  "paymentMethodId": "pm_1234567890",
  
  "totalPrice": 99.00,
  "priceCurrency": "USD",
  
  "billingAddress": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "Springfield",
    "addressRegion": "IL",
    "postalCode": "62701",
    "addressCountry": "US"
  },
  
  "confirmationNumber": "CONF-2025-ABC123",
  "orderDelivery": {
    "@type": "ParcelDelivery",
    "expectedArrivalFrom": "2025-11-25T00:00:00Z",
    "expectedArrivalUntil": "2025-11-27T23:59:59Z"
  }
}
```

### Invoice Example (Billing Transaction)

```json
{
  "@context": "https://schema.org",
  "@type": "Invoice",
  "@id": "urn:amdwiki:invoice:INV-2025-001",
  "identifier": "INV-2025-001",
  "description": "Annual Premium Subscription",
  
  "customer": {
    "@type": "Person",
    "@id": "urn:uuid:testuser-d0b8b3ee"
  },
  
  "provider": {
    "@type": "Organization",
    "@id": "amdwiki-platform"
  },
  
  "referencesOrder": {
    "@type": "Order",
    "@id": "urn:amdwiki:order:2025-001"
  },
  
  "totalPaymentDue": {
    "@type": "PriceSpecification",
    "price": 99.00,
    "priceCurrency": "USD"
  },
  
  "paymentDueDate": "2025-12-24",
  "paymentStatus": "PaymentComplete",
  
  "billingPeriod": {
    "@type": "Duration",
    "startDate": "2025-11-24",
    "endDate": "2026-11-24"
  },
  
  "accountId": "ACCT-testuser-001",
  "confirmationNumber": "PAY-2025-XYZ789"
}
```

### Example MoneyTransfer (Financial Transaction)

```json
{
  "@context": "https://schema.org",
  "@type": "MoneyTransfer",
  "@id": "urn:amdwiki:transfer:TXN-2025-001",
  "identifier": "TXN-2025-001",
  
  "amount": {
    "@type": "MonetaryAmount",
    "value": 99.00,
    "currency": "USD"
  },
  
  "sender": {
    "@type": "Person",
    "@id": "urn:uuid:testuser-d0b8b3ee"
  },
  
  "recipient": {
    "@type": "Organization",
    "@id": "amdwiki-platform"
  },
  
  "beneficiaryBank": {
    "@type": "BankOrCreditUnion",
    "name": "Example Bank"
  },
  
  "startTime": "2025-11-24T10:15:00Z",
  "endTime": "2025-11-24T10:15:03Z",
  
  "actionStatus": "CompletedActionStatus"
}
```
