import React, { useState } from "react";
import "../styles/home-page.scss";
import { signup } from "../api/signup";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleSignup = async () => {
    const data = await signup(form);
    if (data.userId) {
      localStorage.setItem("userId", data.userId);
      navigate("/chat");
    }
  };

  return (
    <section className="home-page">
      <article className="form">
        <div className="form-inner">
          <div className="image"></div>
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
          <button onClick={handleSignup}>Sign Up</button>
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
