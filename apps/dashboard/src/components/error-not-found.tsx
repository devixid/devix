import React, { memo } from "react";

const Error404NotFound = () => {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center">
      <img
        src="https://static.wikia.nocookie.net/4e5c6fb3-2946-4364-82af-23025ae2b20b"
        alt="404"
        className="w-full max-w-xl"
      />
    </div>
  );
};

export default memo(Error404NotFound);
