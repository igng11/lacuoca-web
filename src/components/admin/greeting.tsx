"use client";

import { useEffect, useState } from "react";

export function Greeting() {
  const [greeting, setGreeting] = useState("Inicio");
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Buenos días!");
    else if (hour < 19) setGreeting("Buenas tardes!");
    else setGreeting("Buenas noches!");
  }, []);
  return <span className="eyebrow">{greeting}</span>;
}