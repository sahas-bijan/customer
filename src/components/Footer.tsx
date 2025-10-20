export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-center">
          <p className="text-sm">© {currentYear} Customer Support Ticket System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
