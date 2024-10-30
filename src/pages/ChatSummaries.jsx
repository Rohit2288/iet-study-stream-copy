// import { useState, useEffect } from 'react';

// function ChatSummaries() {
//   const [summaries, setSummaries] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchSummaries();
//   }, []);

//   const fetchSummaries = async () => {
//     try {
//       const response = await fetch('http://localhost:5001/api/chat/summaries');
//       const data = await response.json();
//       setSummaries(data);
//     } catch (error) {
//       console.error('Error fetching summaries:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto">
//       <h2 className="text-2xl font-bold mb-6">Chat Summaries</h2>

//       {loading ? (
//         <div className="text-center">Loading...</div>
//       ) : (
//         <div className="space-y-4">
//           {summaries.map((summary) => (
//             <div 
//               key={summary._id}
//               className="bg-white p-4 rounded-lg shadow"
//             >
//               <h3 className="text-lg font-semibold text-gray-800 mb-2">
//                 {summary.roomTitle}
//               </h3>
//               <p className="text-gray-600 mb-2">{summary.content}</p>
//               <div className="text-sm text-gray-500">
//                 <span>Participants: {summary.participantCount}</span>
//                 <span className="mx-2">•</span>
//                 <span>Messages: {summary.messageCount}</span>
//                 <span className="mx-2">•</span>
//                 <span>
//                   Date: {new Date(summary.date).toLocaleDateString()}
//                 </span>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// export default ChatSummaries;
// 
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;

function ChatSummaries() {
  const [summaries, setSummaries] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${backendUrl}/api/chat/summaries`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSummaries(data);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-100 h-40 rounded-lg"/>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Chat Summaries</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
          </svg>
          {error}
        </div>
      )}

      {!error && summaries.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No chat summaries available
        </div>
      )}
      
      <div className="space-y-4">
        {summaries.map(summary => (
          <div key={summary.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">{summary.roomTitle}</h2>
              <span className="text-sm text-gray-500">
                {format(new Date(summary.date), 'PPP')}
              </span>
            </div>
            
            <div className="flex gap-4 mb-4 text-sm text-gray-600">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
                {summary.participantCount} participants
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                </svg>
                {summary.messageCount} messages
              </span>
            </div>
            
            <div className="whitespace-pre-wrap text-gray-700 prose max-w-none">
              {summary.summary}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatSummaries;