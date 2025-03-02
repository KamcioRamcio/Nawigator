import React, { useRef } from "react";

function Login() {
  const usernameRef = useRef(null);

  const handleLogin = () => {
    const username = usernameRef.current.value;
    if (username) {
      localStorage.setItem("username", username);
      window.location.href = "/Main/Leki";
    }
  };

  return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-6 text-center">Logowanie</h1>
          <input
              type="text"
              ref={usernameRef}
              placeholder="Username"
              className="w-full p-2 mb-4 border border-gray-300 rounded"
          />
          <button
              onClick={handleLogin}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Login
          </button>
        </div>
      </div>
  );
}

export default Login;