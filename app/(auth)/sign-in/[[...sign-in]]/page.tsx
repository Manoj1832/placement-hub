import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#2D1A5C] flex items-center justify-center relative overflow-hidden">
      {/* Background blobs for wavy effect */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#462888] opacity-50 blur-[100px]" />
        <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#392070] opacity-50 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-[#241350] opacity-80 blur-[80px]" />
      </div>

      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: "bg-[#00FF7F] text-black hover:bg-[#00cc66]",
            footerActionLink: "text-[#00FF7F] hover:text-[#00cc66]"
          }
        }}
      />
    </div>
  );
}
