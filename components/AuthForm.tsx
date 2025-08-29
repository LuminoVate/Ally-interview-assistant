"use client";

import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import FormField from "./FormField";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/firebase/Client";
import { signIn, signUp } from "@/lib/actions/auth.action";

const authFormSchema = (type: FormType) => {
  return z.object({
    name:
      type === "sign-up" ? z.string().min(2).max(100) : z.string().optional(),
    email: z.string().min(5).max(100).email(),
    password: z.string().min(8).max(100),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const formSchema = authFormSchema(type);
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      if (isSignIn) {
        const { email, password } = values;
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const idToken = await userCredential.user.getIdToken();

        if (!idToken) {
          toast.error("Failed to retrieve ID token");
          return;
        }

        await signIn({
          email,
          idToken,
        });

        toast.success("Logged in successfully");
        console.log("sign in", values);
        router.push("/");
      } else {
        const { name, email, password } = values;
        const userCredentials = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const result = await signUp({
          uid: userCredentials.user.uid,
          name: name!,
          email,
          password,
        });

        if (!result?.success) {
          toast.error(result?.message || "Error signing up");
        }

        toast.success("Account created successfully , Please log in");
        router.push("/sign-in");
        console.log("sign up", values);
      }
    } catch (e: any) {
      console.error("Error in auth form submission:", e);
      // Show a user-friendly message for invalid credentials
      if (
        e.code === "auth/invalid-credential" ||
        e.message?.toLowerCase().includes("invalid credential")
      ) {
        toast.error("Invalid email or password. Please try again.");
      } else if (e.code === "auth/email-already-in-use") {
        toast.error("Email already in use. Please try another.");
      } else {
        toast.error(e.message || "An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[556px]">
      <div className="flex flex-col gap-6 card py-13 px-10">
        <div className="flex flex-row gap-2 items-center justify-center">
          <Image src="/logo_notext.png" alt="logo" height={60} width={60} />
          <h2 className="text-primary-100">Ally</h2>
        </div>
        <h3 className="">Practise job interview with AI</h3>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {!isSignIn && (
              <FormField
                name="name"
                control={form.control}
                label="Name"
                type="text"
                placeholder="Enter your name"
              />
            )}
            <FormField
              name="email"
              control={form.control}
              label="Email"
              type="email"
              placeholder="Enter your email"
            />
            <FormField
              name="password"
              control={form.control}
              label="Password"
              placeholder="Enter your password"
              type="password"
            />

            <Button className="btn cursor-pointer" type="submit">
              {isSignIn
                ? loading
                  ? "Loading..."
                  : "Sign In "
                : loading
                ? "Creating..... "
                : "Create an Account "}
            </Button>
          </form>
          <p className="text-center">
            {isSignIn
              ? " Already have an account? "
              : " Don't have an account? "}
            <Link
              className="underline"
              href={isSignIn ? "/sign-up" : "/sign-in"}
            >
              {isSignIn ? " Register" : " Login"}
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
};
export default AuthForm;
