import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodError, ZodIssue } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { post } from "@/services/apiService";
import { appName, allowRegistration } from "@/config";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import Validate from "@/lib/Handlevalidation";
import logo from "../../../public/logo.jpeg";

interface BackendErrorResponse {
  errors: Array<{
    path: Array<string | number>;
    message: string;
  }>;
}

function mapBackendErrorToIssue(err: BackendErrorResponse): ZodIssue[] {
  return err.errors.map(({ path, message }) => ({
    code: "custom" as const,
    path,
    message,
  }));
}

function throwAsZodError(err: BackendErrorResponse): never {
  const issues = mapBackendErrorToIssue(err);
  throw new ZodError(issues);
}

interface LoginResponse {
  token: string;
  accesstoken: string;
  user: {
    id: string;
    email: string;
  };
}

interface FieldValidationError {
  path: string[];
  message: string;
}

interface ApiValidationErrorResponse {
  status: number;
  error: FieldValidationError[];
  message: string;
}

interface ApiGeneralError extends Error {
  message: string;
  status?: number;
}

type LoginFormInputs = z.infer<typeof loginSchema>;

const loginSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (location.state?.unauthorized) {
      toast.error("You are not authorized.");
      setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} });
      }, 0);
    }
  }, [location, navigate]);

  const loginMutation = useMutation<LoginResponse, unknown, LoginFormInputs>({
    mutationFn: async (loginData: LoginFormInputs) => {
      return await post("/auth/login", loginData);
    },
    onSuccess: (data) => {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
      toast.success("Login successful!");
    },
    onError: (error: any) => {
      Validate(error, setError);
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Internal Server Error");
      }
    },
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = (data) => {
    loginMutation.mutate(data);
  };

  const isLoading = loginMutation.isPending;

  return (
    <div>
      {/* Logo at top */}
      <div className="flex justify-center mb-2">
        <img src={logo} alt="Logo" className="h-16 w-auto object-contain" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-sm text-gray-500">
              Login to your {appName} account
            </p>
          </div>

          {/* Email Field */}
          <div className="grid gap-2 relative pb-3">
            <Label htmlFor="email">Email</Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...field}
                  disabled={isLoading}
                  aria-invalid={errors.email ? "true" : "false"}
                />
              )}
            />
            {errors.email && (
              <p className="text-destructive text-xs absolute -bottom-1 left-0">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="grid gap-2 relative pb-3">
            <Label htmlFor="password">Password</Label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <PasswordInput
                  id="password"
                  {...field}
                  disabled={isLoading}
                  aria-invalid={errors.password ? "true" : "false"}
                />
              )}
            />
            {errors.password && (
              <p className="text-destructive text-xs absolute -bottom-1 left-0">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>

          {/* Registration Link */}
          {allowRegistration && (
            <div className="text-center text-sm text-gray-600">
              Don’t have an account?{" "}
              <a href="/register" className="underline underline-offset-4">
                Register
              </a>
            </div>
          )}
          <div className="text-center text-xs text-gray-500 mt-1">
            Need help? Refer to the{" "}
            <a href="/help/user-manual" className="underline">
              User Manual
            </a>
            .
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
