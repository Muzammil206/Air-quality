"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Wind, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import Image from "next/image"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
})

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setLoginError(null)
    setLoginSuccess(null)

    try {
      

      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setLoginError("Invalid email or password. Please check your credentials and try again.")
        } else if (error.message.includes("Email not confirmed")) {
          setLoginError("Please check your email and click the verification link before signing in.")
        } else if (error.message.includes("Too many requests")) {
          setLoginError("Too many login attempts. Please wait a few minutes before trying again.")
        } else {
          setLoginError(error.message || "An unexpected error occurred. Please try again.")
        }
        return
      }

      if (data.user) {
        setLoginSuccess("Welcome back! Redirecting to your dashboard...")
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      }
    } catch (error) {
      console.error("Login error:", error)
      setLoginError("Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Image src="/logo2.svg" alt="AirQNigeria" width={50} height={50} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-gray-600 text-base leading-relaxed">Sign in to your AirQNigeria account</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            {loginSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-green-700 text-sm leading-relaxed">{loginSuccess}</p>
              </div>
            )}

            {loginError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 text-sm leading-relaxed">{loginError}</p>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          className="h-12 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500 text-base"
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
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="h-12 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500 text-base pr-12"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg mt-8 text-base transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-gray-600 text-base">
            Don't have an account?{" "}
            <Link href="/register" className="text-cyan-600 hover:text-cyan-700 font-semibold transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
