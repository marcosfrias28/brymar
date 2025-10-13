import React from "react";

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen">
      <div className="size-36 border-t-2 border-b-2 border-l-2 border-r-2 border-gray-300 rounded-full animate-spin"></div>
    </div>
  );
};

export default Loading;
