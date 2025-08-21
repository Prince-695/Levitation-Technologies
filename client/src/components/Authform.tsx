"use client"

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import logo from '../assets/logo.png'; // Adjust the path as necessary

// Define schemas for validation
const loginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface AuthFormProps {
    mode: 'login' | 'register';
}

export default function AuthForm({ mode }: AuthFormProps) {
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    
    const isLogin = mode === 'login';
    const schema = isLogin ? loginSchema : registerSchema;
    
    const form = useForm<LoginFormData | RegisterFormData>({
        resolver: zodResolver(schema),
        defaultValues: isLogin 
            ? { email: '', password: '' }
            : { fullName: '', email: '', password: '' }
    });

    const onSubmit = async (data: LoginFormData | RegisterFormData) => {
        setLoading(true);
        setErrors([]);

        console.log('Form data being sent:', data); // Debug log

        try {
            if (isLogin) {
                const response = await authAPI.login(data as LoginFormData);
                
                if (response.success && response.token && response.user) {
                    login(response.user, response.token);
                    navigate('/dashboard');
                } else {
                    setErrors([response.message || 'Login failed']);
                }
            } else {
                console.log('Sending registration data:', data); // Debug log
                const response = await authAPI.register(data as RegisterFormData);
                console.log('Registration response:', response); // Debug log
                
                if (response.success) {
                    setSuccess(true);
                    setTimeout(() => {
                        navigate('/login');
                    }, 2000);
                } else {
                    setErrors([response.message || 'Registration failed']);
                }
            }
        } catch (error: unknown) {
            console.error('Registration error:', error); // Debug log
            const errorMessages = (error as { response?: { data?: { errors?: string[], message?: string } } }).response?.data?.errors || [
                (error as { response?: { data?: { message?: string } } }).response?.data?.message || `An error occurred during ${mode}`,
            ];
            setErrors(errorMessages);
        } finally {
            setLoading(false);
        }
    };

    if (!isLogin && success) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md bg-transparent border-0 shadow-none">
                    <CardHeader className="text-center">
                        <CardTitle className="text-green-600">Registration Successful!</CardTitle>
                        <CardDescription>Your account has been created. Redirecting to login...</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="h-full xl:max-w-5xl max-w-7xl w-full flex items-center justify-center overflow-hidden">

            <Card className="w-full bg-transparent border-0 shadow-none mx-20 ">
                <CardHeader>
                    <img src={logo} alt="Logo" className=" mb-4 " height={200} width={200} />
                    <CardTitle className='text-4xl text-white'>{isLogin ? 'Let the journey begin' : 'Sign Up to begin your journey'}</CardTitle>
                    <CardDescription>
                        {isLogin 
                            ? 'This is basic login page which is used for levitation assignment purpose. ' 
                            : 'This is basic signup page which is used for levitation assignment purpose. '
                        }
                    </CardDescription>
                </CardHeader>
                
                <CardContent>
                    {errors.length > 0 && (
                        <div className="mb-4 p-3 rounded-md">
                            {errors.map((error, index) => (
                                <p key={index} className="text-sm text-red-600">{error}</p>
                            ))}
                        </div>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {!isLogin && (
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='text-lg text-white'>Enter your Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter your Name" className='text-white' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-lg text-white'>Email Address</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="Enter email ID" className='text-white' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-lg text-white'>Current Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Enter the password" className='text-white' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex items-center gap-5">
                                <Button type="submit" className="w-[150px] bg-[#303030] rounded-lg text-lg text-[#ccf575]" disabled={loading}>
                                    {loading 
                                        ? (isLogin ? 'Logging in...' : 'Creating account...') 
                                        : (isLogin ? 'Login now' : 'Register')
                                    }
                                </Button>
                                
                                 <p className="text-sm text-gray-600">
                                    <Link 
                                        to={isLogin ? "/register" : "/login"} 
                                        className="text-[#b8b8b8] hover:underline"
                                    >
                                        {isLogin ? "Don't have an account ?" : "Already have an account ?"}
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}