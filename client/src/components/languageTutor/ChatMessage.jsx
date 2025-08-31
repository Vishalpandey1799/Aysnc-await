import React from 'react'

const ChatMessage = ({message}) => {
    const isUser = message.sender === 'user';
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xl rounded-2xl px-5 py-3 text-foreground ${
          isUser
            ? 'bg-blue-600 rounded-br-none'
            : 'bg-card rounded-bl-none'
        }`}
      >
        <p className="text-base">{message.text}</p>
        {!isUser && (
            <p className="text-xs text-muted-foreground mt-2">{message.author || 'Tutor'}</p>
        )}
      </div>
    </div>
  )
}

export default ChatMessage