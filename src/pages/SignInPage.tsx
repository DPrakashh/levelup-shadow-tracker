
import { SignIn } from '@clerk/clerk-react'

const SignInPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            LevelUp ⚔️
          </h1>
          <p className="text-gray-300 text-lg">Welcome back, Hunter!</p>
        </div>
        <SignIn 
          routing="path" 
          path="/sign-in" 
          redirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-black/40 backdrop-blur-sm border border-purple-500/30",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-300",
              socialButtonsBlockButton: "bg-white/10 border-gray-600 text-white hover:bg-white/20",
              socialButtonsBlockButtonText: "text-white",
              dividerLine: "bg-gray-600",
              dividerText: "text-gray-300",
              formFieldLabel: "text-white",
              formFieldInput: "bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400",
              formButtonPrimary: "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700",
              footerActionLink: "text-blue-400 hover:text-blue-300",
              identityPreviewText: "text-white",
              identityPreviewEditButton: "text-blue-400",
            }
          }}
        />
      </div>
    </div>
  )
}

export default SignInPage
