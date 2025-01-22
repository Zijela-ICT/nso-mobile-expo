import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the type for learning hours context
interface LearningHoursContextType {
    learningHours: number;
    updateLearningHours: (seconds: number) => void;
}

// Create the context
const LearningHoursContext = createContext<LearningHoursContextType | undefined>(undefined);

// Custom hook to use the learning hours context
export const useLearningHours = () => {
    const context = useContext(LearningHoursContext);
    if (!context) {
        throw new Error('useLearningHours must be used within a LearningHoursProvider');
    }
    return context;
};

// Learning hours provider component
interface LearningHoursProviderProps {
    children: ReactNode;
}
export const LearningHoursProvider: React.FC<LearningHoursProviderProps> = ({ children }) => {
    const [learningHours, setLearningHours] = useState<number>(0);

    // Function to update learning hours
    const updateLearningHours = async (learningSeconds: number) => {
        // Retrieve the existing learning hours from AsyncStorage
        try {
            const existingLearningSeconds = await AsyncStorage.getItem('learningHours');
            let currentLearningSeconds = existingLearningSeconds ? parseInt(existingLearningSeconds) : 0;
            // Add the provided number of seconds to the current learning hours
            currentLearningSeconds += learningSeconds;
            // Update the learning hours state
            setLearningHours(currentLearningSeconds);
            // Save the updated learning hours to AsyncStorage
            await AsyncStorage.setItem('learningHours', currentLearningSeconds.toString());

        } catch (error) {
        }
    };

    // Fetch learning hours from async storage when component mounts
    useEffect(() => {
        const fetchLearningHours = async () => {
            try {
                const storedLearningHours = await AsyncStorage.getItem('learningHours');
                if (storedLearningHours !== null) {
                    // Convert stored learning hours to a number and update state
                    setLearningHours(Number(storedLearningHours));
                }
            } catch (error) {
                console.error('Error fetching learning hours from AsyncStorage:', error);
            }
        };

        fetchLearningHours();

        // No cleanup needed for useEffect since it's fetching data only
    }, []);

    // Context value
    const value: LearningHoursContextType = {
        learningHours,
        updateLearningHours,
    };

    return (
        <LearningHoursContext.Provider value={value}>
            {children}
        </LearningHoursContext.Provider>
    );
};
