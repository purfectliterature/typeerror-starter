"use client";

import { createUser } from "./actions";

const Buttons = () => {
  return (
    <>
      <button
        onClick={async () => {
          const name = Date.now().toString();
          const email = `${name}@example.com`;
          await createUser(name, email);
        }}
      >
        Create user
      </button>
    </>
  );
};

export default Buttons;
