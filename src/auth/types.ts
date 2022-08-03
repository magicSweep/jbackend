export type AuthUser = {
  uid: string;
};

export type UserDb = {
  exists: (userUid: string) => Promise<boolean>;
};
