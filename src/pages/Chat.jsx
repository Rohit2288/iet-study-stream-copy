import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Paperclip, Send, X } from 'lucide-react';
import io from 'socket.io-client';

const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;

function Chat() {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomTitle, setRoomTitle] = useState('');
  const [error, setError] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Connect to Socket.IO server
    socketRef.current = io(backendUrl, {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    // Load existing chat rooms
    fetchRooms();

    // Socket event listeners
    socketRef.current.on('message', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });
    
    socketRef.current.on('roomCreated', handleRoomCreated);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/chat/rooms`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch rooms');
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      setError('Error fetching rooms: ' + error.message);
    }
  };

  const createRoom = async () => {
    if (!roomTitle.trim()) {
      setError('Please enter a room title');
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/chat/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title: roomTitle })
      });

      if (!response.ok) throw new Error('Failed to create room');
      const newRoom = await response.json();
      setRooms(prevRooms => [...prevRooms, newRoom]);
      setRoomTitle('');
      setError('');
      // Join the newly created room
      joinRoom(newRoom.id);
    } catch (error) {
      setError('Failed to create room: ' + error.message);
    }
  };

  const joinRoom = async (roomId) => {
    try {
      const response = await fetch(`${backendUrl}/api/chat/rooms/${roomId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to join room');
      const data = await response.json();
      setMessages(data);
      setCurrentRoom(roomId);
      socketRef.current.emit('joinRoom', roomId);
      setError('');
    } catch (error) {
      setError('Error joining room: ' + error.message);
    }
  };

  const handleRoomCreated = (room) => {
    setRooms(prev => [...prev, room]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB

    const validFiles = files.filter(file => {
      const isValidType = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ].includes(file.type);
      
      const isValidSize = file.size <= maxSize;
      
      if (!isValidType) setError(`Invalid file type: ${file.name}`);
      if (!isValidSize) setError(`File too large: ${file.name}`);
      
      return isValidType && isValidSize;
    });

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const uploadAttachments = async () => {
    const formData = new FormData();
    attachments.forEach(file => {
      formData.append('files', file);
    });

    try {
      setIsUploading(true);
      const response = await fetch(`${backendUrl}/api/chat/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload files');
      const data = await response.json();
      return data.fileUrls;
    } catch (error) {
      setError('Error uploading files: ' + error.message);
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && attachments.length === 0) || !currentRoom) return;

    let fileUrls = [];
    if (attachments.length > 0) {
      fileUrls = await uploadAttachments();
    }

    const messageData = {
      content: newMessage,
      sender: user._id,
      attachments: fileUrls.map(url => ({
        fileUrl: url,
        filename: attachments[fileUrls.indexOf(url)].name,
        fileType: attachments[fileUrls.indexOf(url)].type,
        fileSize: attachments[fileUrls.indexOf(url)].size
      }))
    };

    try {
      const response = await fetch(`${backendUrl}/api/chat/rooms/${currentRoom}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) throw new Error('Failed to send message');
      const savedMessage = await response.json();

      setMessages(prev => [...prev, savedMessage]);
      socketRef.current.emit('sendMessage', savedMessage);

      setNewMessage('');
      setAttachments([]);
    } catch (error) {
      setError('Error sending message: ' + error.message);
    }
  };

  const endChat = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/chat/rooms/${currentRoom}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to end chat');
      const data = await response.json();
      navigate('/chat-summaries', { state: { summary: data.summary } });
    } catch (error) {
      setError('Error ending chat: ' + error.message);
    }
  };

  const MessageBubble = ({ message, isCurrentUser }) => (
    <div
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isCurrentUser
            ? 'bg-blue-600 text-white ml-auto rounded-br-none'
            : 'bg-gray-200 text-gray-800 mr-auto rounded-bl-none'
        }`}
      >
        <div className={`text-sm font-semibold mb-1 ${
          isCurrentUser ? 'text-blue-100' : 'text-gray-600'
        }`}>
          {message.sender.name}
        </div>
        {message.content && (
          <div className="break-words">{message.content}</div>
        )}
        {message.attachments?.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.attachments.map((attachment, index) => (
              <a
                key={index}
                href={attachment.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`block text-sm underline ${
                  isCurrentUser ? 'text-blue-100' : 'text-blue-600'
                }`}
              >
                {attachment.filename}
              </a>
            ))}
          </div>
        )}
        <div className={`text-xs mt-1 ${
          isCurrentUser ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {new Date(message.createdAt).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-12rem)] flex" style={{ display: 'flex', height: 'calc(100vh - 12rem)' }}>
      {/* Sidebar - Room List */}
      <div style={{
        minWidth: '250px', // Ensures sidebar does not shrink below 250px
        width: '25%', // Adjust the width as necessary
        height: '100%', // Full height
        backgroundColor: 'white',
        borderRight: '1px solid #ccc', // Add a border to separate from the chat area
        padding: '20px',
        boxSizing: 'border-box', // Include padding and border in the width calculation
        overflowY: 'auto' // Adds scroll to sidebar if content is too long
      }}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Create New Room</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              value={roomTitle}
              onChange={(e) => setRoomTitle(e.target.value)}
              placeholder="Room Title"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={createRoom}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold mb-2">Chat Rooms</h3>
          {rooms.map(room => (
            <button
              key={room.id}
              onClick={() => joinRoom(room.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                currentRoom === room.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'hover:bg-gray-50'
              }`}
            >
              {room.title}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{
        flex: 1, // Take the remaining space
        height: '100%', // Full height
        backgroundColor: '#f0f0f0', // Different background to distinguish from sidebar
        display: 'flex',
        flexDirection: 'column' // Stack children vertically
      }}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 m-2 rounded-lg relative">
            <span className="block sm:inline">{error}</span>
            <button
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setError('')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {currentRoom ? (
          <>
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-white">
              <div className="space-y-2">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isCurrentUser={message.sender.id === user._id}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t">
              {attachments.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-gray-100 rounded-lg px-3 py-1"
                    >
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={sendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isUploading}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={isUploading}
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isUploading || (!newMessage.trim() && attachments.length === 0)}
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>

            {/* End Chat Button */}
            <div className="p-4 bg-white border-t">
              <button
                onClick={endChat}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                End Chat & Generate Summary
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-white">
            <div className="text-gray-500 text-center">
              <div className="mb-2">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-1">No Chat Selected</h3>
              <p className="text-gray-600">
                Select a chat room from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;