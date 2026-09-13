export default function Card({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">

      {/* If a title is passed in, render this header section */}
      {title && (
        <div className="border-b border-gray-100 pb-3 mb-4">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        </div>
      )}

      {/* The 'children' injects whatever HTML is placed between the custom tags */}
      <div className="text-gray-600">
        {children}
      </div>

    </div>
  );
}
