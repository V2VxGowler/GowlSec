-- Le badge Fondateur est une propriété serveur qui ne peut pas être modifiée
-- depuis le formulaire de profil.
ALTER TABLE "User"
ADD COLUMN "isFounder" BOOLEAN NOT NULL DEFAULT false;

-- Normalise les rôles existants afin que "Admin" et "admin" soient traités
-- de la même manière après la migration.
UPDATE "User"
SET "role" = 'admin'
WHERE LOWER("role") = 'admin';

-- Compte officiel GowlSec confirmé en production.
UPDATE "User"
SET "isFounder" = true
WHERE "id" = 28 AND LOWER("username") = 'gowlsec';

-- Retire définitivement l'ancien salon CFD et ses messages.
DELETE FROM "HubMessage"
WHERE LOWER("room") = 'cfd'
   OR "room" IN (
     SELECT "key"
     FROM "HubRoom"
     WHERE LOWER("key") = 'cfd' OR LOWER("label") = 'cfd'
   );

DELETE FROM "HubRoom"
WHERE LOWER("key") = 'cfd' OR LOWER("label") = 'cfd';
