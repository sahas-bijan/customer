import { Link } from 'wouter';

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold hover:text-blue-200 transition-colors">
              Support Tickets
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
              Home
            </Link>
            <Link
              href="/tickets"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              View All Tickets
            </Link>
            <Link
              href="/new"
              className="px-3 py-2 rounded-md text-sm font-medium bg-blue-800 hover:bg-blue-900 transition-colors"
            >
              Create Ticket
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
