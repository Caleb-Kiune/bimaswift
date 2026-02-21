"use client";

import React, { useState } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
  }
  console.log(count);

  return (
    <div>
      <h1>template</h1>
      {children}
      <button onClick={handleClick}>Change + 1</button>
    </div>
  );
}
