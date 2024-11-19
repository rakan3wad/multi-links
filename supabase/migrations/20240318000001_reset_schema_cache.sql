-- Reset the schema cache
BEGIN;
  SELECT schema_cache.clear();
  SELECT schema_cache.refresh();
COMMIT;
