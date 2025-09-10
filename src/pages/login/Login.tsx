import "./Login.css";
import { useState } from "react";
import { signup, login, resetPass } from "../../config/firebase";

export default function Login() {
  const [currentState, setCurrentState] = useState("Sign up");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const onSubmitHandler = (event) => {
    event.preventDefault();

    if (currentState === "Sign up") {
      if (!agreeTerms) {
        alert("You must agree to the terms and privacy policy");
        return;
      }
      signup(email, password, userName);
    } else {
      login(email, password);
    }
  };

  return (
    <div className="login">
      <img src="src/assets/logo.png" alt="logo" className="logo" /> {/* fixed image path */}
      <form onSubmit={onSubmitHandler} className="login-form">
        <h2>{currentState}</h2>

        {currentState === "Sign up" && (
          <input
            onChange={(e) => setUserName(e.target.value)}
            value={userName}
            type="text"
            placeholder="Username"
            className="form-input"
            required
          />
        )}

        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type="email"
          placeholder="Email"
          required
          className="form-input"
        />
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password"
          placeholder="Password"
          required
          className="form-input"
        />

        <button type="submit">
          {currentState === "Sign up" ? "Create account" : "Login now"}
        </button>

        {currentState === "Sign up" && (
          <div className="login-term">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <p>Agree to the terms of use & privacy policy</p>
          </div>
        )}

        <div className="login-forgot">
          {currentState === "Sign up" ? (
            <p className="login-toggle">
              Already have an account{" "}
              <span onClick={() => setCurrentState("Login")}>Login Here</span>
            </p>
          ) : (
            <p className="login-toggle">
              Create an account{" "}
              <span onClick={() => setCurrentState("Sign up")}>Click Here</span>
            </p>
          )}
          {currState === "Login" ? <p className="login-toggle">
              Forget Password{" "} ?
              <span onClick={() => resetPass(email)}>Reset here</span>
            </p> : null }
        </div>
      </form>
    </div>
  );
}