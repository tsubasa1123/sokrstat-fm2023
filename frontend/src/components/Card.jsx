// src/components/Card.jsx
export default function Card({ children, onClick }) {
  return (
    <div
      onClick={onClick}
      className="
        bg-white dark:bg-gray-800 
        rounded-xl p-4 shadow-md 
        transform transition 
        hover:scale-105 hover:shadow-glow cursor-pointer
      "
    >
      {children}
    </div>
  );
}
