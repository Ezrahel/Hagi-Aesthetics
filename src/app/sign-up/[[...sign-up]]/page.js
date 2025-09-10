import { SignUp } from "@clerk/nextjs";

const appearance = {
  layout: {
    socialButtonsPlacement: "bottom",
    socialButtonsVariant: "iconButton",
    privacyPageUrl: "",
    termsPageUrl: ""
  },
  elements: {
    footer: "hidden",
    footerAction: "hidden",
    dividerRow: "hidden",
    formButtonPrimary: "bg-pink hover:bg-pink/90",
    card: "shadow-none",
    headerSubtitle: "hidden",
    socialButtons: "hidden",
    dividerLine: "hidden",
    formField: "gap-1",
    formFieldInput: "rounded-none border-pink focus:border-pink",
    formButtonPrimary: "bg-pink hover:bg-pink/90 text-white rounded-none",
  },
};

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp 
        appearance={appearance}
      />
    </div>
  );
}
