import express from "express";

export const signup = (req, res) => {
  res.send("server is signup");
};

export const login = (req, res) => {
  res.send("server is login");
};

export const logout = (req, res) => {
  res.send("server is logout");
};
