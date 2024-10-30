import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-primary-600">
            IET Study Stream
          </Link>
          
          <div className="flex space-x-4">
            <Link to="/" className="btn btn-secondary">Home</Link>
            <Link to="/papers" className="btn btn-secondary">View Papers</Link>
            <Link to="/chat-summaries" className="btn btn-secondary">Chat Summaries</Link>
            
            {isAuthenticated() && (
              <>
                <Link to="/upload-paper" className="btn btn-secondary">Upload Paper</Link>
                <Link to="/chat" className="btn btn-secondary">Chat</Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated() ? (
              <>
                <span className="text-gray-600">{user.email}</span>
                <button onClick={logout} className="btn btn-primary">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">Login</Link>
                <Link to="/signup" className="btn btn-primary">Signup</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
