import { Platform } from 'react-native';

export const commonScreenOptions = {
  headerStyle: {
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  headerTitleAlign: 'center' as const,
  headerLeftContainerStyle: {
    paddingLeft: 16,
  },
  headerRightContainerStyle: {
    paddingRight: 16,
  },
};
