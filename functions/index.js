import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

const app = getApps().length ? getApps()[0] : initializeApp();
const auth = getAuth(app);
const db = getFirestore(app);

export const removeMember = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign in as an administrator to remove a member.");
  }

  const memberId = request.data?.memberId;
  const memberType = request.data?.memberType;
  if (typeof memberId !== "string" || !memberId.trim() || memberId !== memberId.trim() ||
      memberId.length > 128 || memberId.includes("/") ||
      !["students", "staff"].includes(memberType)) {
    throw new HttpsError("invalid-argument", "A valid member ID and member type are required.");
  }

  const callerRef = db.collection("staff").doc(request.auth.uid);
  const callerSnapshot = await callerRef.get();
  const callerRole = callerSnapshot.exists
    ? String(callerSnapshot.data().role || "").trim().toLowerCase()
    : "";
  if (!["admin", "principal"].includes(callerRole)) {
    throw new HttpsError("permission-denied", "Only an admin or principal can remove members.");
  }

  if (memberType === "staff" && memberId === request.auth.uid) {
    throw new HttpsError("failed-precondition", "You cannot remove your own account.");
  }

  const memberRef = db.collection(memberType).doc(memberId);
  const memberSnapshot = await memberRef.get();
  if (!memberSnapshot.exists) {
    throw new HttpsError("not-found", "The selected member profile no longer exists.");
  }

  if (memberType === "staff") {
    const targetRole = String(memberSnapshot.data().role || "").trim().toLowerCase();
    if (["admin", "principal"].includes(targetRole)) {
      throw new HttpsError("failed-precondition", "Admin and principal accounts cannot be removed here.");
    }
  }

  try {
    await auth.deleteUser(memberId);
  } catch (error) {
    if (error.code !== "auth/user-not-found") {
      console.error("Failed to delete member's Firebase Authentication account:", error);
      throw new HttpsError("internal", "Could not delete the member's Firebase Authentication account.");
    }
  }

  try {
    await memberRef.delete();
  } catch (error) {
    console.error("Authentication account was removed, but the member profile could not be deleted:", error);
    throw new HttpsError(
      "internal",
      "The sign-in account was removed, but the profile could not be deleted. Contact the system administrator."
    );
  }

  return { success: true };
});
