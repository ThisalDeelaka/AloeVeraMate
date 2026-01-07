import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from './Card';

interface ErrorMessageProps {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
}

export default function ErrorMessage({ 
  title = 'Error', 
  message, 
  type = 'error' 
}: ErrorMessageProps) {
  const getColor = () => {
    switch (type) {
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      case 'info':
        return '#2196F3';
      default:
        return '#999';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '';
    }
  };

  return (
    <Card style={[styles.container, { borderLeftColor: getColor() }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{getIcon()}</Text>
        <Text style={[styles.title, { color: getColor() }]}>{title}</Text>
      </View>
      <Text style={styles.message}>{message}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
