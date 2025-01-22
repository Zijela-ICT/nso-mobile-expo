import React from 'react';
import { useAuth } from '@/contexts/auth.context';
import TabNavigator from './bottom-tab-navigator';
import StackNavigator from './stack-navigator';

const RootNavigator = () => {
    const { isAuthenticated } = useAuth();

    return isAuthenticated ? <TabNavigator /> : <StackNavigator />;
};

export default RootNavigator;
