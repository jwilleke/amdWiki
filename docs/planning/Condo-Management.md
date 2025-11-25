# AmdWiki Condo-Management Package

Is an enhancment to docs/planning/Business-packages/business-addon-mvp.md

As a next-gen digital platform, AMdWiki can have "Enahancment Packages" which cater to specfic bussines needs.

The condo-management package add features to perfom as a management platform to the Condominiumn association as well as a place for Condominiumn association members to be informased about the Association and make maintenace requests.

Key Benefits of Using Interaction Types
✅ Standardized vocabulary for social features
✅ Queryable activity streams for analytics
✅ Audit trail of user engagement
✅ Notification system foundation
✅ SEO-friendly (Google understands these types)
✅ Interoperable with other systems using Schema.org

1. Hierarchy OverviewOrganization (HOA)
└── manages → ApartmentComplex (Garden Condo Community)
    ├── containsPlace → ApartmentBuilding (Duplex/4-Unit Structure)
    │   └── containsPlace → Apartment (Unit w/ private entrance/driveway/garage)
    └── amenityFeature → Community-Wide (clubhouse, pool)

Each Condo unit has relations to different types of persons:
- Occupants
- deed-Owners
- Vendors for Maintenace

Possible JSON Structure
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "urn:condo:association:maple-gardens-hoa",
      "name": "Maple Gardens Condominium Association",
      "description": "Manages 30 garden-style buildings (duplexes & 4-unit structures) with 100+ residential units.",
      "manages": {
        "@type": "ApartmentComplex",
        "@id": "urn:condo:complex:maple-gardens"
      }
    },
    {
      "@type": "ApartmentComplex",
      "@id": "urn:condo:complex:maple-gardens",
      "identifier": "MG-COMPLEX-001",
      "name": "Maple Gardens Garden Condominiums",
      "description": "Garden-style condominium community: 30 low-rise buildings (2-4 units each) with private entrances, driveways, and garages.",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "456 Elm Street",
        "addressLocality": "Springfield",
        "addressRegion": "IL",
        "postalCode": "62702"
      },
      "numberOfFloors": 2,  // Typical garden-style
      "numberOfAvailableSpaces": 108,  // Total units
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 39.78,
        "longitude": -89.65
      },
      
      /* COMMUNITY AMENITIES */
      "amenityFeature": [
        {
          "@type": "SportsActivityLocation",
          "@id": "urn:condo:common:pool",
          "name": "Community Pool"
        }
      ],
      
      /* BUILDINGS */
      "containsPlace": [
        {
          "@type": "ApartmentBuilding",
          "@id": "urn:condo:building:duplex-a",
          "name": "Duplex Building A",
          "description": "2-unit garden condo building with private entrances/driveways/garages.",
          "numberOfFloors": 2,
          "numberOfAvailableSpaces": 2,
          "containedInPlace": {
            "@type": "ApartmentComplex",
            "@id": "urn:condo:complex:maple-gardens"
          },
          "containsPlace": [
            {
              "@type": "Apartment",
              "@id": "urn:condo:unit:a1"
            }
          ]
        },
        {
          "@type": "ApartmentBuilding",
          "@id": "urn:condo:building:quad-b",
          "name": "4-Unit Building B",
          "description": "Quadplex garden condo with individual private access.",
          "numberOfFloors": 1,
          "numberOfAvailableSpaces": 4
        }
      ]
    },
    
    /* EXAMPLE UNIT IN DUPLEX */
    {
      "@type": "Apartment",
      "@id": "urn:condo:unit:a1",
      "identifier": "UNIT-A1",
      "name": "Garden Condo Unit A1",
      "description": "2BR/2BA end-unit in duplex building. Private entrance, driveway, and 2-car garage.",
      "numberOfBedrooms": 2,
      "numberOfBathroomsTotal": 2,
      "floorSize": {
        "@type": "QuantitativeValue",
        "value": 1400,
        "unitText": "sq ft"
      },
      "containedInPlace": {
        "@type": "ApartmentBuilding",
        "@id": "urn:condo:building:duplex-a"
      },
      
      /* PRIVATE AMENITIES */
      "amenityFeature": [
        {
          "@type": "LocationFeatureSpecification",
          "name": "Private Entrance",
          "value": true
        },
        {
          "@type": "LocationFeatureSpecification",
          "name": "Private Driveway",
          "accessMode": "private",
          "value": true
        },
        {
          "@type": "LocationFeatureSpecification",
          "name": "Attached 2-Car Garage",
          "maximumAttendeeCapacity": 2,  // Cars
          "value": true
        }
      ],
      
      /* OWNERS/OCCUPANTS/MAINTENANCE */
      "owner": { /* Deed owner */ },
      "occupant": [ /* Residents */ ],
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "buildingConfiguration",
          "value": "duplex-garden"
        },
        {
          "@type": "PropertyValue",
          "name": "garageDoorCode",
          "value": "HOA-MANAGED"
        }
      ]
    }
  ]
}
```
