import React from 'react'
import { Button } from '../ui/button'
import { Flame } from 'lucide-react'

const SessionEndCard = ({userName, onGoHome}) => {
  return (
     <div className="flex flex-col items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4 w-full max-w-md p-8 rounded-3xl shadow-2xl bg-card border border-border">
                <div className="relative">
                    <Flame size={64} className="text-orange-400" />
                    <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white font-bold text-sm">1</span>
                </div>
                <h2 className="text-2xl font-bold text-center">Well done on your session, {userName}!</h2>
                <p className="text-muted-foreground text-center">To make the most of your learning, try learning every day.</p>
                <div className="flex justify-between w-full mt-4 border-t border-border pt-4">
                    <div>
                        <p className="text-muted-foreground text-sm">Lesson duration</p>
                        <p className="font-bold text-lg">3 minutes</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground text-sm">New words saved</p>
                        <p className="font-bold text-lg">2 words</p>
                    </div>
                </div>
                <Button variant="outline" className="w-full mt-6 h-12 text-base" onClick={onGoHome}>
                    Go home
                </Button>
            </div>
        </div>
   
  )
}

export default SessionEndCard