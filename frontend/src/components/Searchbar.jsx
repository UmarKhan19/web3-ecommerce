import { useState } from "react";

export default function Searchbar({ _setSearchQuery }) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSearchQuery("");
        _setSearchQuery(searchQuery);
      }}
      className="flex gap-2 bg-gray-300 px-4 py-2 rounded-3xl"
    >
      <input
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
        }}
        type="text"
        className="bg-transparent border-r-2 border-black"
      />
      <button type="submit">Search</button>
    </form>
  );
}
