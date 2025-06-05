import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Search } from 'lucide-react-native';

interface SearchBarProps {
  onPress?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Search size={16} color='#9CA3AF' />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
