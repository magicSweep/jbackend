import { BuildFor } from "lizzygram-common-data/dist/types";

export const set_ = (upperCaseBuildFor: string) => (title: string) => {
  process.env[title] = process.env[`${upperCaseBuildFor}_${title}`];
};

export const setFirestoreAndDrive = (buildFor: BuildFor) => {
  const BUILD_FOR = buildFor.toUpperCase();

  const set = set_(BUILD_FOR);

  set("PROJECT_ID");

  // GOOGLE DRIVE
  set("DRIVE_PARENT_ID");
  set("DRIVE_PRIVATE_KEY_ID");
  set("DRIVE_PRIVATE_KEY");
  set("DRIVE_CLIENT_EMAIL");
  set("DRIVE_CLIENT_ID");
  set("DRIVE_CLIENT_X509_CERT_URL");

  // FIRESTORE
  set("FIRESTORE_PRIVATE_KEY_ID");
  set("FIRESTORE_PRIVATE_KEY");
  set("FIRESTORE_CLIENT_EMAIL");
  set("FIRESTORE_CLIENT_ID");
  set("FIRESTORE_CLIENT_X509_CERT_URL");
};
