import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FeedbackContextType {
  isVisible: boolean;
  openFeedback: () => void;
  closeFeedback: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};

interface FeedbackProviderProps {
  children: ReactNode;
}

export const FeedbackProvider: React.FC<FeedbackProviderProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);

  const openFeedback = () => setIsVisible(true);
  const closeFeedback = () => setIsVisible(false);

  return (
    <FeedbackContext.Provider value={{ isVisible, openFeedback, closeFeedback }}>
      {children}
    </FeedbackContext.Provider>
  );
};
