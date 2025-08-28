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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (isSignIn) {
        toast.success("Logged in successfully");
        console.log("sign in", values);
        router.push("/");
      } else {
        toast.success("Account created successfully , Please log in");
        router.push("/sign-in");
        console.log("sign up", values);
      }
    } catch (e) {
      toast.error("Something went wrong");
    } finally {
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
              {isSignIn ? "Sign In " : "Create an Account "}
            </Button>
          </form>
          <p className="text-center">
            {isSignIn
              ? " Already have an account? "
              : " Don't have an account? "}
            <Link href={isSignIn ? "/sign-up" : "/sign-in"}>
              {isSignIn ? " Register" : " Login"}
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
};
export default AuthForm;
