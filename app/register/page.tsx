"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Wind, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"
import Image from "next/image"

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(50, { message: "Name must be less than 50 characters." })
    .regex(/^[a-zA-Z\s]+$/, { message: "Name can only contain letters and spaces." }),
  email: z.string().email({ message: "Please enter a valid email address." }).min(1, { message: "Email is required." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
    }),
  role: z
    .string({
      required_error: "Please select a professional role.",
    })
    .min(1, { message: "Please select a professional role." }),
})

const professionalRoles = [
  "GIS Analyst",
  "Environmental Researcher",
  "Student",
  "Environmental Scientist",
  "Data Analyst",
  "Policy Maker",
  "Public Health Officer",
  "Urban Planner",
  "Climate Researcher",
  "Environmental Consultant",
  "Academic Researcher",
  "Government Official",
  "NGO Worker",
  "Journalist",
  "Other",
]

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const router = useRouter()


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            name: values.name,
            role: values.role,
          },
        },
      })

      if (authError) {
        // Enhanced error handling with specific error messages
        let errorMessage = "Registration failed. Please try again."

        if (authError.message.includes("already registered")) {
          errorMessage = "An account with this email already exists. Please try logging in instead."
        } else if (authError.message.includes("invalid email")) {
          errorMessage = "Please enter a valid email address."
        } else if (authError.message.includes("weak password")) {
          errorMessage = "Password is too weak. Please choose a stronger password."
        } else if (authError.message.includes("rate limit")) {
          errorMessage = "Too many registration attempts. Please wait a moment and try again."
        } else {
          errorMessage = authError.message
        }

        toast.error(errorMessage)
        return
      }

      if (authData.user) {
        // Create user profile in profiles table with better error handling
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            user_id: authData.user.id,
            name: values.name,
            email: values.email,
            role: values.role,
            created_at: new Date().toISOString(),
          },
        ])

        if (profileError) {
          console.error("Profile creation error:", profileError)
          toast.error("Account created but profile setup failed. Please contact support.")
          return
        }

        // Show success state instead of redirecting
        setUserEmail(values.email)
        setIsSuccess(true)
        toast.success("Account created successfully! Please check your email to verify your account.")
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("An unexpected error occurred. Please check your internet connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4 font-sans">Account Created Successfully!</h1>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We've sent a verification email to <span className="font-semibold text-gray-900">{userEmail}</span>.
                Please check your inbox and click the verification link to activate your account.
              </p>
              <div className="space-y-3">
                <Button onClick={() => setIsSuccess(false)} variant="outline" className="w-full h-12 font-medium">
                  Create Another Account
                </Button>
                <Link href="/login">
                  <Button className="w-full h-12 bg-cyan-500 hover:bg-cyan-600 text-white font-medium">
                    Go to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Image src="/logo2.svg" alt="AirQNigeria" width={50} height={50} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3 font-sans tracking-tight">Create Your Account</h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Join AirQNigeria to access comprehensive air quality data
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800 font-semibold text-sm">Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          className="h-12 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500 text-base font-medium"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800 font-semibold text-sm">Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
                          className="h-12 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500 text-base font-medium"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800 font-semibold text-sm">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Create a strong password"
                          className="h-12 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500 text-base font-medium"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800 font-semibold text-sm">Professional Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500 text-base font-medium">
                            <SelectValue placeholder="Select your professional role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {professionalRoles.map((role) => (
                            <SelectItem key={role} value={role} className="text-base">
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold text-base rounded-lg mt-8 shadow-lg transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-gray-600 text-base">
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-600 hover:text-cyan-700 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
