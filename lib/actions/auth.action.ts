"use server";

import { db, auth } from "@/firebase/admin";
import { cookies } from "next/headers";
import { success } from "zod";

export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  try {
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists) {
      // User already exists
      return {
        success: false,
        message: "User already exists",
      };
    }

    await db.collection("users").doc(uid).set({
      name,
      email,
    });

    return {
      success: true,
      message: "User created successfully",
    };
  } catch (e: any) {
    console.error("Error signing up:", e);

    if (e.code === "auth/email-already-in-use") {
      return {
        success: false,
        message: "Email already in use",
      };
    }
    return {
      success: false,
      message: "Error signing up",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);

    if (!userRecord) {
      return {
        success: false,
        message: "User does not exist",
      };
    }

    await setSessionCookie(idToken);

    return {
      success: true,
      message: "Sign-in successful",
    };
  } catch (e: unknown) {
    console.error("Error signing in:", e);

    if (typeof e === "object" && e !== null && "code" in e) {
      const err = e as { code: string };

      if (err.code === "auth/user-not-found") {
        return { success: false, message: "User not found" };
      }

      if (err.code === "auth/invalid-credential") {
        return { success: false, message: "Invalid credentials" };
      }
    }

    return {
      success: false,
      message: "Error signing in",
    };
  }
}

export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: 60 * 60 * 24 * 7 * 1000, // 7 days in milliseconds
  });

  cookieStore.set("session", sessionCookie, {
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();

    if (!userRecord.exists) {
      return null;
    }

    return {
      id: userRecord.id,
      email: userRecord.data()?.email,
      name: userRecord.data()?.name,
    } as User;
  } catch (e) {
    console.error("Error verifying session cookie:", e);
    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
// export async function getInterviewByUserId(userID:string) : Promise<Interview[] |null>{
//     const interviews = await db
//     .collection('interviews')
//     // .where ('userId','==',userId)
//     .orderBy('createdAt','desc')
//     .get();

//     return interviews.docs.map((doc)->({
//         id:doc.id,
//         ...doc.data();
//     })) as Interview[];
// }
