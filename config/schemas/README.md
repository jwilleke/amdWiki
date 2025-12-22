# JSON Schemas Directory

This directory is for JSON Schema files used by SchemaManager for validation.

## Usage

Place `.json` files containing JSON Schema definitions here. They will be automatically loaded by SchemaManager on startup.

Example schema file structure:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "value": { "type": "number" }
  },
  "required": ["name"]
}
```

Schemas can be retrieved in code via:

```javascript
const schemaManager = engine.getManager('SchemaManager');
const schema = schemaManager.getSchema('my-schema');
```

## Note

This directory is optional. If no schemas are needed, it can remain empty.
