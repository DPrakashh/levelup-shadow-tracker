
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
            }
          }}
        />
      </div>
    </div>
  )
}

export default SignInPage
