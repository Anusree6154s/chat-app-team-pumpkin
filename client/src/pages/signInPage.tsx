import { useState } from "react";
import "../styles/home-page.scss";
import { signin } from "../api/signin";
import { useNavigate } from "react-router-dom";

export default function SigninPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleSignin = async () => {
    const data = await signin(form);
    if (data.userId) {
      localStorage.setItem("userId", data.userId);
      navigate("/chat");
    }
  };

  return (
    <section className="home-page">
      <article className="form">
        <div className="form-inner">
          <div
            style={{
              border: "1px solid transparent",
              textAlign: "center",
              fontWeight: "bold",
              fontFamily: "Inter",
            }}
          >
            Sign In
          </div>
          <input
            type="text"
            placeholder="Name"
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          <input
            type="text"
            placeholder="Email"
            onChange={(e) =>
              setForm((prev) => ({ ...prev, email: e.target.value }))
            }
          />
          <input
            type="text"
            placeholder="Phone Number"
            onChange={(e) =>
              setForm((prev) => ({ ...prev, phone: e.target.value }))
            }
          />
          <button onClick={handleSignin}>Sign In</button>

          <p className="signin-footer">
            <span>Not a member? </span>
            <a href="/">Sign Up</a>
          </p>
        </div>
        <img
          src="/form-pattern.png"
          alt="form-pattern"
          className="form-pattern top"
        />
        <img
          src="/form-pattern.png"
          alt="form-pattern"
          className="form-pattern bottom"
        />
      </article>
    </section>
  );
}
