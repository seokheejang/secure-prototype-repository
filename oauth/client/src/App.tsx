import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

function App() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<any>(null);

  const clientId = "YOUR_GOOGLE_CLIENT_ID"; // 여기에 Google OAuth 클라이언트 ID를 입력하세요.

  const handleLoginSuccess = (response: any) => {
    console.log("Login Success:", response);
    setUser(response?.credential);
  };

  const handleLoginFailure = () => {
    // error를 인수 없이 처리
    console.error("Login Failed");
    setUser(null);
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + Google OAuth</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <div className="card">
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={handleLoginFailure}
        />
        {user && (
          <div>
            <h2>Welcome, {user.name}</h2>
            <img src={user.picture} alt="User Profile" width={50} height={50} />
          </div>
        )}
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </GoogleOAuthProvider>
  );
}

export default App;
