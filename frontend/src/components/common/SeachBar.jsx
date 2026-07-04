function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}) {
  return (
    <input
      type="text"
      className={`search-input ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}

export default SearchBar;