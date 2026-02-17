export default function StatCard({ title, value, icons }) {
  return (
    <div className="cursor-pointer w-full bg-white p-6 rounded-3xl transition-all duration-500 hover:scale-105 shadow-[#003b46] shadow-md">
      <span className="text-[#003b46]">{icons}</span>
      <h2 className="text-primary mt-3 text-[#003b46] font-serif font-extrabold text-3xl">{title}</h2>
      <p className="text-5xl text-gray-400 mt-3 font-serif font-extrabold">
        {value}
      </p>
    </div>
  );
}
