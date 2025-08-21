'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--primary)/0.1),transparent_60%)]" />
      
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div 
          className="absolute inset-0 animate-pulse" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
            animation: 'float 6s ease-in-out infinite'
          }} 
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-3/4 w-48 h-48 bg-primary/7 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 text-center">
        <div className="mx-auto max-w-4xl">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            Now in Beta - Join early adopters
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-tight">
            <span className="block mb-2">Take control of your</span>
            <span className="relative block">
              <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent animate-pulse">
                finances
              </span>
              <svg
                className="absolute -bottom-3 left-0 h-4 w-full text-primary/40 animate-pulse"
                viewBox="0 0 300 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 10c49.7-3 99.4-4.5 149-3.5 49.7 1.2 99.3 4.5 149 3.5"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>
          
          <p className="mx-auto mt-8 max-w-2xl text-xl leading-8 text-muted-foreground/90">
            Personal finance tracker yang mudah digunakan. Catat pengeluaran, 
            kelola anggaran, dan pantau keuangan pribadi Anda dengan aman.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4">
            <Button
              size="lg"
              className="group relative rounded-2xl px-10 py-5 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105"
            >
              <span className="relative z-10">Get started for free</span>
              <svg className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="group rounded-2xl px-10 py-5 text-lg font-semibold border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/5 backdrop-blur-sm transition-all duration-300 transform hover:scale-105"
            >
              <svg className="mr-3 h-5 w-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2" />
              </svg>
              View demo
            </Button>
          </div>
        </div>

        {/* Enhanced Feature highlights */}
        <div className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-3 px-4 sm:px-0">
          {[
            { icon: "M5 13l4 4L19 7", text: "100% Free", delay: "0s" },
            { icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", text: "Secure & Private", delay: "0.2s" },
            { icon: "M13 10V3L4 14h7v7l9-11h-7z", text: "Lightning Fast", delay: "0.4s" }
          ].map((item, index) => (
            <div 
              key={index}
              className="group flex items-center justify-center gap-3 rounded-2xl bg-primary/10 border border-primary/20 px-6 py-4 text-sm font-medium text-primary backdrop-blur-sm hover:bg-primary/15 transition-all duration-300 transform hover:scale-105"
              style={{ animationDelay: item.delay }}
            >
              <svg className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.text}
            </div>
          ))}
        </div>

        {/* App Preview Mockup */}
        <div className="mt-20 relative">
          <div className="mx-auto max-w-4xl">
            <div className="relative rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 shadow-2xl shadow-primary/20">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-gray-400 text-sm">monli.app</div>
                </div>
                <div className="bg-gray-800 rounded-2xl p-6 space-y-4">
                  <div className="h-8 bg-primary/20 rounded-lg animate-pulse"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-20 bg-gray-700 rounded-xl animate-pulse delay-100"></div>
                    <div className="h-20 bg-gray-700 rounded-xl animate-pulse delay-200"></div>
                    <div className="h-20 bg-gray-700 rounded-xl animate-pulse delay-300"></div>
                  </div>
                  <div className="h-32 bg-gray-700 rounded-xl animate-pulse delay-400"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
      `}</style>
    </section>
  );
}