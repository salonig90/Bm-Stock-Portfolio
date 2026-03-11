import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    API.post("signup/", formData)
      .then(() => {
        alert("Account created successfully!");
        navigate("/login");
      })
      .catch((error) => {
        const errorMsg = error.response?.data?.error || "Signup failed. Please check your details.";
        alert(errorMsg);
      });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f2f5'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '500px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Staff Signup</h2>
        <form onSubmit={handleSubmit}>
          {Object.keys(formData).map((key) => (
            <div key={key} style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', textTransform: 'capitalize' }}>{key}</label>
              <input
                type={key === "password" ? "password" : "text"}
                name={key}
                value={formData[key]}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                required
              />
            </div>
          ))}
          <button type="submit" style={{
            width: '100%',
            padding: '12px',
            background: '#00d2ff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '10px'
          }}>
            Create Account
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
