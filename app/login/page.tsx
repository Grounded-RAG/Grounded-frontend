import { LoginScreen } from "@/components/screens/login-screen";

export default function LoginPage() {
  return (
    <>
      <noscript>
        <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
          <h1>Sign in to Grounded</h1>
          <p>JavaScript is required to use this application.</p>
        </main>
      </noscript>
      <LoginScreen />
    </>
  );
}
