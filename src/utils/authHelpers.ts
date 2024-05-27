import { IUser } from "../models/userModel";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000; // 30 minutes

export async function incrementFailedLoginAttempts(user: IUser) {
  user.failedLoginAttempts += 1;
  if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
    user.accountLockedUntil = new Date(Date.now() + LOCK_TIME);
  }
  await user.save();
}

export function isAccountLocked(user: IUser) {
  if (
    user.accountLockedUntil &&
    user.accountLockedUntil > new Date(Date.now())
  ) {
    return true;
  }
  return false;
}
