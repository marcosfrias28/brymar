-- Agregar coordenadas de ejemplo a los terrenos existentes
-- Coordenadas de República Dominicana

UPDATE lands 
SET location = jsonb_set(
    COALESCE(location::jsonb, '{}'),
    '{coordinates}',
    '{"latitude": 18.4861, "longitude": -69.9312}'
)
WHERE id = 1;

UPDATE lands 
SET location = jsonb_set(
    COALESCE(location::jsonb, '{}'),
    '{coordinates}',
    '{"latitude": 18.5204, "longitude": -69.9540}'
)
WHERE id = 2;

UPDATE lands 
SET location = jsonb_set(
    COALESCE(location::jsonb, '{}'),
    '{coordinates}',
    '{"latitude": 18.4655, "longitude": -69.9365}'
)
WHERE id = 3;

UPDATE lands 
SET location = jsonb_set(
    COALESCE(location::jsonb, '{}'),
    '{coordinates}',
    '{"latitude": 19.4515, "longitude": -70.6969}'
)
WHERE id = 4;

UPDATE lands 
SET location = jsonb_set(
    COALESCE(location::jsonb, '{}'),
    '{coordinates}',
    '{"latitude": 18.2367, "longitude": -71.0719}'
)
WHERE id = 5;

UPDATE lands 
SET location = jsonb_set(
    COALESCE(location::jsonb, '{}'),
    '{coordinates}',
    '{"latitude": 18.6151, "longitude": -68.9739}'
)
WHERE id = 6;

UPDATE lands 
SET location = jsonb_set(
    COALESCE(location::jsonb, '{}'),
    '{coordinates}',
    '{"latitude": 19.7892, "longitude": -70.5348}'
)
WHERE id = 7;

UPDATE lands 
SET location = jsonb_set(
    COALESCE(location::jsonb, '{}'),
    '{coordinates}',
    '{"latitude": 18.8070, "longitude": -70.2204}'
)
WHERE id = 8;

UPDATE lands 
SET location = jsonb_set(
    COALESCE(location::jsonb, '{}'),
    '{coordinates}',
    '{"latitude": 18.0731, "longitude": -71.2288}'
)
WHERE id = 9;

UPDATE lands 
SET location = jsonb_set(
    COALESCE(location::jsonb, '{}'),
    '{coordinates}',
    '{"latitude": 19.2177, "longitude": -69.4203}'
)
WHERE id = 10;